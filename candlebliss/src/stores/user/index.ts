export interface BaseAction<T> {
  setState: any;
  getState: () => T;
  dispatch: any;
}
