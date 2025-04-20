import React, { useState } from 'react';
import Image from 'next/image';

interface OrderActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    actionType: 'cancel' | 'exchange' | 'refund';
    onSubmit: (reason: string, files: File[]) => void;
    isLoading: boolean;
}

const OrderActionModal: React.FC<OrderActionModalProps> = ({
    isOpen,
    onClose,
    title,
    actionType,
    onSubmit,
    isLoading,
}) => {
    const [reason, setReason] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Reset state when modal closes
    const handleClose = () => {
        setReason('');
        setFiles([]);
        setPreviewUrls([]);
        onClose();
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);

            // Create preview URLs for the images
            const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newPreviewUrls]);
        }
    };

    // Remove file and its preview
    const handleRemoveFile = (index: number) => {
        const updatedFiles = [...files];
        const updatedPreviews = [...previewUrls];

        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(updatedPreviews[index]);

        updatedFiles.splice(index, 1);
        updatedPreviews.splice(index, 1);

        setFiles(updatedFiles);
        setPreviewUrls(updatedPreviews);
    };

    const handleSubmit = () => {
        onSubmit(reason, files);
    };

    // Thêm mô tả quy trình xử lý dựa trên loại hành động
    const getProcessDescription = () => {
        if (actionType === 'cancel') {
            return (
                <div className="mb-4 text-sm bg-gray-50 p-3 rounded-md">
                    <p className="font-medium text-gray-700 mb-2">Quy trình hủy đơn:</p>
                    <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                        <li>Bạn gửi yêu cầu hủy đơn hàng</li>
                        <li>Đơn hàng sẽ chuyển sang trạng thái <span className="font-medium text-red-600">Đã huỷ</span></li>
                        <li>Nếu đã thanh toán, khoản tiền sẽ được hoàn trả trong vòng 7-14 ngày làm việc</li>
                    </ol>
                </div>
            );
        } else if (actionType === 'exchange') {
            return (
                <div className="mb-4 text-sm bg-gray-50 p-3 rounded-md">
                    <p className="font-medium text-gray-700 mb-2">Quy trình đổi/trả hàng:</p>
                    <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                        <li>Bạn gửi yêu cầu đổi/trả hàng</li>
                        <li>Đơn hàng sẽ chuyển sang trạng thái <span className="font-medium text-yellow-600">Đổi trả hàng</span></li>
                        <li>Nếu được duyệt, trạng thái sẽ chuyển thành <span className="font-medium text-blue-600">Đã chấp nhận đổi trả</span></li>
                        <li>Sau khi giao hàng mới, trạng thái sẽ chuyển thành <span className="font-medium text-green-600">Đã hoàn thành đổi trả và hoàn tiền</span></li>
                        <li>Nếu bị từ chối, trạng thái sẽ chuyển thành <span className="font-medium text-red-600">Đã từ chối đổi trả</span></li>
                    </ol>
                </div>
            );
        } else {
            return (
                <div className="mb-4 text-sm bg-gray-50 p-3 rounded-md">
                    <p className="font-medium text-gray-700 mb-2">Quy trình trả hàng hoàn tiền:</p>
                    <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                        <li>Bạn gửi yêu cầu trả hàng hoàn tiền</li>
                        <li>Đơn hàng sẽ chuyển sang trạng thái <span className="font-medium text-yellow-600">Trả hàng hoàn tiền</span></li>
                        <li>Sau khi nhận lại hàng, trạng thái sẽ chuyển thành <span className="font-medium text-yellow-600">Đang chờ hoàn tiền</span></li>
                        <li>Khoản tiền sẽ được hoàn trả trong vòng 7-14 ngày làm việc</li>
                        <li>Khi hoàn tiền xong, trạng thái sẽ chuyển thành <span className="font-medium text-green-600">Hoàn tiền thành công</span></li>
                        <li>Nếu quá trình xảy ra lỗi, trạng thái sẽ chuyển thành <span className="font-medium text-red-600">Hoàn tiền thất bại</span></li>
                    </ol>
                </div>
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 md:mx-auto">
                {/* Modal header */}
                <div className="flex items-start justify-between p-4 border-b rounded-t">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>

                {/* Process description */}
                {getProcessDescription()}

                {/* Modal body */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {actionType === 'cancel' ? 'Lý do hủy đơn' : actionType === 'exchange' ? 'Lý do đổi/trả hàng' : 'Lý do trả hàng và hoàn tiền'}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            rows={4}
                            placeholder={`Vui lòng nhập lý do ${actionType === 'cancel' ? 'hủy đơn hàng' : actionType === 'exchange' ? 'đổi/trả hàng' : 'trả hàng và hoàn tiền'}`}
                            required
                        />
                    </div>

                    {/* File upload for exchange and refund only */}
                    {actionType !== 'cancel' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hình ảnh minh chứng
                            </label>
                            <div className="mt-1 flex items-center">
                                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                    <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tải hình ảnh lên
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        multiple
                                    />
                                </label>
                                <span className="ml-2 text-xs text-gray-500">
                                    (Tối đa 5 hình ảnh)
                                </span>
                            </div>

                            {/* Image previews */}
                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index}`}
                                                width={100}
                                                height={100}
                                                className="object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b">
                    <button
                        type="button"
                        className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                        onClick={handleClose}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none ${actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                            actionType === 'exchange' ? 'bg-purple-600 hover:bg-purple-700' :
                                'bg-yellow-600 hover:bg-yellow-700'
                            } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={handleSubmit}
                        disabled={isLoading || !reason}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </div>
                        ) : (
                            actionType === 'cancel' ? 'Xác nhận hủy đơn' :
                                actionType === 'exchange' ? 'Xác nhận đổi/trả' :
                                    'Xác nhận trả hàng hoàn tiền'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderActionModal;