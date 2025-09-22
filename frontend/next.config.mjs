/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable static export for GitHub Pages deployment
  ...(process.env.GITHUB_ACTIONS && {
    output: 'export',
    trailingSlash: true,
    basePath: '/nexapdf',
    assetPrefix: '/nexapdf/',
  }),
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api',
  },
  // Ensure API URL is available at build time
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api',
  },
}

export default nextConfig;