// src/pages/NearbyListPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// MapPage의 HOSTS와 동일한 더미 데이터 5명
const MOCK_HOSTS = [
  {
    id: 1,
    name: "이지섭",
    role: "도자기 장인",
    category: "artisan",
    lat: 35.82075,
    lng: 128.7415,
    reviews: 129,
    price: 50000,
  },
  {
    id: 2,
    name: "서지유",
    role: "전시 기획자",
    category: "youth",
    lat: 35.8223,
    lng: 128.7432,
    reviews: 28,
    price: 40000,
  },
  {
    id: 3,
    name: "최하늘",
    role: "조향사",
    category: "alley",
    lat: 35.8218,
    lng: 128.7385,
    reviews: 82,
    price: 35000,
  },
  {
    id: 4,
    name: "소성민",
    role: "브랜드 컨설턴트",
    category: "artist",
    lat: 35.8234,
    lng: 128.7398,
    reviews: 52,
    price: 30000,
  },
  {
    id: 5,
    name: "강도윤",
    role: "목공예 장인",
    category: "artisan",
    lat: 35.8188,
    lng: 128.7423,
    reviews: 63,
    price: 45000,
  },
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

export default function NearbyListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFromQuery = params.get("category");

  const [myPos, setMyPos] = useState({
    lat: 35.825,
    lng: 128.741,
  });

  const [sortKey, setSortKey] = useState("distance"); // distance | priceLow | priceHigh
  const [showPriceSheet, setShowPriceSheet] = useState(false);

  // 내 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // 실패하면 기본값(경산시청 근처) 유지
        }
      );
    }
  }, []);

  // 필터 + 거리/가격 정렬
  const filteredHosts = useMemo(() => {
    const base = MOCK_HOSTS.filter((h) =>
      categoryFromQuery ? h.category === categoryFromQuery : true
    );
    const withDist = base.map((h) => ({
      ...h,
      distance: haversineDistance(myPos.lat, myPos.lng, h.lat, h.lng),
    }));

    if (sortKey === "distance") {
      return [...withDist].sort((a, b) => a.distance - b.distance);
    }
    if (sortKey === "priceLow") {
      return [...withDist].sort((a, b) => a.price - b.price);
    }
    if (sortKey === "priceHigh") {
      return [...withDist].sort((a, b) => b.price - a.price);
    }
    return withDist;
  }, [myPos, sortKey, categoryFromQuery]);

  const totalCount = filteredHosts.length;

  return (
    <div className="min-h-[100dvh] bg-neutral-50 flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col pb-28">
        {/* 헤더 */}
        <header className="flex items-center px-4 py-3 border-b bg-white">
          <button
            type="button"
            className="text-2xl mr-2"
            onClick={() => navigate(-1)}
          >
            ‹
          </button>
          <h1 className="text-[17px] font-semibold">근처 소상공인 보기</h1>
        </header>

        {/* 필터 바 */}
        <section className="bg-white px-4 pt-3 pb-2 border-b">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 text-[13px] whitespace-nowrap"
              onClick={() => setShowPriceSheet(true)}
            >
              <span>⚙️</span>
              <span>가격</span>
              <span>▾</span>
            </button>

            <FilterChip label="시간대" />
            <FilterChip label="카테고리" />
            <FilterChip label="전문 분야" />
          </div>
        </section>

        {/* 총 N건 + 정렬 */}
        <section className="flex items-center justify-between px-4 py-3 text-[14px]">
          <div>
            <span className="font-semibold">총 {totalCount}건</span>
          </div>
          <div>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 text-[13px]"
              onClick={() => {
                // 간단한 토글 예시 (거리 ↔ 가격 낮은순)
                setSortKey((prev) =>
                  prev === "distance" ? "priceLow" : "distance"
                );
              }}
            >
              <span>정렬</span>
              <span>▾</span>
            </button>
          </div>
        </section>

        {/* 리스트 */}
        <main className="flex-1 px-4 space-y-3 pb-4 overflow-y-auto">
          {filteredHosts.map((host) => (
            <article
              key={host.id}
              className="bg-white rounded-3xl shadow-sm px-4 py-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[18px] font-bold">{host.name}</div>
                  <div className="text-[13px] text-neutral-500 mt-1">
                    {host.role}
                  </div>
                </div>
                <button type="button" className="text-[22px] text-[#D8D8D8]">
                  ♡
                </button>
              </div>

              <div className="mt-3 space-y-1 text-[13px] text-neutral-500">
                <div>💬 후기 {host.reviews}</div>
                <div>
                  📍 내 위치에서{" "}
                  <span className="text-[#e64a45] font-semibold">
                    {formatDistance(host.distance)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[14px]">
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

        {/* 하단 인물지도 보기 버튼 */}
        <button
          type="button"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[220px] rounded-full bg-[#e64a45] text-white py-3 text-[15px] font-semibold shadow-[0_8px_20px_rgba(230,74,69,0.4)]"
          onClick={() => navigate(`/map?category=${categoryFromQuery ?? ""}`)}
        >
          인물 지도 보기
        </button>

        {/* 가격 필터 바텀시트 */}
        {showPriceSheet && (
          <>
            {/* 어두운 배경 */}
            <div
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setShowPriceSheet(false)}
            />
            {/* 바텀 시트 */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
              <div className="w-full max-w-[480px] bg-white rounded-t-3xl pt-4 pb-6 shadow-[0_-4px_16px_rgba(0,0,0,0.25)]">
                <div className="flex justify-between items-center px-4 mb-4">
                  <div className="flex gap-4 text-[14px] font-semibold">
                    <span className="text-black">가격</span>
                    <span className="text-neutral-300">시간대</span>
                    <span className="text-neutral-300">카테고리</span>
                    <span className="text-neutral-300">전문분야</span>
                  </div>
                  <button
                    type="button"
                    className="text-2xl"
                    onClick={() => setShowPriceSheet(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex justify-between text-[13px] mb-2">
                    <span>0원</span>
                    <span>20만원+</span>
                  </div>

                  {/* 슬라이더 모양만 (동작 X) */}
                  <div className="relative h-10 flex items-center">
                    <div className="h-[3px] bg-black w-full rounded-full" />
                    <div className="absolute left-0 w-5 h-5 rounded-full border-2 border-black bg-white -translate-y-1/2 top-1/2" />
                    <div className="absolute right-0 w-5 h-5 rounded-full border-2 border-black bg-white -translate-y-1/2 top-1/2" />
                  </div>
                </div>

                <div className="flex gap-3 px-4">
                  <button className="flex-1 h-12 rounded-lg bg-neutral-100 text-[14px]">
                    ↺ 초기화
                  </button>
                  <button className="flex-[2] h-12 rounded-lg bg-neutral-900 text-white text-[14px]">
                    {totalCount}명 검색
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label }) {
  return (
    <button
      type="button"
      className="px-3 py-1.5 rounded-full border border-neutral-200 text-[13px] bg-white whitespace-nowrap"
    >
      {label} ▾
    </button>
  );
}
