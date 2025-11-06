import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoChevronBack,
  IoChevronForward,
  IoShareOutline,
  IoMapOutline,
} from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import BottomTab from "../../components/BottomTab";
import { IoMdTime } from "react-icons/io";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import { RiHome5Line } from "react-icons/ri";
import fakeImg from "../../assets/fakeImg.svg";
import { LuCalendarDays } from "react-icons/lu";
import fakeProfile from "../../assets/fakeProfile.svg";
import Calendar from "../../components/Calendar";
import { fetchAvailableSlots, createReservation } from "../../apis/experiences";

/*  목업 데이터 */
const fakeExperience = {
  id: 1,
  tags: ["초콜릿", "일일클래스"],
  title: "한 입의 예술, 핸드메이드 초콜릿",
  subtitle: "Chocolate One Day Class",
  rating: 4.5,
  ratingCount: 230,
  durationText: "1시간",
  ageText: "전 연령 이용 가능",
  host: {
    name: "박서현",
    intro1: "벨기에 수료 5년, 디저트로",
    intro2: "이야기를 빚는 쇼콜라티에",
    avatarEmoji: fakeProfile,
  },
  heroImage: fakeImg,
};

const PRICE_PER_PERSON = 50000;

/* 별점 */
function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <div className="flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <AiFillStar key={`f-${i}`} className="w-4 h-4 text-[#F13030]" />
      ))}
      {hasHalf && <AiFillStar className="w-4 h-4 text-[#E7E7E7]" />}
      {Array.from({ length: empty }).map((_, i) => (
        <AiFillStar key={`e-${i}`} className="w-4 h-4 text-[#E7E7E7]" />
      ))}
    </div>
  );
}

/* 액션 아이템 */
function ActionItem({ icon, label, toggleable = false }) {
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={() => toggleable && setActive((p) => !p)}
      className="flex flex-col items-center py-3 rounded-xl"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        {toggleable ? (
          active ? (
            <FaHeart size={20} color="#F13030" />
          ) : (
            <FaRegHeart size={20} color="#3A3A3A" />
          )
        ) : (
          icon
        )}
      </div>
      <span className="text-[14px] font-medium text-[#555558]">{label}</span>
    </button>
  );
}

/* 날짜 포맷 */
const toYYYYMMDD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/* HH:MM:SS -> HH:MM */
const toDisplayHM = (t) => (typeof t === "string" ? t.slice(0, 5) : t);

export default function ExperienceDetailPage({ data = fakeExperience }) {
  const navigate = useNavigate();
  const { experienceId } = useParams(); // URL에서 체험 ID 수신

  // 헤더 페이드
  const heroRef = useRef(null);
  const topSentinelRef = useRef(null);
  const [showTopBar, setShowTopBar] = useState(false);
  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowTopBar(!entry.isIntersecting),
      { root: null, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 탭 상태
  const [tab, setTab] = useState("reserve"); // "reserve" | "detail"

  // 날짜 스트립 (오늘 ~ +10일) — 고정
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
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
        price: PRICE_PER_PERSON,
        dateObj: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      });
    }
    return arr;
  }, []);

  const [selectedDateIdx, setSelectedDateIdx] = useState(1);
  const selectedDate = dateStrip[selectedDateIdx];

  // 달력에서 고른 실제 예약일(스트립과 독립)
  const [pickedDate, setPickedDate] = useState(
    selectedDate?.dateObj || new Date()
  );

  const handleStripPick = (idx) => {
    setSelectedDateIdx(idx);
    setPickedDate(dateStrip[idx].dateObj);
  };

  // 회차: API 연동
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  // 날짜 변경/초기 진입 시 호출
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

  const [selectedSlot, setSelectedSlot] = useState(null);

  // 인원수
  const [adult, setAdult] = useState(0);
  const [child, setChild] = useState(0);

  // 합계/예약 가능
  const total = useMemo(
    () => (adult + child) * PRICE_PER_PERSON,
    [adult, child]
  );
  const canReserve = adult + child > 0 && !!selectedSlot;

  // 상단 월 표시
  const monthLabel = useMemo(() => {
    const d = pickedDate ?? selectedDate?.dateObj ?? new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [pickedDate, selectedDate]);

  /* 달력 토글 */
  const [showCalendar, setShowCalendar] = useState(false);
  const toggleCalendar = () => setShowCalendar((p) => !p);

  // 달력 범위: 오늘 ~ 오늘 기준 두 달 뒤 같은 일자
  const minDate = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const maxDate = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth() + 2, t.getDate());
  }, []);

  // 달력에서 날짜 선택 → pickedDate만 변경(스트립은 그대로)
  const handleCalendarChange = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    setPickedDate(normalized);
    setSelectedSlot(null);
  };

  // 하단 요약용 포맷(달력 선택 우선)
  const fmtPicked = useMemo(() => {
    const d = pickedDate;
    if (!d) return selectedDate?.label || "";
    return `${d.getMonth() + 1}.${d.getDate()} ${dayLabels[d.getDay()]}`;
  }, [pickedDate, selectedDate]);

  // 예약 생성
  const [reserveLoading, setReserveLoading] = useState(false);

  const handleReserve = async () => {
    if (!canReserve) return;

    const ac = new AbortController();
    const payload = {
      experienceId: experienceId ?? data.id,
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
    <div className="min-h-[100dvh] bg-white flex flex-col items-center">
      {/* 스크롤 시 나타나는 상단 고정 헤더 */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 transition-all duration-150 ${
          showTopBar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-14 bg-white/95 backdrop-blur border-b border-[#EEE] relative flex items-center">
          <div className="absolute ml-2 flex items-center">
            <button
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center"
            >
              <IoChevronBack size={22} className="text-[#3A3A3A]" />
            </button>
            <button
              aria-label="홈"
              onClick={() => navigate("/app")}
              className="w-9 h-9 flex items-center justify-center"
            >
              <RiHome5Line size={22} className="text-[#3A3A3A]" />
            </button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-[#2B2B2B] truncate max-w-[200px] text-center">
            초콜릿 원데이 클래스
          </div>
          <div className="absolute right-3">
            <button
              aria-label="저장"
              className="w-9 h-9 flex items-center justify-center"
            >
              <FaRegHeart size={20} className="text-[#3A3A3A]" />
            </button>
          </div>
        </div>
      </div>

      {/* 본문 컨테이너 */}
      <div className="w-full max-w-[480px] pb-[160px]">
        {/* 히어로 */}
        <div ref={heroRef} className="relative">
          <img
            src={data.heroImage}
            alt={data.title}
            className="w-full h-[360px] object-cover"
          />
          <div
            ref={topSentinelRef}
            className="absolute top-[80px] left-0 right-0 h-px"
          />
          {/* 투명 헤더 (스크롤 전) */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-14 z-40 flex items-center justify-between px-3 transition-opacity duration-150 ${
              showTopBar ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="flex items-center">
              <button
                aria-label="뒤로가기"
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full backdrop-blur flex items-center justify-center text-white/70"
              >
                <IoChevronBack size={22} />
              </button>
              <button
                aria-label="홈"
                onClick={() => navigate("/app")}
                className="w-9 h-9 rounded-full backdrop-blur flex items-center justify-center text-white/70"
              >
                <RiHome5Line size={22} />
              </button>
            </div>
            <button
              aria-label="저장"
              className="w-9 h-9 rounded-full backdrop-blur flex items-center justify-center text-white/70"
            >
              <FaRegHeart size={20} />
            </button>
          </div>
        </div>

        {/* 소개 섹션 */}
        <div className="px-5 py-5">
          <div className="flex gap-2 mb-2">
            {data.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded-full bg-[#F8F8F8] text-[#9D9D9D] text-[12px] font-semibold"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-[24px] font-bold text-[#3A3A3A]">{data.title}</h1>
          <p className="text-[15px] font-medium text-[#A0A0A0] mt-1">
            {data.subtitle}
          </p>

          <div className="flex items-center gap-1.5 mt-3">
            <Stars value={data.rating} />
            <span className="text-[14px] font-semibold text-[#3A3A3A]">
              {data.ratingCount}
            </span>
            <IoChevronForward className="text-[#A0A0A0] cursor-pointer" />
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#555558]">
              <IoMdTime className="w-[15px] h-[15px] text-[#8E8E93]" />
              <span>{data.durationText}</span>
            </div>
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#555558]">
              <FaUser className="w-[14px] h-[14px] text-[#C9C9C9]" />
              <span>{data.ageText}</span>
            </div>
          </div>

          <div className="mt-6 pb-2 grid grid-cols-4 gap-2 border-t border-b text-center">
            <ActionItem toggleable label="저장하기" />
            <ActionItem icon={<IoMapOutline size={20} />} label="지도보기" />
            <ActionItem icon={<CiStar size={28} />} label="리뷰쓰기" />
            <ActionItem icon={<IoShareOutline size={23} />} label="공유하기" />
          </div>

          {/* 호스트 정보 */}
          <div className="mt-4 border-[#EDEEF0] pt-5">
            <div className="flex gap-1.5">
              <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">
                호스트 정보
              </h2>
              <IoChevronForward
                size={22}
                className="text-[#7F7F7F] cursor-pointer mt-1"
              />
            </div>
            <div className="flex justify-between rounded-2xl">
              <div className="flex items-center">
                <div>
                  <p className="text-[17px] font-bold text-[#3A3A3A]">
                    {data.host.name}
                  </p>
                  <p className="text-[13px] text-[#A0A0A0] font-medium pt-2">
                    {data.host.intro1}
                  </p>
                  <p className="text-[13px] text-[#A0A0A0] font-medium">
                    {data.host.intro2}
                  </p>
                </div>
              </div>
              <img
                src={data.host.avatarEmoji}
                className="w-[80px] h-[80px] mr-2"
                alt="host"
              />
            </div>
          </div>
        </div>

        {/* 탭 바 */}
        <div
          className="px-5 border-b border-[#EDEEF0]"
          role="tablist"
          aria-label="상세 탭"
        >
          <div className="flex w-full">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "reserve"}
              onClick={() => setTab("reserve")}
              className={`flex-1 text-center py-3 text-[15px] font-bold ${
                tab === "reserve"
                  ? "text-[#3A3A3A] border-b-2 border-[#3A3A3A]"
                  : "text-[#C5C5C7] border-b-2 border-transparent"
              }`}
            >
              예약하기
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "detail"}
              onClick={() => setTab("detail")}
              className={`flex-1 text-center py-3 text-[15px] font-bold ${
                tab === "detail"
                  ? "text-[#3A3A3A] border-b-2 border-[#3A3A3A]"
                  : "text-[#C5C5C7] border-b-2 border-transparent"
              }`}
            >
              상세정보
            </button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="relative w-full">
          {/* === 예약하기 === */}
          <div
            className={`px-5 pt-2 pb-8 border-t border-[#F0F0F0] ${
              tab === "reserve" ? "block" : "hidden"
            }`}
          >
            {/* 상단 타이틀 (월) */}
            <div className="flex items-center justify-between mt-3 mb-4">
              <h2 className="text-[20px] font-bold text-[#3A3A3A]">
                {monthLabel}
              </h2>
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
                        onClick={() => {
                          handleStripPick(idx);
                          setSelectedSlot(null);
                        }}
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
            <div className="mt-6">
              <h3 className="text-[20px] font-bold text-[#3A3A3A] mb-4">
                회차선택
              </h3>

              {/* 상태 메시지 */}
              {loadingSlots && (
                <p className="text-sm text-[#888]">
                  예약 가능 시간을 불러오는 중…
                </p>
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
          </div>

          {/* 상세정보 (디자인 안 나옴 나중에 채울 것) */}
          <div
            className={`px-5 pt-4 pb-12 ${
              tab === "detail" ? "block" : "hidden"
            }`}
          >
            {/* 상세 정보 콘텐츠는 추후 작성 */}
          </div>
        </div>
      </div>

      {/* 고정 하단 영역 */}
      {tab === "reserve" && (
        <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#EEE] bg-white z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="leading-tight">
              <p className="text-[18px] font-bold text-[#1D1D1F]">
                {total.toLocaleString()}원
              </p>
              <p className="text-[12px] text-[#8E8E93]">
                {fmtPicked} · {adult + child}명
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
      )}

      {/* BottomTab */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#EEE] bg-white z-30">
        <BottomTab />
      </div>
    </div>
  );
}
