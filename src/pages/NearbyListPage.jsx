import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BiSolidMessageDetail } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { MdArrowBackIosNew } from "react-icons/md";

const MIN_PRICE = 0;
const MAX_PRICE = 200000;
const PRICE_STEP = 5000;

const MOCK_HOSTS = [
  {
    id: 1,
    name: "이지섭",
    role: "도자기 장인",
    category: "artisan",
    field: "도자기",
    lat: 35.82075,
    lng: 128.7415,
    reviews: 129,
    price: 50000,
    available: [9, 13, 18],
  },
  {
    id: 2,
    name: "서지유",
    role: "전시 기획자",
    category: "youth",
    field: "전시 기획",
    lat: 35.8223,
    lng: 128.7432,
    reviews: 28,
    price: 40000,
    available: [11, 17],
  },
  {
    id: 3,
    name: "최하늘",
    role: "조향사",
    category: "alley",
    field: "조향",
    lat: 35.8218,
    lng: 128.7385,
    reviews: 82,
    price: 35000,
    available: [15, 18],
  },
  {
    id: 4,
    name: "소성민",
    role: "브랜드 컨설턴트",
    category: "artist",
    field: "브랜드 컨설팅",
    lat: 35.8234,
    lng: 128.7398,
    reviews: 52,
    price: 30000,
    available: [11, 15],
  },
  {
    id: 5,
    name: "강도윤",
    role: "목공예 장인",
    category: "artisan",
    field: "목공예",
    lat: 35.8188,
    lng: 128.7423,
    reviews: 63,
    price: 45000,
    available: [9, 17],
  },
];

const TIME_SLOTS = [
  { key: "9-11", label: "오전 9시 ~ 11시", start: 9, end: 11 },
  { key: "11-13", label: "오전 11시 ~ 오후 1시", start: 11, end: 13 },
  { key: "13-15", label: "오후 1시 ~ 3시", start: 13, end: 15 },
  { key: "15-17", label: "오후 3시 ~ 5시", start: 15, end: 17 },
  { key: "17-19", label: "오후 5시 ~ 7시", start: 17, end: 19 },
];

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
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function formatPriceLabel(value, isMax = false) {
  if (isMax && value >= MAX_PRICE) return "20만원+";
  if (value === 0) return "0원";
  if (value % 10000 === 0) return `${value / 10000}만원`;
  return `${value.toLocaleString()}원`;
}

export default function NearbyListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFromQuery = params.get("category");

  const [myPos, setMyPos] = useState({ lat: 35.825, lng: 128.741 });
  const [sortKey, setSortKey] = useState("distance");

  const [activeFilterTab, setActiveFilterTab] = useState("price");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const [showSortSheet, setShowSortSheet] = useState(false);

  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromQuery);
  const [selectedField, setSelectedField] = useState(null);

  const trackRef = useRef(null);
  const [draggingHandle, setDraggingHandle] = useState(null);

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
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedTimeSlot(null);
    setSelectedCategory(categoryFromQuery || null);
    setSelectedField(null);
  }, [activeFilterTab, categoryFromQuery]);

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

  const filteredHosts = useMemo(() => {
    let base = MOCK_HOSTS.map((h) => ({
      ...h,
      distance: haversineDistance(myPos.lat, myPos.lng, h.lat, h.lng),
    }));

    if (selectedCategory) {
      base = base.filter((h) => h.category === selectedCategory);
    }

    if (selectedTimeSlot) {
      const slot = TIME_SLOTS.find((s) => s.key === selectedTimeSlot);
      if (slot) {
        base = base.filter((h) =>
          h.available.some((t) => t >= slot.start && t < slot.end)
        );
      }
    }

    if (selectedField) {
      base = base.filter((h) => h.field === selectedField);
    }

    base = base.filter(
      (h) => h.price >= priceRange[0] && h.price <= priceRange[1]
    );

    if (sortKey === "distance") base.sort((a, b) => a.distance - b.distance);
    if (sortKey === "priceLow") base.sort((a, b) => a.price - b.price);
    if (sortKey === "priceHigh") base.sort((a, b) => b.price - a.price);

    return base;
  }, [
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
    <div className="min-h-[100dvh] bg-neutral-50 flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col pb-28">
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
                className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-full border border-neutral-200 text-[13px]"
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

        <section className="relative flex items-center justify-between px-4 pt-1 pb-3 text-[14px]">
          <span className="text-[17px] font-bold">총 {totalCount}건</span>

          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-full border border-neutral-200 text-[13px]"
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

        <main className="flex-1 px-4 space-y-3 pb-4 overflow-y-auto">
          {filteredHosts.map((host) => (
            <article
              key={host.id}
              className="bg-white rounded-3xl shadow-sm px-4 py-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-row items-baseline gap-2">
                    <span className="text-[18px] font-bold">{host.name}</span>
                    <span className="text-[13px] text-neutral-500">
                      {host.role}
                    </span>
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
                <div className="flex flex-row items-center">
                  <IoLocationSharp className="text-[15px] mr-1" />
                  <span className="mr-1">내 위치에서</span>
                  <span className="text-[#e64a45] font-semibold">
                    {formatDistance(host.distance)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[14px] flex items-center">
                  <span className="text-[#e64a45] mr-1">1인</span>
                  <span className="font-semibold">
                    {host.price.toLocaleString()}원 ~
                  </span>
                </div>
                <button className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-[13px]">
                  만나러 가기
                </button>
              </div>
            </article>
          ))}
        </main>

        {!showFilterSheet && (
          <button
            type="button"
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[220px] rounded-full bg-[#e64a45] text-white py-3 text-[15px] font-semibold shadow-[0_8px_20px_rgba(230,74,69,0.4)]"
            onClick={() => navigate(buildMapUrl())}
          >
            인물 지도 보기
          </button>
        )}

        {showFilterSheet && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setShowFilterSheet(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
              <div className="w-full max-w-[1000px] relative">
                <button
                  type="button"
                  className="absolute -top-16 left-1/2 -translate-x-1/2 w-[220px] rounded-full bg-[#e64a45] text-white py-3 text-[15px] font-semibold shadow-[0_8px_20px_rgba(230,74,69,0.4)]"
                  onClick={() => {
                    setShowFilterSheet(false);
                    navigate(buildMapUrl());
                  }}
                >
                  인물 지도 보기
                </button>

                <div className="bg-white rounded-t-3xl pt-4 pb-6 shadow-[0_-4px_16px_rgba(0,0,0,0.25)]">
                  <div className="flex justify-between items-center px-4 mb-4">
                    <div className="flex gap-4 text-[14px] font-semibold">
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

                  <div className="px-6 pb-6">
                    {activeFilterTab === "price" && (
                      <>
                        <div className="flex justify-between text-[13px] mb-4">
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

                        <p className="text-[13px] text-neutral-500 mt-3">
                          {formatPriceLabel(priceRange[0])} ~{" "}
                          {formatPriceLabel(priceRange[1], true)}
                        </p>
                      </>
                    )}

                    {activeFilterTab === "time" && (
                      <div className="flex flex-wrap gap-2 text-[13px]">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot.key}
                            className={`px-3 py-1.5 rounded-full border ${
                              selectedTimeSlot === slot.key
                                ? "border-black bg-neutral-200"
                                : "border-neutral-300 bg-white"
                            }`}
                            onClick={() =>
                              setSelectedTimeSlot((prev) =>
                                prev === slot.key ? null : slot.key
                              )
                            }
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeFilterTab === "category" && (
                      <div className="flex flex-wrap gap-2 text-[13px]">
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
                                ? "border-black bg-neutral-200"
                                : "border-neutral-300 bg-white"
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

                    {activeFilterTab === "field" && (
                      <div className="flex flex-wrap gap-2 text-[13px]">
                        {[
                          "도자기",
                          "전시 기획",
                          "조향",
                          "브랜드 컨설팅",
                          "목공예",
                        ].map((f) => (
                          <button
                            key={f}
                            className={`px-3 py-1.5 rounded-full border ${
                              selectedField === f
                                ? "border-black bg-neutral-200"
                                : "border-neutral-300 bg-white"
                            }`}
                            onClick={() =>
                              setSelectedField((prev) =>
                                prev === f ? null : f
                              )
                            }
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 px-4">
                    <button
                      className="flex-1 h-12 rounded-lg bg-neutral-100 text-[14px]"
                      onClick={() => {
                        setPriceRange([MIN_PRICE, MAX_PRICE]);
                        setSelectedTimeSlot(null);
                        setSelectedCategory(categoryFromQuery || null);
                        setSelectedField(null);
                      }}
                    >
                      ↺ 초기화
                    </button>
                    <button
                      className="flex-[2] h-12 rounded-lg bg-neutral-900 text-white text-[14px]"
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
