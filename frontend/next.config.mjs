/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Run as development server, not static export
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
