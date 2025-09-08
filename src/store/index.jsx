
import { configureStore } from "@reduxjs/toolkit"; // RTK store creator
import allDataReducer from "./slices/allDataSlice";       // the reducer we just created

// Create the Redux store and register our slice under the 'allData' key
export const store = configureStore({
  reducer: {
    allData: allDataReducer,                       // state.allData -> handled by allDataReducer
  },
});
