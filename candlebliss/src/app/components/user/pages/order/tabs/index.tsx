import {  ORDER_PROCESS_OPTIONS } from '@/contants/order.constant';
import { useOrder } from '@/stores/user/order';
import { useEffect } from 'react';

interface Props {
   handleFilterByStatus: (value: string) => void;
   orderStatus: string;
}

const Tabs = (props: Props) => {
   const [orderStore, orderAction] = useOrder();

   const handleTabClick = (status: string) => {
      orderAction.getOrders(status);
      props.handleFilterByStatus(status);
   };

   useEffect(() => {
      orderAction.getOrders(props.orderStatus);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className='w-full flex max-w-full overflow-x-auto pb-[10px] md:pb-0 bg-[#fff] pt-[12px] pl-[20px] rounded-t-[8px] gap-[20px]'>
         {ORDER_PROCESS_OPTIONS.map((item, index) => {
            return (
               <div
                  key={index}
                  onClick={() => {
                     handleTabClick(item.value);
                  }}
                  className={`text-[14px] font-bold whitespace-nowrap text-center border-b-[2px] border-b-[transparent] cursor-pointer transition-all w-auto py-[4px] px-[10px] 
                  ${
                     props.orderStatus === item.value
                        ? 'border-b-[var(--color-primary)] text-primary'
                        : ''
                  }`}
               >
                  {item.label}
               </div>
            );
         })}
      </div>
   );
};
export default Tabs;
