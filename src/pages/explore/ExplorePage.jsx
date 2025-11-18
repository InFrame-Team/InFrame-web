import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../../components/BottomTab";
import { IoSearch } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";

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

  const hotList = [
    {
      id: 1,
      host: "박서현님",
      rating: "4.50",
      reviews: 210,
      avatar: "/host-choco.png",
      background: "/chocolate-texture.jpg",
      classes: [
        {
          title: "나만의 초콜릿 만들기",
          desc: "프리미엄 원두와 견과류…",
          img: "/choco1.jpg",
        },
        {
          title: "디핑 데코 체험",
          desc: "녹인 초콜릿에 과일이나 …",
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

  const storyList = [
    {
      title: "데이터로 경산을 읽는 청년",
      host: "한서윤 호스트",
      img: "/story1.jpg",
    },
    {
      title: "노포 주인의 단골 비법 이야기",
      host: "최광호 호스트",
      img: "/story2.jpg",
    },
    {
      title: "세 번째 이야기",
      host: "김민준 호스트",
      img: "/story3.jpg",
    },
  ];

  const handleBooking = () => {
    alert("예약 페이지로 이동합니다.");
  };

  /* ================== HOT 첫 카드(박서현님) ================== */
  const FeaturedHostCard = ({ hostData }) => {
    const backgroundStyle = {
      backgroundImage: `url(${hostData.background || "/default-texture.jpg"})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };

    return (
      <div className="w-[280px] shrink-0">
        <div className="rounded-[26px] overflow-hidden bg-white shadow-[0_10px_26px_rgba(0,0,0,0.22)] border border-[#DADADA]">
          {/* 배경 + 프로필 / 이름 */}
          <div className="relative">
            <div className="w-full h-[152px]" style={backgroundStyle} />

            {/* 아바타 + 이름 (배경과 겹쳐서) */}
            <div className="absolute left-6 bottom-[-44px] flex items-center gap-4">
              <img
                src={hostData.avatar}
                alt={hostData.host}
                className="w-[78px] h-[78px] rounded-full border-[3px] border-white bg-white object-cover shadow-[0_4px_14px_rgba(0,0,0,0.4)]"
              />
              <span className="text-[23px] font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                {hostData.host}
              </span>
            </div>
          </div>

          {/* 아래 내용 */}
          <div className="pt-14 px-6 pb-6">
            {/* 평점 / 후기 줄 */}
            <div className="flex items-center justify-center text-[14px] mb-5">
              <AiFillStar className="text-[#F13030] mr-1 text-[18px]" />
              <span className="font-semibold text-[#1D1D1D]">
                {hostData.rating}
              </span>
              <span className="mx-1 text-[#C4C4C4]">·</span>
              <button
                type="button"
                className="text-[#1D1D1D] underline underline-offset-[3px] decoration-[0.5px]"
              >
                후기 {hostData.reviews}개
              </button>
            </div>

            {/* 예약 버튼 */}
            <button
              onClick={handleBooking}
              className="w-full bg-[#3A3A3A] text-white text-[17px] font-semibold py-3 rounded-[16px] mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
            >
              예약 바로가기
            </button>

            {/* 클래스 리스트 */}
            <div className="space-y-6">
              {hostData.classes.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-[78px] h-[78px] rounded-[22px] object-cover mr-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold text-[#1D1D1D] mb-1 truncate">
                      {item.title}
                    </p>
                    <p className="text-[13px] text-[#B1B1B1] leading-snug line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ======================= 렌더 ======================= */

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative">
        {/* 상단 헤더 영역 */}
        <header className="px-4 pt-4 pb-4 border-b border-neutral-100">
          {/* 로고 */}
          <div className="flex items-center justify-start">
            <img
              src="/inframe-logo.png"
              alt="in경산 로고"
              className="h-8 object-contain"
            />
          </div>

          {/* 타이틀 문구 */}
          <h1 className="text-[18px] font-bold text-[#1D1D1D] mt-7 mb-3 leading-snug">
            상황에 딱 맞는 로컬 체험을 찾아드립니다.
          </h1>

          {/* 검색 바 */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-[#F4F4F4] rounded-[14px] px-4 py-2.5 mb-3 shadow-inner"
          >
            <input
              type="text"
              placeholder="오늘 하고 싶은 체험이나 기분을 적어주세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-[#B3B3B3]"
            />
            <button type="submit" className="pl-2">
              <IoSearch className="text-[20px] text-[#7C7C7C]" />
            </button>
          </form>

          {/* 시나리오 버튼들 */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {scenarioButtons.map((text) => (
              <button
                key={text}
                onClick={() => handleScenarioClick(text)}
                className="shrink-0 px-3 py-1.5 border border-[#F1F1F1] rounded-full bg-white text-[11px] text-[#9D9D9D] text-left"
              >
                {text}
              </button>
            ))}
          </div>

          {/* TIP 박스 */}
          <div className="mt-4 px-1">
            <div className="rounded-[14px] bg-[#F8F8F8] border border-[#EFEFEF] px-4 py-3 flex items-start">
              <p className="text-[13px] font-bold text-[#F13030] mr-3 pt-[2px] whitespace-nowrap">
                TIP
              </p>
              <p className="flex-1 text-[13px] text-[#3A3A3A] leading-relaxed">
                &quot;누구랑&quot; &quot;무엇을&quot; &quot;어떻게&quot; 등의
                키워드를 정확하게 입력하면
                <br />
                원하는 체험을 쉽게 만나볼 수 있어요!
              </p>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="pb-[72px] pt-4">
          {/* HOT 섹션 */}
          <section className="mt-4">
            <h2 className="text-[18px] font-bold text-[#1D1D1D] px-4 mb-4">
              <span className="text-[#F13030]">HOT</span> 지금 주목할만한
            </h2>

            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
              {/* 상세 카드 (박서현님) */}
              {hotList[0] && <FeaturedHostCard hostData={hotList[0]} />}

              {/* 나머지 카드들 */}
              {hotList.slice(1).map((item) => (
                <div key={item.id} className="w-[250px] shrink-0">
                  <div className="rounded-[22px] overflow-hidden bg-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] border border-[#E3E3E3]">
                    {/* 상단 이미지 + 오버레이 */}
                    <div
                      className="relative h-[130px] bg-neutral-200"
                      style={{
                        backgroundImage: `url(${item.cover})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-[15px] font-bold text-white mb-1">
                          {item.host}
                        </p>
                        <div className="flex items-center text-[12px] text-white/90">
                          <AiFillStar className="text-[#FFD85A] mr-1 text-[14px]" />
                          <span>{item.rating}</span>
                          <span className="ml-2">후기 {item.reviews}개</span>
                        </div>
                      </div>
                    </div>

                    {/* 클래스 2개 + 더보기 */}
                    <div className="p-4 space-y-3 bg-white">
                      {item.classes.slice(0, 2).map((cls, idx) => (
                        <div key={idx} className="flex items-start">
                          <img
                            src={cls.img}
                            alt={cls.title}
                            className="w-11 h-11 rounded-[10px] object-cover mr-3 shrink-0"
                          />
                          <p className="text-[13px] font-semibold text-[#1D1D1D] truncate">
                            {cls.title}
                          </p>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="w-full text-center text-[12px] text-[#8D8D8D] mt-1"
                      >
                        더보기 &gt;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 경산의 온기를 담은 이야기 섹션 */}
          <section className="mt-10 mb-4">
            <h2 className="text-[18px] font-bold text-[#1D1D1D] px-4 mb-4">
              경산의 온기를 담은 이야기
            </h2>

            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
              {storyList.map((story, index) => (
                <div key={index} className="w-[200px] shrink-0">
                  <div className="rounded-[20px] overflow-hidden h-[240px] shadow-[0_6px_18px_rgba(0,0,0,0.22)]">
                    <img
                      src={story.img}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute" />
                    <div className="absolute" />
                    <div className="relative -mt-[240px] h-full">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[16px] font-bold text-white leading-snug">
                          {story.title}
                        </p>
                        <p className="text-[13px] text-white/90 mt-1">
                          {story.host}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* 하단 탭바 */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <BottomTab active="explore" />
        </div>
      </div>
    </div>
  );
}
