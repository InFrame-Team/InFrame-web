import React, { useEffect, useMemo, useState } from "react";
import BaseAppSheet from "./BaseAppSheet";

// 오픈: 06~11
const OPEN_HOURS = Array.from({ length: 6 }, (_, i) => 6 + i); // 6~11
// 마감: 12~26
const CLOSE_HOURS = Array.from({ length: 15 }, (_, i) => 12 + i); // 12~26

function toKoreanTime(h) {
  let meridiem = "오전";
  let hour = h;

  if (h >= 12 && h < 24) {
    meridiem = "오후";
    hour = h === 12 ? 12 : h - 12;
  } else if (h >= 24) {
    meridiem = "오전";
    hour = h - 24;
  }

  if (hour === 0) hour = 12;

  return `${meridiem} ${hour}:00`;
}

export default function TimeSheet({
  open,
  onClose,
  start, // 부모가 들고 있는 기존 값
  end,
  onChangeStart,
  onChangeEnd,
  onApply,
}) {
  const [tempStart, setTempStart] = useState(start || "");
  const [tempEnd, setTempEnd] = useState(end || "");

  // 시트 열릴 때, 부모 값 기준으로 초기화
  useEffect(() => {
    if (open) {
      setTempStart(start || "");
      setTempEnd(end || "");
    }
  }, [open, start, end]);

  const openTimes = useMemo(() => OPEN_HOURS.map((h) => toKoreanTime(h)), []);
  const closeTimes = useMemo(() => CLOSE_HOURS.map((h) => toKoreanTime(h)), []);

  const canApply = Boolean(tempStart && tempEnd);

  return (
    <BaseAppSheet
      open={open}
      onClose={onClose}
      title="예약 가능한 시간을 등록해주세요."
      topOffsetPx={56}
      footer={
        <button
          type="button"
          disabled={!canApply}
          onClick={() => {
            if (!canApply) return;

            // 적용 누를 때만 부모 state 업데이트
            onChangeStart?.(tempStart);
            onChangeEnd?.(tempEnd);

            onApply?.();
          }}
          className={`w-full h-11 rounded-[10px] text-[14px] font-semibold
            ${
              canApply
                ? "bg-[#3A3A3A] text-white"
                : "bg-[#E6E6EB] text-[#B7B7C2]"
            }`}
        >
          적용
        </button>
      }
    >
      <div className="px-5 pb-5">
        {/* 오픈 */}
        <div className="mb-8">
          <div className="text-[16px] font-bold text-[#3A3A3A] mt-3 mb-5">
            오픈
          </div>
          <div className="grid grid-cols-3 gap-2">
            {openTimes.map((t) => {
              const selected = tempStart === t;

              return (
                <button
                  key={`open-${t}`}
                  type="button"
                  onClick={() => setTempStart(selected ? "" : t)}
                  className={`h-[55px] rounded-[10px] border-[2px] text-[14px] text-[#3A3A3A]
                    ${
                      selected
                        ? "bg-white border-[#3094F1] font-bold"
                        : "bg-white border-[#E9E9EC] font-medium"
                    }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 마감 */}
        <div>
          <div className="text-[16px] font-bold text-[#3A3A3A] mb-5">마감</div>
          <div className="grid grid-cols-3 gap-2">
            {closeTimes.map((t) => {
              const selected = tempEnd === t;

              return (
                <button
                  key={`close-${t}`}
                  type="button"
                  onClick={() => setTempEnd(selected ? "" : t)}
                  className={`h-[55px] rounded-[10px] border-[2px] text-[14px] text-[#3A3A3A]
                    ${
                      selected
                        ? "bg-white border-[#3094F1] font-bold"
                        : "bg-white border-[#E9E9EC] font-medium"
                    }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BaseAppSheet>
  );
}
