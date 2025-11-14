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

  const recommendedHost = {
    name: "이지섭 호스트",
    subtitle: "흙을 담아 삶의 이야기를 빚어냅니다.",
    avatar: "/host-pottery.png",
    reviews: 129,
    distance: "210m",
    images: ["/potter-1.jpg", "/potter-2.jpg", "/potter-3.jpg"],
  };

  const hotList = [
    {
      id: 1,
      host: "박서현님",
      rating: "4.50",
      reviews: 210,
      avatar: "/host-choco.png",
      cover: "/choco-main.jpg",
      classes: [
        {
          title: "나만의 초콜릿 만들기",
          desc: "프리미엄 원두와 견과류…",
          img: "/choco1.jpg",
        },
        {
          title: "디핑 데코 체험",
          desc: "녹인 초콜릿에 과일이나…",
          img: "/choco2.jpg",
        },
        {
          title: "초콜릿 시식 타임",
          desc: "다양한 원두 초콜릿을 비…",
          img: "/choco3.jpg",
        },
      ],
    },
    {
      id: 2,
      host: "이지섭 호스트",
      rating: "4.80",
      reviews: 129,
      avatar: "/host-potter.png",
      cover: "/pottery-main.jpg",
      classes: [
        {
          title: "물레 도자기 만들기",
          desc: "기초 물레 성형부터 완성까지…",
          img: "/potter-1.jpg",
        },
        {
          title: "백자 컵 핸드메이드",
          desc: "일상에서 쓰는 나만의 컵…",
          img: "/potter-2.jpg",
        },
        {
          title: "도예 원데이 클래스",
          desc: "처음 와도 따라올 수 있어요",
          img: "/potter-3.jpg",
        },
      ],
    },
    {
      id: 3,
      host: "최하늘 조향사",
      rating: "4.70",
      reviews: 82,
      avatar: "/host-perfume.png",
      cover: "/perfume-main.jpg",
      classes: [
        {
          title: "나만의 향수 만들기",
          desc: "원하는 분위기를 향으로 표현해요",
          img: "/perfume1.jpg",
        },
        {
          title: "디퓨저 만들기",
          desc: "집 안을 채우는 나만의 향기",
          img: "/perfume2.jpg",
        },
        {
          title: "향 블렌딩 클래스",
          desc: "기본 향부터 직접 배합까지…",
          img: "/perfume3.jpg",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 헤더 */}
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

      {/* ===== 메인 컨텐츠 ===== */}
      <main className="flex-1 overflow-y-auto pb-32 px-4 pt-5">
        <section className="mb-6">
          <h2 className="text-[20px] font-bold text-[#3A3A3A]">
            이지혜님이 관심있어할 호스트
          </h2>
          <p className="mt-1 text-[15px] text-[#919191]">
            이전에 전통 공예 장인을 만나셨군요!
          </p>

          <div className="mt-4 px-1">
            <div className="rounded-[22px] bg-white px-3 pt-4 pb-5">
              {/* 프로필 + 텍스트 그룹 */}
              <div className="flex justify-between items-start">
                {/* 왼쪽: 프로필 + 텍스트 */}
                <div className="flex">
                  {/* 프로필 이미지 (완전한 원형) */}
                  <img
                    src="/host-pottery.png"
                    alt="이지섭 호스트"
                    className="w-[72px] h-[72px] rounded-full object-cover mr-4 shrink-0"
                  />

                  {/* 오른쪽 텍스트 — 프로필의 높이를 기준으로 세로 배치 */}
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[18px] font-bold text-[#3A3A3A] leading-tight">
                        이지섭 호스트
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#A0A0A0] leading-snug">
                        흙을 담아 삶의 이야기를 빚어냅니다.
                      </p>
                    </div>

                    {/* 후기 & 거리 — 프로필 하단 정렬 */}
                    <div className="mt-2 flex items-center text-[13px] text-[#919191]">
                      <div className="flex items-center mr-4">
                        <BiSolidMessageDetail className="text-[13px] mr-1" />
                        후기 129
                      </div>

                      <div className="flex items-center">
                        <IoLocationSharp className="text-[13px] mr-1" />
                        <span className="mr-1">내 위치에서</span>
                        <span className="text-[#F13030] font-medium">210m</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 좋아요 버튼 */}
                <button className="text-[#D3D3D3] mt-1">
                  <AiOutlineHeart className="text-[24px]" />
                </button>
              </div>

              {/* 아래 이미지 3장 */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <img
                  src="/potter-1.jpg"
                  className="w-full h-[95px] rounded-xl object-cover"
                />
                <img
                  src="/potter-2.jpg"
                  className="w-full h-[95px] rounded-xl object-cover"
                />
                <img
                  src="/potter-3.jpg"
                  className="w-full h-[95px] rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── HOT 지금 주목할만한 ─────────────────────────── */}
        <section className="mt-1 mb-6 px-0">
          <h2 className="text-[18px] font-bold text-[#3A3A3A] px-1">
            <span className="text-[#F13030]">HOT</span> 지금 주목할만한
          </h2>

          <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar px-1 pb-2">
            {hotList.map((item) => (
              <div
                key={item.id}
                className="shrink-0 w-[280px] rounded-2xl bg-white border border-[#EDEDED] shadow-[0_4px_10px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <div className="w-full h-[110px]">
                  <img
                    src={item.cover}
                    alt={`${item.host} 배경`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="relative px-4">
                  <div className="flex items-center -mt-7">
                    <img
                      src={item.avatar}
                      alt={item.host}
                      className="w-14 h-14 rounded-full border-4 border-white"
                    />
                    <div className="ml-2 flex-1">
                      <p className="text-[15px] text-[#FFFFFF] font-extrabold">
                        {item.host}
                      </p>
                      <div className="flex items-center text-[12px] text-[#3A3A3A] gap-1">
                        <span className="text-[#F13030]">★ </span> {item.rating}
                        <span>·</span>
                        <span>후기 {item.reviews}개</span>
                      </div>
                    </div>
                  </div>

                  <button className="mt-3 w-full bg-[#3A3A3A] text-white rounded-lg py-2 text-[13px] font-medium">
                    예약 바로가기
                  </button>
                </div>

                <div className="mt-3 px-4 pb-4">
                  {item.classes.map((cls, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        idx !== item.classes.length - 1 ? "mb-3" : ""
                      }`}
                    >
                      <img
                        src={cls.img}
                        alt={cls.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-[16px] text-[#1D1D1D] font-semibold">
                          {cls.title}
                        </p>
                        <p className="text-[15px] text-[#6D6D6D]">{cls.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 탭바 */}
      <div className="fixed bottom-0 left-0 right-0">
        <BottomTab active="explore" />
      </div>
    </div>
  );
}
