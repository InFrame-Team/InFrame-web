import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

import { getExploreRecommendations } from "../../apis/explore";
import { fetchExperienceDetail } from "../../apis/experiences";
import { toggleHostLike } from "../../apis/likes";

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

  // 검색 submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    navigate(`/explore/result?query=${encodeURIComponent(query.trim())}`);
  };

  // 시나리오 버튼 클릭
  const handleScenarioClick = (text) => {
    navigate(`/explore/result?query=${encodeURIComponent(text)}`);
  };

  // 🔹 입력 문장에서 첫 단어만 추출
  function extractFirstWord(text) {
    if (!text) return "";
    return text.trim().split(" ")[0]; // 첫 번째 단어 반환
  }

  // 🔥 호스트 좋아요 토글
  const handleHostLikeToggle = async (hostId) => {
    if (!hostId) {
      alert("호스트 정보가 없어 좋아요를 처리할 수 없습니다.");
      return;
    }

    // 현재 isLiked 상태 (rollback용으로 기억)
    const prevIsLiked =
      experiences.find((exp) => exp.hostId === hostId)?.isLiked ?? false;

    // 1) 낙관적 업데이트: 같은 hostId 가진 카드 전부 토글
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.hostId === hostId ? { ...exp, isLiked: !prevIsLiked } : exp
      )
    );

    // 2) 서버에 반영
    try {
      const res = await toggleHostLike(hostId);

      if (!res.success) {
        throw new Error(res.message || "좋아요 처리 실패");
      }
    } catch (error) {
      console.error("호스트 좋아요 토글 실패:", error);
      alert(
        error.message ||
          "좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );

      // 3) 실패 시 UI 롤백
      setExperiences((prev) =>
        prev.map((exp) =>
          exp.hostId === hostId ? { ...exp, isLiked: prevIsLiked } : exp
        )
      );
    }
  };

  // 데이터 로딩
  const fetchData = async () => {
    if (!queryParam) return;
    setLoading(true);
    setError("");

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

      const detailRes = await fetchExperienceDetail(exp.experienceId);

      if (detailRes.success && detailRes.data) {
        const d = detailRes.data;

        return {
          ...exp,
          title: d.title || exp.title,
          hostName: d.hostName,
          businessName: d.businessName,
          rating: d.rating,
          reviewCount: d.reviewCount,
          imageUrls: d.imageUrls,
          description: d.experienceIntro,
          hostId: d.hostId || null,
          // 서버에서 내려주는 호스트 좋아요 상태
          isLiked: d.isLiked || false,
        };
      }

      console.warn(
        `체험 ID ${exp.experienceId} 상세 정보 호출 실패 또는 데이터 누락`
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
    setQuery(queryParam || "");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam]);

  const getAiRecommendationTitle = () => {
    if (!queryParam) return "AI 추천 결과";

    const keyword = extractFirstWord(queryParam);

    return `‘${keyword}’에 관심이 많으시네요!`;
  };
  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[400px] bg-white relative flex flex-col">
        {/* 상단 헤더 */}
        <header className="sticky top-0 bg-white px-4 pt-5 pb-3 border-b border-neutral-200 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="text-[20px] text-neutral-700"
          >
            <IoIosArrowBack />
          </button>
          <h1 className="text-[15px] font-semibold text-[#111111]">AI 추천</h1>
          <div className="w-5" />
        </header>

        {/* 메인 */}
        <main className="flex-1 overflow-y-auto px-4 pb-10">
          {/* 상단 타이틀 */}
          <h2 className="text-[18px] font-bold mt-7 mb-3 leading-snug text-[#111111]">
            상황에 딱 맞는 로컬 체험을 찾아드립니다.
          </h2>

          {/* 검색창 */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-[#F4F4F4] rounded-[14px] px-4 py-2.5 mb-3"
          >
            <input
              type="text"
              placeholder="친구랑 도자기 관련해서 반나절 즐길 체험 추천해줘"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-[#B3B3B3]"
            />
            <button type="submit" className="pl-2">
              <IoSearch className="text-[20px] text-[#7C7C7C]" />
            </button>
          </form>

          {/* 시나리오 버튼들 */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
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

          {/* AI 추천 섹션 타이틀/설명 */}
          {queryParam && (
            <section className="mt-6 mb-4">
              <h3 className="text-[17px] font-bold text-[#111111] mb-1">
                {getAiRecommendationTitle()}
              </h3>
              <p className="text-[13px] text-neutral-500">
                반나절 동안 천천히 즐길 수 있는 공방을 추천드릴게요.
              </p>
            </section>
          )}

          {/* 로딩/에러 */}
          {loading && (
            <p className="text-[12px] text-neutral-500 mb-3">
              추천 불러오는 중...
            </p>
          )}
          {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

          {/* 카드 리스트 */}
          {!loading &&
            experiences.map((exp) => (
              <article
                key={exp.id || exp.experienceId}
                className="mb-4 rounded-[18px] border border-[#E5E5E5] bg-white overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.04)]"
              >
                {/* 상단 3분할 이미지 영역 */}
                <div className="grid grid-cols-3 gap-[1px] bg-neutral-200 h-[130px]">
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

                {/* 하단 내용 */}
                <div className="px-4 pt-3 pb-4">
                  {/* 호스트 이름 + 좋아요 */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <p className="text-[16px] font-bold text-[#222222] leading-tight">
                        {exp.hostName || "김도윤"}{" "}
                        <span className="font-semibold text-[15px] text-[#222222]">
                          &lt;{exp.businessName || "토우"}&gt;
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleHostLikeToggle(exp.hostId)}
                      className="p-1"
                    >
                      {exp.isLiked ? (
                        <FaHeart className="text-[18px] text-[#ff3b30]" />
                      ) : (
                        <FaRegHeart className="text-[18px] text-neutral-400" />
                      )}
                    </button>
                  </div>

                  {/* 평점/후기 */}
                  <div className="flex items-center text-[12px] text-[#3A3A3A] mb-2">
                    <FaStar className="text-[#ff3b30] mr-1 text-[11px]" />
                    <span className="">
                      {typeof exp.rating === "number"
                        ? exp.rating.toFixed(2)
                        : "4.80"}
                    </span>
                    <span className="mx-1">·</span>
                    <span>후기 {exp.reviewCount ?? 0}개</span>
                  </div>

                  {/* ⭐️ 설명(description) 추가 */}
                  {exp.description && (
                    <p className="text-[12px] text-[#3A3A3A] mb-3 leading-snug line-clamp-2">
                      {exp.description}
                    </p>
                  )}

                  {/* 예약 버튼 */}
                  <button
                    onClick={() =>
                      navigate(`/experiences/${exp.id ?? exp.experienceId}`)
                    }
                    className="w-full h-10 rounded-[10px] bg-[#333333] text-white text-[13px] font-semibold"
                  >
                    예약 바로가기
                  </button>
                </div>
              </article>
            ))}
        </main>
      </div>
    </div>
  );
}
