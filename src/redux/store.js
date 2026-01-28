import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import propertyReducer from './propertySlice';
import recommendationReducer from './recommendationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    recommendation: recommendationReducer,
  },
});
