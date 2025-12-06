
import { configureStore } from "@reduxjs/toolkit";
import allDataReducer from "./slices/allDataSlice"; 

const store = configureStore({
  reducer: {
    allData: allDataReducer,
  },
});

export default store;