import { getOrders, getDetails } from "./order.action"
import { createHook, createStore } from "react-sweet-state"

export type State = {
  orders: Array<any>
  orderDetails: any
}

const initialState: State = {
  orders: [],
  orderDetails: null,
}

const actions = {
  getOrders,
  getDetails
}

const Store = createStore({
  initialState,
  actions
})

export const useOrder = createHook(Store)
