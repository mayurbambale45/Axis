import { configureStore } from '@reduxjs/toolkit';
import { axisApi } from './apiSlice';

export const store = configureStore({
  reducer: {
    [axisApi.reducerPath]: axisApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(axisApi.middleware),
});
