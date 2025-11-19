// src/pages/explore/ExploreResultPage.jsx (수정된 전체 코드)
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FaStar, FaRegHeart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

import { getExploreRecommendations } from "../../apis/explore";

export default function ExploreResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const scenarioButtons = [
    "친구랑 시험 끝나고 반나절 즐길 체험 추천해줘",
    "오늘은 혼자 조용히 힐링하고 싶어",
    "비 오는 날 어울리는 실내 체험 알려줘",
    "데이트에 감성 있는 클래스 찾아줘",
  ];

  // URL에서 'query' 파라미터 값을 가져옵니다. (현재 검색어)
  const queryParam = new URLSearchParams(location.search).get("query");

  // ✅ 수정: query 상태를 URL 파라미터 값(queryParam)으로 초기화합니다.
  const [query, setQuery] = useState(queryParam || "");

  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [error, setError] = useState("");

  // const queryParam = new URLSearchParams(location.search).get("query"); // 중복 제거

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    // 현재 query 상태 값으로 새 URL을 생성하고 이동합니다.
    navigate(`/explore/result?query=${encodeURIComponent(query.trim())}`);
  };

  const handleScenarioClick = (text) => {
    navigate(`/explore/result?query=${encodeURIComponent(text)}`);
  };

  useEffect(() => {
    // API 호출 로직은 queryParam이 있을 때만 실행되도록 유지합니다.
    if (!queryParam) return;

    // ✅ query 상태를 queryParam과 일치시키기 (선택적: 사용자가 입력 필드를 지우지 않았다면 필요 없음.
    // 하지만 API를 호출하는 시점에서 입력 필드도 초기 검색어와 일치시켜 주는 것이 좋습니다.)
    setQuery(queryParam);

    const fetchData = async () => {
      setLoading(true);
      setError("");
      // queryParam을 사용하여 API 호출
      const res = await getExploreRecommendations({ query: queryParam });
      setLoading(false);

      if (!res.success) {
        setError(res.message || "추천 결과를 불러오지 못했습니다.");
        return;
      }
      setExperiences(res.data || []);
    };

    fetchData();
  }, [queryParam]); // queryParam이 변경될 때마다 실행

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative">
        {/* 상단 */}
        <header className="sticky top-0 bg-white px-4 pt-5 pb-3 border-b border-neutral-200 flex items-center justify-between">
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
              value={query} // ✅ query 상태와 연결
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

          <div className="text-[13px] text-neutral-500 mt-4 mb-3">
            {/* queryParam을 사용하여 현재 검색어 표시 */}“{queryParam}”에 대한
            추천 결과입니다.
          </div>

          {/* ... (이하 결과 표시 영역은 동일) ... */}
          {loading && (
            <p className="text-[12px] text-neutral-500">추천 불러오는 중...</p>
          )}
          {error && <p className="text-[12px] text-red-500">{error}</p>}

          {!loading &&
            experiences.map((exp) => (
              <div
                key={exp.id || exp.experienceId}
                className="mb-4 rounded-2xl border border-neutral-200 bg-white overflow-hidden"
              >
                {/* 이미지 */}
                <div className="grid grid-cols-3 gap-[1px] bg-neutral-200">
                  <div
                    className="h-24 bg-neutral-200"
                    style={
                      exp.imageUrl
                        ? {
                            backgroundImage: `url(${exp.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  />
                  <div className="h-24 bg-neutral-200" />
                  <div className="h-24 bg-neutral-200" />
                </div>

                {/* 내용 */}
                <div className="px-4 py-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[13px] font-semibold">
                      {exp.title || "제목 없음"}
                    </p>
                    <FaRegHeart className="text-[15px] text-neutral-400 mt-[2px]" />
                  </div>

                  <div className="flex items-center text-[11px] text-neutral-500 mb-1">
                    <FaStar className="text-[#ff3b30] mr-1" />
                    <span>{exp.rating ?? "4.8"}</span>
                    <span className="mx-1">·</span>
                    <span>후기 {exp.reviewCount ?? 120}개</span>
                  </div>

                  {exp.description && (
                    <p className="text-[11px] text-neutral-600 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/experiences/${exp.id ?? exp.experienceId}`)
                    }
                    className="w-full h-9 rounded-md bg-[#333333] text-white text-[12px] font-semibold"
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
