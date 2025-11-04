import React, { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import AuthContext from "../../../contexts/AuthContext";
import { signin } from "../../../apis/auth";

export default function SigninEmail() {
  const navigate = useNavigate();
  const { login: saveLogin } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const isActive = useMemo(
    () => form.email.trim() !== "" && form.password.trim() !== "",
    [form]
  );

  const handleSubmit = async () => {
    if (!isActive || loading) return;
    setLoading(true);
    const res = await signin(form);
    setLoading(false);

    if (res.success) {
      const accessToken = res.data?.accessToken;
      if (accessToken) {
        saveLogin(accessToken);
        navigate("/app", { replace: true }); // 로그인 후 이동하는 페이지 수정 필요
      } else {
        alert("토큰을 받지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 뒤로가기 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[18px] text-[#3A3A3A]"
            >
              <IoChevronBack size={24} />
            </button>
          </div>
        </header>

        {/* 본문 */}
        <main className="px-6 pt-8 pb-24">
          <h1 className="text-[24px] font-bold text-[#3A3A3A] mb-6">
            이메일로 로그인
          </h1>

          <input
            type="email"
            placeholder="이메일 입력"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border-2 border-[#E5E5E5] rounded-[8px] px-4 py-3 text-[15px] mt-10 mb-3 focus:border-[#e02d2d] focus:outline-none"
          />
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border-2 border-[#E5E5E5] rounded-[8px] px-4 py-3 text-[15px] focus:border-[#e02d2d] focus:outline-none"
          />

          <button
            type="button"
            disabled={!isActive || loading}
            onClick={handleSubmit}
            className={`mt-8 w-full rounded-[8px] text-white text-[15px] font-semibold py-3 transition ${
              isActive && !loading
                ? "bg-[#F13030] hover:bg-[#e02d2d] active:bg-[#e02d2d]"
                : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
            }`}
          >
            {loading ? "로그인 중..." : "로그인 하기"}
          </button>
        </main>
      </div>
    </div>
  );
}
