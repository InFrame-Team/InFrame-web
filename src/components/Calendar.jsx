import React, { useMemo, useState } from "react";

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function clampDate(d, min, max) {
  if (min && d < min) return min;
  if (max && d > max) return max;
  return d;
}
function inMonth(d, cursor) {
  return d.getMonth() === cursor.getMonth();
}
function fmtYM(d) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  className = "",
}) {
  const initial = clampDate(value ?? new Date(), minDate, maxDate);
  const [cursor, setCursor] = useState(() => startOfMonth(initial));

  const weeks = useMemo(() => {
    const firstDay = startOfMonth(cursor);
    const startOffset = (firstDay.getDay() + 7) % 7; // 0=일
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - startOffset);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }
    return Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [cursor]);

  // 월 이동 가능 여부
  const canGoPrev =
    !minDate ||
    startOfMonth(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)) >=
      startOfMonth(minDate);
  const canGoNext =
    !maxDate ||
    startOfMonth(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) <=
      startOfMonth(maxDate);

  // 과거/미래 제한
  const disabledDay = (d) =>
    !!(
      (minDate &&
        d <
          new Date(
            minDate.getFullYear(),
            minDate.getMonth(),
            minDate.getDate()
          )) ||
      (maxDate &&
        d >
          new Date(
            maxDate.getFullYear(),
            maxDate.getMonth(),
            maxDate.getDate()
          ))
    );

  return (
    <div
      className={`bg-white rounded-2xl border border-[#EDEEF0] px-4 pt-3 pb-4 select-none ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <button
          onClick={() =>
            canGoPrev &&
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          disabled={!canGoPrev}
          className={`px-1 text-[18px] leading-none ${
            canGoPrev ? "text-[#777]" : "text-[#CCC] cursor-not-allowed"
          }`}
          aria-label="이전 달"
        >
          {"<"}
        </button>
        <div className="text-[20px] font-extrabold text-[#2B2B2B]">
          {fmtYM(cursor)}
        </div>
        <button
          onClick={() =>
            canGoNext &&
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          disabled={!canGoNext}
          className={`px-1 text-[18px] leading-none ${
            canGoNext ? "text-[#777]" : "text-[#CCC] cursor-not-allowed"
          }`}
          aria-label="다음 달"
        >
          {">"}
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 text-[12px] mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
          <div
            key={w}
            className={`text-center py-1 ${
              i === 0 ? "text-[#F13030]" : "text-[#9AA0A6]"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-rows-6 gap-y-1">
        {weeks.map((row, i) => (
          <div key={i} className="grid grid-cols-7">
            {row.map((d, idx) => {
              const selected = value && isSameDay(d, value);
              const dim = !inMonth(d, cursor);
              const isDisabled = disabledDay(d);
              const isSunday = idx % 7 === 0;
              const base =
                "w-10 h-10 mx-auto rounded-full text-[14px] font-medium flex items-center justify-center transition-colors";

              const stateClass = selected
                ? "bg-[#F13030] text-white font-semibold shadow-sm"
                : isDisabled
                ? "text-[#D1D5DB]"
                : dim
                ? "text-[#C7CBD1]"
                : isSunday
                ? "text-[#F13030] hover:bg-[#FDE8E8]"
                : "text-[#2B2B2B] hover:bg-[#F5F5F6]";

              const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (isDisabled) return;
                    const normalized = new Date(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate()
                    );
                    onChange?.(normalized);
                  }}
                  disabled={isDisabled}
                  className={`${base} ${stateClass}`}
                  aria-pressed={!!selected}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
