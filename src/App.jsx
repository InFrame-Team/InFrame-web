import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import MobileApp from "./pages/MobileApp";
import Name from "./pages/auth/signup/Name";
import Nickname from "./pages/auth/signup/Nickname";
import Account from "./pages/auth/signup/Account";
import Success from "./pages/auth/signup/Success";
import { SignupProvider } from "./contexts/SignupContext";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<MobileApp />} />
        <Route
          path="/signup/*"
          element={
            <SignupProvider>
              <Routes>
                <Route path="name" element={<Name />} />
                <Route path="nickname" element={<Nickname />} />
                <Route path="account" element={<Account />} />
                <Route path="success" element={<Success />} />
              </Routes>
            </SignupProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
