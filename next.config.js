/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // We're using pages directory
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // For any external images
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig