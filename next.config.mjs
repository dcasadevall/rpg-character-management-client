/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
    },
    // Allow images from the localhost domain for development
    reactStrictMode: true,
};

export default nextConfig; 