import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../../components/BottomTab";
import { IoSearch, IoLocationSharp } from "react-icons/io5";
import { BiSolidMessageDetail } from "react-icons/bi";
import { AiOutlineHeart } from "react-icons/ai";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const scenarioButtons = [
    "친구랑 시험 끝나고 반나절 즐길 체험 추천해줘",
    "오늘은 혼자 조용히 힐링하고 싶어",
    "비 오는 날 어울리는 실내 체험 알려줘",
    "데이트에 감성 있는 클래스 찾아줘",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    navigate(`/explore/result?query=${encodeURIComponent(query.trim())}`);
  };

  const handleScenarioClick = (text) => {
    navigate(`/explore/result?query=${encodeURIComponent(text)}`);
  };

  // ⭐ 샘플 데이터 (나중에 API 연동 예정)
  const recommendedHost = {
    name: "이지섭 호스트",
    title: "흙을 담아 삶에 여유를 더해보세요",
    avatar: "/host-pottery.png",
    distance: "210m",
    images: [
      "/sample-p1.jpg",
      "/sample-p2.jpg",
      "/sample-p3.jpg",
      "/sample-p4.jpg",
    ],
  };

  const hotList = [
    {
      host: "박서현님",
      rating: "4.50",
      reviews: 210,
      avatar: "/host-choco.png",
      cover: "/cover-choco.jpg",
      classes: [
        {
          title: "나만의 초콜릿 만들기",
          desc: "프리미엄 원두와 견과류...",
          img: "/choco1.jpg",
        },
        {
          title: "디핑 데코 체험",
          desc: "녹인 초콜릿에 과일이나...",
          img: "/choco2.jpg",
        },
        {
          title: "초콜릿 시식 타임",
          desc: "다양한 원두 초콜릿을 비...",
          img: "/choco3.jpg",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-3 pt-2 pb-3 border-b border-neutral-100">
        <div className="px-2 py-1 flex items-center justify-start">
          <img
            src="/inframe-logo.png"
            alt=""
            className="w-30 h-9 object-contain"
            aria-hidden
          />
        </div>

        <h1 className="text-[18px] font-bold text-[#1D1D1D] mt-8 mb-3 leading-snug">
          상황에 딱 맞는 로컬 체험을 찾아드립니다.
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-[#f4f4f4] rounded-xl px-4 py-2.5 mb-2"
        >
          <input
            type="text"
            placeholder="오늘 하고 싶은 체험이나 기분을 적어주세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-neutral-400"
          />
          <button type="submit">
            <IoSearch className="text-[20px]" />
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {scenarioButtons.map((text) => (
            <button
              key={text}
              onClick={() => handleScenarioClick(text)}
              className="shrink-0 px-3 py-1.5 border border-[#F1F1F1] rounded-full bg-[#FFFFFF] text-[11px] text-[#9D9D9D] text-left"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="px-4 pt-4">
          <div className="rounded-xl bg-[#F8F8F8] border border-[#F0F0F0] px-4 py-3 flex items-start justify-between">
            <p className="text-[13px] font-bold text-[#F13030] mr-3 whitespace-nowrap">
              TIP
            </p>
            <p className="flex-1 text-[13px] text-[#3A3A3A] leading-relaxed">
              &quot;누구랑&quot; &quot;무엇을&quot; &quot;어떻게&quot; 등의
              키워드를 정확하게 <br />
              입력하면 원하는 체험을 쉽게 만나볼 수 있어요!
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-4 pt-5">
        {/* ── 이지혜님이 관심있어할 호스트 섹션 ─────────────────────── */}
        <section className="mb-8">
          <h2 className="text-[18px] font-extrabold text-[#1D1D1D]">
            이지혜님이 관심있어할 호스트
          </h2>
          <p className="mt-1 text-[13px] text-[#777777]">
            이전에 전통 공예 장인을 만나셨군요!
          </p>

          <div className="mt-4 rounded-2xl bg-white border border-[#F0F0F0] shadow-[0_4px_12px_rgba(0,0,0,0.04)] px-4 pt-4 pb-4">
            {/* 프로필 영역 */}
            <div className="flex items-center">
              <img
                src="/host-potter.png" // 아바타 이미지 경로
                alt="이지섭 호스트"
                className="w-16 h-16 rounded-full mr-3"
              />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[17px] font-extrabold text-[#1D1D1D]">
                    이지섭 호스트
                  </p>
                  <button
                    type="button"
                    className="ml-2 text-[#D3D3D3]"
                    aria-label="관심 호스트"
                  >
                    <AiOutlineHeart className="text-[22px]" />
                  </button>
                </div>
                <p className="mt-0.5 text-[13px] text-[#9B9B9B]">
                  흙을 담아 삶의 이야기를 빚어냅니다.
                </p>
              </div>
            </div>

            {/* 후기 / 거리 */}
            <div className="mt-3 flex items-center text-[13px] text-[#9B9B9B]">
              <div className="flex items-center mr-4">
                <BiSolidMessageDetail className="text-[15px] mr-1" />
                <span>후기 129</span>
              </div>

              <div className="flex items-center">
                <IoLocationSharp className="text-[15px] mr-1" />
                <span className="mr-1">내 위치에서</span>
                <span className="text-[#F13030] font-semibold">210m</span>
              </div>
            </div>

            {/* 썸네일 이미지들 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <img
                src="/potter-1.jpg"
                alt="도자기 작업"
                className="w-full h-24 rounded-xl object-cover"
              />
              <img
                src="/potter-2.jpg"
                alt="도자기 작업"
                className="w-full h-24 rounded-xl object-cover"
              />
              <img
                src="/potter-3.jpg"
                alt="도자기 작품"
                className="w-full h-24 rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* 아래에는 HOT 섹션이나 다른 콘텐츠 이어서 넣으면 됨 */}
      </main>
      {/* 🔥 HOT 지금 주목할만한 */}
      <section className="mt-6 mb-10 px-1">
        <h2 className="text-[16px] font-extrabold text-[#1D1D1D] px-3">
          <span className="text-[#F13030]">HOT</span> 지금 주목할만한
        </h2>

        {/* 가로 스크롤 리스트 */}
        <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar px-3 pb-2">
          {/* 카드 1 */}
          <div className="shrink-0 w-[240px] rounded-2xl bg-white border border-[#EDEDED] shadow-[0_4px_10px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* 상단 이미지 */}
            <div className="w-full h-[110px]">
              <img
                src="/choco-main.jpg"
                alt="초콜릿 배경"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 프로필 + 이름 + 리뷰 */}
            <div className="relative px-4">
              <div className="flex items-center -mt-7">
                <img
                  src="/host-choco.png"
                  alt="박서현님"
                  className="w-14 h-14 rounded-full border-4 border-white"
                />
                <div className="ml-2 flex-1">
                  <p className="text-[15px] font-extrabold">박서현님</p>
                  <div className="flex items-center text-[12px] text-[#777] gap-1">
                    <span className="text-[#F13030]">★ 4.50</span>
                    <span>·</span>
                    <span>후기 210개</span>
                  </div>
                </div>
              </div>

              {/* 예약 버튼 */}
              <button className="mt-3 w-full bg-[#3B3B3B] text-white rounded-lg py-2 text-[13px] font-medium">
                예약 바로가기
              </button>
            </div>

            {/* 클래스 리스트 */}
            <div className="mt-3 px-4 pb-4">
              {/* 클래스 1 */}
              <div className="flex gap-3 mb-3">
                <img
                  src="/choco1.jpg"
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-[14px] font-semibold">
                    나만의 초콜릿 만들기
                  </p>
                  <p className="text-[12px] text-[#8b8b8b]">
                    프리미엄 원두와 견과류…
                  </p>
                </div>
              </div>

              {/* 클래스 2 */}
              <div className="flex gap-3 mb-3">
                <img
                  src="/choco2.jpg"
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-[14px] font-semibold">디핑 데코 체험</p>
                  <p className="text-[12px] text-[#8b8b8b]">
                    녹인 초콜릿에 과일이나…
                  </p>
                </div>
              </div>

              {/* 클래스 3 */}
              <div className="flex gap-3">
                <img
                  src="/choco3.jpg"
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-[14px] font-semibold">초콜릿 시식 타임</p>
                  <p className="text-[12px] text-[#8b8b8b]">
                    다양한 원두 초콜릿을 비…
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 카드 2 — 필요하면 복사해서 추가 */}
        </div>
      </section>
      {/* ===== 추천 섹션 끝 ===== */}

      <div className="fixed bottom-0 left-0 right-0">
        <BottomTab active="explore" />
      </div>
    </div>
  );
}
