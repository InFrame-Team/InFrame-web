import { IoChevronBack } from "react-icons/io5";

export default function StepHeader({
  onBack,
  title = "프로그램 등록/수정",
  currentStep = 1,
  totalSteps = 4,
}) {
  const segmentPct = 100 / totalSteps;
  const leftPct = segmentPct * (currentStep - 1);

  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="relative flex items-center justify-center h-12 px-3">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="absolute left-3 w-9 h-9 flex items-center justify-center"
        >
          <IoChevronBack size={22} className="text-[#3A3A3A]" />
        </button>

        {/* 진행 바 */}
        <div className="relative w-[120px] h-[6px] bg-[#F2F2F2] rounded-full overflow-hidden">
          <div
            className="absolute top-0 h-[6px] bg-[#F13030] rounded-full transition-all duration-300"
            style={{ left: `${leftPct}%`, width: `${segmentPct}%` }}
          />
        </div>
      </div>

      {/*  4단계에서는 제목 숨김 */}
      {currentStep !== 4 && (
        <h1 className="text-center text-[18px] font-bold text-[#3A3A3A] mt-1 mb-7">
          {title}
        </h1>
      )}
    </header>
  );
}
