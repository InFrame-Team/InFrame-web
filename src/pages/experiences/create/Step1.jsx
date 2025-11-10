import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import fakeProfile from "../../../assets/fakeProfile.svg";
import StepHeader from "../../../components/StepHeader";

function HostCard() {
  return (
    <div className="flex items-center h-[102px] gap-3 p-4 border-[2px] border-[#E6E6E6] rounded-[10px]">
      <div className="w-[72px] h-[72px] rounded-full bg-[#FFEFEF] flex items-center justify-center text-xl">
        <img src={fakeProfile} />
      </div>

      <div className="flex-1 ml-2">
        <p className="text-[18px] font-bold text-[#3A3A3A]">이지섭 호스트</p>
        <p className="text-[13px] font-medium text-[#A0A0A0] mt-1">
          흙을 담아 삶의 이야기를 빚어냅니다.
        </p>
      </div>
    </div>
  );
}

function DropdownSkeleton({ label, placeholder = "선택", disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-[14px] font-semibold text-[#3A3A3A]">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`w-full h-[46px] px-3 rounded-[5px] border-[2px] text-left text-[14px] flex items-center justify-between ${
            disabled
              ? "bg-[#F7F7F9] text-[#B9B9C1] border-[#F0F0F3] cursor-not-allowed"
              : "bg-white text-[#3A3A3A] border-[#E7E7EA]"
          }`}
        >
          <span className="text-[#969696] text-[15px] font-medium">
            {placeholder}
          </span>
          <IoChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            } ${disabled ? "text-[#D1D1D6]" : "text-[#D4D4D4]"}`}
          />
        </button>

        {/* 드롭 패널 */}
        {open && !disabled && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E7E7EA] rounded-lg shadow-sm overflow-hidden">
            <div className="h-28" />
          </div>
        )}
      </div>
    </div>
  );
}

function TagInputSkeleton() {
  return (
    <div className="w-full">
      <label className="block mb-4 text-[20px] font-bold text-[#3A3A3A]">
        보유한 자격증을 작성해주세요.
      </label>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-[46px] px-3 rounded-[5px] border-[2px] border-[#E6E6E6] bg-white flex items-center justify-between">
          <input
            disabled
            placeholder="추가해 주세요."
            className="w-full bg-transparent outline-none text-[15px] font-medium text-[#969696] placeholder:text-[#969696]"
          />
          <span className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[#D4D4D4] text-[20px] cursor-pointer">
            +
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Step1() {
  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px]">
        <StepHeader onBack={() => navigate(-1)} currentStep={1} />

        <main className="px-5 pb-28">
          {/* 호스트 카드 */}
          <HostCard />

          {/* 필드들 */}
          <section className="mt-8 space-y-7">
            <div>
              <p className="mb-4 text-[20px] font-bold text-[#3A3A3A]">
                분야 카테고리를 선택해주세요.
              </p>
              <DropdownSkeleton placeholder="장인/명인" />
            </div>

            <div>
              <p className="mb-4 text-[20px] font-bold text-[#3A3A3A]">
                전문 분야 및 상세 분야를
                <br /> 선택해주세요.
              </p>
              <div className="space-y-2">
                <DropdownSkeleton placeholder="전문 분야" />
                <DropdownSkeleton placeholder="상세 분야" />
              </div>
            </div>

            <TagInputSkeleton />
          </section>
        </main>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3 border-t border-[#EEE]">
          <button
            type="button"
            className="w-full h-[48px] rounded-[10px] bg-[#3A3A3A] text-white text-[16px] font-bold"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
