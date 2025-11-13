import { IoCheckmarkSharp } from "react-icons/io5";
import BaseAppSheet from "./BaseAppSheet";

export default function FieldSheet({
  open,
  title = "전문 분야를 선택해주세요.",
  options = [],
  selectedId,
  onSelect,
  onNext,
  showPrev = false,
  onPrev,
  onClose,
}) {
  return (
    <BaseAppSheet
      open={open}
      title={title}
      onClose={onClose}
      topOffsetPx={60}
      footer={
        <div className="flex gap-2">
          {showPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="h-[48px] min-w-[92px] px-4 rounded-[10px] border border-[#E6E6E6] text-[15px] bg-white"
            >
              이전
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="flex-1 h-[48px] rounded-[10px] text-[15px] font-semibold bg-[#3A3A3A] text-white"
          >
            적용
          </button>
        </div>
      }
    >
      <ul
        className="px-5 py-2 divide-y-2 divide-[#F5F5F5]"
        role="radiogroup"
        aria-label={title}
      >
        {options.map((opt) => {
          const active = selectedId === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => onSelect(opt.id)}
                role="radio"
                aria-checked={active}
                className="w-full flex items-center justify-between py-3.5 focus:outline-none"
              >
                <span
                  className={`text-[16px] ${
                    active
                      ? "text-[#3A3A3A] font-bold"
                      : "text-[#5B5B61] font-medium"
                  }`}
                >
                  {opt.label}
                </span>

                <span className="shrink-0">
                  {active ? (
                    <span className="w-5 h-5 rounded-full bg-[#3094F1] flex items-center justify-center">
                      <IoCheckmarkSharp size={12} className="text-white" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-[#E4E4E7] bg-white block" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </BaseAppSheet>
  );
}
