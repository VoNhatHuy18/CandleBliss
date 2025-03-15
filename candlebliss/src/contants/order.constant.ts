export enum ORDER_PROCESS_FILTER {
    UNPAID = "UNPAID", // chờ thanh toán
    WAITING_BANKING = "WAITING_BANKING", // chờ thanh toán bằng chuyển khoản ngân hàng
    PROCESSING = "PROCESSING", // đang xử lí
    DELIVERING = "DELIVERING", // đang giao hàng
    WAITING_CONFIRM_USER = "WAITING_CONFIRM_USER", // chờ xử lý
    COMPLETED = "COMPLETED", // đã hoàn thành
    CANCELLED = "CANCELLED", // đã hủy
    REQUEST_REFUND = "REQUEST_REFUND" // đổi trả
}

export const ORDER_PROCESS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: ORDER_PROCESS_FILTER.WAITING_BANKING, label: "Chờ thanh toán" },
    { value: ORDER_PROCESS_FILTER.PROCESSING, label: "Chờ xử lý" },
    { value: ORDER_PROCESS_FILTER.DELIVERING, label: "Đang vận chuyển" },
    { value: ORDER_PROCESS_FILTER.WAITING_CONFIRM_USER, label: "Chờ xác nhận" },
    { value: ORDER_PROCESS_FILTER.COMPLETED, label: "Hoàn thành" },
    { value: ORDER_PROCESS_FILTER.CANCELLED, label: "Đã hủy" },
]

export enum ORDER_PROCESS_STATUS {
    UNPAID = "UNPAID", // chờ thanh toán
    WAITING_BANKING = "WAITING_BANKING", // chờ thanh toán chuyển khoản ngân hàng
    PENDING = "PENDING", // đã đặt hàng
    PROCESSING = "PROCESSING", //đang xử lí

    PACKING = "PACKING", // đang gói hàng
    READY_TO_PICK = "READY_TO_PICK", // chờ lấy hàng
    DELIVERING = "DELIVERING", // đang giao

    WAITING_CONFIRM_USER = "WAITING_CONFIRM_USER", //hoàn thành đơn hàng - chờ user chốt đã nhận hàng
    COMPLETED = "COMPLETED", //hoàn thành
    CANCELLED = "CANCELLED", //hủy
    COMPLAIN = "COMPLAIN", //khiếu nại
    CANCELLED_BY_COMPLAIN = "CANCELLED_BY_COMPLAIN" //hủy đơn hàng từ khiếu nại
}