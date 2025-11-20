import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomTab from "../../components/BottomTab";
import { IoSearch } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";

// 🔴 API 함수 Import (실제 경로에 맞게 수정 필요)
import { getHostMap } from "../../apis/map";
import { getReviewsByHostId } from "../../apis/getReviewsByHostId";
import { getMyInfo } from "../../apis/user";
import { getExperiencesByHostId } from "../../apis/experiences";

import news1Img from "../../assets/news1.png";
import news2Img from "../../assets/news2.png";
import news3Img from "../../assets/news3.png";

// =================================================================

// 🟢 HotHostCard 컴포넌트: 미리 로드된 데이터를 받아 렌더링 (Left side 디자인, Right side 데이터 구조)
const HotHostCard = React.memo(({ item, onBooking }) => {
  // 3개 슬롯 고정 및 플레이스홀더 생성 로직
  const classList = [
    ...(item.classes || []),
    ...Array(Math.max(0, 3 - (item.classes?.length || 0))).fill({
      title: "등록된 체험 없음",
      desc: "이 호스트의 새로운 체험을 기대해주세요.",
      img: "/default-class.png",
      isPlaceholder: true,
    }),
  ].slice(0, 3); // 항상 3개의 아이템을 보장

  // 데이터 필드 설정 및 기본값 (hotList가 미리 처리했으므로 안정적임)
  const finalHostName = item.host || "Unknown Host";
  const finalRating = item.rating || "0.00";
  const finalReviews = item.reviews || 0;
  const finalAvatar = item.avatar || "/default-avatar.png";
  const bgSrc =
    item.background ||
    "https://placehold.co/340x160/F0F0F0/000000?text=Background";

  return (
    <div className="w-[340px] shrink-0">
      {/* 전체 카드 컨테이너 */}
      <div className="rounded-[10px] bg-white border border-[#E3E3E3] overflow-hidden">
        {/* 1. 상단 배경 및 프로필 영역 */}
        <div className="relative h-[120px] bg-gray-200">
          {/* 배경 이미지 */}
          <img
            src={bgSrc}
            alt={`${finalHostName} 배경`}
            className="w-full h-full object-cover"
            // 이미지 로드 실패 시 대체 배경
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/340x160/F0F0F0/000000?text=Background";
            }}
          />
          {/* 이름 텍스트 (배경 이미지 위) */}
          <div className="absolute bottom-2 left-[125px] flex justify-start">
            <span className="text-[24px] font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {finalHostName}님
            </span>
          </div>
          {/* 프로필 이미지 (배경 하단 중앙에 걸치도록 위치 조정) */}
          <div className="absolute left-6 top-[75px]">
            <img
              src={finalAvatar}
              alt={finalHostName}
              className="w-[88px] h-[88px] rounded-full border-[4px] border-white bg-white object-cover shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
          </div>
        </div>

        {/* 2. 하단 흰색 영역 */}
        <div className="px-6 pt-10 pb-6 relative">
          {/* 평점 영역 (흰색 영역 상단에 배치) */}
          <div className="absolute top-2 left-[125px] flex items-center text-[15px] text-[#3A3A3A]">
            <AiFillStar className="text-[#F13030] mr-1 text-[18px]" />
            {/* 평점은 소수점 두 자리까지 포맷 */}
            <span className="">{finalRating}</span>
            <span className="mx-2 text-[#C4C4C4]">·</span>
            <span className="decoration-[0.6px]">후기 {finalReviews}개</span>
          </div>

          {/* 예약 바로가기 버튼 */}
          <button
            type="button"
            onClick={onBooking}
            className="w-full bg-[#3A3A3A] text-white text-[17px] font-semibold py-3 rounded-[12px] mt-5 mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          >
            예약 바로가기
          </button>

          {/* 클래스 리스트 */}
          <div className="space-y-5">
            {classList.map((cls, idx) => (
              <div
                key={cls.id || idx} // class ID가 있으면 사용, 없으면 index 사용
                className="flex items-start"
              >
                {/* 썸네일 */}
                <div
                  className={`w-[70px] h-[70px] rounded-[16px] mr-4 shrink-0 ${
                    cls.isPlaceholder
                      ? "bg-[#F4F4F4] flex items-center justify-center text-xs text-neutral-400"
                      : "bg-transparent"
                  }`}
                >
                  {cls.isPlaceholder ? (
                    "No Image"
                  ) : (
                    <img
                      src={cls.img || "/default-class.png"}
                      alt={cls.title}
                      className="w-full h-full object-cover rounded-[16px]"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-class.png";
                      }}
                    />
                  )}
                </div>

                {/* 제목 + 설명 */}
                <div className="flex-1 min-w-0 pt-1">
                  {cls.isPlaceholder ? (
                    <>
                      <div className="h-5 bg-[#EFEFEF] rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-[#F4F4F4] rounded w-full"></div>
                    </>
                  ) : (
                    <>
                      <p className="text-[17px] font-bold text-[#1D1D1D] mb-1 truncate">
                        {cls.title}
                      </p>
                      <p className="text-[13px] text-[#AFAFAF] leading-snug line-clamp-1">
                        {cls.desc}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// =================================================================

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hotList, setHotList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 데이터 로딩 및 필터링 useEffect
  useEffect(() => {
    async function loadHotHosts() {
      setLoading(true);

      let currentUserId = null;
      let isCurrentUserHost = false;

      // 1. 현재 사용자 정보 가져오기 (인증 상태 확인 및 ID, 권한 확인)
      try {
        const meResult = await getMyInfo();

        if (meResult.success && meResult.data) {
          const user = meResult.data;
          // ID 필드를 유연하게 처리
          currentUserId = user.id || user.user_id || user.userId || null;

          // 권한 필드를 유연하게 처리하여 호스트 여부 판단
          let rawRole = (
            user.role ??
            user.roles ??
            user.authority ??
            (Array.isArray(user.authorities)
              ? user.authorities.map((a) => a.authority || a).join(",")
              : "")
          )
            .toString()
            .toUpperCase();
          isCurrentUserHost =
            rawRole.includes("BUSINESS") || rawRole.includes("HOST");

          console.log(
            `[ExplorePage] 로그인된 user_id: ${currentUserId}, isCurrentUserHost: ${isCurrentUserHost}`
          );
        }
      } catch (e) {
        console.warn(
          "로그인된 사용자 정보를 가져올 수 없습니다. (인증 실패 등)",
          e
        );
      }

      // 2. HOT 호스트 목록 가져오기
      try {
        const hostMapResult = await getHostMap();

        if (hostMapResult.success && Array.isArray(hostMapResult.data)) {
          // 3. 필터링: 현재 사용자가 호스트이고 ID를 알 때, 자신의 호스트 카드는 제외
          const filteredHosts = hostMapResult.data.filter((host) => {
            // 호스트 역할이 아니거나, 사용자 ID를 모르면 모두 통과
            if (!isCurrentUserHost || currentUserId === null) {
              return true;
            }
            // 호스트의 userId와 현재 로그인 ID가 같으면 제외
            return String(host.userId) !== String(currentUserId);
          });

          // 4. 데이터 추가 가공 (리뷰 및 체험 목록 로드) - N+1 쿼리 방지
          const hostPromises = filteredHosts.map(async (host) => {
            // A. 리뷰 평점 계산
            const reviewResult = await getReviewsByHostId(host.hostId);
            let totalRating = 0;
            let ratingCount = 0;

            if (reviewResult.success && Array.isArray(reviewResult.data)) {
              reviewResult.data.forEach((review) => {
                if (review.rating) {
                  totalRating += Number(review.rating);
                  ratingCount++;
                }
              });
            }
            const avgRating =
              ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : "0.00";

            // B. 체험 목록 가져오기 (최대 3개)
            let classes = [];
            try {
              const expListResult = await getExperiencesByHostId(host.hostId);

              if (Array.isArray(expListResult.data)) {
                classes = expListResult.data.slice(0, 3).map((exp) => ({
                  id: exp.experienceId, // 체험 ID 추가
                  title: exp.title,
                  desc: exp.description || "",
                  img: exp.mainImageUrl || "",
                }));
              }
            } catch (e) {
              console.error(`Host ID ${host.hostId} 체험 목록 조회 실패:`, e);
            }

            // 최종 포맷된 호스트 객체 반환
            return {
              id: host.hostId,
              host: host.hostName,
              rating: avgRating,
              reviews: host.reviewCount || 0,
              avatar: host.profileImageUrl || "/default-avatar.png",
              background:
                host.companyLogoUrl ||
                "https://placehold.co/340x160/F0F0F0/000000?text=Background",
              classes: classes,
            };
          });

          const formattedHosts = await Promise.all(hostPromises);
          setHotList(formattedHosts);
        } else {
          console.error("getHostMap API 호출 오류:", hostMapResult.message);
          setHotList([]);
        }
      } catch (error) {
        console.error("HOT 리스트 로딩 중 예상치 못한 오류:", error);
        setHotList([]);
      } finally {
        setLoading(false);
      }
    }
    loadHotHosts();
  }, []);

  const scenarioButtons = [
    "친구랑 시험 끝나고 반나절 즐길 체험 추천해줘",
    "오늘은 혼자 조용히 힐링하고 싶어",
    "비 오는 날 어울리는 실내 체험 알려줘",
    "데이트에 감성 있는 클래스 찾아줘",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      // alert() 대신 커스텀 메시지 사용을 권장합니다. 여기서는 console.log로 대체합니다.
      console.log("검색어를 입력해주세요.");
      return;
    }
    navigate(`/explore/result?query=${encodeURIComponent(query.trim())}`);
  };

  const handleScenarioClick = (text) => {
    navigate(`/explore/result?query=${encodeURIComponent(text)}`);
  };

  const handleBooking = () => {
    console.log("예약 페이지로 이동합니다.");
    // 실제 예약 페이지 URL로 navigate(e.g. /booking/${hostId})
  };

  const handleStoryClick = (link) => {
    if (link) {
      navigate(link);
    } else {
      console.log("이 이야기는 아직 준비되지 않았습니다.");
    }
  };

  const storyList = [
    {
      title: "데이터로 경산을 읽는 청년",
      host: "한서준 호스트",
      img: news1Img,
      link: "/story/1",
    },
    {
      title: "노포 주인의 단골 비법 이야기",
      host: "최광호 호스트",
      img: news2Img,
      link: "/story/2",
    },
    {
      title: "청년 사장님의 맥주 비밀 레시피",
      host: "윤서연 호스트",
      img: news3Img,
      link: "/story/3",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative">
        <header className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-start">
            <img
              src="/inframe-logo.png"
              alt="in경산 로고"
              className="h-8 object-contain"
            />
          </div>

          <h1 className="text-[18px] font-bold text-[#1D1D1D] mt-7 mb-3 leading-snug">
            상황에 딱 맞는 로컬 체험을 찾아드립니다.
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-[#F4F4F4] rounded-[14px] px-4 py-2.5 mb-3"
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

        <main className="pb-[72px] pt-4">
          <section className="mt-4">
            <h2 className="text-[18px] font-bold text-[#1D1D1D] px-4 mb-4">
              <span className="text-[#F13030]">HOT</span> 지금 주목할만한
            </h2>

            {/* 가로 스크롤 + Host 카드들 */}
            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
              {loading ? (
                <div className="px-4 py-6 text-neutral-500 text-center w-full">
                  데이터를 불러오는 중입니다...
                </div>
              ) : hotList.length > 0 ? (
                hotList.map((item) => (
                  // item.id를 key로 사용합니다.
                  <HotHostCard
                    key={item.id}
                    item={item}
                    onBooking={handleBooking}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-neutral-500 text-center w-full">
                  현재 주목할 만한 호스트가 없습니다.
                </div>
              )}
            </div>
          </section>

          <section className="mt-10 mb-4">
            <h2 className="text-[18px] font-bold text-[#1D1D1D] px-4 mb-4">
              경산의 온기를 담은 이야기
            </h2>

            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
              {storyList.map((story, index) => (
                <button
                  key={index}
                  className="w-[200px] shrink-0 focus:outline-none rounded-[20px]"
                >
                  <div className="rounded-[20px] overflow-hidden h-[240px] relative">
                    <img
                      src={story.img}
                      alt={story.title}
                      className="w-full h-full object-cover
                               transition-transform duration-300 ease-in-out
                               hover:scale-105"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-10">
          <BottomTab active="explore" />
        </div>
      </div>
    </div>
  );
}
