/** @type {import("next").NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        // images: { allowFutureImage: true },
        largePageDataBytes: 256 * 1024,
    },
    output: "standalone",
};

module.exports = nextConfig;
