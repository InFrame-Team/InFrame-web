import React, { createContext, useContext, useState } from "react";

const defaultState = {
  name: "",
  nickname: "",
  email: "",
  password: "",
  agreeRequired: false, // 서버 전송 X, 검증용
  agreeOptional: false, // 서버 전송 X
};

const SignupContext = createContext(null);

export function SignupProvider({ children }) {
  const [data, setDataState] = useState(defaultState);
  const setData = (patch) => setDataState((prev) => ({ ...prev, ...patch }));
  const reset = () => setDataState(defaultState);
  return (
    <SignupContext.Provider value={{ data, setData, reset }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("useSignup은 SignupProvider 내부에서만 사용");
  return ctx;
}
