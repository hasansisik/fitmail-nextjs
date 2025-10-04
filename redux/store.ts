// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { mailReducer } from "./reducers/mailReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    mail: mailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
