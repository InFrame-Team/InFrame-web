import React, { useMemo, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { BiSolidCamera } from "react-icons/bi";
import StepHeader from "../../../components/experience_create/StepHeader";
import { useNavigate } from "react-router-dom";
import { useExperienceCreate } from "../../../contexts/ExperienceCreateContext";

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

// UI 라벨 -> API 에 들어가는 시간(시간 단위 숫자)
const DURATION_TO_HOURS = {
  "30분 내외": 1,
  "1시간": 1,
  "2시간": 2,
  "3시간": 3,
  "4시간": 4,
  "5시간": 5,
  "5시간 이상": 5,
};

// UI 라벨 -> 최대 인원 숫자
const CAPACITY_TO_INT = {
  "1명": 1,
  "2명": 2,
  "3명": 3,
  "4명": 4,
  "5명 이상": 5, // 최소 기준
};

// 저장된 숫자값을 다시 라벨로
const hoursToDurationLabel = (h) => {
  const entry = Object.entries(DURATION_TO_HOURS).find(([, val]) => val === h);
  return entry ? entry[0] : "";
};

const capacityToLabel = (n) => {
  const entry = Object.entries(CAPACITY_TO_INT).find(([, val]) => val === n);
  return entry ? entry[0] : "";
};

export default function Step2() {
  const navigate = useNavigate();
  const { data, update } = useExperienceCreate();

  const [isFocused, setIsFocused] = useState(false);

  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");
  const [price, setPrice] = useState(
    data.price !== undefined && data.price !== null ? String(data.price) : ""
  );
  const [duration, setDuration] = useState(
    data.durationInHours ? hoursToDurationLabel(data.durationInHours) : ""
  );
  const [capacity, setCapacity] = useState(
    data.maxCapacityPerSlot ? capacityToLabel(data.maxCapacityPerSlot) : ""
  );

  const [images, setImages] = useState(() => {
    if (data.mainImageFile) {
      return [
        {
          id: "saved",
          url: URL.createObjectURL(data.mainImageFile),
          file: data.mainImageFile,
        },
      ];
    }
    return [];
  });

  const fileInputRef = useRef(null);

  const countText = useMemo(() => `${images.length}/1`, [images.length]);
  const descCount = useMemo(() => description.length, [description]);

  const saveStep2ToContext = () => {
    const durationInHours = DURATION_TO_HOURS[duration] ?? 1;
    const maxCapacityPerSlot = CAPACITY_TO_INT[capacity] ?? 1;

    update({
      title,
      description,
      price,
      durationInHours,
      maxCapacityPerSlot,
      mainImageFile: images[0]?.file || null,
    });
  };

  const canNext = useMemo(() => {
    return (
      title.trim() &&
      description.trim() &&
      price.trim() &&
      duration &&
      capacity &&
      images.length > 0
    );
  }, [title, description, price, duration, capacity, images.length]);

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

  const removeImage = () => {
    setImages([]);
  };

  const toggleSingle = (current, value, setter) => {
    if (current === value) setter("");
    else setter(value);
  };

  const handleNext = () => {
    if (!canNext) return;
    saveStep2ToContext();
    navigate("/experience/create/step3");
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
                    onClick={removeImage}
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

          {/* 프로그램 소개 */}
          <section className="mb-8">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-3">
              프로그램 소개를 작성해주세요.
            </h2>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 50))}
                placeholder={
                  "예) 프리미엄 원두와 견과류, 제철 과일을 활용해 직접 초콜릿을 만들어 보세요.\n" +
                  "어떤 체험인지, 진행 방식과 특징을 간단히 설명해 주세요."
                }
                rows={4}
                className="w-full h-[90px] rounded-[5px] border-[2px] border-[#E6E6E6] px-4 py-3 text-[13px] text-[#3A3A3A] placeholder:text-[#B6B6B6] outline-none resize-none"
              />
              <div className="text-[12px] mt-1 text-right">
                <span className="text-[#3A3A3A] font-medium">{descCount}</span>
                <span className="text-[#8E8E93]"> / 50</span>
              </div>
            </div>
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
                  if (!/^\d*$/.test(raw)) return; // 숫자만
                  setPrice(raw);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="가격을 입력해주세요."
                className={`w-full h-11 rounded-[5px] border-[2px] pl-8 pr-4 text-[14px] placeholder:text-[#969696] outline-none transition-colors
                  ${
                    isFocused || price ? "border-[#3A3A3A]" : "border-[#E6E6E6]"
                  }
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
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3">
          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className={`w-full h-[48px] rounded-[10px] text-[16px] font-bold ${
              canNext
                ? "bg-[#3A3A3A] text-white"
                : "bg-[#EDEDED] text-[#B1B1B1] cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
