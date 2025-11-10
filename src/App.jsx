// src/App.jsx
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
import ExperienceDetail from "./pages/experiences/ExperienceDetail";

import MapPage from "./pages/map/MapPage";
import NearbyListPage from "./pages/map/NearbyListPage";
import RegisterHost from "./pages/host/RegisterHost";
import HostBusinessNumber from "./pages/host/HostBusinessNumber";

import AuthProvider from "./contexts/AuthProvider";
import HostBasicInfo from "./pages/host/HostBasicInfo";
import HostComplete from "./pages/host/HostComplete";
import HostProfileSettings from "./pages/host/HostProfileSettings";
import HostLocationPicker from "./pages/host/HostLocationPicker";

// 🔽 새로 추가
import ExplorePage from "./pages/explore/ExplorePage";
import ExploreResultPage from "./pages/explore/ExploreResultPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<MobileApp />} />

          {/* 탐색 탭 */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/result" element={<ExploreResultPage />} />

          <Route path="/map" element={<MapPage />} />
          <Route path="/nearby" element={<NearbyListPage />} />

          <Route path="/register-host" element={<RegisterHost />} />
          <Route
            path="/host/business-number"
            element={<HostBusinessNumber />}
          />
          <Route path="/host/basic-info" element={<HostBasicInfo />} />
          <Route path="/host/complete" element={<HostComplete />} />
          <Route
            path="/host/profile-settings"
            element={<HostProfileSettings />}
          />
          <Route
            path="/host/location-picker"
            element={<HostLocationPicker />}
          />

          <Route path="/signin" element={<SigninEntry />} />
          <Route path="/signin/email" element={<SigninEmail />} />
          <Route path="/oauth-redirect" element={<OAuthRedirect />} />

          <Route path="/signup" element={<SignupLayout />}>
            <Route path="name" element={<Name />} />
            <Route path="nickname" element={<Nickname />} />
            <Route path="account" element={<Account />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          <Route
            path="/experiences/:experienceId"
            element={<ExperienceDetail />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
