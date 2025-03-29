import { BaseAction } from ".."
import { State } from "./index"
import { getOrderDetails, getOrdersByStatus } from "@/services/user/order"

type Actions = BaseAction<State>

export const getOrders = (status: string | undefined) => {
  return async (actions: Actions) => {
    try {
      const res = await getOrdersByStatus(status)
      actions.setState({
        ...actions.getState(),
        orders: res?.listData || [{
          id: 1,
          name: 'GIỎ TRUYỀN THÔNG 01 - COMBO 9KG',
          price: 120000,
          quantity: 1,
          image: '/images/image.png',
          type: 'Mùi hương: Hương sen đào',
          status: "PENDING",
          options: [
            { name: 'Kích thước', value: 'Lớn' },
            { name: 'Màu sắc', value: 'Trắng ngà' },
          ],
        },
        {
          id: 2,
          name: 'GIỎ TRUYỀN THÔNG 01 - COMBO 9KG',
          price: 120000,
          quantity: 2,
          image: '/images/image.png',
          type: 'Mùi hương: Hương sen đào',
          status: "COMPLETED",
          options: [
            { name: 'Kích thước', value: 'Trung bình' },
            { name: 'Màu sắc', value: 'Hồng nhạt' },
          ],
        },]
      })
    } catch (error: any) {
      console.log(error);
    }
  }
}

export const getDetails = (id: string) => {
  return async (actions: Actions) => {
    try {
      const res = await getOrderDetails(id)
      actions.setState({
        ...actions.getState(),
        orderDetails: res?.data
      })
    } catch (error: any) {
      console.log(error);
    }
  }
}

