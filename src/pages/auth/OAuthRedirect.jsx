// src/pages/OAuthRedirect.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuthRedirect() {
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (!token) {
      // 토큰 없으면 에러 안내 후 로그인 페이지 등으로
      navigate("/signin?error=oauth_no_token", { replace: true });
      return;
    }

    // 1) 보관 (예: localStorage) — 임시 방식
    localStorage.setItem("accessToken", token);

    // 2) 전역 상태(Context/Zustand 등) 갱신이 필요하면 여기서
    // setAuth({ isLoggedIn: true, token, ... })

    // 3) 메인으로 이동
    navigate("/app", { replace: true });
  }, [search, navigate]);

  return <div>로그인 처리 중입니다...</div>;
}
