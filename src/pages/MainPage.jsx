import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../components/BottomTab";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { FaStar } from "react-icons/fa"; // ⭐️ 평점 표시를 위해 추가

// POST API는 사용하지 않고, GET API만 사용합니다.
import { getLikedHosts, getLikedExperiences } from "../apis/likes";

export default function MainPage() {
  const navigate = useNavigate();

  const goMessages = () => navigate("/messages");
  const goCategory = (key) => navigate(`/map?category=${key}`);
  const goHostMore = () => navigate("/host/ezisub");
  const goNearbyMap = () => navigate("/map");

  const [tab, setTab] = useState("host");

  // ------------------------- API 응답 데이터 상태 -------------------------
  // 좋아요 누른 호스트 목록 (최근 2개)
  const [savedHosts, setSavedHosts] = useState([]);
  // 좋아요 누른 체험 목록 (최근 2개)
  const [experienceList, setExperienceList] = useState([]);

  // 좋아요 상태를 저장 (최초 GET 응답으로 초기화됨)
  const [hostLikeState, setHostLikeState] = useState({});
  const [experienceLikeState, setExperienceLikeState] = useState({});

  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------- 데이터 로딩 로직 (useEffect) -------------------------
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. 호스트 목록 조회 (GET /api/v1/likes/host)
        const hostResult = await getLikedHosts();

        if (hostResult.success && hostResult.data) {
          const likedHosts = hostResult.data;

          // ✅ 최근 2개만 저장하도록 .slice(0, 2) 적용
          const recentHosts = likedHosts.slice(0, 2);
          setSavedHosts(recentHosts);

          // 2. 좋아요 상태 초기화
          const initialHostLikes = {};
          recentHosts.forEach((h) => {
            initialHostLikes[h.hostId] = true;
          });
          setHostLikeState(initialHostLikes);
        } else {
          console.error("좋아요 호스트 목록 조회 실패:", hostResult.message);
          setError(hostResult.message);
        }

        // 3. 체험 목록 조회 (GET /api/v1/likes/experience)
        const expResult = await getLikedExperiences();

        if (expResult.success && expResult.data) {
          const likedExperiences = expResult.data;

          // ✅ 최근 2개만 저장하도록 .slice(0, 2) 적용
          const recentExperiences = likedExperiences.slice(0, 2);
          setExperienceList(recentExperiences);

          // 4. 좋아요 상태 초기화
          const initialExpLikes = {};
          recentExperiences.forEach((e) => {
            initialExpLikes[e.experienceId] = true;
          });
          setExperienceLikeState(initialExpLikes);
        } else {
          console.error("좋아요 체험 목록 조회 실패:", expResult.message);
        }
      } catch (e) {
        setError("초기 데이터를 불러오는 중 네트워크 오류가 발생했습니다.");
        console.error("Initial data load error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // ------------------------- 하트 클릭 핸들러 (POST 호출 제거됨) -------------------------
  const handleHostLikeClick = (hostId) => {
    setHostLikeState((prev) => ({
      ...prev,
      [hostId]: !prev[hostId],
    }));
    console.warn(
      `[호스트 좋아요] ID ${hostId}의 클라이언트 상태만 변경되었습니다. (POST 호출 제거됨)`
    );
  };

  const handleExperienceLikeClick = (experienceId) => {
    setExperienceLikeState((prev) => ({
      ...prev,
      [experienceId]: !prev[experienceId],
    }));
    console.warn(
      `[체험 좋아요] ID ${experienceId}의 클라이언트 상태만 변경되었습니다. (POST 호출 제거됨)`
    );
  };

  // ------------------------- 나머지 UI용 데이터 -------------------------
  const categories = useMemo(
    () => [
      { key: "artisan", label: "장인/명인", img: "/artisan.png" },
      { key: "youth", label: "청년 사업가", img: "/youth.png" },
      { key: "alley", label: "골목 상인", img: "/alley.png" },
      { key: "artist", label: "예술가/문화인", img: "/artist.png" },
    ],
    []
  );

  // ------------------------- 렌더링 시작 -------------------------
  return (
    <div className="min-h-[100dvh] bg-[#F7F7F7] text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-200">
          <div className="px-5 py-3 flex items-center justify-between">
            <img
              src="/inframe-logo.png"
              alt=""
              className="w-30 h-9 object-contain"
              aria-hidden
            />

            <div className="flex items-center gap-1 text-neutral-600">
              <button
                type="button"
                onClick={goMessages}
                aria-label="검색으로 이동"
                className="p-2 text-[22px] hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                <IoSearch />
              </button>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="px-5 pt-4 pb-0 space-y-8">
          {/* 카테고리 + 내 주변 */}
          <section>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => goCategory(c.key)}
                  aria-label={`${c.label} 페이지로 이동`}
                  className="relative h-32 w-full rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <span className="absolute top-4 left-4 text-[17px] font-bold text-neutral-900">
                    {c.label}
                  </span>

                  <div className="absolute bottom-3 right-3">
                    <img
                      src={c.img}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="w-14 h-14 object-contain drop-shadow-sm"
                    />
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goNearbyMap}
              aria-label="내 주변 호스트 지도 페이지로 이동"
              className="flex justify-between items-center w-full rounded-2xl bg-[#e64a45] text-white p-6 mt-3 shadow-[0_8px_24px_rgba(230,74,69,0.25)] hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div>
                <div className="text-left text-[18px] font-bold leading-snug">
                  내 주변
                  <br />
                  호스트 만나기
                </div>

                <div className="text-[12px] font-medium opacity-90 mt-5">
                  나와 가까이 있는 호스트를 만나보세요!
                </div>
              </div>

              <img
                src="/hand.png"
                alt="악수 아이콘"
                className="w-35 h-20 object-contain drop-shadow-md ml-6"
              />
            </button>
          </section>

          {/* 나의 저장 */}
          <section className="space-y-5">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-bold">
                  나의 저장으로 만나보세요!
                </h2>
                <button
                  className="text-[#919191] text-[20px]"
                  aria-label="더보기"
                  onClick={() => navigate("/favorites")}
                >
                  <MdArrowForwardIos />
                </button>
              </div>

              <p className="pt-2 text-[14px] text-[#919191]">
                최근 추가한 나의 즐겨찾기예요
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTab("host")}
                className={`px-4 py-1.5 rounded-full font-semibold text-[15px] border-[1.5px] transition ${
                  tab === "host"
                    ? "bg-white text-[#1D1D1D] border-[#555558]"
                    : "bg-white text-[#919191] border-neutral-200"
                }`}
              >
                호스트
              </button>
              <button
                onClick={() => setTab("product")}
                className={`px-4 py-1.5 rounded-full font-semibold text-[15px] border-[1.5px] transition ${
                  tab === "product"
                    ? "bg-white text-[#1D1D1D] border-[#555558]"
                    : "bg-white text-[#919191] border-neutral-200"
                }`}
              >
                상품
              </button>
            </div>

            {/* 로딩 및 에러 처리 UI */}
            {isLoading && (
              <div className="text-center text-neutral-500 py-10">
                데이터를 불러오는 중입니다...
              </div>
            )}

            {error && (
              <div className="text-center text-red-500 py-10">{error}</div>
            )}

            {/* 탭 내용 - 호스트 (이미지 1705aa.jpg) */}
            {!isLoading && !error && tab === "host" && (
              <div className="bg-white ml-[-20px] !w-[calc(100%+40px)] -mb-24 pb-24">
                {savedHosts.length > 0 ? (
                  savedHosts.map((host) => (
                    <article key={host.hostId} className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={host.avatar || host.profileImageUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-[15px] font-bold">
                                {host.name || host.hostName}
                              </div>
                              <div className="text-[12px] text-neutral-500">
                                {host.tagline || "호스트 태그라인"}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleHostLikeClick(host.hostId)}
                              aria-pressed={hostLikeState[host.hostId]}
                              className="p-1 -mr-1"
                            >
                              {hostLikeState[host.hostId] ? (
                                <FaHeart className="w-5 h-5 text-rose-600" />
                              ) : (
                                <CiHeart className="w-5 h-5 text-[#D8D8D8]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {(host.experiences || host.experienceImageUrls)
                          ?.slice(0, 3)
                          .map((exp, index) => (
                            <button
                              key={exp.id || index}
                              onClick={goHostMore}
                              className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100"
                            >
                              <img
                                src={typeof exp === "string" ? exp : exp.img}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center text-neutral-500 -mx-5">
                    좋아요를 누른 호스트가 없습니다.
                  </div>
                )}
              </div>
            )}

            {/* 탭 내용 - 상품 (체험) - 이미지 17086c.jpg 레이아웃 적용 */}
            {!isLoading && !error && tab === "product" && (
              <div className="ml-[-20px] !w-[calc(100%+40px)]">
                {experienceList.length > 0 ? (
                  // 2열 그리드 + 수평 스크롤 컨테이너
                  <div className="px-5 pb-5 flex gap-3 overflow-x-scroll no-scrollbar">
                    {experienceList.map((exp) => (
                      <article
                        key={exp.experienceId}
                        className="flex-shrink-0 w-40 bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        {/* 상품 카드: 160px 너비 */}
                        <div className="relative aspect-square">
                          <img
                            // API 응답 구조에 맞게 필드명 사용
                            src={exp.experienceImageUrls?.[0] || exp.img}
                            alt={exp.title || "체험 이미지"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleExperienceLikeClick(exp.experienceId)
                            }
                            aria-pressed={experienceLikeState[exp.experienceId]}
                            className="absolute top-2 right-2 p-1 text-white bg-black/30 rounded-full"
                          >
                            {/* 빨간 하트와 투명 하트 */}
                            {experienceLikeState[exp.experienceId] ? (
                              <FaHeart className="w-5 h-5 text-rose-500" />
                            ) : (
                              <CiHeart className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>

                        <div className="p-3 text-sm space-y-1">
                          {/* 가격 */}
                          <div className="font-bold text-base">
                            {exp.price || "가격 미정"}
                          </div>
                          {/* 제목 */}
                          <p className="line-clamp-2 text-neutral-800 h-10">
                            {exp.title || "체험 상품명"}
                          </p>
                          {/* 호스트 */}
                          <div className="text-neutral-500 text-xs mt-1">
                            {exp.hostName || "호스트 이름"}
                          </div>
                          {/* 평점 */}
                          <div className="flex items-center text-xs text-neutral-500 pt-1">
                            <FaStar className="w-3 h-3 text-yellow-400 mr-1" />
                            <span>{exp.rating || "N/A"}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center text-neutral-500 -mx-5 mt-5">
                    좋아요를 누른 체험(상품)이 없습니다.
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        <BottomTab />
      </div>
    </div>
  );
}
