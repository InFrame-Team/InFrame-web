import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoChevronBack,
  IoChevronForward,
  IoHeartOutline,
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
import fakeProfile from "../../assets/fakeProfile.svg";

// 목업 데이터
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

// 더미 예약 데이터
const fakeSchedule = {
  currency: "KRW",
  pricePerPerson: 50000,
  dates: [
    {
      key: "2025-11-09",
      label: "11.9 일",
      price: 50000,
      slots: ["09:00", "10:00", "11:00", "13:00", "14:00"],
    },
    {
      key: "2025-11-10",
      label: "11.10 월",
      price: 50000,
      slots: ["09:00", "10:00", "11:00", "13:00", "14:00"],
    },
    {
      key: "2025-11-11",
      label: "11.11 화",
      price: 50000,
      slots: ["09:00", "10:00", "11:00", "13:00", "14:00"],
    },
  ],
};

// 평점
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

// 저장하기, 지도보기, 리뷰쓰기, 공유하기
function ActionItem({ icon, label, toggleable = false }) {
  const [active, setActive] = useState(false);
  const handleClick = () => {
    if (toggleable) setActive((prev) => !prev);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
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

export default function ExperienceDetailPage({
  data = fakeExperience,
  schedule = fakeSchedule,
}) {
  const navigate = useNavigate();

  // 예약 하단 표기용 — 임시값
  const [selectedDateKey] = useState(schedule.dates[1].key); // 11.10 기본
  const [selectedSlot] = useState("13:00");
  const [adult] = useState(2);
  const [child] = useState(0);

  const selectedDate = useMemo(
    () => schedule.dates.find((d) => d.key === selectedDateKey),
    [selectedDateKey, schedule.dates]
  );
  const total = useMemo(
    () => (adult + child) * selectedDate.price,
    [adult, child, selectedDate.price]
  );
  const canReserve = adult + child > 0 && !!selectedSlot;

  // 상단 헤더 노출 제어
  const heroRef = useRef(null);
  const topSentinelRef = useRef(null);
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setShowTopBar(!entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

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

      {/* 본문 */}
      <div className="w-full max-w-[480px] pb-[160px]">
        <div ref={heroRef} className="relative">
          <img
            src={data.heroImage}
            alt={data.title}
            className="w-full h-[360px] object-cover"
          />
          <div
            ref={topSentinelRef}
            className="absolute top-[80px] left-0 right-0 h-px"
          ></div>

          {/* 이미지 위 투명 헤더 (스크롤 전 상태) */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-14 z-40 flex items-center justify-between px-3 transition-opacity duration-150 ${
              showTopBar ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* 좌측: 뒤로가기 + 홈 */}
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
            <div>
              <button
                aria-label="저장"
                className="w-9 h-9 rounded-full backdrop-blur flex items-center justify-center text-white/70"
              >
                <FaRegHeart size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-5">
          {/* 태그 */}
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

          {/* 제목 */}
          <h1 className="text-[24px] font-bold text-[#3A3A3A]">{data.title}</h1>
          <p className="text-[15px] font-medium text-[#A0A0A0] mt-1">
            {data.subtitle}
          </p>

          {/* 평점 */}
          <div className="flex items-center gap-1.5 mt-3">
            <Stars value={data.rating} />
            <span className="text-[14px] font-semibold text-[#3A3A3A]">
              {data.ratingCount}
            </span>
            <IoChevronForward className="text-[#A0A0A0] cursor-pointer" />
          </div>

          {/* 시간/연령 */}
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

          {/* 저장, 지도, 리뷰, 공유 영역 */}
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* 고정 하단 영역 */}
      <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#EEE] bg-white z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-[18px] font-bold text-[#1D1D1F]">
              {total.toLocaleString()}원
            </p>
            <p className="text-[12px] text-[#8E8E93]">
              {selectedDate.label} · {adult + child}명
            </p>
          </div>
          <button
            disabled={!canReserve}
            className={`px-6 py-3 rounded-full text-white text-[14px] font-semibold shadow-sm
              ${
                canReserve
                  ? "bg-[#F13030]"
                  : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
              }`}
          >
            예약 진행하기
          </button>
        </div>
      </div>

      {/* BottomTab */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#EEE] bg-white z-30">
        <BottomTab />
      </div>
    </div>
  );
}
