import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ORDER_PROCESS_STATUS } from '@/contants/order.constant';

const renderDescription = (data: any) => {
   switch (data?.status) {
      case ORDER_PROCESS_STATUS.PENDING:
      case ORDER_PROCESS_STATUS.PROCESSING:
         return 'Đơn hàng sẽ được cửa hàng xử lý và giao tới bạn';
      case ORDER_PROCESS_STATUS.DELIVERING:
         return 'Nhà bán đang giao hàng cho bạn';
      case ORDER_PROCESS_STATUS.WAITING_CONFIRM_USER:
      case ORDER_PROCESS_STATUS.COMPLETED:
         return 'Giao hàng thành công';
      default:
         break;
   }
};
const renderOrderStatus = (data: any) => {
   switch (data?.status) {
      case ORDER_PROCESS_STATUS.UNPAID:
      case ORDER_PROCESS_STATUS.WAITING_BANKING:
         return (
            <span className='text-[#FF8754] border-[2px] px-3 py-1 rounded-[16px]'>
               Chờ thanh toán
            </span>
         );
      case ORDER_PROCESS_STATUS.PENDING:
         return (
            <span className='text-[#FFC700] border-[2px] px-3 py-1 rounded-[16px]'>Đã đặt đơn</span>
         );
      case ORDER_PROCESS_STATUS.PROCESSING:
         return (
            <span className='text-[#0060FF] border-[2px] px-3 py-1 rounded-[16px]'>Đang xử lý</span>
         );

      case ORDER_PROCESS_STATUS.PACKING:
         return (
            <span className='text-[#0060FF] border-[2px] px-3 py-1 rounded-[16px]'>
               Đang đóng gói
            </span>
         );
      case ORDER_PROCESS_STATUS.READY_TO_PICK:
         return (
            <span className='text-[#0060FF] border-[2px] px-3 py-1 rounded-[16px]'>
               Chờ vận chuyển
            </span>
         );
      case ORDER_PROCESS_STATUS.DELIVERING:
         return (
            <span className='text-[#0060FF] border-[2px] px-3 py-1 rounded-[16px]'>
               Đang vận chuyển
            </span>
         );

      case ORDER_PROCESS_STATUS.WAITING_CONFIRM_USER:
      case ORDER_PROCESS_STATUS.COMPLETED:
         return (
            <span className='text-[#00A023] border-[2px] px-3 py-1 rounded-[16px]'>
               Đã hoàn thành
            </span>
         );
      case ORDER_PROCESS_STATUS.CANCELLED:
         return (
            <span className='text-[#F24D4D] border-[2px] px-3 py-1 rounded-[16px]'>Đã hủy</span>
         );
      default:
         break;
   }
};

const renderButtons = ({ data, handlePayAgain, setConfirmReceive }: any) => {
   switch (data?.status) {
      case ORDER_PROCESS_STATUS.WAITING_CONFIRM_USER:
         return (
            <button
               className='rounded-[4px] px-3 py-1 text-[14px] bg-[#00A023] text-white'
               onClick={() => setConfirmReceive(true)}
            >
               Đã nhận
            </button>
         );
      case ORDER_PROCESS_STATUS.UNPAID:
      case ORDER_PROCESS_STATUS.WAITING_BANKING:
         return (
            <button
               className='rounded-[4px] px-3 py-1 text-[14px] bg-[#00317e] text-white'
               onClick={handlePayAgain}
            >
               Thanh toán lại
            </button>
         );
      default:
         break;
   }
};

const OrderItem = ({ data }: any) => {
   const [confirmReceive, setConfirmReceive] = useState(false);
   return (
      <>
         <div className='bg-[#fafafa] px-5 py-2 rounded-[8px] mb-[20px]'>
            <div className='mt-1 max-md:max-w-full'>
               <div className='flex gap-5 max-md:flex-col max-md:gap-0'>
                  <div className='flex flex-col w-[47%] max-md:ml-0 max-md:w-full'>
                     <div className='flex gap-2 self-stretch my-auto max-md:mt-[0]'>
                        <div className='flex justify-center items-center min-h-[100px] min-w-[136px] p-3.5 rounded-lg bg-[#F4F4F4] max-md:px-5'>
                           <div className='relative h-full w-full'>
                              <Image
                                 src={data?.image || '/images/image.png'}
                                 alt='logo'
                                 objectFit='contain'
                                 layout='fill'
                                 loading='lazy'
                                 blurDataURL={'/images/logo/store-primary-small.webp'}
                                 placeholder='blur'
                                 unoptimized={true}
                              />
                           </div>
                        </div>
                        <div className='flex flex-col my-auto text-[16px] tracking-normal'>
                           <div className='leading-6 text-slate-950'>{data?.name || ''}</div>
                           <a className='opacity-50 mt-1 text-base tracking-wide text-slate-950 break-words text-truncate-3'>
                              {data?.type || ''}
                           </a>
                           <div className='self-start mt-1 text-center leading-[150%] text-[#868596]'>
                              Số lượng: {data?.quantity || 0}
                           </div>
                           {/* <div className="self-start mt-1 text-center leading-[150%] text-[#868596]">{data?.orderItems?.length > 1 ? `+${calcRemainingQuantity(data.orderItems)} ${t["Product"]}` : null}</div> */}
                        </div>
                     </div>
                  </div>
                  <div className='flex flex-col ml-5 w-[30%] max-md:ml-0 max-md:w-full'>
                     <div className='self-stretch text-left my-auto text-[16px] tracking-normal leading-6  max-md:mt-[10px] max-md:self-start'>
                        Mã đơn: #{data?.code || data?.id || ''}
                     </div>
                  </div>
                  <div className='flex flex-col ml-5 w-[30%] max-md:ml-0 max-md:w-full'>
                     <div className='flex flex-col grow justify-end text-[16px] tracking-normal leading-6 max-md:mt-[10px]'>
                        <div className='self-end max-md:self-start text-end font-bold text-black'>
                           Tổng tiền: {data?.price}
                        </div>
                        <Link
                           href={`/user/order/${data?.code}`}
                           className='flex items-center gap-[4px] self-end max-md:self-start mt-2 text-blue-600 cursor-pointer'
                        >
                           <div>Chi tiết đơn hàng</div>
                           <ChevronRightIcon className='h-[14px] w-[14px] text-blue-600 mt-[4px]' />
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
            <div className='flex items-center justify-between mt-3 border-t-[2px] border-[#f0f0f0] flex-wrap py-2'>
               <div className='text-[#61615e] text-[12px] sm:w-[50%] w-full'>
                  {renderDescription(data)}
               </div>
               <div className='flex items-center flex-wrap gap-[10px] mt-2'>
                  {!data?.complain || (data?.complain && data?.complain?.length === 0)
                     ? renderButtons({ data, handlePayAgain: () => {}, setConfirmReceive })
                     : null}
                  <div className='text-[14px]'>Trạng thái {renderOrderStatus(data)}</div>
               </div>
            </div>
         </div>

         {/* <Modal open={confirmReceive} closeModal={() => setConfirmReceive(false)}>
        <div className="flex flex-col px-[35px] py-[20px] text-xl font-semibold leading-8 text-center rounded-2xl backdrop-blur-[150px] bg-white max-w-[432px] text-neutral-50">
          <div className="flex justify-center items-center min-h-[190px]">
            <div className="w-[200px] h-[200px] opacity-10 object-cover absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%] z-[10]">
              <Image unoptimized={true} src="/images/logo/store-primary-small.webp" alt="/images/logo/store-primary-small.webp" layout="fill" objectFit="cover" />
            </div>
            <div className="w-full flex relative flex-col gap-5">
              <FaCircleInfo color="yellow" size={60} className="self-center aspect-square relative z-[11]" />
              <div className="relative z-[11] break-words w-full">{t["Confirmation of receipt of goods"]} !</div>
              <div className="relative z-[11] flex gap-5 justify-center flex-wrap mt-[10px] max-w-full text-lg tracking-normal leading-6 w-full">
                <div className="justify-center min-w-[150px] items-center p-2 rounded bg-[#d9e7ff] text-black max-md:px-5 cursor-pointer" onClick={(e: any) => setConfirmReceive(false)}>
                  {t["Cancel"]}
                </div>
                <input
                  type="submit"
                  onClick={handleConfirmReceived}
                  className={`w-fit  min-w-[150px] justify-center items-center p-2 bg-blue-900 rounded text-neutral-50 cursor-pointer`}
                  value={t["Confirm"]}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal> */}
      </>
   );
};

export default OrderItem;
