import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FaStar, FaRegHeart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";

import { getExploreRecommendations } from "../../apis/explore";

export default function ExploreResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [error, setError] = useState("");
  const queryParam = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    if (!queryParam) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      const res = await getExploreRecommendations({ query: queryParam });
      setLoading(false);

      if (!res.success) {
        setError(res.message || "추천 결과를 불러오지 못했습니다.");
        return;
      }
      setExperiences(res.data || []);
    };

    fetchData();
  }, [queryParam]);

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

          <div className="text-[13px] text-neutral-500 mb-3">
            “{queryParam}”에 대한 추천 결과입니다.
          </div>

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
