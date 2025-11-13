import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../apis/api";

import BottomTab from "../../components/BottomTab";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { LuCrosshair } from "react-icons/lu";
import { BiSolidMessageDetail } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";

const CATEGORY_ITEMS = [
  { key: "artisan", label: "장인" },
  { key: "youth", label: "청년사업가" },
  { key: "alley", label: "골목상인" },
  { key: "artist", label: "예술가" },
];

const DUMMY_HOSTS = [
  {
    id: "h1",
    category: "artisan",
    name: "이지섭",
    title: "도자기 장인",
    place: "경산시청 근처",
    lat: 35.82075,
    lng: 128.7415,
    distance: 114,
    price: "50,000원 ~",
    reviews: 129,
    avatar: "/host-potter.png",
  },
  {
    id: "h2",
    category: "youth",
    name: "서지유",
    title: "전시 기획자",
    place: "중방동 전시공간",
    lat: 35.8223,
    lng: 128.7432,
    distance: 420,
    price: "40,000원 ~",
    reviews: 28,
    avatar: "/host-planner.png",
  },
  {
    id: "h3",
    category: "alley",
    name: "최하늘",
    title: "조향사",
    place: "남매공원 인근 공방",
    lat: 35.8218,
    lng: 128.7385,
    distance: 650,
    price: "35,000원 ~",
    reviews: 82,
    avatar: "/host-perfumer.png",
  },
  {
    id: "h4",
    category: "artist",
    name: "소성민",
    title: "브랜드 컨설턴트",
    place: "사동 카페거리",
    lat: 35.8234,
    lng: 128.7398,
    distance: 900,
    price: "30,000원 ~",
    reviews: 52,
    avatar: "/host-consultant.png",
  },
  {
    id: "h5",
    category: "artisan",
    name: "강도윤",
    title: "목공예 장인",
    place: "정평동 목공방",
    lat: 35.8188,
    lng: 128.7423,
    distance: 1200,
    price: "45,000원 ~",
    reviews: 63,
    avatar: "/host-wood.png",
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

function ensureMyLocationStyles() {
  if (document.getElementById("my-location-pulse-style")) return;
  const style = document.createElement("style");
  style.id = "my-location-pulse-style";
  style.innerHTML = `
    @keyframes my-location-pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.6);
        opacity: 0.7;
      }
      70% {
        transform: translate(-50%, -50%) scale(1.3);
        opacity: 0;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.3);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hostOverlaysRef = useRef({});
  const labelListRef = useRef(null);
  const labelItemRefs = useRef({});
  const myLocationOverlayRef = useRef(null);
  const myPositionRef = useRef(null);
  const initialSelectRef = useRef(true);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryFromQuery = params.get("category");

  const [activeCategory, setActiveCategory] = useState(() => {
    const exists = CATEGORY_ITEMS.some((c) => c.key === categoryFromQuery);
    return exists ? categoryFromQuery : null;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostId, setSelectedHostId] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  const [hosts, setHosts] = useState(DUMMY_HOSTS);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    async function fetchHosts() {
      try {
        const res = await api.get("/host/list");

        const raw = res.data.hosts || res.data;

        const mapped = raw.map((h) => ({
          id: h.id,
          category: h.category || "artisan",
          name: h.businessName || h.name,
          title: h.title || "",
          place: h.addressBase || h.place || "",
          lat: h.latitude,
          lng: h.longitude,
          distance: 0,
          price: h.priceText || "가격 문의",
          reviews: h.reviewCount ?? 0,
          avatar: h.profileImageUrl || null,
        }));

        setHosts(mapped);
      } catch (err) {
        console.error(
          "[MapPage] 호스트 목록 불러오기 실패, 더미 데이터 사용",
          err
        );
        // 실패하면 DUMMY_HOSTS 그대로 사용
      }
    }

    fetchHosts();
  }, []);

  const displayedHosts = useMemo(() => {
    let filtered = activeCategory
      ? hosts.filter((h) => h.category === activeCategory)
      : hosts;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((h) => {
        const target = [h.name, h.title, h.place]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return target.includes(q);
      });
    }

    const withDistance = filtered.map((h) => {
      if (myLocation && h.lat && h.lng) {
        const d = haversineDistance(
          myLocation.lat,
          myLocation.lng,
          h.lat,
          h.lng
        );
        return { ...h, distance: Math.round(d) };
      }
      return h;
    });

    return [...withDistance].sort((a, b) => a.distance - b.distance);
  }, [hosts, activeCategory, searchQuery, myLocation]);

  const createMyLocationOverlay = (lat, lng) => {
    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map || !kakao || !kakao.maps) return;

    ensureMyLocationStyles();

    const pos = new kakao.maps.LatLng(lat, lng);

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = "40px";
    container.style.height = "40px";

    const pulse = document.createElement("div");
    pulse.style.position = "absolute";
    pulse.style.top = "50%";
    pulse.style.left = "50%";
    pulse.style.width = "30px";
    pulse.style.height = "30px";
    pulse.style.borderRadius = "50%";
    pulse.style.background = "rgba(66,133,244,0.35)";
    pulse.style.animation = "my-location-pulse 1.8s ease-out infinite";

    const halo = document.createElement("div");
    halo.style.position = "absolute";
    halo.style.top = "50%";
    halo.style.left = "50%";
    halo.style.width = "24px";
    halo.style.height = "24px";
    halo.style.borderRadius = "50%";
    halo.style.background = "rgba(66,133,244,0.25)";
    halo.style.transform = "translate(-50%, -50%)";

    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.top = "50%";
    dot.style.left = "50%";
    dot.style.width = "14px";
    dot.style.height = "14px";
    dot.style.borderRadius = "50%";
    dot.style.background = "#4285F4";
    dot.style.border = "3px solid #ffffff";
    dot.style.transform = "translate(-50%, -50%)";

    container.appendChild(pulse);
    container.appendChild(halo);
    container.appendChild(dot);

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: container,
      yAnchor: 0.5,
      xAnchor: 0.5,
      zIndex: 10,
    });

    overlay.setMap(map);
    myLocationOverlayRef.current = overlay;
  };

  const handleMoveToMyLocation = () => {
    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map || !kakao || !kakao.maps) return;

    if (myPositionRef.current) {
      const { lat, lng } = myPositionRef.current;
      const pos = new kakao.maps.LatLng(lat, lng);
      map.panTo(pos);
      if (myLocationOverlayRef.current) {
        myLocationOverlayRef.current.setPosition(pos);
      } else {
        createMyLocationOverlay(lat, lng);
      }
      return;
    }

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        myPositionRef.current = { lat, lng };
        setMyLocation({ lat, lng });

        const pos = new kakao.maps.LatLng(lat, lng);
        map.panTo(pos);

        if (myLocationOverlayRef.current) {
          myLocationOverlayRef.current.setPosition(pos);
        } else {
          createMyLocationOverlay(lat, lng);
        }
      },
      (err) => {
        console.warn("내 위치 재요청 실패", err);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // ---------- 지도 초기화 (1번만) ----------
  useEffect(() => {
    async function initMap() {
      const { kakao } = window;
      if (!mapRef.current || !kakao || !kakao.maps) return;

      let centerLat = 35.825;
      let centerLng = 128.741;
      let usedMyLocation = false;

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          });
          centerLat = position.coords.latitude;
          centerLng = position.coords.longitude;
          usedMyLocation = true;

          myPositionRef.current = { lat: centerLat, lng: centerLng };
          setMyLocation({ lat: centerLat, lng: centerLng });
        } catch (err) {
          console.warn("위치 권한 오류, 경산시청 사용", err);
        }
      }

      const center = new kakao.maps.LatLng(centerLat, centerLng);

      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 3,
      });
      mapInstanceRef.current = map;
      setMapReady(true);

      if (usedMyLocation) {
        createMyLocationOverlay(centerLat, centerLng);
      }

      try {
        const res = await fetch("/gyeongsan_city.geojson");
        if (res.ok) {
          const geojson = await res.json();
          let coords = geojson.features[0].geometry.coordinates;
          const type = geojson.features[0].geometry.type;
          if (type === "MultiPolygon") {
            coords = coords[0][0];
          } else if (type === "Polygon") {
            coords = coords[0];
          }

          const gyeongsanPath = coords.map(
            (c) => new kakao.maps.LatLng(c[1], c[0])
          );
          const worldPath = [
            new kakao.maps.LatLng(85, -180),
            new kakao.maps.LatLng(85, 180),
            new kakao.maps.LatLng(-85, 180),
            new kakao.maps.LatLng(-85, -180),
          ];

          const maskPolygon = new kakao.maps.Polygon({
            path: [worldPath, gyeongsanPath],
            strokeWeight: 0,
            strokeColor: "none",
            fillColor: "#000000",
            fillOpacity: 0.45,
          });
          maskPolygon.setMap(map);

          const borderPolygon = new kakao.maps.Polygon({
            path: [gyeongsanPath],
            strokeWeight: 2,
            strokeColor: "#ffffff",
            strokeOpacity: 0.9,
            fillColor: "transparent",
            fillOpacity: 0,
          });
          borderPolygon.setMap(map);

          if (!usedMyLocation) {
            const bounds = new kakao.maps.LatLngBounds();
            gyeongsanPath.forEach((latlng) => bounds.extend(latlng));

            const centerOfGyeongsan = bounds.getCenter();
            map.setCenter(centerOfGyeongsan);
            map.setLevel(8);
          }
        }
      } catch (e) {
        console.warn("gyeongsan_city.geojson 로드 실패", e);
      }

      hostOverlaysRef.current = {};
    }

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAO_JS_KEY
      }&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => initMap());
      };
      document.head.appendChild(script);
    }
  }, []);

  // ---------- hosts가 바뀔 때마다 마커 생성/갱신 ----------
  useEffect(() => {
    if (!mapReady || !window.kakao || !window.kakao.maps) return;
    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map) return;

    // 기존 마커 제거
    Object.values(hostOverlaysRef.current).forEach(({ overlay }) =>
      overlay.setMap(null)
    );
    hostOverlaysRef.current = {};

    hosts.forEach((host) => {
      if (!host.lat || !host.lng) return;

      const pos = new kakao.maps.LatLng(host.lat, host.lng);

      const el = document.createElement("div");
      el.className = "host-marker";
      el.innerHTML = host.avatar
        ? `<img src="${host.avatar}" alt="${host.name}" />`
        : `<span style="font-size:26px;">😊</span>`;

      el.addEventListener("click", () => {
        setSelectedHostId((prev) => (prev === host.id ? null : host.id));
        setSheetExpanded(true);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: el,
        yAnchor: 1,
      });
      overlay.setMap(map);

      hostOverlaysRef.current[host.id] = { overlay, el, host };
    });

    // 초기 선택 호스트
    if (!selectedHostId && hosts.length > 0) {
      setSelectedHostId(hosts[0].id);
    }
  }, [hosts, mapReady]); // ← 지도 준비 + 호스트 로딩 이후

  // ---------- 선택된 호스트에 맞춰 지도 패닝 ----------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao) return;

    Object.values(hostOverlaysRef.current).forEach(({ el }) => {
      el.classList.remove("active");
    });

    if (!selectedHostId) return;

    const item = hostOverlaysRef.current[selectedHostId];
    if (!item) return;

    item.el.classList.add("active");

    const { kakao } = window;
    const pos = new kakao.maps.LatLng(item.host.lat, item.host.lng);

    if (initialSelectRef.current) {
      initialSelectRef.current = false;
      if (myLocation) {
        return;
      }
    }

    map.panTo(pos);
  }, [selectedHostId, myLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const visibleIds = new Set(displayedHosts.map((h) => h.id));

    Object.entries(hostOverlaysRef.current).forEach(([id, { overlay }]) => {
      if (visibleIds.has(id)) {
        overlay.setMap(map);
      } else {
        overlay.setMap(null);
      }
    });

    if (
      selectedHostId &&
      !displayedHosts.find((h) => h.id === selectedHostId)
    ) {
      const first = displayedHosts[0];
      setSelectedHostId(first ? first.id : null);
    }
  }, [activeCategory, searchQuery, displayedHosts, selectedHostId, mapReady]);

  useEffect(() => {
    if (!sheetExpanded || !selectedHostId) return;
    const container = labelListRef.current;
    const item = labelItemRefs.current[selectedHostId];
    if (!container || !item) return;

    const targetScrollLeft =
      item.offsetLeft + item.offsetWidth / 2 - container.clientWidth / 2;

    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }, [selectedHostId, sheetExpanded]);

  return (
    <div className="relative min-h-[100dvh] bg-white">
      <div
        ref={mapRef}
        className="absolute inset-0"
        style={{ minHeight: "100dvh" }}
      />

      <div className="pointer-events-none relative z-10 flex flex-col min-h-[100dvh] pb-24">
        {/* 상단 검색창 */}
        <header className="pt-6 px-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 bg-white rounded-[10px] shadow-md px-4 py-4">
              <input
                type="text"
                placeholder="장소 · 호스트를 검색해보세요"
                className="flex-1 bg-transparent text-[15px] placeholder:text-neutral-400 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="text-[18px] text-neutral-500 px-1"
                aria-label="검색"
              >
                <FaMagnifyingGlass />
              </button>
            </div>

            <button
              type="button"
              className="flex items-center justify-center w-14 h-14 rounded-[10px] bg-[#7b7b7b] text-white shadow-md"
              aria-label="필터 열기"
            >
              <TbAdjustmentsHorizontal size={25} />
            </button>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORY_ITEMS.map((c) => {
              const isActive = activeCategory === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) => (prev === c.key ? null : c.key))
                  }
                  className={[
                    "shrink-0 px-4 py-1 rounded-full text-[13px] border bg-white",
                    isActive
                      ? "border-[#e64a45] text-[#e64a45] font-semibold"
                      : "border-neutral-300 text-neutral-700",
                  ].join(" ")}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex-1" />

        {/* 하단 카드 + 내 위치 버튼 */}
        <div className="pointer-events-auto fixed bottom-[70px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 flex flex-col gap-2">
          <div className="w-full flex flex-col items-center mb-1">
            <button
              type="button"
              onClick={() => setSheetExpanded((prev) => !prev)}
              className="mb-1 text-black text-3xl leading-none"
              aria-label="라벨 접기/펼치기"
            >
              {sheetExpanded ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </button>

            <div className="relative w-full flex justify-center items-center">
              <button
                type="button"
                className="w-[150px] rounded-full bg-[#e64a45] text-white py-2.5 text-[15px] font-semibold shadow-[0_6px_16px_rgba(230,74,69,0.4)]"
                onClick={() => {
                  const q = activeCategory ? `?category=${activeCategory}` : "";
                  navigate(`/nearby${q}`);
                }}
              >
                목록 보기
              </button>

              <button
                type="button"
                className="absolute right-1 w-11 h-11 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] border border-neutral-200 flex items-center justify-center"
                aria-label="내 위치로 이동"
                onClick={handleMoveToMyLocation}
              >
                <LuCrosshair className="text-neutral-700 text-xl" />
              </button>
            </div>
          </div>

          {sheetExpanded && (
            <div
              ref={labelListRef}
              className="mt-1 flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory"
              style={{ padding: "0 calc((100% - 250px) / 2)" }}
            >
              {displayedHosts.map((host) => {
                const selected = host.id === selectedHostId;
                return (
                  <button
                    key={host.id}
                    type="button"
                    ref={(el) => {
                      if (el) labelItemRefs.current[host.id] = el;
                    }}
                    onClick={() =>
                      setSelectedHostId((prev) =>
                        prev === host.id ? null : host.id
                      )
                    }
                    className={[
                      "min-w-[250px] max-w-[250px] rounded-2xl bg-white border text-left px-4 py-2 shadow-sm transition-all duration-150 snap-center",
                      selected
                        ? "border-[#000000] shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
                        : "border-neutral-200",
                    ].join(" ")}
                  >
                    <div className="flex flex-row items-baseline gap-2">
                      <span className="text-[17px] font-bold">{host.name}</span>
                      {host.title && (
                        <span className="text-[13px] text-neutral-500">
                          {host.title}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-row items-center text-[13px] text-neutral-500">
                      <BiSolidMessageDetail className="text-[15px] mr-1" />
                      <span>후기 {host.reviews}</span>
                    </div>

                    <div className="mt-0.5 flex flex-row items-center text-[13px] text-neutral-500">
                      <IoLocationSharp className="text-[15px] mr-1" />
                      <span className="mr-1">내 위치에서</span>
                      <span className="text-[#e64a45] font-semibold">
                        {host.distance}m
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[14px]">
                      <div className="flex items-center">
                        <span className="text-[#e64a45] font-semibold mr-1">
                          1인
                        </span>
                        <span className="font-semibold">{host.price}</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-full border border-neutral-300 text-[12px]">
                        만나러 가기
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomTab />
    </div>
  );
}
