import React, { useMemo, useState } from "react";
import StepHeader from "../../../components/experience_create/StepHeader.jsx";
import { IoChevronDown } from "react-icons/io5";
import TimeSheet from "../../../components/experience_create/TimeSheet.jsx";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Step3() {
  // 요일 선택
  const [days, setDays] = useState(() => new Set());

  // 시간 선택
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);

  // 유의사항
  const [notice, setNotice] = useState("");
  const noticeCount = useMemo(() => notice.length, [notice]);

  const toggleDay = (d) => {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 상단 헤더 */}
        <StepHeader onBack={() => history.back()} currentStep={3} />

        {/* 본문 */}
        <main className="px-5 pt-2 pb-28">
          {/* 예약 가능한 요일 */}
          <section className="mb-10">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-4">
              예약 가능한 요일을 등록해주세요.
            </h2>
            <div className="flex items-center gap-2">
              {DAYS.map((d) => {
                const selected = days.has(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-9 h-9 rounded-full border-[2px] text-[14px]
                      ${
                        selected
                          ? "bg-white border-[#3094F1] text-[#3094F1] font-bold"
                          : "bg-[#F8F8F8] border-[#F8F8F8] text-[#3A3A3A] font-medium"
                      }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 예약 가능한 시간 */}
          <section className="mb-10">
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-4">
              예약 가능한 시간을 등록해주세요.
            </h2>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              {/* 시작 시간 버튼 */}
              <button
                type="button"
                onClick={() => setTimeSheetOpen(true)}
                className="w-full h-11 rounded-[5px] border-[2px] border-[#E6E6E6] px-4 flex items-center justify-between"
              >
                <span
                  className={`text-[14px] ${
                    timeStart ? "text-[#3A3A3A]" : "text-[#B6B6B6]"
                  }`}
                >
                  {timeStart || "시간 선택"}
                </span>
                <IoChevronDown size={18} className="text-[#C7C7CC]" />
              </button>

              <div className="text-[#B6B6B6] text-[18px] text-center">~</div>

              {/* 종료 시간 버튼 */}
              <button
                type="button"
                onClick={() => setTimeSheetOpen(true)}
                className="w-full h-11 rounded-[5px] border-[2px] border-[#E6E6E6] px-4 flex items-center justify-between"
              >
                <span
                  className={`text-[14px] ${
                    timeEnd ? "text-[#3A3A3A]" : "text-[#B6B6B6]"
                  }`}
                >
                  {timeEnd || "시간 선택"}
                </span>
                <IoChevronDown size={18} className="text-[#C7C7CC]" />
              </button>
            </div>
          </section>

          {/* 유의사항 */}
          <section>
            <h2 className="text-[20px] text-[#3A3A3A] font-bold mb-4">
              프로그램 유의사항을 작성해주세요.
            </h2>
            <div>
              <textarea
                value={notice}
                onChange={(e) => setNotice(e.target.value.slice(0, 500))}
                placeholder={
                  "예) 위생상의 이유로 외부 음식 반입은 제한됩니다.\n" +
                  "제작 과정에서는 개인 공구를 각자 지참할 수 있습니다.\n" +
                  "프로그램 일정 및 내용은 상황에 따라 변동될 수 있습니다.\n" +
                  "체험 중 촬영된 사진·영상은 홍보 자료로 활용될 수 있습니다."
                }
                className="w-full h-[110px] rounded-[5px] border-[2px] border-[#E6E6E6]
                           px-4 py-3 text-[13px] text-[#3A3A3A] placeholder:text-[#B6B6B6]
                           outline-none resize-none"
              />
              <div className="text-[12px] mt-1 text-right">
                <span className="text-[#3A3A3A] font-medium">
                  {noticeCount}
                </span>
                <span className="text-[#8E8E93]"> / 500</span>
              </div>
            </div>
          </section>
        </main>

        {/* 시간 선택 시트 */}
        <TimeSheet
          open={timeSheetOpen}
          onClose={() => setTimeSheetOpen(false)}
          start={timeStart}
          end={timeEnd}
          onChangeStart={setTimeStart}
          onChangeEnd={setTimeEnd}
          onApply={() => setTimeSheetOpen(false)}
        />

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur px-5 pb-6 pt-3">
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
