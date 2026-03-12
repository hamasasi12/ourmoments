/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: '**' },
        ],
    },
    serverExternalPackages: ['pg', 'bcryptjs'],
};

export default nextConfig;
