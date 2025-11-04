import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import MobileApp from "./pages/MobileApp";
import Name from "./pages/auth/signup/Name";
import Nickname from "./pages/auth/signup/Nickname";
import Account from "./pages/auth/signup/Account";
import SignupLayout from "./pages/auth/signup/SignupLayout";
import Onboarding from "./pages/auth/signup/Onboarding";
import MapPage from "./pages/MapPage";
import NearbyListPage from "./pages/NearbyListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<MobileApp />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/nearby" element={<NearbyListPage />} />
        <Route path="/signup" element={<SignupLayout />}>
          <Route path="name" element={<Name />} />
          <Route path="nickname" element={<Nickname />} />
          <Route path="account" element={<Account />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
