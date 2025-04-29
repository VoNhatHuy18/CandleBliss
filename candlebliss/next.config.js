/** @type {import('next').NextConfig} */

const { HOST } = require('./src/app/constants/api.tsx');

const nextConfig = {
   async rewrites() {
      return [
         {
            source: '/api/:path*',
            destination: `${HOST}/api/:path*`,
         },
      ];
   },
   images: {
      domains: ['example.com', 'localhost', 'res.cloudinary.com', 'placehold.co'],
   },
};

module.exports = nextConfig;
