import React from "react";
import loginBg from "../../../assets/loginBg.png";
import logo from "../../../assets/logo.png";
import mainIcon from "../../../assets/mailIcon.png";
import kakaoIcon from "../../../assets/kakaoIcon.png";
import naverIcon from "../../../assets/naverIcon.png";
import vector1 from "../../../assets/vector1.png";
import vector2 from "../../../assets/vector2.png";
import { useNavigate } from "react-router-dom";
import { socialLogin } from "../../../apis/auth";

export default function SigninEntry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative overflow-hidden">
        {/* 상단 */}
        <div className="relative h-[60vh] w-full">
          {/* 배경 이미지 */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${loginBg})` }}
          />

          {/* 옅어지는 오버레이 */}
          <div
            className="absolute inset-x-0 bottom-0 h-[45%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.95) 90%, rgba(255,255,255,1) 100%)",
            }}
          />

          {/* 로고 */}
          <header className="relative z-10 flex flex-col items-center pt-14">
            <img src={logo} alt="로고" className="w-[152px] h-auto" />
            <div className="flex items-center gap-[7px] mt-5">
              <img
                src={vector1}
                alt="지구본 아이콘"
                className="w-[10px] h-[10px]"
              />
              <span className="text-[13px] text-white font-medium">
                대한민국
              </span>
              <img
                src={vector2}
                alt="폴리곤 아이콘"
                className="w-[4px] h-[4px] mt-[2px]"
              />
            </div>
          </header>
        </div>

        {/* 하단 */}
        <main className="bg-white px-5 pb-28">
          <div className="flex flex-col text-center text-[21px] text-[#3A3A3A] font-bold">
            <p>장소 대신 사람을 만나는,</p>
            <p>경산 기반의 로컬 인물 발견 플랫폼</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {/* 이메일 로그인 */}
            <button
              type="button"
              onClick={() => navigate("/signin/email")}
              className="w-full h-[48px] rounded-[10px] bg-white border border-[#E5E5E5] text-[15px] text-[#3A3A3A] font-medium flex items-center justify-center gap-2"
            >
              <img src={mainIcon} alt="이메일 아이콘" className="w-4 h-4" />
              이메일로 로그인
            </button>

            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={() => socialLogin("kakao")}
              className="w-full h-[48px] rounded-[10px] bg-white border border-[#E5E5E5] text-[15px] text-[#3A3A3A] font-medium flex items-center justify-center gap-2"
            >
              <img src={kakaoIcon} alt="카카오 아이콘" className="w-4 h-4" />
              카카오로 로그인
            </button>

            {/* 네이버 로그인 */}
            <button
              type="button"
              onClick={() => socialLogin("naver")}
              className="w-full h-[48px] rounded-[10px] bg-white border border-[#E5E5E5] text-[15px] text-[#3A3A3A] font-medium flex items-center justify-center gap-2"
            >
              <img src={naverIcon} alt="네이버 아이콘" className="w-4 h-4" />
              네이버로 로그인
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/signup/name")}
            className="mt-6 block mx-auto text-[13px] text-[#555558] underline"
          >
            회원가입
          </button>
        </main>
      </div>
    </div>
  );
}
