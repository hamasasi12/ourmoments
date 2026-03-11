import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            displayName?: string | null;
            partnerName?: string | null;
            anniversaryDate?: string | null;
        };
    }

    interface User {
        id: string;
        displayName?: string | null;
        partnerName?: string | null;
        anniversaryDate?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        displayName?: string | null;
        partnerName?: string | null;
        anniversaryDate?: string | null;
    }
}
