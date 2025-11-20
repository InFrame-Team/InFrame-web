import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

// API 함수 (경로가 올바른지 확인하세요)
import { getExploreRecommendations } from "../../apis/explore";
import { fetchExperienceDetails } from "../../apis/experiences";
import { toggleHostLike } from "../../apis/likes";
import { getHostMap } from "../../apis/map";

export default function ExploreResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const scenarioButtons = [
    "친구랑 시험 끝나고 반나절 즐길 체험 추천해줘",
    "오늘은 혼자 조용히 힐링하고 싶어",
    "비 오는 날 어울리는 실내 체험 알려줘",
    "데이트에 감성 있는 클래스 찾아줘",
  ];

  const queryParam = new URLSearchParams(location.search).get("query");
  const [query, setQuery] = useState(queryParam || "");
  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [error, setError] = useState("");

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

  // ✅ 수정된 handleLikeToggle 함수: 같은 호스트의 모든 체험 카드에 좋아요 상태 반영
  const handleLikeToggle = async (hostId, hostName) => {
    if (!hostId) {
      alert("호스트 정보가 없어 좋아요를 처리할 수 없습니다.");
      return;
    }

    // 1. 낙관적 업데이트: UI를 먼저 변경
    setExperiences((prevExperiences) => {
      // 현재 상태를 기반으로, 토글될 새로운 isLiked 상태를 결정
      // (같은 호스트의 첫 번째 체험 카드의 현재 isLiked 상태를 사용)
      const currentExp = prevExperiences.find((exp) => exp.hostId === hostId);
      const newIsLikedState = !currentExp?.isLiked; // null 체크 추가

      return prevExperiences.map((exp) => {
        // 해당 hostId를 가진 모든 체험 카드의 isLiked 상태를 일괄적으로 변경
        if (exp.hostId === hostId) {
          return {
            ...exp,
            isLiked: newIsLikedState, // 계산된 새로운 상태 적용
          };
        }
        return exp;
      });
    });

    // 2. API 호출 (영구 저장)
    try {
      await toggleHostLike(hostId);

      console.log(
        `[${
          hostName || "호스트"
        }] 님의 모든 체험의 좋아요 상태가 서버에 반영되었습니다.`
      );
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      alert(
        "좋아요 처리 중 오류가 발생했습니다. 로그인이 필요한지 확인해 주세요."
      );
      // API 실패 시, UI 상태를 롤백하는 로직은 복잡성 때문에 생략합니다.
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    // getHostMap은 현재 로직에서 사용되지 않으므로 주석 처리하거나 제거 가능
    // const mapRes = await getHostMap();
    // const hostMap = {};

    // if (mapRes.success && mapRes.data) {
    //   mapRes.data.forEach((host) => {
    //     if (host.hostId) {
    //       hostMap[host.hostId] = host.businessName;
    //     }
    //   });
    // }

    const listRes = await getExploreRecommendations({ query: queryParam });

    if (!listRes.success) {
      setLoading(false);
      setError(listRes.message || "추천 결과를 불러오지 못했습니다.");
      return;
    }

    const basicExperiences = listRes.data || [];

    const detailedPromises = basicExperiences.map(async (exp) => {
      if (!exp.experienceId)
        return {
          ...exp,
          hostId: null,
          isLiked: false,
          businessName: "정보 없음",
        };

      const detailRes = await fetchExperienceDetails(exp.experienceId);

      if (detailRes.success && detailRes.data) {
        const detailData = detailRes.data;

        const hostId = detailData.hostId || null;

        return {
          ...exp,
          title: detailData.title || exp.title,
          hostName: detailData.hostName,
          businessName: detailData.businessName,
          rating: detailData.rating,
          reviewCount: detailData.reviewCount,
          imageUrls: detailData.imageUrls,
          hostId: hostId,
          // 상세 정보 API에서 isLiked 상태를 받아서 초기화
          isLiked: detailData.isLiked || false,
        };
      }

      console.warn(
        `체험 ID ${exp.experienceId}의 상세 정보 호출 실패 또는 데이터 누락.`
      );
      return {
        ...exp,
        hostId: null,
        isLiked: false,
        businessName: "정보 없음",
      };
    });

    const detailedExperiences = await Promise.all(detailedPromises);

    setExperiences(detailedExperiences);
    setLoading(false);
  };

  useEffect(() => {
    if (!queryParam) return;
    setQuery(queryParam);
    fetchData();
  }, [queryParam]);

  const getAiRecommendationTitle = () => {
    if (!queryParam) return "AI 추천 결과";
    const keyword = queryParam.split(" ")[0];
    return `'${keyword}'에 관심 많으시네요!`;
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative">
        <header className="sticky top-0 bg-white px-4 pt-5 pb-3 border-b border-neutral-200 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="text-[16px] text-neutral-600"
          >
            <IoIosArrowBack />
          </button>
          <h1 className="text-[15px] font-semibold">AI 추천</h1>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-10">
          <h2 className="text-[18px] font-bold mt-8 mb-2">
            상황에 딱 맞는 로컬 체험을 찾아드립니다.
          </h2>
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

          {queryParam && (
            <div className="mt-6">
              <h3 className="text-[17px] font-bold text-[#3A3A3A] mb-1">
                {getAiRecommendationTitle()}
              </h3>
              <p className="text-[13px] text-neutral-500 mb-4">
                반나절 동안 천천히 즐길 수 있는 공방을 추천드릴게요.
              </p>
            </div>
          )}

          {loading && (
            <p className="text-[12px] text-neutral-500">추천 불러오는 중...</p>
          )}
          {error && <p className="text-[12px] text-red-500">{error}</p>}

          {!loading &&
            experiences.map((exp) => (
              <div
                key={exp.id || exp.experienceId}
                className="mb-4 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="grid grid-cols-3 gap-[1px] bg-neutral-200 h-[100px]">
                  <div
                    className="h-full bg-neutral-200"
                    style={{
                      backgroundImage: `url(${
                        exp.imageUrls?.[0] ||
                        exp.mainImageUrl ||
                        "/default-exp-1.png"
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className="h-full bg-neutral-200"
                    style={{
                      backgroundImage: `url(${
                        exp.imageUrls?.[1] || "/default-exp-2.png"
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className="h-full bg-neutral-200"
                    style={{
                      backgroundImage: `url(${
                        exp.imageUrls?.[2] || "/default-exp-3.png"
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>

                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[16px] font-bold text-[#3A3A3A]">
                      {exp.hostName || "김도윤"}
                      <span className="font-normal ml-3">
                        {exp.businessName || "토우"}{" "}
                      </span>
                    </p>

                    <button
                      onClick={() => handleLikeToggle(exp.hostId, exp.hostName)}
                      className="p-1"
                    >
                      {exp.isLiked ? (
                        <FaHeart className="text-[18px] text-[#ff3b30]" />
                      ) : (
                        <FaRegHeart className="text-[18px] text-neutral-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center text-[12px] text-neutral-500 mb-2">
                    <FaStar className="text-[#ff3b30] mr-1 text-[11px]" />
                    <span>{exp.rating ? exp.rating.toFixed(2) : "N/A"}</span>
                    <span className="mx-1">·</span>
                    <span>후기 {exp.reviewCount ?? 0}개</span>
                  </div>

                  {exp.description && (
                    <p className="text-[12px] text-neutral-600 mb-3 leading-snug line-clamp-2">
                      {exp.description}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/experiences/${exp.id ?? exp.experienceId}`)
                    }
                    className="w-full h-10 rounded-[10px] bg-[#333333] text-white text-[13px] font-semibold"
                  >
                    예약 바로가기
                  </button>
                </div>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}
