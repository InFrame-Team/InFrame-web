import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { useSignup } from "../../../contexts/SignupContext";

export default function Name() {
  const navigate = useNavigate();
  const { data, setData } = useSignup();

  // 이름이 입력되어야 다음 버튼 활성화
  const isNextEnabled = useMemo(() => data.name.trim().length > 0, [data.name]);

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
          <h1 className="text-[26px] font-bold text-[#3A3A3A]">
            이름을 알려주세요
          </h1>

          <label className="mt-12 pl-1 block text-[15px] text-[#3A3A3A] font-medium">
            이름 <span className="text-[#F13030]">*</span>
          </label>

          {/* 이름 입력란 */}
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ name: e.target.value })}
            placeholder=""
            className="mt-2 w-full bg-transparent border-0 border-b border-[#E9E9E9] outline-none px-1 py-2 text-[15px] text-[#3A3A3A]"
          />
        </main>

        {/* 다음 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-6 pb-6 pt-3">
          <button
            type="button"
            disabled={!isNextEnabled}
            onClick={() => navigate("/signup/nickname")}
            className={`w-full rounded-[8px] text-white text-[14px] font-semibold py-3 transition ${
              isNextEnabled
                ? "bg-[#F13030] hover:bg-[#e02d2d] active:bg-[#e02d2d]"
                : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
