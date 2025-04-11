/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.vercel.app',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
            },
        ],
    },
    // Allow images from the localhost domain for development
    reactStrictMode: true,
};

export default nextConfig; 