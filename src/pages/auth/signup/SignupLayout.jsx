import React from "react";
import { Outlet } from "react-router-dom";
import { SignupProvider } from "../../../contexts/SignupContext";

export default function SignupLayout() {
  return (
    <SignupProvider>
      <Outlet />
    </SignupProvider>
  );
}
