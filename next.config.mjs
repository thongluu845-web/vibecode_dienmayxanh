/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.tgdd.vn",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  // Bỏ qua ESLint errors trong production build (Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Bỏ qua TypeScript errors trong production build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
