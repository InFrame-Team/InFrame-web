import React from "react";
import { IoCheckmarkSharp } from "react-icons/io5";
import BaseAppSheet from "./BaseAppSheet";

export default function CategorySheet({
  open,
  title = "선택해주세요.",
  options = [],
  selectedId,
  onSelect,
  onApply,
  onClose,
}) {
  const handleApply = () => {
    if (!selectedId) return;
    const selected = options.find((o) => o.id === selectedId);
    onApply?.(selected);
    onClose?.();
  };

  return (
    <BaseAppSheet
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={handleApply}
          disabled={!selectedId}
          className={`w-full h-[48px] rounded-[10px] text-[15px] font-semibold ${
            selectedId ? "bg-[#3A3A3A] text-white" : "bg-[#D8D8D8] text-white"
          }`}
        >
          적용
        </button>
      }
    >
      <ul className="px-5 py-3 space-y-3" role="radiogroup">
        {options.map((opt) => {
          const active = selectedId === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => onSelect(opt.id)}
                className={`w-full flex items-center gap-3 p-5 rounded-[12px] border-2 transition-colors ${
                  active ? "border-[#3094F1]" : "border-[#EFEFEF]"
                }`}
                role="radio"
                aria-checked={active}
              >
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt=""
                    className="w-[37px] h-[35px] object-contain"
                    draggable={false}
                  />
                )}

                <span
                  className={`flex-1 text-left text-[17.5px] text-[#3A3A3A] ${
                    active ? "font-bold" : "font-medium"
                  }`}
                >
                  {opt.label}
                </span>

                <span
                  className={`shrink-0 w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors ${
                    active
                      ? "bg-[#3094F1] text-white border border-[#3094F1]"
                      : "border border-[#E4E4E7] bg-white"
                  }`}
                  aria-hidden
                >
                  {active && (
                    <IoCheckmarkSharp size={15} className="text-white" />
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
