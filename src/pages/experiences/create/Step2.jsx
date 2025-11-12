import React, { useMemo, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { BiSolidCamera } from "react-icons/bi";
import StepHeader from "../../../components/experience_create/StepHeader";
import { IoArrowForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const DURATION_OPTIONS = [
  "30분 내외",
  "1시간",
  "2시간",
  "3시간",
  "4시간",
  "5시간",
  "5시간 이상",
];

const CAPACITY_OPTIONS = ["1명", "2명", "3명", "4명", "5명 이상"];

export default function Step2() {
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [capacity, setCapacity] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const countText = useMemo(() => `${images.length}/1`, [images.length]);

  const openFileDialog = () => {
    if (images.length >= 1) return;
    fileInputRef.current?.click();
  };

  const onFilesChange = (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const item = { id: `${Date.now()}`, url: URL.createObjectURL(file), file };
    setImages([item]);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((it) => it.id !== id));
  };

  const toggleSingle = (current, value, setter) => {
    if (current === value) setter("");
    else setter(value);
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 상단 헤더 */}
        <StepHeader onBack={() => history.back()} currentStep={2} />

        {/* 본문 */}
        <main className="px-5 pt-2 pb-28">
          {/* 제목 */}
          <section className="mb-8">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-4">
              등록할 프로그램 제목을 작성해주세요.
            </h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요."
              className="w-full h-11 rounded-[5px] border-[2px] border-[#E6E6E6] px-4 text-[15px] text-[#3A3A3A] placeholder:text-[#969696] outline-none"
            />
          </section>

          {/* 이미지 업로드 */}
          <section className="mb-6">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-1">
              이미지를 등록해주세요.
            </h2>
            <p className="text-[13px] font-medium text-[#969696] ml-0.5 mb-3">
              사진이 있으면 더 많은 사람들이 확인해요.
            </p>

            <div className="flex items-center gap-3">
              {/* 업로드 버튼 */}
              <button
                type="button"
                onClick={openFileDialog}
                className="shrink-0 w-[64px] h-[64px] rounded-[5px] border-[2px] border-[#E6E6E6] bg-white flex flex-col items-center justify-center"
              >
                <BiSolidCamera size={26} className="text-[#969696]" />
                <span className="text-[12px] text-[#969696]">{countText}</span>
              </button>

              {/* 이미지 썸네일 */}
              {images[0] && (
                <div className="relative w-[64px] h-[64px] rounded-[12px] overflow-hidden border border-[#EDEDED]">
                  <img
                    src={images[0].url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="이미지 삭제"
                    onClick={() => setImages([])}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <RxCross2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFilesChange}
              className="hidden"
            />
          </section>

          {/* 소개 */}
          <section className="mb-6">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-3">
              프로그램 소개를 작성해주세요.
            </h2>
            <button
              type="button"
              onClick={() => navigate("/experience/create/intro")}
              className="w-full h-11 rounded-[5px] border-[2px] border-[#E6E6E6] px-4 flex items-center justify-between"
            >
              <span className="text-[15px] font-medium text-[#969696]">
                프로그램을 추가해 주세요.
              </span>
              <IoArrowForward size={20} className="text-[#D4D4D4]" />
            </button>
          </section>

          {/* 가격 */}
          <section className="mb-8">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-4">
              가격을 설정해주세요.
            </h2>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium transition-colors ${
                  isFocused || price ? "text-[#3A3A3A]" : "text-[#969696]"
                }`}
              >
                ₩
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={
                  price
                    ? Number(price.replaceAll(",", "")).toLocaleString()
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value.replaceAll(",", "");
                  if (!/^\d*$/.test(raw)) return; // 숫자만 입력
                  setPrice(raw);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="가격을 입력해주세요."
                className={`w-full h-11 rounded-[5px] border-[2px] pl-8 pr-4 text-[14px] placeholder:text-[#969696] outline-none transition-colors
        ${isFocused || price ? "border-[#3A3A3A]" : "border-[#E6E6E6]"}
        text-[#3A3A3A]`}
              />
            </div>
          </section>

          {/* 소요 시간 */}
          <section className="mb-8">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-3">
              소요 시간을 설정해주세요.
            </h2>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const selected = duration === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSingle(duration, opt, setDuration)}
                    className={
                      "h-9 px-3 rounded-full border-[2px] text-[15px] " +
                      (selected
                        ? "bg-white border-[#3094F1] text-[#3094F1] font-semibold"
                        : "bg-[#F8F8F8] border-[#F8F8F8] text-[#3A3A3A] font-medium")
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 최대 인원 */}
          <section>
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-3">
              최대 인원을 설정해주세요.
            </h2>
            <div className="flex flex-wrap gap-2">
              {CAPACITY_OPTIONS.map((opt) => {
                const selected = capacity === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSingle(capacity, opt, setCapacity)}
                    className={
                      "h-9 px-3 rounded-full border-[2px] text-[15px] " +
                      (selected
                        ? "bg-white border-[#3094F1] text-[#3094F1] font-semibold"
                        : "bg-[#F8F8F8] border-[#F8F8F8] text-[#3A3A3A] font-medium")
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3 border-t border-[#EEE]">
          <button
            type="button"
            className="w-full h-11 rounded-[10px] bg-[#3A3A3A] text-white text-[14px] font-semibold"
            onClick={() => {}}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
