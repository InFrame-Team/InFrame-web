import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 필요한 컴포넌트 및 아이콘
import BottomTab from "../components/BottomTab"; // 실제 경로로 가정
import { CiHeart } from "react-icons/ci"; // 빈 하트 (좋아요 아님)
import { FaHeart } from "react-icons/fa"; // 채워진 하트 (좋아요 상태)
import { MdArrowForwardIos } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

// API 함수 (경로가 올바른지 확인하세요)
import {
  getLikedHosts,
  getLikedExperiences,
  toggleHostLike,
  toggleExperienceLike,
} from "../apis/likes";

export default function MainPage() {
  const navigate = useNavigate();

  const goMessages = () => navigate("/messages");
  const goCategory = (key) => navigate(`/map?category=${key}`);
  const goHostMore = () => navigate("/host/ezisub"); // 상세 페이지
  const goNearbyMap = () => navigate("/map");
  const goExperienceDetail = (expId) => navigate(`/experiences/${expId}`);

  const [tab, setTab] = useState("host");

  // ------------------------- API 응답 데이터 상태 -------------------------
  const [savedHosts, setSavedHosts] = useState([]);
  const [experienceList, setExperienceList] = useState([]);

  // 좋아요 상태를 저장 (최초 GET 응답으로 초기화됨)
  const [hostLikeState, setHostLikeState] = useState({});
  const [experienceLikeState, setExperienceLikeState] = useState({});

  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------- 데이터 로딩 로직 (useEffect) -------------------------

  /**
   * 서버로부터 초기 데이터를 불러와 상태를 업데이트하는 함수입니다.
   */
  async function loadInitialData() {
    setIsLoading(true);
    setError(null);
    let successCount = 0;

    try {
      // 1. 호스트 목록 조회 (GET /api/v1/likes/host)
      const hostResult = await getLikedHosts();

      if (hostResult.success && hostResult.data) {
        const likedHosts = hostResult.data;

        // 최근 2개만 표시
        const recentHosts = likedHosts.slice(0, 2);
        setSavedHosts(recentHosts);

        // 좋아요 상태 초기화 (현재 목록에 있는 호스트는 좋아요 상태로 가정)
        const initialHostLikes = {};
        recentHosts.forEach((h) => {
          initialHostLikes[h.hostId] = true;
        });
        setHostLikeState(initialHostLikes);
        successCount++;
      } else {
        console.error("좋아요 호스트 목록 조회 실패:", hostResult.message);
        setSavedHosts([]);
        setHostLikeState({});
      }

      // 2. 체험 목록 조회 (GET /api/v1/likes/experience)
      const expResult = await getLikedExperiences();

      if (expResult.success && expResult.data) {
        const likedExperiences = expResult.data;

        // 최근 2개만 표시
        const recentExperiences = likedExperiences.slice(0, 2);
        setExperienceList(recentExperiences);

        // 좋아요 상태 초기화 (현재 목록에 있는 체험은 좋아요 상태로 가정)
        const initialExpLikes = {};
        recentExperiences.forEach((e) => {
          initialExpLikes[e.experienceId] = true;
        });
        setExperienceLikeState(initialExpLikes);
        successCount++;
      } else {
        console.error("좋아요 체험 목록 조회 실패:", expResult.message);
        setExperienceList([]);
        setExperienceLikeState({});
      }

      // 두 API 호출 중 하나라도 성공했다면 전체 에러 메시지는 표시하지 않음
      if (successCount === 0) {
        throw new Error("호스트와 체험 목록 모두를 불러오는 데 실패했습니다.");
      }
    } catch (e) {
      setError("초기 데이터를 불러오는 중 네트워크 오류가 발생했습니다.");
      // 모든 상태 초기화
      setSavedHosts([]);
      setExperienceList([]);
      setHostLikeState({});
      setExperienceLikeState({});
      console.error("Initial data load error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []); // 컴포넌트 마운트 시 한 번 실행

  // ------------------------- 호스트 하트 클릭 핸들러 -------------------------

  const handleHostLikeClick = async (hostId) => {
    // ⚠️ 오류 방어 코드
    if (!hostId) {
      console.error(
        "오류: hostId가 누락되어 좋아요 토글을 실행할 수 없습니다."
      );
      alert("호스트 정보가 올바르지 않아 처리할 수 없습니다.");
      return;
    }

    const wasLiked = hostLikeState[hostId];

    // 1. UI 즉시 반영 (낙관적 업데이트)
    const optimisticNewState = !wasLiked;
    setHostLikeState((prev) => ({
      ...prev,
      [hostId]: optimisticNewState,
    }));

    if (wasLiked) {
      // 좋아요를 취소하는 경우, 목록에서 즉시 제거
      setSavedHosts((prevHosts) =>
        prevHosts.filter((h) => h.hostId !== hostId)
      );
    }

    // 2. ✅ API 호출 (영구 저장)
    try {
      await toggleHostLike(hostId);
      console.log(
        `[호스트 좋아요] ID ${hostId} 상태가 서버에 반영되었습니다. (취소: ${wasLiked})`
      );

      // 3. ✅ API 호출 성공/실패 시 최신 목록을 서버에서 다시 불러와 상태를 재동기화합니다.
      await loadInitialData();
    } catch (error) {
      console.error("좋아요 토글 API 호출 실패:", error);
      alert("좋아요 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");

      // API 실패 시, UI 상태 롤백을 위해 전체 데이터를 다시 불러오는 것이 가장 안전합니다.
      await loadInitialData();
    }
  };

  // ------------------------- 체험 하트 클릭 핸들러 -------------------------

  // 체험 좋아요 핸들러: 호스트와 동일하게 API 연동 + 재동기화
  const handleExperienceLikeClick = async (experienceId) => {
    // ⚠️ 오류 방어 코드
    if (!experienceId) {
      console.error(
        "오류: experienceId가 누락되어 좋아요 토글을 실행할 수 없습니다."
      );
      alert("체험 정보가 올바르지 않아 처리할 수 없습니다.");
      return;
    }

    const wasLiked = experienceLikeState[experienceId];
    const optimisticNewState = !wasLiked;

    // 1. 좋아요 상태 토글 (UI 즉시 반영)
    setExperienceLikeState((prev) => ({
      ...prev,
      [experienceId]: optimisticNewState,
    }));

    // 2. 좋아요 취소 시 목록에서 제거 (UI 즉시 반영)
    if (wasLiked) {
      setExperienceList((prevExps) =>
        prevExps.filter((e) => e.experienceId !== experienceId)
      );
    }

    // 3. 실제 서버에 토글 요청
    try {
      await toggleExperienceLike(experienceId);
      console.log(
        `[체험 좋아요] ID ${experienceId} 상태가 서버에 반영되었습니다. (취소: ${wasLiked})`
      );

      // 4. 서버 기준으로 다시 동기화
      await loadInitialData();
    } catch (error) {
      console.error("체험 좋아요 토글 API 호출 실패:", error);
      alert(
        "체험 좋아요 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );

      // 실패 시에도 전체 데이터 다시 불러와서 상태 복구
      await loadInitialData();
    }
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
      <div className="w-full max-w-[480px] flex flex-col h-[100dvh]">
        {/* 헤더 */}
        <header className="z-30 bg-white/80 backdrop-blur border-b border-neutral-200">
          <div className="px-5 py-3 flex items-center justify-between">
            <img
              src="/inframe-logo.png"
              alt="Inframe 로고"
              className="w-30 h-9 object-contain"
              aria-hidden
            />

            <div className="flex items-center gap-1 text-neutral-600">
              <button
                type="button"
                onClick={goMessages}
                aria-label="메시지로 이동"
                className="p-2 text-[22px] hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                {/* 메시지 아이콘 대신 검색 아이콘으로 변경 요청에 맞게 반영 */}
                <IoSearch />
              </button>
            </div>
          </div>
        </header>

        {/* 메인 (스크롤 영역) */}
        <main className="flex-1 overflow-y-auto px-5 pt-4 pb-20 space-y-8">
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

                <div className="text-[9px] font-medium opacity-90 mt-5">
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

            {/* 탭 내용 - 호스트 */}
            {!isLoading && !error && tab === "host" && (
              // 좋아요 목록이 없으면 카드 배경을 제거하고 텍스트만 표시
              <div
                className={`-mx-5 bg-white ${
                  savedHosts.length > 0
                    ? "rounded-xl shadow-lg border border-neutral-100 p-4 space-y-4"
                    : ""
                }`}
              >
                {savedHosts.length > 0 ? (
                  savedHosts.map((host) => (
                    <article
                      key={host.hostId}
                      className="border-b border-neutral-100 last:border-b-0 pb-4 last:pb-0"
                    >
                      {/* 상단 호스트 정보 */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              host.avatar ||
                              host.profileImageUrl ||
                              "/default-avatar.png"
                            }
                            alt={`${host.name || host.hostName} 아바타`}
                            className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                          />
                          <div className="flex flex-col">
                            <div className="text-[16px] font-bold">
                              {host.name || host.hostName || "이름 없음"} 호스트
                            </div>
                            <div className="text-[13px] text-neutral-600">
                              {host.tagline ||
                                host.hostIntro ||
                                "전통을 익히고, 트렌드를 빚어내요."}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleHostLikeClick(host.hostId)}
                          aria-pressed={hostLikeState[host.hostId]}
                          className="p-1 shrink-0 mt-1"
                        >
                          {/* 좋아요 상태에 따라 FaHeart (채워진 하트)와 CiHeart (빈 하트) 토글 */}
                          {hostLikeState[host.hostId] ? (
                            <FaHeart className="w-5 h-5 text-rose-600" />
                          ) : (
                            <CiHeart className="w-6 h-6 text-[#D8D8D8]" />
                          )}
                        </button>
                      </div>

                      {/* 하단 3개 이미지 그리드 */}
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
                                alt={`체험 이미지 ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="p-6 text-center text-neutral-500">
                    좋아요를 누른 호스트가 없습니다.
                  </div>
                )}
              </div>
            )}

            {/* 탭 내용 - 상품 (체험) */}
            {!isLoading && !error && tab === "product" && (
              <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-5 -mx-5 px-5">
                {experienceList.length > 0 ? (
                  experienceList.map((exp) => (
                    <article
                      key={exp.experienceId}
                      className="flex-shrink-0 w-[160px] bg-white rounded-lg overflow-hidden shadow-md"
                    >
                      <button
                        onClick={() => goExperienceDetail(exp.experienceId)}
                        className="w-full text-left"
                      >
                        {/* 상품 카드: 160px 너비 */}
                        <div className="relative aspect-square">
                          <img
                            // API 응답 구조에 맞게 필드명 사용
                            src={
                              exp.imageUrls?.[0] ||
                              exp.experienceImageUrls?.[0] ||
                              exp.img ||
                              "/default-exp.png"
                            }
                            alt={exp.title || "체험 상품명"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // 버튼 클릭 시 상품 상세 이동 방지
                              handleExperienceLikeClick(exp.experienceId);
                            }}
                            aria-pressed={experienceLikeState[exp.experienceId]}
                            className="absolute top-2 right-2 p-1 text-white bg-transparent"
                          >
                            <FaHeart
                              className={`w-6 h-6 ${
                                experienceLikeState[exp.experienceId]
                                  ? "text-rose-600"
                                  : "text-white opacity-70"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-3 text-sm space-y-1 text-left">
                          {/* 가격 */}
                          <div className="text-[18px] font-bold text-neutral-900">
                            {exp.price
                              ? `${exp.price.toLocaleString()}원`
                              : "가격 미정"}
                          </div>
                          {/* 제목 */}
                          <p className="line-clamp-2 text-[14px] text-neutral-800 h-10 leading-tight">
                            {exp.title || "체험 상품명"}
                          </p>
                          {/* 호스트 */}
                          <div className="text-neutral-500 text-xs mt-1 pt-1">
                            {exp.hostName || "호스트 이름"}
                          </div>
                          {/* 평점 */}
                          <div className="flex items-center text-xs text-neutral-500 pt-1">
                            <FaStar className="w-3 h-3 text-[#B3B3B3] mr-1" />
                            <span className="text-[13px] text-neutral-500">
                              {exp.rating ? exp.rating.toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center text-neutral-500 w-full">
                    좋아요를 누른 체험(상품)이 없습니다.
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        {/* BottomTab */}
        <BottomTab />
      </div>
    </div>
  );
}
