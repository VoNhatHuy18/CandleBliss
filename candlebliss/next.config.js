/** @type {import('next').NextConfig} */

// Xóa hoặc sửa đổi phần rewrites nếu bạn muốn sử dụng API routes của Next.js
const nextConfig = {
   // Xóa phần rewrites nếu bạn muốn sử dụng API routes của Next.js
   // Hoặc nếu bạn cần chuyển hướng đến API bên ngoài, hãy sửa đổi như sau:

   /*
   async rewrites() {
      return [
         {
            source: '/external-api/:path*',
            destination: 'https://external-api.com/:path*',
         },
      ];
   },
   */
   images: {
      domains: ['example.com', 'localhost', 'res.cloudinary.com', 'placehold.co'],
   },
};

module.exports = nextConfig;
