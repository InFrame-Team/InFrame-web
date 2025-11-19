import React, { useEffect, useMemo, useState } from "react";
import { LuCalendarDays } from "react-icons/lu";
import Calendar from "../Calendar";
import { fetchAvailableSlots, createReservation } from "../../apis/experiences";

/* 날짜 포맷 */
const toYYYYMMDD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/* HH:MM:SS -> HH:MM */
const toDisplayHM = (t) => (typeof t === "string" ? t.slice(0, 5) : t);

/* 요일 라벨 */
const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default function ReservationSection({
  experienceId,
  price, // 인당 가격
}) {
  const pricePerPerson = price ?? 50000;

  // 날짜 스트립 (오늘 ~ +10일)
  const dateStrip = useMemo(() => {
    const today = new Date();
    const arr = [];
    for (let i = 0; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const mm = d.getMonth() + 1;
      const dd = d.getDate();
      const yo = dayLabels[d.getDay()];
      arr.push({
        key: toYYYYMMDD(d),
        label: `${mm}.${dd} ${yo}`,
        price: pricePerPerson,
        dateObj: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      });
    }
    return arr;
  }, [pricePerPerson]);

  const [selectedDateIdx, setSelectedDateIdx] = useState(1);
  const selectedDate = dateStrip[selectedDateIdx];

  // 달력에서 고른 실제 예약일(스트립과 독립)
  const [pickedDate, setPickedDate] = useState(
    selectedDate?.dateObj || new Date()
  );

  const handleStripPick = (idx) => {
    setSelectedDateIdx(idx);
    setPickedDate(dateStrip[idx].dateObj);
    setSelectedSlot(null);
  };

  // 회차: API 연동
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!experienceId || !pickedDate) return;

    const ac = new AbortController();
    const dateStr = toYYYYMMDD(pickedDate);

    setLoadingSlots(true);
    setSlotsError("");
    setSlots([]);

    fetchAvailableSlots(experienceId, dateStr, ac.signal)
      .then((list) => {
        const available = (list || [])
          .filter((x) => x.isAvailable)
          .map((x) => x.startTime);
        setSlots(available);
      })
      .catch((e) => {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        if (e.response?.status === 401) setSlotsError("로그인이 필요합니다.");
        else if (e.response?.status === 404)
          setSlotsError("체험 정보를 찾을 수 없습니다.");
        else setSlotsError("예약 가능 시간을 불러오지 못했습니다.");
      })
      .finally(() => setLoadingSlots(false));

    return () => ac.abort();
  }, [experienceId, pickedDate]);

  // 인원수
  const [adult, setAdult] = useState(0);
  const [child, setChild] = useState(0);
  const totalPeople = adult + child; // 총 인원

  // 합계/예약 가능 여부
  const total = useMemo(
    () => totalPeople * pricePerPerson,
    [totalPeople, pricePerPerson]
  );
  const canReserve = totalPeople > 0 && !!selectedSlot;

  // 상단 월 표시
  const monthLabel = useMemo(() => {
    const d = pickedDate ?? selectedDate?.dateObj ?? new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [pickedDate, selectedDate]);

  /* 달력 토글 */
  const [showCalendar, setShowCalendar] = useState(false);
  const toggleCalendar = () => setShowCalendar((p) => !p);

  // 달력 범위: 오늘 ~ 두 달 뒤
  const minDate = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const maxDate = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth() + 2, t.getDate());
  }, []);

  const handleCalendarChange = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    setPickedDate(normalized);
    setSelectedSlot(null);
  };

  // 하단 고정 바에 쓰는 날짜 포맷
  const fmtPicked = useMemo(() => {
    const d = pickedDate;
    if (!d) return selectedDate?.label || "";
    return `${d.getMonth() + 1}.${d.getDate()} ${dayLabels[d.getDay()]}`;
  }, [pickedDate, selectedDate]);

  // 예약확인 카드용 날짜+시간 포맷 (11.10(월) 13:00)
  const reservationLabel = useMemo(() => {
    if (!pickedDate || !selectedSlot) return "";
    const d = pickedDate;
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = dayLabels[d.getDay()];
    const time = toDisplayHM(selectedSlot);
    return `${String(month).padStart(2, "0")}.${String(date).padStart(
      2,
      "0"
    )}(${day}) ${time}`;
  }, [pickedDate, selectedSlot]);

  // 예약 생성
  const [reserveLoading, setReserveLoading] = useState(false);

  const handleReserve = async () => {
    if (!canReserve || !pickedDate) return;

    const ac = new AbortController();
    const payload = {
      experienceId,
      reservationDate: toYYYYMMDD(pickedDate),
      startTime: selectedSlot,
      numAdults: adult,
      numChildren: child,
    };

    try {
      setReserveLoading(true);
      await createReservation(payload, ac.signal);
      alert("예약이 완료되었습니다.");
    } catch (e) {
      const status = e.response?.status;
      const serverMsg =
        e.response?.data?.message || e.message || "알 수 없는 오류";
      console.error("Reservation error:", e.response || e);
      alert(`오류(${status ?? "?"}): ${serverMsg}`);
    } finally {
      setReserveLoading(false);
    }
  };

  return (
    <>
      {/* 예약 섹션 본문 */}
      <div className="px-5 pt-2 pb-8 border-t border-[#F0F0F0]">
        {/* 상단 타이틀 (월) */}
        <div className="flex items-center justify-between mt-3 mb-4">
          <h2 className="text-[20px] font-bold text-[#3A3A3A]">{monthLabel}</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-[16px] font-semibold text-[#3A3A3A]"
            onClick={toggleCalendar}
            aria-pressed={showCalendar}
          >
            <LuCalendarDays className="w-4 h-4 text-[#C9C9C9]" />
            달력보기
          </button>
        </div>

        {/* 날짜/금액 영역 → 달력 토글 */}
        <div className="-mx-5 px-5 border-b pb-2">
          {showCalendar ? (
            <div className="py-1">
              <Calendar
                value={pickedDate || selectedDate?.dateObj || new Date()}
                onChange={handleCalendarChange}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto snap-x pb-2">
              {dateStrip.map((d, idx) => {
                const active = idx === selectedDateIdx;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleStripPick(idx)}
                    className={`w-[109px] h-[56px] min-w-[92px] snap-start rounded-full border px-4 py-1 text-center ${
                      active
                        ? "bg-[#F13030] text-white"
                        : "bg-white border-[#C5C5C7] text-[#3A3A3A]"
                    }`}
                  >
                    <div className="text-[16px] font-bold">{d.label}</div>
                    <div
                      className={`text-[11px] ${
                        active ? "text-[#ECFFE7]" : "text-[#3A3A3A]"
                      }`}
                    >
                      {d.price.toLocaleString()}원
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 인원 선택 */}
        <div className="mt-5 border-b pb-7">
          <h3 className="text-[20px] font-bold text-[#3A3A3A] mb-3">
            인원선택
          </h3>
          <div className="space-y-1.5 pl-1">
            {/* 성인 */}
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold text-[#555558]">
                성인
              </span>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setAdult((n) => Math.max(0, n - 1))}
                  className="w-8 h-8 rounded-full border border-[#E5E5EA] text-[#3A3A3A] leading-none"
                >
                  −
                </button>
                <span className="w-4 text-center text-[16px] font-semibold text-[#3A3A3A]">
                  {adult}
                </span>
                <button
                  type="button"
                  onClick={() => setAdult((n) => n + 1)}
                  className="w-8 h-8 rounded-full border border-[#E5E5EA] text-[#3A3A3A] leading-none"
                >
                  ＋
                </button>
              </div>
            </div>
            {/* 아동 */}
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold text-[#555558]">
                아동
              </span>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setChild((n) => Math.max(0, n - 1))}
                  className="w-8 h-8 rounded-full border border-[#E5E5EA] text-[#3A3A3A] leading-none"
                >
                  −
                </button>
                <span className="w-4 text-center text-[16px] font-semibold text-[#3A3A3A]">
                  {child}
                </span>
                <button
                  type="button"
                  onClick={() => setChild((n) => n + 1)}
                  className="w-8 h-8 rounded-full border border-[#E5E5EA] text-[#3A3A3A] leading-none"
                >
                  ＋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 회차선택 */}
        <div className="mt-6 border-b pb-8">
          <h3 className="text-[20px] font-bold text-[#3A3A3A] mb-4">
            회차선택
          </h3>

          {/* 상태 메시지 */}
          {loadingSlots && (
            <p className="text-sm text-[#888]">예약 가능 시간을 불러오는 중…</p>
          )}
          {!loadingSlots && slotsError && (
            <p className="text-sm text-red-500">{slotsError}</p>
          )}
          {!loadingSlots && !slotsError && slots.length === 0 && (
            <p className="text-sm text-[#888]">
              해당 날짜에는 예약 가능한 시간이 없습니다.
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 mt-2">
            {slots.map((raw) => {
              const display = toDisplayHM(raw);
              const active = selectedSlot === raw;
              return (
                <button
                  key={raw}
                  type="button"
                  onClick={() =>
                    setSelectedSlot((prev) => (prev === raw ? null : raw))
                  }
                  className={`py-3 rounded-lg border border-[#E9E9EC] text-[14px] font-medium ${
                    active
                      ? "outline outline-2 outline-[#3A3A3A] text-[#3A3A3A] font-semibold"
                      : "text-[#555558]"
                  }`}
                >
                  {display}
                </button>
              );
            })}
          </div>
        </div>

        {/* 예약확인 + 합계 섹션 */}
        <div className="mt-6">
          <h3 className="text-[20px] font-bold text-[#3A3A3A] mb-2">
            예약확인
          </h3>
          <div className="rounded-[10px] border border-[#E9E9EC] px-5 py-3 flex items-center justify-between text-[16px] font-medium text-[#3A3A3A] bg-white">
            {canReserve ? (
              <>
                <span className="truncate">{reservationLabel}</span>
                <span className="ml-4 whitespace-nowrap">{totalPeople}인</span>
              </>
            ) : (
              <span className="text-[#A0A0A0]">
                날짜, 시간, 인원을 선택하면 예약 정보가 표시됩니다.
              </span>
            )}
          </div>

          <div className="mt-6 border-t-2 border-t-[#3A3A3A] font-bold pt-5 flex items-center justify-between">
            <span className="text-[20px] text-[#3A3A3A]">합계</span>
            <span className="text-[22px] text-[#F13030]">
              {total.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 고정 하단 영역 (합계/예약버튼) */}
      <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#EEE] bg-white z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-[18px] font-bold text-[#1D1D1F]">
              {total.toLocaleString()}원
            </p>
            <p className="text-[12px] text-[#8E8E93]">
              {fmtPicked} · {totalPeople}명
            </p>
          </div>
          <button
            onClick={handleReserve}
            disabled={!canReserve || reserveLoading}
            className={`px-6 py-3 rounded-full text-white text-[14px] font-semibold shadow-sm ${
              canReserve && !reserveLoading
                ? "bg-[#F13030]"
                : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
            }`}
          >
            {reserveLoading ? "처리 중…" : "예약 진행하기"}
          </button>
        </div>
      </div>
    </>
  );
}
