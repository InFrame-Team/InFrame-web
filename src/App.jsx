import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import MobileApp from "./pages/MobileApp";
import Name from "./pages/auth/signup/Name";
import Nickname from "./pages/auth/signup/Nickname";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<MobileApp />} />
        <Route path="/signup/name" element={<Name />} />
        <Route path="/signup/nickname" element={<Nickname />} />
      </Routes>
    </BrowserRouter>
  );
}
