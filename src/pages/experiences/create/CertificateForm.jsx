import React, { useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useExperienceCreate } from "../../../contexts/ExperienceCreateContext";

export default function CertificateForm() {
  const navigate = useNavigate();
  const { data, update } = useExperienceCreate();
  const [name, setName] = useState(data.certificateName || "");
  const [issuer, setIssuer] = useState(data.certificateIssuer || "");
  const [year, setYear] = useState(data.certificateYear || "");

  const onBack = () => navigate(-1);

  const onChangeYear = (e) => {
    // 숫자만, 4자리 제한
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(onlyDigits);
  };

  const canSave =
    name.trim().length > 0 && // 자격증명 입력
    issuer.trim().length > 0 && // 발행처/기관 입력
    year.trim().length === 4; // 취득년도 4자리

  const onSave = () => {
    if (!canSave) return;

    const certString = [name, issuer, year].filter(Boolean).join(" / ");

    update({
      certificateName: name,
      certificateIssuer: issuer,
      certificateYear: year,
      certifications: certString,
    });

    navigate(-1);
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px]">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="h-12 relative flex items-center justify-center px-3">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={onBack}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center"
            >
              <IoChevronBack size={22} className="text-[#3A3A3A]" />
            </button>
            <h1 className="text-[15px] font-semibold text-[#3A3A3A]">자격증</h1>
          </div>
        </header>

        {/* 본문 */}
        <main className="px-5 pt-12 pb-28">
          <p className="mb-4 text-[20px] font-bold text-[#3A3A3A]">자격증</p>

          {/* 자격증명 */}
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="자격증 입력"
              autoComplete="off"
              className="w-full h-[46px] px-3 py-0 rounded-[5px] border-[2px] border-[#E7E7EA]
                         bg-white text-[15px] font-medium text-[#3A3A3A]
                         placeholder:text-[#969696] focus:placeholder-transparent
                         outline-none appearance-none leading-none"
            />
          </div>

          {/* 발행처/기관 + 취득년도 */}
          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2 w-full">
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="발행처 · 발행기관"
              autoComplete="off"
              className="min-w-0 h-[46px] px-3 py-0 rounded-[5px] border-[2px] border-[#E7E7EA]
                         bg-white text-[15px] font-medium text-[#3A3A3A]
                         placeholder:text-[#969696] focus:placeholder-transparent
                         outline-none appearance-none leading-none"
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={year}
              onChange={onChangeYear}
              placeholder="취득년도"
              autoComplete="off"
              className="h-[46px] px-3 py-0 rounded-[5px] border-[2px] border-[#E7E7EA]
                         bg-white text-[15px] font-medium text-[#3A3A3A]
                         placeholder:text-[#969696] focus:placeholder-transparent
                         outline-none appearance-none leading-none text-left"
            />
          </div>
        </main>

        {/* 하단 고정 저장 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3 border-t border-[#EEE]">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={`w-full h-[48px] rounded-[10px] text-[16px] font-bold ${
              canSave
                ? "bg-[#F13030] text-white"
                : "bg-[#F9B4B4] text-white/80 cursor-not-allowed"
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
