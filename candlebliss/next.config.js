/** @type {import('next').NextConfig} */
const nextConfig = {
   async rewrites() {
      return [
         {
            source: '/api/:path*',
            destination: 'http://68.183.226.198:3000/api/:path*',
         },
      ];
   },
   images: {
      domains: ['example.com', 'localhost', 'res.cloudinary.com'], 
   },
};

module.exports = nextConfig;
