// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { mailReducer } from "./reducers/mailReducer";
import premiumReducer from "./reducers/premiumReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    mail: mailReducer,
    premium: premiumReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
