import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import MobileApp from "./pages/MobileApp";

import SignupLayout from "./pages/auth/signup/SignupLayout";
import Name from "./pages/auth/signup/Name";
import Nickname from "./pages/auth/signup/Nickname";
import Account from "./pages/auth/signup/Account";
import Onboarding from "./pages/auth/signup/Onboarding";

import SigninEntry from "./pages/auth/signin/SigninEntry";
import SigninEmail from "./pages/auth/signin/SigninEmail";
import OAuthRedirect from "./pages/auth/OAuthRedirect";

import MapPage from "./pages/MapPage";
import NearbyListPage from "./pages/NearbyListPage";

import AuthProvider from "./contexts/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<MobileApp />} />

          <Route path="/map" element={<MapPage />} />
          <Route path="/nearby" element={<NearbyListPage />} />

          <Route path="/signin" element={<SigninEntry />} />
          <Route path="/signin/email" element={<SigninEmail />} />
          <Route path="/oauth-redirect" element={<OAuthRedirect />} />

          <Route path="/signup" element={<SignupLayout />}>
            <Route path="name" element={<Name />} />
            <Route path="nickname" element={<Nickname />} />
            <Route path="account" element={<Account />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
