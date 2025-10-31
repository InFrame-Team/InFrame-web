import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import checkIcon from "../../../assets/checkIcon.png";
import checkedIcon from "../../../assets/checkedIcon.png";

export default function Account() {
  const navigate = useNavigate();

  // 입력값, 동의 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeOptional, setAgreeOptional] = useState(false);

  // 버튼 활성화 조건: 이메일 입력 + 비밀번호 입력 + 필수 동의 체크
  const isNextEnabled = useMemo(() => {
    const hasEmail = email.trim().length > 0;
    const hasPassword = password.trim().length > 0;
    return hasEmail && hasPassword && agreeRequired;
  }, [email, password, agreeRequired]);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 뒤로가기 버튼 */}
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
        <main className="px-5 pt-12 pb-28">
          <h1 className="text-[26px] font-bold text-[#3A3A3A]">회원가입</h1>

          <label className="mt-12 pl-1 block text-[15px] text-[#3A3A3A] font-medium">
            이메일 주소 <span className="text-[#F13030]">*</span>
          </label>

          {/* 이메일 입력란 */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-2 w-full bg-transparent border-0 border-b border-[#E9E9E9] outline-none px-1 py-2 text-[15px] text-[#3A3A3A]"
          />

          <label className="mt-12 pl-1 block text-[15px] text-[#3A3A3A] font-medium">
            비밀번호 <span className="text-[#F13030]">*</span>
          </label>

          {/* 비밀번호 입력란 */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="mt-2 w-full bg-transparent border-0 border-b border-[#E9E9E9] outline-none px-1 py-2 text-[15px] text-[#3A3A3A]"
          />

          {/* 약관 동의 영역 */}
          <div className="mt-10 space-y-5">
            {/* 필수 동의 */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setAgreeRequired(!agreeRequired)}
            >
              <img
                src={agreeRequired ? checkedIcon : checkIcon}
                alt="check"
                className="w-6 h-6"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A]">
                [필수] 만 14세 이상이며 모두 동의합니다.
              </p>
            </div>

            {/* 선택 동의 */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setAgreeOptional(!agreeOptional)}
            >
              <img
                src={agreeOptional ? checkedIcon : checkIcon}
                alt="check"
                className="w-6 h-6"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A]">
                [선택] 광고성 정보 수신에 모두 동의합니다.
              </p>
            </div>
          </div>
        </main>

        {/* 다음 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-6 pb-6 pt-3">
          <button
            type="button"
            disabled={!isNextEnabled}
            onClick={() => navigate("/signup/success")}
            className={`w-full rounded-[8px] text-white text-[14px] font-semibold py-3 transition ${
              isNextEnabled
                ? "bg-[#F13030] hover:bg-[#e02d2d] active:bg-[#e02d2d]"
                : "bg-[#F5B7B7] cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
