// src/pages/auth/Onboarding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import img1 from "../../../assets/onboarding1.png";
import img2 from "../../../assets/onboarding2.png";
import img3 from "../../../assets/onboarding3.png";

const slides = [
  {
    img: img1,
    rows: [
      { size: "sm", text: "빤한 명소 대신, 사람들을 만나", bold: false },
      { size: "lg", text: "특별한 경험을 만나보세요", bold: true },
    ],
  },
  {
    img: img2,
    rows: [
      { size: "sm", text: "관광지 마커 대신,", bold: false },
      { size: "lg", text: "로컬 호스트가", bold: true },
      { size: "lg", text: "당신을 기다립니다.", bold: false },
    ],
  },
  {
    img: img3,
    rows: [
      { size: "sm", text: "AI가 분석한 취향,", bold: false },
      { size: "lg", text: "당신만의 맞춤 만남을", bold: true },
      { size: "lg", text: "시작하세요.", bold: true },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = React.useState(0);
  const isLast = index === slides.length - 1;
  const startX = React.useRef(0);
  const deltaX = React.useRef(0);
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e) => {
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    const th = 50;
    if (deltaX.current > th) prev();
    if (deltaX.current < -th) next();
  };

  const next = () => setIndex((i) => Math.min(i + 1, slides.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const skip = () => navigate("/signin");
  const goLogin = () => {
    if (isLast) navigate("/signin");
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 헤더 + 단계 인디케이터 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="relative px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className={`text-[18px] text-[#3A3A3A] ${
                index === 0 ? "opacity-30 cursor-default" : ""
              }`}
              aria-label="이전"
            >
              <IoChevronBack size={24} />
            </button>

            {/* 중앙 단계 표시 (세그먼트 바) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <div className="flex w-36 h-1.5 rounded-full overflow-hidden">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`flex-1 h-full cursor-pointer transition-colors duration-200 ${
                      i === index ? "bg-[#F13030]" : "bg-[#E5E7EB]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={skip}
              className="text-[#3A3A3A] p-1"
              aria-label="건너뛰기"
            >
              <RxCross2 size={22} />
            </button>
          </div>
        </header>

        {/* 슬라이드 영역 */}
        <main
          className="px-6 pt-6 pb-28 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s, idx) => (
              <section
                key={idx}
                className="min-w-full flex flex-col items-center mt-20"
              >
                <img
                  src={s.img}
                  alt=""
                  className="w-[70%] max-w-[210px] select-none"
                  draggable={false}
                />
                <div className="mt-8 flex flex-col items-center gap-1 text-[#3A3A3A]">
                  {s.rows.map((row, i) => {
                    const isSmall = row.size === "sm";
                    const base = isSmall
                      ? "text-[18px]  text-[#6B7280]" // 보조 문구
                      : "text-[21px] text-[#111827] leading-6"; // 메인 문구
                    const weight = row.bold ? "font-bold" : "font-medium";
                    return (
                      <p key={i} className={`${base} ${weight} text-center`}>
                        {row.text}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-6 pb-6 pt-3">
          <button
            type="button"
            onClick={goLogin}
            disabled={!isLast}
            className={`w-full rounded-[8px] text-[14px] font-semibold py-3 transition ${
              isLast
                ? "bg-[#F13030] text-white hover:bg-[#e02d2d] active:bg-[#e02d2d]"
                : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
            }`}
          >
            로그인 하러가기
          </button>
        </div>
      </div>
    </div>
  );
}
