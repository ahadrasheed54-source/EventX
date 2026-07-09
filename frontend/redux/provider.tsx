"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { setCredentials, setHydrated } from "./slices/authSlice";

function SessionRestorer({ children }: { children: React.ReactNode }) {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = localStorage.getItem("eventx_token");
    const userJson = localStorage.getItem("eventx_user");

    if (token && userJson) {
      try {
        store.dispatch(setCredentials({ token, user: JSON.parse(userJson) }));
      } catch {
        store.dispatch(setHydrated());
      }
    } else {
      store.dispatch(setHydrated());
    }
  }, []);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRestorer>{children}</SessionRestorer>
    </Provider>
  );
}
