import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean; // becomes true once we've checked localStorage on first load
}

const initialState: AuthState = {
  user: null,
  token: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called on login/register success, and when restoring session from localStorage
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.hydrated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("eventx_token", action.payload.token);
        localStorage.setItem("eventx_user", JSON.stringify(action.payload.user));
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("eventx_user", JSON.stringify(state.user));
        }
      }
    },
    setHydrated: (state) => {
      state.hydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("eventx_token");
        localStorage.removeItem("eventx_user");
      }
    },
  },
});

export const { setCredentials, updateUser, setHydrated, logout } = authSlice.actions;
export default authSlice.reducer;
