import React from "react";
import createSuccessImg from "../../../assets/createSuccessImg.png";
import StepHeader from "../../../components/experience_create/StepHeader.jsx";

export default function Step4() {
  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 상단 헤더 */}
        <StepHeader onBack={() => history.back()} currentStep={4} />

        {/* 본문 */}
        <main className="px-5 pt-12 pb-28 flex flex-col items-center">
          <div className="w-[314px] h-[307px] mb-10 flex items-center justify-center">
            <img
              src={createSuccessImg}
              alt="프로그램 등록 완료"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 텍스트 영역 */}
          <h1 className="text-[24px] font-bold text-center mb-2">
            프로그램 등록 완료
          </h1>
          <p className="text-[18px] font-medium text-center leading-relaxed">
            이제 많은 사람들과
            <br />
            특별한 시간을 나눠보세요
          </p>
        </main>

        {/* 하단 버튼 -> 완료 후 리디렉트 경로 지정해야함!! */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3">
          <button
            type="button"
            disabled
            className="w-full h-[48px] rounded-[10px] text-[16px] font-bold bg-[#3A3A3A] text-white"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
