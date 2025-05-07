'use client';

interface StarRatingProps {
    rating: number;
    reviewCount?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

const StarRating = ({ rating, reviewCount = 0, size = 'md', showCount = true }: StarRatingProps) => {
    // Kích thước sao dựa vào prop size
    const starSize = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    }[size];

    return (
        <div className="flex items-center">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    // Xác định loại sao (đầy, nửa, trống)
                    return (
                        <div key={star} className="relative">
                            {/* Sao nền (màu xám) */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`${starSize} text-gray-300`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>

                            {/* Sao màu (vàng) với độ rộng tính theo rating */}
                            {rating >= star - 1 && (
                                <div
                                    className="absolute top-0 left-0 overflow-hidden"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, (rating - (star - 1)) * 100))}%`
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`${starSize} text-yellow-400`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showCount && reviewCount > 0 && (
                <span className={`text-gray-500 ml-1 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
                    ({reviewCount})
                </span>
            )}
        </div>
    );
};

export default StarRating;