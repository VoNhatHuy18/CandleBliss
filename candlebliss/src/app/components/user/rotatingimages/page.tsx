
'use client';
import { useState, useEffect } from 'react';

import Image from 'next/image';

const RotatingImages = () => {
  // Dữ liệu hình ảnh - bạn có thể thay thế với đường dẫn tới các hình ảnh thực
  const imageData = [
    { src: '/images/image.png', alt: 'Hương thơm dịu nhẹ' },
    { src: '/images/image2.png', alt: 'Hương hoa quả tươi mát' },
    { src: '/images/image3.png', alt: 'Hương gỗ ấm áp' }
  ];

  // State để theo dõi vị trí hiện tại
  const [positions, setPositions] = useState([0, 1, 2]);

  // Chức năng xoay hình ảnh theo chu kỳ
  const rotateImages = () => {
    setPositions(prev => [(prev[0] + 1) % 3, (prev[1] + 1) % 3, (prev[2] + 1) % 3]);
  };

  // Tự động xoay hình ảnh mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(rotateImages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
        {positions.map((pos, index) => {
          const isCenter = index === 1;
          return (
            <div 
              key={pos} 
              className={`flex flex-col items-center transition-all duration-500 ease-in-out ${
                isCenter ? 'md:scale-125 z-10' : 'z-0'
              }`}
              style={{ 
                transform: isCenter ? 'scale(1.25)' : 'scale(1)',
                opacity: isCenter ? 1 : 0.8
              }}
            >
              <div className="overflow-hidden rounded-t-full px-9">
                <Image
                  src={imageData[pos].src}
                  alt={imageData[pos].alt}
                  className="w-full h-auto max-w-xs object-cover"
                  width={500}
                  height={500}
                />
              </div>
              <p className="text-lg text-center mt-2 font-medium">
                {imageData[pos].alt}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RotatingImages;