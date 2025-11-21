// src/pages/NearbyListPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BiSolidMessageDetail } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { MdArrowBackIosNew } from "react-icons/md";
import { FiRotateCw } from "react-icons/fi";

// API 함수 (경로가 올바른지 확인하세요)
import { getHostMap } from "../../apis/map";
import { fetchDetailFields } from "../../apis/enums";

const MIN_PRICE = 0;
const MAX_PRICE = 200000;
const PRICE_STEP = 5000;

const TIME_SLOTS = [
  { key: "30m", label: "30분 내외", minMinutes: 0, maxMinutes: 60 },
  { key: "1h", label: "1시간", minMinutes: 60, maxMinutes: 120 },
  { key: "2h", label: "2시간", minMinutes: 120, maxMinutes: 180 },
  { key: "3h", label: "3시간", minMinutes: 180, maxMinutes: 240 },
  { key: "4h", label: "4시간", minMinutes: 240, maxMinutes: 300 },
  { key: "5h", label: "5시간", minMinutes: 300, maxMinutes: 360 },
  { key: "5h+", label: "5시간 이상", minMinutes: 360, maxMinutes: null },
];

// 백엔드 category → 프론트 key 매핑
function mapBackendCategory(code) {
  if (!code) return "artisan";
  const upper = code.toString().toUpperCase();

  if (upper === "MASTER_ARTISAN") return "artisan";
  if (upper === "YOUTH_ENTREPRENEUR") return "youth";
  if (upper === "ALLEY_MERCHANT") return "alley";
  if (upper === "ARTIST") return "artist";

  return "artisan";
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(m) {
  if (m == null) return "";
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function formatPriceLabel(value, isMax = false) {
  if (isMax && value >= MAX_PRICE) return "20만원+";
  if (value === 0) return "0원";

  const man = Math.floor(value / 10000);
  const chun = Math.floor((value % 10000) / 1000);

  let result = "";
  if (man > 0) result += `${man}만`;
  if (chun > 0) result += `${chun}천`;

  return result + "원";
}

// 전문 분야 고정 목록
const FIELD_OPTIONS = [
  { code: "CRAFT_CREATION", description: "공예/창작" },
  { code: "FOOD_DESSERT", description: "음식/디저트" },
  { code: "FLOWER_GARDENING", description: "플라워/가드닝" },
  { code: "CULTURE_TRADITION", description: "문화/전통체험" },
  { code: "MUSIC_ART", description: "음악/예술" },
  { code: "LIFE_HEALING", description: "라이프/힐링" },
  { code: "LOCAL_TOUR", description: "지역탐방/체험투어" },
  { code: "PHOTO_CONTENT", description: "사진/콘텐츠" },
];

export default function NearbyListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFromQuery = params.get("category"); // 쿼리에서 받은 카테고리
  const fieldFromQuery = params.get("field");

  // 내 위치 (거리 계산용)
  const [myPos, setMyPos] = useState({ lat: 35.825, lng: 128.741 });

  // 실제 호스트 데이터
  const [hosts, setHosts] = useState([]);
  const [loadingHosts, setLoadingHosts] = useState(false);

  const [fieldOptions, setFieldOptions] = useState([]);

  // 정렬 기준 (기본: 거리 가까운 순)
  const [sortKey, setSortKey] = useState("distance");

  const [activeFilterTab, setActiveFilterTab] = useState("price");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    params.get("time") || null
  );
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromQuery || null
  );
  const [selectedField, setSelectedField] = useState(fieldFromQuery || null);

  const trackRef = useRef(null);
  const [draggingHandle, setDraggingHandle] = useState(null);

  // BottomSheet 높이 측정용 State 및 Ref
  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetHeightRef = useRef(null);

  // 내 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setMyPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    async function loadFields() {
      const data = await fetchDetailFields(); // signal 인자 없어도 됨
      setFieldOptions(data);
    }
    loadFields();
  }, []);

  // BottomSheet 높이 동적 측정 useEffect
  useEffect(() => {
    if (showFilterSheet && sheetHeightRef.current) {
      // 탭 내용 변경 직후 높이를 정확히 측정하기 위해 setTimeout 사용
      const timer = setTimeout(() => {
        if (sheetHeightRef.current) {
          const newHeight = sheetHeightRef.current.offsetHeight;
          if (newHeight !== sheetHeight) {
            setSheetHeight(newHeight);
          }
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showFilterSheet, activeFilterTab, sheetHeight]);

  // MapPage와 동일한 /host/map 데이터 가져오기
  useEffect(() => {
    async function fetchHosts() {
      setLoadingHosts(true);

      const result = await getHostMap();

      if (!result.success) {
        console.error(
          "[NearbyListPage] host/map 실패:",
          result.status,
          result.message
        );
        setHosts([]);
        setLoadingHosts(false);
        return;
      }

      const raw = result.data;
      console.log("[NearbyListPage] host/map raw:", raw);

      const mapped = raw.map((h, idx) => {
        const latRaw = h.latitude ?? h.lat;
        const lngRaw = h.longitude ?? h.lng;

        const lat =
          latRaw !== null && latRaw !== undefined ? Number(latRaw) : null;
        const lng =
          lngRaw !== null && lngRaw !== undefined ? Number(lngRaw) : null;

        // 가격 계산 로직 강화
        const priceSource = h.minPrice ?? h.price ?? h.lowestPrice ?? null;

        let numericPrice = 0;
        if (priceSource != null) {
          const cleanedPrice = String(priceSource).replace(/[^0-9]/g, "");
          numericPrice = Number(cleanedPrice) || 0;
        }

        // 체험 소요 시간(분)
        const durationMinutes =
          h.durationMinutes ??
          h.durationMin ??
          h.experienceDuration ??
          h.estimatedDuration ??
          null;

        return {
          // ⭐ host.id를 useNavigate에 사용하기 위해 hostId를 id로 설정
          id: String(h.hostId ?? h.id ?? `host-${idx}`),
          category: mapBackendCategory(h.category),
          name: h.hostName || h.name || "이름 없는 호스트",
          detailFieldCode: h.detailField ?? null,
          title: h.detailField || h.title || "",
          place: h.addressBase || h.place || "",
          lat,
          lng,
          reviews: h.reviewCount ?? 0,
          priceNumber: numericPrice,
          priceText: h.lowestPrice || null, // 표시용 텍스트 (예: "20,000원")
          available: h.availableHours ?? h.available ?? [],
          durationMinutes,
        };
      });

      console.log("[NearbyListPage] mapped hosts:", mapped);
      setHosts(mapped);
      setLoadingHosts(false);
    }

    fetchHosts();
  }, []);

  // 가격 슬라이더 드래그 처리
  const updatePriceByClientX = (handle, clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));

    const rawValue = MIN_PRICE + ratio * (MAX_PRICE - MIN_PRICE);
    const stepped = Math.round(rawValue / PRICE_STEP) * PRICE_STEP;

    if (handle === "min") {
      setPriceRange(([min, max]) => {
        const nextMin = Math.min(stepped, max - PRICE_STEP);
        return [Math.max(MIN_PRICE, nextMin), max];
      });
    } else if (handle === "max") {
      setPriceRange(([min, max]) => {
        const nextMax = Math.max(stepped, min + PRICE_STEP);
        return [min, Math.min(MAX_PRICE, nextMax)];
      });
    }
  };

  // 상태와 URL 쿼리 동기화 로직
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    let shouldUpdate = false;

    if (selectedCategory) {
      if (currentParams.get("category") !== selectedCategory) {
        currentParams.set("category", selectedCategory);
        shouldUpdate = true;
      }
    } else {
      if (currentParams.has("category")) {
        currentParams.delete("category");
        shouldUpdate = true;
      }
    }

    // 다른 필터 값도 URL에 반영이 필요하면 여기에 추가

    if (shouldUpdate) {
      navigate(`${location.pathname}?${currentParams.toString()}`, {
        replace: true,
      });
    }
  }, [selectedCategory, navigate, location.search, location.pathname]);

  useEffect(() => {
    if (!draggingHandle) return;

    const onMove = (e) => {
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      if (clientX == null) return;
      updatePriceByClientX(draggingHandle, clientX);
    };

    const stop = () => setDraggingHandle(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    window.addEventListener("touchcancel", stop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
      window.removeEventListener("touchcancel", stop);
    };
  }, [draggingHandle]);

  // 실제 hosts 데이터에 필터 + 정렬 적용
  const filteredHosts = useMemo(() => {
    if (!hosts || hosts.length === 0) return [];

    // 거리 계산
    let base = hosts.map((h) => {
      let distance = null;
      if (h.lat != null && h.lng != null) {
        distance = haversineDistance(myPos.lat, myPos.lng, h.lat, h.lng);
      }
      return {
        ...h,
        distance,
      };
    });

    // 카테고리 필터
    if (selectedCategory) {
      base = base.filter((h) => h.category === selectedCategory);
    }

    // 시간대 필터 (체험 소요 시간 기준)
    if (selectedTimeSlot) {
      const slot = TIME_SLOTS.find((s) => s.key === selectedTimeSlot);
      if (slot) {
        base = base.filter((h) => {
          const d = h.durationMinutes;
          if (d == null) return true;
          if (slot.maxMinutes == null) {
            return d >= slot.minMinutes;
          }
          return d >= slot.minMinutes && d < slot.maxMinutes;
        });
      }
    }

    // 전문분야 필터 (detailField 등과 매칭)
    if (selectedField) {
      base = base.filter((h) => h.title === selectedField);
    }

    // 가격 필터 (priceNumber 기준)
    base = base.filter(
      (h) => h.priceNumber >= priceRange[0] && h.priceNumber <= priceRange[1]
    );

    // 정렬
    if (sortKey === "distance") {
      base.sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    }
    if (sortKey === "priceLow") {
      base.sort((a, b) => a.priceNumber - b.priceNumber);
    }
    if (sortKey === "priceHigh") {
      base.sort((a, b) => b.priceNumber - a.priceNumber);
    }

    return base;
  }, [
    hosts,
    myPos,
    sortKey,
    selectedCategory,
    selectedField,
    priceRange,
    selectedTimeSlot,
  ]);

  const totalCount = filteredHosts.length;

  const minPercent =
    ((priceRange[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent =
    ((priceRange[1] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  // MapPage에 넘기는 쿼리랑 맞추기
  const buildMapUrl = () => {
    const qs = new URLSearchParams();

    if (selectedCategory) qs.set("category", selectedCategory);
    if (selectedTimeSlot) qs.set("time", selectedTimeSlot);
    if (selectedField) qs.set("field", selectedField);
    if (priceRange[0] > MIN_PRICE) qs.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < MAX_PRICE) qs.set("maxPrice", String(priceRange[1]));

    const query = qs.toString();
    return query ? `/map?${query}` : "/map";
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-[#F7F7F7] relative">
        <header className="relative flex items-center justify-center px-4 py-3 border-b bg-white">
          <button
            type="button"
            className="absolute left-4 text-2xl"
            onClick={() => navigate(-1)}
          >
            <MdArrowBackIosNew />
          </button>
          <h1 className="text-[17px] font-semibold">근처 소상공인 보기</h1>
        </header>

        {/* 필터 탭 */}
        <section className="px-4 pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-1 items-center">
            <button className="flex items-center justify-center min-w-8 min-h-8 w-6 h-6 rounded-full bg-white border border-neutral-300 text-[#7b7b7b] shadow-sm shrink-0">
              <TbAdjustmentsHorizontal size={20} className="text-[#3A3A3A]" />
            </button>

            {[
              { key: "price", label: "가격" },
              { key: "time", label: "시간대" },
              { key: "category", label: "카테고리" },
              { key: "field", label: "전문분야" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className="flex items-center justify-between gap-1 px-2 py-1 rounded-full border border-[#E9E9EC] bg-white text-[12px]"
                onClick={() => {
                  setActiveFilterTab(item.key);
                  setShowFilterSheet(true);
                }}
              >
                <span className="text-[#989898]">{item.label}</span>
                <MdKeyboardArrowDown size={20} className="text-[#989898]" />
              </button>
            ))}
          </div>
        </section>

        {/* 정렬 + 개수 */}
        <section className="relative flex items-center justify-between px-4 pt-1 pb-3 text-[14px]">
          <span className="text-[17px] font-bold">
            {loadingHosts ? "불러오는 중..." : `총 ${totalCount}건`}
          </span>

          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-full border border-[#E9E9EC] bg-white text-[13px]"
              onClick={() => setShowSortSheet((prev) => !prev)}
            >
              <span className="text-[#989898]">정렬</span>
              <MdKeyboardArrowDown size={20} className="text-[#989898]" />
            </button>

            {showSortSheet && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white border border-neutral-200 shadow-lg text-[13px] z-20">
                <button
                  className={`w-full text-left px-4 py-2 rounded-t-2xl ${
                    sortKey === "distance"
                      ? "bg-neutral-100 font-semibold"
                      : "hover:bg-neutral-50"
                  }`}
                  onClick={() => {
                    setSortKey("distance");
                    setShowSortSheet(false);
                  }}
                >
                  거리 가까운 순
                </button>
                <button
                  className={`w-full text-left px-4 py-2 ${
                    sortKey === "priceLow"
                      ? "bg-neutral-100 font-semibold"
                      : "hover:bg-neutral-50"
                  }`}
                  onClick={() => {
                    setSortKey("priceLow");
                    setShowSortSheet(false);
                  }}
                >
                  가격 낮은 순
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-b-2xl ${
                    sortKey === "priceHigh"
                      ? "bg-neutral-100 font-semibold"
                      : "hover:bg-neutral-50"
                  }`}
                  onClick={() => {
                    setSortKey("priceHigh");
                    setShowSortSheet(false);
                  }}
                >
                  가격 높은 순
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 실제 데이터 카드 리스트 */}
        <main className="flex-1 px-4 space-y-3 pb-4 overflow-y-auto">
          {!loadingHosts && filteredHosts.length === 0 && (
            <p className="text-[13px] text-neutral-400">
              조건에 맞는 호스트가 없습니다.
            </p>
          )}

          {filteredHosts.map((host) => (
            <article
              key={host.id}
              className="bg-white rounded-3xl shadow-sm px-4 py-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-row items-baseline gap-2">
                    <span className="text-[18px] font-bold">{host.name}</span>

                    {host.detailFieldCode && (
                      <span className="text-[13px] text-neutral-500">
                        {fieldOptions.find(
                          (f) => f.code === host.detailFieldCode
                        )?.description || ""}
                      </span>
                    )}
                  </div>
                </div>
                <button type="button" className="text-[22px] text-[#D8D8D8]">
                  ♡
                </button>
              </div>

              <div className="mt-3 space-y-1 text-[13px] text-neutral-500">
                <div className="flex flex-row items-center">
                  <BiSolidMessageDetail className="text-[15px] mr-1" />
                  <span>후기 {host.reviews}</span>
                </div>
                {host.distance != null && (
                  <div className="flex flex-row items-center">
                    <IoLocationSharp className="text-[15px] mr-1" />
                    <span className="mr-1">내 위치에서</span>
                    <span className="text-[#e64a45] font-semibold">
                      {formatDistance(host.distance)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[14px] flex items-center">
                  <span className="text-[#e64a45] mr-1">1인</span>

                  <span className="font-semibold">
                    {host.priceNumber > 0
                      ? `${host.priceNumber.toLocaleString()}원 ~`
                      : `${host.priceText}원~` || "가격 문의"}
                  </span>
                </div>
                {/* ⭐️ 수정된 부분: 호스트 상세 페이지로 이동 */}
                <button
                  onClick={() => navigate(`/host/${host.id}`)}
                  className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-[13px]"
                >
                  만나러 가기
                </button>
              </div>
            </article>
          ))}
        </main>

        {/* 인물 지도 보기 버튼 */}
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-[50]"
          style={{
            pointerEvents: "auto",
            bottom: showFilterSheet ? `${sheetHeight + 10}px` : "40px",
            transition: "bottom 0.3s ease-out",
          }}
        >
          <button
            type="button"
            className={`w-full mx-auto rounded-full bg-[#e64a45] text-white py-3 text-[15px] font-semibold shadow-[0_8px_20px_rgba(230,74,69,0.4)] transition-all flex items-center justify-center gap-2 ${
              showFilterSheet ? "w-[150px]" : "w-[220px]"
            }`}
            onClick={() => navigate(buildMapUrl())}
          >
            {showFilterSheet ? (
              <>
                <span>인물 지도 보기</span>
              </>
            ) : (
              <span>인물 지도 보기</span>
            )}
          </button>
        </div>

        {/* 필터 바텀 시트 */}
        {showFilterSheet && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setShowFilterSheet(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
              <div className="w-full max-w-[1000px] relative">
                <div
                  ref={sheetHeightRef}
                  className="bg-white rounded-t-3xl pt-4 pb-6 shadow-[0_-4px_16px_rgba(0,0,0,0.25)]"
                >
                  {/* 탭 헤더 */}
                  <div className="flex justify-between items-center px-4 mb-4">
                    <div className="flex gap-4 text-[16px] font-semibold">
                      {["price", "time", "category", "field"].map((tab) => (
                        <button
                          key={tab}
                          className={
                            activeFilterTab === tab
                              ? "text-black"
                              : "text-neutral-300"
                          }
                          onClick={() => setActiveFilterTab(tab)}
                        >
                          {tab === "price"
                            ? "가격"
                            : tab === "time"
                            ? "시간대"
                            : tab === "category"
                            ? "카테고리"
                            : "전문분야"}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="text-2xl"
                      onClick={() => setShowFilterSheet(false)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* 탭 내용 */}
                  <div className="px-7 pb-6">
                    {/* 가격 탭 */}
                    {activeFilterTab === "price" && (
                      <>
                        <div className="flex justify-between font-semibold text-[#3A3A3A] text-[13px] mb-4">
                          <span>{formatPriceLabel(priceRange[0])}</span>
                          <span>{formatPriceLabel(priceRange[1], true)}</span>
                        </div>

                        <div
                          ref={trackRef}
                          className="relative h-10 cursor-pointer"
                          onMouseDown={(e) => {
                            const rect =
                              trackRef.current.getBoundingClientRect();
                            const mid =
                              ((priceRange[0] + priceRange[1]) / 2 -
                                MIN_PRICE) /
                              (MAX_PRICE - MIN_PRICE);
                            const clickRatio =
                              (e.clientX - rect.left) / rect.width;
                            const handle =
                              clickRatio * 100 < mid * 100 ? "min" : "max";
                            setDraggingHandle(handle);
                            updatePriceByClientX(handle, e.clientX);
                          }}
                        >
                          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[3px] bg-black rounded-full" />

                          {/* 최소 핸들 */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-[3px] border-black"
                            style={{ left: `${minPercent}%` }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggingHandle("min");
                              updatePriceByClientX("min", e.clientX);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              const x = e.touches[0].clientX;
                              setDraggingHandle("min");
                              updatePriceByClientX("min", x);
                            }}
                          />

                          {/* 최대 핸들 */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-[3px] border-black"
                            style={{ left: `${maxPercent}%` }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggingHandle("max");
                              updatePriceByClientX("max", e.clientX);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              const x = e.touches[0].clientX;
                              setDraggingHandle("max");
                              updatePriceByClientX("max", x);
                            }}
                          />
                        </div>
                      </>
                    )}

                    {/* 시간대 탭 */}
                    {activeFilterTab === "time" && (
                      <div className="flex flex-wrap gap-3 text-[15px] py-2">
                        {TIME_SLOTS.map((slot) => {
                          const isActive = selectedTimeSlot === slot.key;
                          return (
                            <button
                              key={slot.key}
                              className={`px-3 py-1.5 rounded-full transition-all
            ${
              isActive
                ? "bg-white border border-[#2D7DF6] text-[#2D7DF6] font-semibold shadow-[0_0_0_1px_rgba(45,125,246,0.15)]"
                : "bg-[#F5F5F7] text-[#222222] border border-transparent"
            }`}
                              onClick={() =>
                                setSelectedTimeSlot((prev) =>
                                  prev === slot.key ? null : slot.key
                                )
                              }
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 카테고리 탭 */}
                    {activeFilterTab === "category" && (
                      <div className="flex flex-wrap gap-2 text-[15px] py-2">
                        {[
                          { key: "artisan", label: "장인" },
                          { key: "youth", label: "청년사업가" },
                          { key: "alley", label: "골목상인" },
                          { key: "artist", label: "예술가" },
                        ].map((c) => (
                          <button
                            key={c.key}
                            className={`px-3 py-1.5 rounded-full border ${
                              selectedCategory === c.key
                                ? "bg-white border border-[#2D7DF6] text-[#2D7DF6] font-semibold shadow-[0_0_0_1px_rgba(45,125,246,0.15)]"
                                : "bg-[#F5F5F7] text-[#222222] border border-transparent"
                            }`}
                            onClick={() =>
                              setSelectedCategory((prev) =>
                                prev === c.key ? null : c.key
                              )
                            }
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 전문분야 탭 */}
                    {activeFilterTab === "field" && (
                      <div className="flex flex-wrap gap-2 text-[15px] py-2">
                        {FIELD_OPTIONS.map((f) => {
                          const isActive = selectedField === f.description;
                          return (
                            <button
                              key={f.code}
                              className={`px-3 py-1.5 rounded-full border ${
                                isActive
                                  ? "bg-white border border-[#2D7DF6] text-[#2D7DF6] font-semibold shadow-[0_0_0_1px_rgba(45,125,246,0.15)]"
                                  : "bg-[#F5F5F7] text-[#222222] border border-transparent"
                              }`}
                              onClick={() =>
                                setSelectedField((prev) =>
                                  prev === f.description ? null : f.description
                                )
                              }
                            >
                              {f.description}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 하단 버튼 영역 – 카카오 UI 스타일 */}
                  <div className="flex gap-3 px-4">
                    <button
                      className="w-20 h-12 text-[#C9C9C9] rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[20px]"
                      onClick={() => {
                        // 모든 필터 상태 초기화
                        setPriceRange([MIN_PRICE, MAX_PRICE]);
                        setSelectedTimeSlot(null);
                        setSelectedCategory(null);
                        setSelectedField(null);
                      }}
                    >
                      <FiRotateCw />
                    </button>
                    <button
                      className="flex-1 h-12 rounded-lg bg-[#3A3A3A] text-white text-[15px] font-semibold"
                      onClick={() => setShowFilterSheet(false)}
                    >
                      {totalCount}명 검색
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
