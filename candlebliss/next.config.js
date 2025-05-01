/** @type {import('next').NextConfig} */

const HOST = 'http://68.183.226.198:3000';
module.exports = { HOST };
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
