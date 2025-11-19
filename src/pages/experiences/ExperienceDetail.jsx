import React, { useEffect, useRef, useState } from "react";
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
import fakeProfile from "../../assets/fakeProfile.svg";
import ReservationSection from "../../components/experience/ReservationSection";

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

          <div className="mt-2 space-y-1.5 border-b pb-5">
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#555558]">
              <IoMdTime className="w-[15px] h-[15px] text-[#8E8E93]" />
              <span>{data.durationText}</span>
            </div>
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#555558]">
              <FaUser className="w-[14px] h-[14px] text-[#C9C9C9]" />
              <span>{data.ageText}</span>
            </div>
          </div>

          {/* 호스트 정보 */}
          <div className="mt-4 border-[#EDEEF0] pt-2">
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
          {/* 예약하기 탭 */}
          {tab === "reserve" && (
            <ReservationSection
              experienceId={experienceId ?? data.id}
              price={data.price} // 실제 연동 시 API 값 넣어줄 예정
            />
          )}

          {/* 상세정보 탭 */}
          {tab === "detail" && (
            <div className="px-5 pt-4 pb-12">
              {/* 상세 정보 콘텐츠는 추후 작성 */}
            </div>
          )}
        </div>
      </div>

      {/* BottomTab */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-[#EEE] bg-white z-30">
        <BottomTab />
      </div>
    </div>
  );
}
