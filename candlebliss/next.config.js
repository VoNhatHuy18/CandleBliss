/** @type {import('next').NextConfig} */

const HOST = 'https://candlebliss.me/api';
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
