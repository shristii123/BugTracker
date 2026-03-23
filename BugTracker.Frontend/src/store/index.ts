import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bugsReducer from './bugsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bugs: bugsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
