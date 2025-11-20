import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

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
import ExplorePage from "./pages/explore/ExplorePage";
import ExploreResultPage from "./pages/explore/ExploreResultPage";

import Step1 from "./pages/experiences/create/Step1";
import CertificateForm from "./pages/experiences/create/CertificateForm";
import Step2 from "./pages/experiences/create/Step2";
import Step3 from "./pages/experiences/create/Step3";
import Step4 from "./pages/experiences/create/Step4";
import { ExperienceCreateProvider } from "./contexts/ExperienceCreateContext";
import ReservationHistoryPage from "./pages/reservation/ReservationHistoryPage";
import ReviewCreatePage from "./pages/reservation/ReviewCreatePage";
import ReservationDetailPage from "./pages/reservation/ReservationDetailPage";
import ReservationCancelPage from "./pages/reservation/ReservationCancelPage";
import ReservationCancelDonePage from "./pages/reservation/ReservationCancelDonePage";
import HostDetailPage from "./pages/host/HostDetailPage";
import HostProgramListPage from "./pages/host/HostProgramListPage";

function ExperienceCreateLayout() {
  return (
    <ExperienceCreateProvider>
      <Outlet />
    </ExperienceCreateProvider>
  );
}

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
          {/* 호스트 상세 정보 */}
          <Route path="/host/:hostId" element={<HostDetailPage />} />
          <Route
            path="/host/:hostId/programs"
            element={<HostProgramListPage />}
          />
          {/* 체험 상세 페이지 */}
          <Route
            path="/experiences/:experienceId"
            element={<ExperienceDetail />}
          />
          {/* 체험 생성 */}
          <Route path="/experience/create" element={<ExperienceCreateLayout />}>
            <Route path="step1" element={<Step1 />} />
            <Route path="step2" element={<Step2 />} />
            <Route path="step3" element={<Step3 />} />
            <Route path="step4" element={<Step4 />} />
            <Route path="certificate" element={<CertificateForm />} />
          </Route>
          {/* 예약 내역 */}
          <Route path="/my/reservations" element={<ReservationHistoryPage />} />
          <Route
            path="/my/reservations/:reservationId/review"
            element={<ReviewCreatePage />}
          />
          <Route
            path="/my/reservations/:reservationId"
            element={<ReservationDetailPage />}
          />
          <Route
            path="/my/reservations/:reservationId/cancel"
            element={<ReservationCancelPage />}
          />
          <Route
            path="/my/reservations/:reservationId/cancel/done"
            element={<ReservationCancelDonePage />}
          />
          ;
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
