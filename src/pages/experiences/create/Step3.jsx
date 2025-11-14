import React, { useMemo, useState } from "react";
import StepHeader from "../../../components/experience_create/StepHeader.jsx";
import { IoChevronDown } from "react-icons/io5";
import TimeSheet from "../../../components/experience_create/TimeSheet.jsx";
import { useNavigate } from "react-router-dom";
import { useExperienceCreate } from "../../../contexts/ExperienceCreateContext";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 한글 요일 → API용 enum
const DAY_MAP = {
  일: "SUNDAY",
  월: "MONDAY",
  화: "TUESDAY",
  수: "WEDNESDAY",
  목: "THURSDAY",
  금: "FRIDAY",
  토: "SATURDAY",
};

// API용 enum → 한글 요일 (초기값 복원용)
const ENUM_TO_DAY = {
  SUNDAY: "일",
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
};

// "오전 9:00" / "오후 10:00" / "09:00" 같은 문자열을 시간 숫자로 변환
function parseTimeToHour(t) {
  if (!t) return null;

  // 이미 "HH:mm" 형식인 경우
  if (/^\d{2}:\d{2}$/.test(t)) {
    return Number(t.slice(0, 2)); // 앞 두 자리
  }

  // "오전 9:00", "오후 10:00" 같은 형식 가정
  const isAm = t.startsWith("오전");
  const isPm = t.startsWith("오후");

  const clean = t.replace("오전", "").replace("오후", "").trim();
  const [hh] = clean.split(":");
  let hour = Number(hh);

  if (Number.isNaN(hour)) return null;

  if (isPm && hour < 12) hour += 12;
  if (isAm && hour === 12) hour = 0; // "오전 12시" → 0시

  return hour;
}

// 시작/종료 라벨로부터 "HH:mm" 리스트 생성
function buildTimeSlots(startLabel, endLabel) {
  const startH = parseTimeToHour(startLabel);
  const endH = parseTimeToHour(endLabel);

  if (startH == null || endH == null) return [];
  if (endH < startH) return []; // 잘못된 범위 방지 (필요 시 alert 가능)

  const slots = [];
  for (let h = startH; h <= endH; h += 1) {
    const hh = String(h).padStart(2, "0");
    slots.push(`${hh}:00`);
  }
  return slots;
}

export default function Step3() {
  const navigate = useNavigate();
  const { data, update, submit } = useExperienceCreate();

  const [days, setDays] = useState(() => {
    const fromContext = data.availableDaysOfWeek || [];
    const converted = fromContext.map((d) => ENUM_TO_DAY[d]).filter(Boolean);
    return new Set(converted);
  });

  const [timeStart, setTimeStart] = useState(() => {
    const times = data.availableTimes || [];
    return times.length > 0 ? times[0] : "";
  });

  const [timeEnd, setTimeEnd] = useState(() => {
    const times = data.availableTimes || [];
    return times.length > 0 ? times[times.length - 1] : "";
  });

  const [timeSheetOpen, setTimeSheetOpen] = useState(false);

  // 유의사항
  const [notice, setNotice] = useState(data.notice || "");
  const noticeCount = useMemo(() => notice.length, [notice]);

  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (d) => {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  // 다음 버튼 활성화 조건: 요일 1개 이상 + 오픈/마감 둘 다 선택
  const isNextEnabled = days.size > 0 && !!timeStart && !!timeEnd;

  const handleNext = async () => {
    if (!isNextEnabled || submitting) return;

    setSubmitting(true);
    try {
      const availableDaysOfWeek = Array.from(days).map((d) => DAY_MAP[d]);
      const availableTimes = buildTimeSlots(timeStart, timeEnd);

      const step3Data = {
        availableDaysOfWeek,
        availableTimes,
        notice,
      };

      // Context에도 저장
      update(step3Data);

      // override를 함께 넘겨서 항상 최신 값으로 submit
      const experienceId = await submit(step3Data);

      navigate("/experience/create/step4", { state: { experienceId } });
    } catch (e) {
      console.error(e);
      alert("체험 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
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
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3">
          <button
            type="button"
            disabled={!isNextEnabled || submitting}
            onClick={handleNext}
            className={`w-full h-[48px] rounded-[10px] text-[16px] font-bold
              ${
                isNextEnabled && !submitting
                  ? "bg-[#3A3A3A] text-white"
                  : "bg-[#EDEDED] text-[#B1B1B1] cursor-not-allowed"
              }`}
          >
            {submitting ? "등록 중..." : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
