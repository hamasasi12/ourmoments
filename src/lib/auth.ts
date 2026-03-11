import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export interface DbUser {
    id: string;
    email: string;
    password_hash: string;
    display_name: string | null;
    partner_name: string | null;
    anniversary_date: string | null;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const res = await query<DbUser>(
                    'SELECT * FROM users WHERE email = $1 LIMIT 1',
                    [credentials.email.toLowerCase()]
                );

                const user = res.rows[0];
                if (!user) return null;

                const valid = await bcrypt.compare(credentials.password, user.password_hash);
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.display_name ?? user.email.split('@')[0],
                    displayName: user.display_name,
                    partnerName: user.partner_name,
                    anniversaryDate: user.anniversary_date,
                };
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as unknown as { id: string; displayName?: string; partnerName?: string; anniversaryDate?: string };
                token.id = u.id;
                token.displayName = u.displayName ?? null;
                token.partnerName = u.partnerName ?? null;
                token.anniversaryDate = u.anniversaryDate ?? null;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.displayName = token.displayName as string;
                session.user.partnerName = token.partnerName as string;
                session.user.anniversaryDate = token.anniversaryDate as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
