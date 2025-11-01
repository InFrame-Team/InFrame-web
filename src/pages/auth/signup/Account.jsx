import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import checkIcon from "../../../assets/checkIcon.png";
import checkedIcon from "../../../assets/checkedIcon.png";
import { useSignup } from "../../../contexts/SignupContext";
import { signup } from "../../../apis/auth.jsx";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const hasText = (v) => v.trim().length > 0;

export default function Account() {
  const navigate = useNavigate();
  const { data, setData, reset } = useSignup();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isNextEnabled = useMemo(() => {
    return isEmail(data.email) && hasText(data.password) && data.agreeRequired;
  }, [data.email, data.password, data.agreeRequired]);

  const submit = async () => {
    if (!isNextEnabled) return;
    setEmailError("");

    try {
      setLoading(true);
      const res = await signup({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        name: data.name,
      });

      if (!res.success) {
        // 409면 이메일 중복 메시지 표시
        if (res.status === 409) {
          setEmailError(res.message);
          return;
        } else {
          alert(res.message);
          return;
        }
      }
      reset();
      navigate("/signup/success");
    } catch (e) {
      alert("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
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
        <main className="px-5 pt-12 pb-28">
          <h1 className="text-[26px] font-bold text-[#3A3A3A]">회원가입</h1>

          <label className="mt-12 pl-1 block text-[15px] text-[#3A3A3A] font-medium">
            이메일 주소 <span className="text-[#F13030]">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ email: e.target.value })}
            autoComplete="email"
            className="mt-2 w-full bg-transparent border-0 border-b border-[#E9E9E9] outline-none px-1 py-2 text-[15px] text-[#3A3A3A]"
          />
          {emailError && (
            <p className="text-[#F13030] text-[13px] mt-1 ml-1">{emailError}</p>
          )}

          <label className="mt-12 pl-1 block text-[15px] text-[#3A3A3A] font-medium">
            비밀번호 <span className="text-[#F13030]">*</span>
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => setData({ password: e.target.value })}
            autoComplete="new-password"
            className="mt-2 w-full bg-transparent border-0 border-b border-[#E9E9E9] outline-none px-1 py-2 text-[15px] text-[#3A3A3A]"
          />

          {/* 약관 */}
          <div className="mt-10 space-y-5">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setData({ agreeRequired: !data.agreeRequired })}
            >
              <img
                src={data.agreeRequired ? checkedIcon : checkIcon}
                alt="check"
                className="w-6 h-6"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A]">
                [필수] 만 14세 이상이며 모두 동의합니다.
              </p>
            </div>

            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setData({ agreeOptional: !data.agreeOptional })}
            >
              <img
                src={data.agreeOptional ? checkedIcon : checkIcon}
                alt="check"
                className="w-6 h-6"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A]">
                [선택] 광고성 정보 수신에 모두 동의합니다.
              </p>
            </div>
          </div>
        </main>

        {/* 제출 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-6 pb-6 pt-3">
          <button
            type="button"
            disabled={!isNextEnabled || loading}
            onClick={submit}
            className={`w-full rounded-[8px] text-white text-[14px] font-semibold py-3 transition ${
              isNextEnabled
                ? "bg-[#F13030] hover:bg-[#e02d2d] active:bg-[#e02d2d]"
                : "bg-[#F5B7B7] cursor-not-allowed"
            }`}
          >
            {loading ? "가입 중..." : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
