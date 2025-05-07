// Create this in a new file: d:\New folder\candlebliss\src\app\components\modals\ReturnRequestModal.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ReturnRequestModalProps {
    isOpen: boolean;
    orderId: number;
    type: 'exchange' | 'refund'; // exchange = đổi/trả, refund = trả hàng hoàn tiền
    onClose: () => void;
    onSubmit: (data: { reason: string; images: File[] }, orderId: number) => Promise<void>;
}

export default function ReturnRequestModal({
    isOpen,
    orderId,
    type,
    onClose,
    onSubmit,
}: ReturnRequestModalProps) {
    const [reason, setReason] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Limit to 5 images
            if (images.length + filesArray.length > 5) {
                setError('Chỉ được chọn tối đa 5 hình ảnh');
                return;
            }

            const newImages = [...images, ...filesArray];
            setImages(newImages);

            // Create preview URLs
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setImagesPreviews([...imagesPreviews, ...newPreviews]);

            setError('');
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        const newPreviews = [...imagesPreviews];

        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        setImages(newImages);
        setImagesPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (reason.trim() === '') {
            setError('Vui lòng nhập lý do đổi/trả hàng');
            return;
        }

        if (images.length === 0) {
            setError('Vui lòng tải lên ít nhất một hình ảnh');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await onSubmit({ reason, images }, orderId);

            // Clean up preview URLs to prevent memory leaks
            imagesPreviews.forEach(preview => URL.revokeObjectURL(preview));

            // Reset form
            setReason('');
            setImages([]);
            setImagesPreviews([]);

            // Close the modal
            onClose();
        } catch (err) {
            console.error('Error submitting return request:', err);
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium">
                        {type === 'exchange' ? 'Yêu cầu đổi/trả hàng' : 'Yêu cầu trả hàng hoàn tiền'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Lý do {type === 'exchange' ? 'đổi/trả' : 'trả hàng hoàn tiền'} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-32 border border-gray-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                            placeholder={`Nhập lý do ${type === 'exchange' ? 'đổi/trả' : 'trả hàng hoàn tiền'} của bạn...`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hình ảnh sản phẩm <span className="text-red-500">*</span>
                            <span className="ml-1 text-xs text-gray-500">(Tối đa 5 hình)</span>
                        </label>

                        {/* Image previews */}
                        {imagesPreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-2 mb-2">
                                {imagesPreviews.map((preview, index) => (
                                    <div key={index} className="relative h-20 bg-gray-100 rounded">
                                        <Image
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            sizes="80px"
                                            style={{ objectFit: 'contain' }}
                                            className="p-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Image upload button */}
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="image-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                                    >
                                        <span>Chọn hình ảnh</span>
                                        <input
                                            id="image-upload"
                                            name="image-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="sr-only"
                                            disabled={images.length >= 5}
                                        />
                                    </label>
                                    <p className="pl-1">hoặc kéo thả vào đây</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex justify-end space-x-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${type === 'exchange'
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-yellow-600 hover:bg-yellow-700'
                                }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'Gửi yêu cầu'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}