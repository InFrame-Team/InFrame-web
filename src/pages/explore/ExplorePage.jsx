import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../../components/BottomTab";
import { IoSearch } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";

// 'assets' 폴더에서 이미지 파일 import (경로 확인 필요)
import storyImage1 from "../../assets/news1.png";
import storyImage2 from "../../assets/news2.png";
import storyImage3 from "../../assets/news3.png";

// 🔴 API 함수 Import (실제 경로에 맞게 수정 필요)
import {
  fetchHostProgramsByHost,
  // 🟢 새로 추가: 호스트 정보 조회 (host/me API를 호출한다고 가정)
  fetchMyHostProfile,
} from "../../apis/host";
import { fetchExperienceDetail } from "../../apis/experiences";
// import { getMyInfo } from "../../apis/user"; // ❌ 기존 user/me API는 사용하지 않습니다.
// 🟢 새로운 HOT 리스트 API 함수 Import
import { getHostMap } from "../../apis/map";

// =================================================================

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // 🟢 HOT 리스트를 저장할 상태
  const [hotList, setHotList] = useState([]);

  // 현재 로그인한 사용자 ID 상태
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 🟢 데이터 로딩 및 필터링 useEffect
  useEffect(() => {
    const loadAllData = async () => {
      setIsDataLoading(true);
      // 로그인 ID를 가져오지 못하면 null로 유지됩니다.
      let fetchedUserId = null;

      // 1. 현재 사용자 (호스트) ID 가져오기 (fetchMyHostProfile 사용)
      try {
        // host/me API 호출 (fetchMyHostProfile 함수가 이를 담당한다고 가정)
        const hostProfileResult = await fetchMyHostProfile();

        // fetchMyHostProfile이 data를 바로 반환하고 hostId 필드를 가진다고 가정
        if (hostProfileResult && hostProfileResult.hostId) {
          // ID를 숫자로 변환하여 저장
          fetchedUserId = Number(hostProfileResult.hostId);
          setCurrentUserId(fetchedUserId);
          console.log(
            `[DEBUG_ID] ✅ 현재 로그인된 hostId: ${fetchedUserId} (타입: ${typeof fetchedUserId})`
          );
        } else {
          // 호스트 정보는 가져왔으나 ID 필드(hostId)가 누락된 경우
          console.error(
            "[DEBUG_ID] ❌ fetchMyHostProfile API 호출 성공했으나 hostId 필드 누락. (필터링이 불가능합니다.)"
          );
        }
      } catch (error) {
        // API 호출 자체가 실패한 경우 (인증 실패 401 포함)
        console.error(
          "fetchMyHostProfile API 호출 오류: 로그인 정보를 가져올 수 없어 필터링이 불가합니다.",
          error
        );
      }

      // 2. HOT 호스트 목록 가져오기 (getHostMap API 사용)
      try {
        const hostMapResult = await getHostMap();

        if (hostMapResult.success) {
          const hostData = hostMapResult.data;

          // 🚨 디버그 로그 출력
          console.log(
            "[DEBUG_ID] --- HOT 리스트 API 응답의 호스트 ID 정보 ---"
          );
          hostData.forEach((item) => {
            const itemUserId =
              item.userId === undefined || item.userId === null
                ? "없음"
                : String(item.userId);
            console.log(
              `[DEBUG_ID] 호스트: ${
                item.hostName || item.hostId
              }, userId: ${itemUserId} (타입: ${typeof item.userId})`
            );
          });
          console.log(
            "[DEBUG_ID] ---------------------------------------------"
          );

          // 3. 필터링 로직: 내 호스트 카드 아예 빼기
          const filteredList = hostData.filter((item) => {
            // 로그인 정보 없으면 그냥 전부 보여줌
            if (!fetchedUserId) return true;

            // 백엔드에서 내려주는 '해당 호스트를 만든 유저 ID' 필드명에 맞춰서 사용
            // getHostMap 응답 스키마에 따라 item.userId를 사용합니다.
            const ownerId = item.userId;

            // ownerId 없으면 필터링 없이 통과
            if (ownerId === undefined || ownerId === null) return true;

            const ownerIdNum = Number(ownerId);

            // 🔴 내 계정이 만든 호스트면 아예 제외 (카드 안 만들기)
            if (ownerIdNum === fetchedUserId) {
              console.log(
                `[DEBUG_FILTER] 🚫 내 호스트 카드 제거: ${item.hostName} (USER ${ownerIdNum})`
              );
              return false;
            }

            // 나머지는 그대로 노출
            return true;
          });

          setHotList(filteredList);
        } else {
          console.error("getHostMap API 호출 오류:", hostMapResult.message);
          setHotList([]);
        }
      } catch (error) {
        console.error("HOT 리스트 로딩 중 예상치 못한 오류:", error);
        setHotList([]);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadAllData();
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
      alert("검색어를 입력해주세요.");
      return;
    }
    navigate(`/explore/result?query=${encodeURIComponent(query.trim())}`);
  };

  const handleScenarioClick = (text) => {
    navigate(`/explore/result?query=${encodeURIComponent(text)}`);
  };

  const storyList = [
    {
      title: "데이터로 경산을 읽는 청년",
      host: "한서윤 호스트",
      img: storyImage1,
      link: "/story/1",
    },
    {
      title: "노포 주인의 단골 비법 이야기",
      host: "최광호 호스트",
      img: storyImage2,
      link: "/story/2",
    },
    {
      title: "세 번째 이야기",
      host: "김민준 호스트",
      img: storyImage3,
      link: "/story/3",
    },
  ];

  const handleBooking = () => {
    alert("예약 페이지로 이동합니다.");
  };

  /* ================== HOT 공통 카드 (API 연동 및 UI 수정) ================== */
  const HotHostCard = React.memo(({ item }) => {
    // 🚨 hotList의 hostId 속성을 사용합니다.
    const hostId = item.hostId;

    // API 응답 데이터 필드에 맞게 초기 상태 설정
    const [programs, setPrograms] = useState([]);
    const [hostDetail, setHostDetail] = useState({
      hostName: item.hostName,
      rating: item.rating,
      reviewCount: item.reviewCount,
      hostProfile: item.profileImageUrl,
    });

    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [error, setError] = useState(null);

    // hotList API에 배경 정보가 없으므로, 기본 커버나 프로필 이미지 사용을 가정합니다.
    const bgSrc = item.companyLogoUrl;

    // 체험 목록 로딩 및 호스트 상세 정보 업데이트
    useEffect(() => {
      if (!hostId) {
        setLoadingPrograms(false);
        return;
      }

      const controller = new AbortController();
      const signal = controller.signal;

      const loadProgramsAndHostDetail = async () => {
        try {
          setLoadingPrograms(true);

          // 1. 호스트의 체험 목록 조회
          // 실제 체험 목록 API는 최대 3개까지만 가져온다고 가정
          const programData = await fetchHostProgramsByHost(hostId);

          if (Array.isArray(programData)) {
            // 최대 3개로 제한
            setPrograms(programData.slice(0, 3));

            // 2. 목록 중 첫 번째 체험의 상세 정보를 조회하여 호스트 정보 업데이트
            if (programData.length > 0) {
              const firstExperienceId = programData[0].experienceId;
              if (firstExperienceId) {
                const detailData = await fetchExperienceDetail(
                  firstExperienceId,
                  signal
                );

                // 상세 정보가 있으면 업데이트하고, 없으면 기본값(hotList에서 온 값) 유지
                setHostDetail((prev) => ({
                  hostName: detailData.hostName || prev.hostName,
                  rating: detailData.rating ? detailData.rating : prev.rating,
                  reviewCount: detailData.reviewCount || prev.reviewCount,
                  hostProfile: detailData.hostProfile || prev.hostProfile,
                }));
              }
            }
          } else {
            setPrograms([]);
          }
          setError(null);
        } catch (err) {
          if (err.name === "CanceledError") {
            return;
          }

          console.error(`Error loading data for host ${hostId}:`, err);
          setError("데이터를 불러오지 못했습니다.");
          setPrograms([]);
        } finally {
          setLoadingPrograms(false);
        }
      };

      loadProgramsAndHostDetail();

      return () => {
        controller.abort();
      };
    }, [
      hostId,
      item.hostName,
      item.rating,
      item.reviewCount,
      item.profileImageUrl,
    ]);

    // 렌더링에 사용할 최종 데이터
    const finalHostName = hostDetail.hostName;
    const finalRating = hostDetail.rating;
    const finalReviews = hostDetail.reviewCount;
    const finalAvatar = hostDetail.hostProfile;

    // 🟢 3개 슬롯 고정 및 플레이스홀더 생성 로직
    const PLACEHOLDER_COUNT = 3;
    const placeholderClass = {
      title: "등록된 체험 없음",
      description: "이 호스트의 새로운 체험을 기대해주세요.",
      mainImageUrl: "/default-class.png",
    };

    const finalProgramList = [];
    for (let i = 0; i < PLACEHOLDER_COUNT; i++) {
      if (i < programs.length) {
        finalProgramList.push(programs[i]);
      } else {
        // 이미 로딩이 완료되었고, 에러가 없으며, 실제 데이터가 없는 경우만 플레이스홀더 추가
        if (!loadingPrograms && !error) {
          // 고유 키를 위해 인덱스 사용
          finalProgramList.push({
            ...placeholderClass,
            experienceId: `placeholder-${hostId}-${i}`,
          });
        }
      }
    }

    // 로딩 또는 에러 상태일 때는 플레이스홀더 없이 메시지 출력
    const shouldShowPrograms = !loadingPrograms && !error;

    return (
      <div className="w-[340px] shrink-0">
        {/* 전체 카드 컨테이너 */}
        <div className="rounded-[10px] bg-white border border-[#E3E3E3] overflow-hidden">
          {/* 1. 상단 배경 및 프로필 영역 (API 데이터 적용) */}
          <div className="relative h-[120px]">
            {" "}
            {/* 배경 높이 증가: 120px -> 160px */}
            {/* 배경 이미지 */}
            <img
              src={bgSrc}
              alt={`${finalHostName} 배경`}
              className="w-full h-full object-cover"
            />
            {/* 이름 텍스트 (API 데이터) - 배경 이미지 위에 유지 */}
            {/* 프로필 이미지의 오른쪽, 별점 위에 오도록 위치 조정 */}
            <div className="absolute bottom-2 left-[125px] flex justify-start">
              <span className="text-[24px] font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {finalHostName}
              </span>
            </div>
            {/* 프로필 이미지 (API 데이터) - 배경 하단 중앙에 걸치도록 위치 조정 */}
            <div className="absolute left-6 top-[75px]">
              {" "}
              {/* top: 35px -> 75px로 조정 */}
              <img
                src={finalAvatar || "/default-avatar.png"} // 기본 이미지 추가
                alt={finalHostName}
                className="w-[88px] h-[88px] rounded-full border-[4px] border-white bg-white object-cover shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {/* 2. 하단 흰색 영역 */}
          {/* 평점과 후기를 이 흰색 영역의 상단에 위치시키기 위해 pt (padding-top)를 조정하고 이름/평점의 절대 위치를 제거 */}
          <div className="px-6 pt-10 pb-6 relative">
            {" "}
            {/* pt-5 -> pt-10으로 증가 */}
            {/* 평점 영역 (API 데이터) - 흰색 영역에 배치 */}
            <div className="absolute top-2 left-[125px] flex items-center text-[15px] text-[#3A3A3A]">
              <AiFillStar className="text-[#F13030] mr-1 text-[18px]" />
              {/* 평점은 소수점 두 자리까지 포맷 */}
              <span className="font-semibold">
                {typeof finalRating === "number"
                  ? finalRating.toFixed(2)
                  : finalRating}
              </span>
              <span className="mx-2 text-[#C4C4C4]">·</span> {/* 색상 수정 */}
              <span className="decoration-[0.6px]">후기 {finalReviews}개</span>
            </div>
            {/* 예약 바로가기 버튼 */}
            <button
              type="button"
              onClick={handleBooking}
              className="w-full bg-[#3A3A3A] text-white text-[17px] font-semibold py-3 rounded-[12px] mt-5 mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
            >
              예약 바로가기
            </button>
            {/* 클래스 리스트 */}
            <div className="space-y-5">
              {loadingPrograms ? (
                <div className="text-center text-neutral-500 text-sm">
                  호스트 정보를 불러오는 중입니다...
                </div>
              ) : error ? (
                <div className="text-center text-red-500 text-sm">{error}</div>
              ) : (
                // 🟢 3개 슬롯 렌더링
                finalProgramList.map((cls, idx) => (
                  <div
                    // key를 cls.experienceId 또는 인덱스로 설정
                    key={cls.experienceId || idx}
                    className="flex items-start"
                  >
                    {/* 썸네일: mainImageUrl 사용 (기본 이미지 포함) */}
                    <img
                      src={cls.mainImageUrl || "/default-class.png"}
                      alt={cls.title}
                      className="w-[70px] h-[70px] rounded-[16px] object-cover mr-4 shrink-0"
                    />
                    {/* 제목 + 설명 */}
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-[17px] font-bold text-[#1D1D1D] mb-1 truncate">
                        {cls.title}
                      </p>
                      {/* description 사용 */}
                      <p className="text-[13px] text-[#AFAFAF] leading-snug line-clamp-1">
                        {cls.description || "상세 설명 없음"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });
  /* =============================================================== */

  // 스토리 카드 클릭 핸들러
  const handleStoryClick = (link) => {
    if (link) {
      navigate(link);
    } else {
      alert("이 이야기는 아직 준비되지 않았습니다.");
    }
  };

  // ------------------------- 메인 렌더링 시작 -------------------------

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative">
        {/* 상단 헤더 영역 */}
        <header className="px-4 pt-4 pb-4">
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

            {/* 가로 스크롤 + Host 카드들 */}
            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
              {isDataLoading ? (
                <div className="px-4 py-6 text-neutral-500 text-center w-full">
                  데이터를 불러오는 중입니다...
                </div>
              ) : hotList.length > 0 ? (
                hotList.map((item) => (
                  // item.hostId를 key로 사용합니다.
                  <HotHostCard key={item.hostId} item={item} />
                ))
              ) : (
                <div className="px-4 py-6 text-neutral-500 text-center w-full">
                  현재 주목할 만한 호스트가 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* 경산의 온기를 담은 이야기 섹션 */}
          <section className="mt-10 mb-4">
            <h2 className="text-[18px] font-bold text-[#1D1D1D] px-4 mb-4">
              경산의 온기를 담은 이야기
            </h2>

            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
              {storyList.map((story, index) => (
                // div 대신 button 태그 사용
                <button
                  key={index}
                  onClick={() => handleStoryClick(story.link)}
                  className="w-[200px] shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-[20px]"
                >
                  <div className="rounded-[20px] overflow-hidden h-[240px] relative">
                    <img
                      src={story.img}
                      alt={story.title}
                      className="w-full h-full object-cover
                               transition-transform duration-300 ease-in-out
                               hover:scale-105" // 스토리 카드에도 호버 확대 효과 적용
                    />
                  </div>
                </button>
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
