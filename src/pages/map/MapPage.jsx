import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getHostMap } from "../../apis/map";

import BottomTab from "../../components/BottomTab";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { LuCrosshair } from "react-icons/lu";
import { BiSolidMessageDetail } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";
import { FiRotateCw } from "react-icons/fi";

import { fetchDetailFields, fetchCategoryEnums } from "../../apis/enums";

// 🔹 가격 / 시간대 필터용 상수
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

// 백엔드 category 값을 프론트에서 쓰는 key 로 매핑
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

// 가격 라벨
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

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // ✅ { [hostId]: { overlay, el, host } }
  const hostOverlaysRef = useRef({});

  const labelListRef = useRef(null);
  const labelItemRefs = useRef({});
  const myLocationOverlayRef = useRef(null);
  const myPositionRef = useRef(null);
  const initialSelectRef = useRef(true);

  const navigate = useNavigate();
  const location = useLocation();
  const focusHostId = location.state?.focusHostId;
  const focusLat = location.state?.focusLat;
  const focusLng = location.state?.focusLng;

  const [fieldOptions, setFieldOptions] = useState([]);
  const params = new URLSearchParams(location.search);
  const categoryFromQuery = params.get("category");

  const [categoryOptions, setCategoryOptions] = useState([]); // enums/categories 결과
  const [activeCategory, setActiveCategory] = useState(categoryFromQuery);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostId, setSelectedHostId] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  const [hosts, setHosts] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  // 🔹 필터 시트 상태 (NearbyListPage와 동일 패턴)
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("price");
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedField, setSelectedField] = useState(null);

  // 가격 슬라이더용
  const trackRef = useRef(null);
  const [draggingHandle, setDraggingHandle] = useState(null);

  // 가격 핸들 위치 %
  const minPercent =
    ((priceRange[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent =
    ((priceRange[1] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  // 호스트 데이터 가져오기
  useEffect(() => {
    async function fetchHosts() {
      const result = await getHostMap();

      if (!result.success) {
        console.error(
          "[MapPage] host/map 실패:",
          result.status,
          result.message
        );
        setHosts([]);
        return;
      }

      const raw = result.data;
      console.log("[MapPage] host/map raw:", raw);

      const mapped = raw.map((h, idx) => {
        const latRaw = h.latitude ?? h.lat;
        const lngRaw = h.longitude ?? h.lng;

        const lat =
          latRaw !== null && latRaw !== undefined ? Number(latRaw) : null;
        const lng =
          lngRaw !== null && lngRaw !== undefined ? Number(lngRaw) : null;

        // 🔹 가격 숫자/텍스트 분리
        const minPrice = h.minPrice ?? h.price ?? h.lowestPrice ?? null;
        const numericPrice = minPrice != null ? Number(minPrice) : 0;
        const priceNumber = Number.isNaN(numericPrice) ? 0 : numericPrice;

        const priceText =
          minPrice != null && !Number.isNaN(numericPrice)
            ? `${priceNumber.toLocaleString()}원 ~`
            : h.lowestPrice || h.priceText || "가격 문의";

        // 🔹 체험 소요 시간(분) – 백엔드 필드 후보들
        const durationMinutes =
          h.durationMinutes ??
          h.durationMin ??
          h.experienceDuration ??
          h.estimatedDuration ??
          null;

        return {
          id: String(h.hostId ?? h.id ?? `host-${idx}`),
          category: h.category ?? null,
          name: h.hostName || h.name || "이름 없는 호스트",
          title: h.detailField || h.title || "",
          place: h.addressBase || h.place || "",
          detailFieldCode: h.detailField ?? null,
          lat,
          lng,
          distance: 0,
          price: priceText,
          priceNumber,
          durationMinutes,
          reviews: h.reviewCount ?? 0,
          logoUrl: h.profileImageUrl || null,
        };
      });

      console.log("[MapPage] mapped hosts:", mapped);
      setHosts(mapped);
    }

    fetchHosts();
  }, []);
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategoryEnums();
        // data: [{ code: "MASTER_ARTISAN", description: "장인" }, ...] 이런 형태라고 가정
        setCategoryOptions(data);
      } catch (e) {
        console.error("[MapPage] categories 로드 실패:", e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadFields() {
      const data = await fetchDetailFields(); // signal 인자 없어도 됨
      setFieldOptions(data);
    }
    loadFields();
  }, []);
  // 가격 슬라이더 드래그 계산
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

  // 🔹 /map 으로 들어올 때 focusLat/focusLng 가 있으면 해당 좌표로 이동
  useEffect(() => {
    if (!mapReady) return;
    if (focusLat == null || focusLng == null) return;
    if (!window.kakao || !window.kakao.maps) return;

    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map) return;

    const pos = new kakao.maps.LatLng(Number(focusLat), Number(focusLng));
    map.setLevel(3);
    map.panTo(pos);
  }, [mapReady, focusLat, focusLng]);

  // ---------- 특정 호스트로 포커스 (예약내역 → 길찾기) ----------
  useEffect(() => {
    if (!mapReady) return;
    if (!focusHostId) return;
    if (!window.kakao || !window.kakao.maps) return;

    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map) return;

    // host.id 는 String(hostId) 형태이므로 문자열로 비교
    const target = hosts.find((h) => String(h.id) === String(focusHostId));

    if (!target || target.lat == null || target.lng == null) {
      console.warn("focusHostId로 호스트를 찾지 못했습니다.", focusHostId);
      return;
    }

    const center = new kakao.maps.LatLng(
      Number(target.lat),
      Number(target.lng)
    );
    map.setLevel(3); // 조금 줌인해서 보여주기
    map.panTo(center);

    // 하단 카드 & 마커도 같이 선택 상태로
    setSelectedHostId(target.id);
    setSheetExpanded(true);
  }, [mapReady, hosts, focusHostId]);

  // 전역 마우스/터치 이벤트로 드래그 처리
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

  // 필터가 적용된 호스트 리스트
  const displayedHosts = useMemo(() => {
    let filtered = hosts;

    if (activeCategory) {
      filtered = filtered.filter(
        (h) => String(h.category) === String(activeCategory)
      );
    }

    // 검색어
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

    // 시간대 필터 (durationMinutes)
    if (selectedTimeSlot) {
      const slot = TIME_SLOTS.find((s) => s.key === selectedTimeSlot);
      if (slot) {
        filtered = filtered.filter((h) => {
          const d = h.durationMinutes;
          if (d == null) return true; // 정보 없으면 필터에서 제외하지 않음
          if (slot.maxMinutes == null) {
            return d >= slot.minMinutes;
          }
          return d >= slot.minMinutes && d < slot.maxMinutes;
        });
      }
    }

    // 전문분야 (title 기준)
    if (selectedField) {
      filtered = filtered.filter((h) => h.title === selectedField);
    }

    // 가격 필터
    filtered = filtered.filter(
      (h) => h.priceNumber >= priceRange[0] && h.priceNumber <= priceRange[1]
    );

    // 거리 계산
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
  }, [
    hosts,
    activeCategory,
    searchQuery,
    myLocation,
    selectedTimeSlot,
    selectedField,
    priceRange,
  ]);

  const totalCount = displayedHosts.length;

  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetHeightRef = useRef(null);

  useEffect(() => {
    if (showFilterSheet && sheetHeightRef.current) {
      // 높이 측정은 BottomSheet 내용이 완전히 렌더링된 후 비동기적으로 이루어져야 함
      const timer = setTimeout(() => {
        if (sheetHeightRef.current) {
          const newHeight = sheetHeightRef.current.offsetHeight;
          if (newHeight !== sheetHeight) {
            setSheetHeight(newHeight);
          }
        }
      }, 0); // 렌더링 후 바로 실행
      return () => clearTimeout(timer);
    }
  }, [showFilterSheet, activeFilterTab, sheetHeight]);

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

  useEffect(() => {
    async function initMap() {
      const { kakao } = window;
      if (!mapRef.current || !kakao || !kakao.maps) return;

      let centerLat = 35.825;
      let centerLng = 128.741;
      let usedMyLocation = false;

      if (focusLat != null && focusLng != null) {
        centerLat = focusLat;
        centerLng = focusLng;
      } else if (navigator.geolocation) {
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
            zIndex: 1,
          });
          maskPolygon.setMap(map);

          const borderPolygon = new kakao.maps.Polygon({
            path: [gyeongsanPath],
            strokeWeight: 2,
            strokeColor: "#ffffff",
            strokeOpacity: 0.9,
            fillColor: "transparent",
            fillOpacity: 0,
            zIndex: 2,
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

  // ---------- 호스트 마커 생성 ----------
  useEffect(() => {
    if (!mapReady || !window.kakao || !window.kakao.maps) return;
    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map) return;

    // 기존 오버레이 제거
    Object.values(hostOverlaysRef.current).forEach(({ overlay }) => {
      if (overlay) overlay.setMap(null);
    });
    hostOverlaysRef.current = {};

    console.log("[MapPage] 마커 생성, hosts length:", hosts.length);

    hosts.forEach((host) => {
      if (host.lat == null || host.lng == null) {
        console.warn("[MapPage] lat/lng 없음, 마커 스킵:", host);
        return;
      }

      const lat = Number(host.lat);
      const lng = Number(host.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        console.warn("[MapPage] lat/lng NaN, 마커 스킵:", host);
        return;
      }

      console.log("[MapPage] marker position:", lat, lng, host.name);

      const pos = new kakao.maps.LatLng(lat, lng);

      // ✅ host 마커 DOM
      const el = document.createElement("div");
      el.className = "host-marker";

      const logoSrc =
        host.logoUrl ||
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

      el.innerHTML = host.logoUrl
        ? `<img src="${logoSrc}" alt="${host.name}" />`
        : `<span style="font-size:26px;">😊</span>`;

      // 클릭 이벤트 (카드 선택)
      el.addEventListener("click", () => {
        setSelectedHostId((prev) => (prev === host.id ? null : host.id));
        setSheetExpanded(true);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: el,
        yAnchor: 1,
        zIndex: 1000,
        clickable: true,
      });

      overlay.setMap(map);

      hostOverlaysRef.current[host.id] = { overlay, el, host };
    });

    if (!selectedHostId && hosts.length > 0) {
      setSelectedHostId(hosts[0].id);
    }
  }, [hosts, mapReady]);

  // ---------- 선택된 호스트에 맞춰 지도 패닝 & 마커 강조 ----------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao) return;

    // 모든 마커 active 제거
    Object.values(hostOverlaysRef.current).forEach(({ el, overlay }) => {
      if (el) el.classList.remove("active");
      if (overlay) overlay.setZIndex(1000);
    });

    if (!selectedHostId) return;

    const item = hostOverlaysRef.current[selectedHostId];
    if (!item) return;

    if (item.el) item.el.classList.add("active");
    if (item.overlay) item.overlay.setZIndex(2000);

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

  // ---------- 카테고리/검색/필터에 따라 마커 숨기기/보이기 ----------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!displayedHosts.length) {
      Object.values(hostOverlaysRef.current).forEach(({ overlay }) => {
        if (overlay) overlay.setMap(map);
      });
      return;
    }

    const visibleIds = new Set(displayedHosts.map((h) => h.id));

    Object.entries(hostOverlaysRef.current).forEach(([id, { overlay }]) => {
      if (!overlay) return;
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
  }, [displayedHosts, selectedHostId, mapReady]);

  // ---------- 하단 카드 열려 있을 때 선택된 카드로 스크롤 ----------
  useEffect(() => {
    if (!sheetExpanded || !selectedHostId) return;
    const container = labelListRef.current;
    const item = labelItemRefs.current[selectedHostId];
    if (!container || !item) return;

    const targetScrollLeft =
      item.offsetLeft + item.offsetWidth / 2 - container.clientWidth / 2;

    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }, [selectedHostId, sheetExpanded]);

  // **********************************************
  // ⭐ 목록 보기 버튼 영역을 완전히 분리하여 BottomSheet 위에 고정 (이미지 구현) ⭐
  // **********************************************
  // 기존의 목록 확장/축소 기능은 showFilterSheet가 닫혔을 때만 동작하도록 유지합니다.
  // -----------------------------------------------------------------------

  // MapPage.jsx (추정)
  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative">
        {/* 지도 */}
        <div
          ref={mapRef}
          className="absolute inset-0"
          style={{ minHeight: "100dvh" }}
        />

        {/* 지도 위 UI (상단 검색창 포함) */}
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
                onClick={() => {
                  setActiveFilterTab("price");
                  setShowFilterSheet(true);
                }}
              >
                <TbAdjustmentsHorizontal size={25} />
              </button>
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categoryOptions.map((c) => {
                const isActive = activeCategory === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() =>
                      setActiveCategory((prev) =>
                        prev === c.code ? null : c.code
                      )
                    }
                    className={[
                      "shrink-0 px-4 py-1 rounded-full text-[13px] border bg-white",
                      isActive
                        ? "border-[#e64a45] text-[#e64a45] font-semibold"
                        : "border-neutral-300 text-neutral-700",
                    ].join(" ")}
                  >
                    {c.description}
                  </button>
                );
              })}
            </div>
          </header>

          <div className="flex-1" />
        </div>

        {/* ⭐ 목록 보기 버튼 (유동적인 위치 처리) ⭐ */}
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-[70]"
          style={{
            pointerEvents: "auto",
            // [핵심 수정] BottomSheet의 측정된 높이를 기반으로 위치 계산
            // 버튼의 중앙이 BottomSheet 상단 경계선에 오도록 계산 (-22px)
            bottom: showFilterSheet
              ? `${sheetHeight + 10}px` // ✅ sheetHeight에서 22px을 뺌 (버튼을 시트 상단 경계에 위치)
              : "80px",
            transition: "bottom 0.3s ease-out",
          }}
        >
          <div className="w-full flex flex-col items-center mb-1">
            {/* 필터 시트가 닫혔을 때만 모든 버튼 표시 */}
            {!showFilterSheet ? (
              <>
                {/* 화살표 버튼 */}
                <button
                  type="button"
                  onClick={() => setSheetExpanded((prev) => !prev)}
                  className="mb-1 text-black text-3xl leading-none"
                >
                  {sheetExpanded ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </button>

                <div className="relative w-full flex justify-center items-center">
                  {/* 목록 보기 버튼 (기존 크기) */}
                  <button
                    type="button"
                    className="mx-auto w-[150px] rounded-full bg-[#e64a45] text-white py-2.5
               text-[15px] font-semibold shadow-[0_6px_16px_rgba(230,74,69,0.4)]"
                    onClick={() => {
                      const q = activeCategory
                        ? `?category=${activeCategory}`
                        : "";
                      navigate(`/nearby${q}`);
                    }}
                  >
                    목록 보기
                  </button>

                  {/* 내 위치 버튼 */}
                  <button
                    type="button"
                    className="absolute right-11 w-11 h-11 rounded-full bg-white shadow 
              border border-neutral-200 flex items-center justify-center"
                    onClick={handleMoveToMyLocation}
                  >
                    <LuCrosshair className="text-neutral-700 text-xl" />
                  </button>
                </div>
              </>
            ) : (
              // 필터 시트가 열렸을 때: '목록 보기' 버튼만 중앙에 배치
              <div className="relative w-full flex justify-center items-center">
                <button
                  type="button"
                  className="mx-auto w-[200px] rounded-full bg-[#e64a45] text-white py-2.5
               text-[15px] font-semibold shadow-[0_6px_16px_rgba(230,74,69,0.4)]"
                  onClick={() => {
                    const q = activeCategory
                      ? `?category=${activeCategory}`
                      : "";
                    navigate(`/nearby${q}`);
                  }}
                >
                  목록 보기
                </button>
              </div>
            )}
          </div>

          {/* 목록 확장 (필터 시트가 닫혔을 때만 목록이 확장되도록 조건 추가) */}
          {!showFilterSheet && sheetExpanded && (
            <div
              ref={labelListRef}
              className="mt-2 flex gap-4 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory"
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
                      "min-w-[300px] max-w-[300px] rounded-2xl bg-white border text-left px-6 py-4 shadow-sm transition-all duration-150 snap-center",
                      selected
                        ? "border-[#000000] shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
                        : "border-neutral-200",
                    ].join(" ")}
                  >
                    <div className="flex flex-row items-baseline gap-2">
                      <span className="text-[22px] font-bold">{host.name}</span>
                      {host.detailFieldCode && (
                        <span className="text-[13px] text-neutral-500">
                          {fieldOptions.find(
                            (f) => f.code === host.detailFieldCode
                          )?.description || ""}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-row items-center text-[13px] text-neutral-500">
                      <BiSolidMessageDetail className="text-[14px] text-[#919191] mr-1" />
                      <span className="text-[#919191]">
                        후기 {host.reviews}
                      </span>
                    </div>

                    <div className="mt-0.5 flex flex-row items-center text-[13px] text-neutral-500">
                      <IoLocationSharp className="text-[14px] text-[#919191] mr-1" />
                      <span className="text-[#919191] mr-1">내 위치에서</span>
                      <span className="text-[#F13030]">{host.distance}m</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[14px]">
                      <div className="flex items-center">
                        <span className="text-[#CD2F2F] font-semibold mr-1">
                          1인
                        </span>
                        <span className="text-[3A3A3A] font-bold">
                          {host.price}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/host/${host.id}`)}
                        className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-[13px]"
                      >
                        만나러 가기
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =============================== */}
        {/* 필터 BottomSheet 전체 코드 (z-index 유지) */}
        {/* =============================== */}

        {/* 필터 BottomSheet */}
        {showFilterSheet && (
          <>
            {/* Dimmed */}
            <div
              className="fixed inset-0 bg-black/40 z-[60]" // z-[60]
              onClick={() => setShowFilterSheet(false)}
            />

            {/* BottomSheet 전체 */}
            <div className="fixed inset-x-0 bottom-0 z-[61] flex justify-center">
              {" "}
              {/* z-[61] */}
              <div
                // [핵심 수정] BottomSheet 요소에 ref 연결 및 상단/하단 패딩 조정
                ref={sheetHeightRef}
                // pt-5 pb-6을 pt-3 pb-6으로 조정하여 탭과 버튼 간격을 좁힘
                className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-[0_-4px_16px_rgba(0,0,0,0.25)] pt-3 pb-6" // ✅ pt-5 -> pt-3
              >
                {/* ------------------ 탭 영역 ------------------ */}
                <div className="flex justify-between items-center px-6 mb-3">
                  {" "}
                  {/* ✅ mb-5 -> mb-3 */}
                  <div className="flex justify-center items-center gap-6 text-[16px] font-semibold">
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
                    className="text-2xl text-neutral-400"
                    onClick={() => setShowFilterSheet(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* ------------------ 탭 콘텐츠 ------------------ */}
                <div className="px-6 pb-4">
                  {/* ============= 가격 탭 ============= */}
                  {activeFilterTab === "price" && (
                    <>
                      <div className="flex justify-between font-semibold text-[#3A3A3A] text-[14px] mb-4">
                        <span>{formatPriceLabel(priceRange[0])}</span>
                        <span>{formatPriceLabel(priceRange[1], true)}</span>
                      </div>

                      {/* 슬라이더 */}
                      <div
                        ref={trackRef}
                        className="relative h-10 cursor-pointer mt-2"
                        onMouseDown={(e) => {
                          const rect = trackRef.current.getBoundingClientRect();
                          const mid =
                            ((priceRange[0] + priceRange[1]) / 2 - MIN_PRICE) /
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
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-[3px] border-black"
                          style={{ left: `${minPercent}%` }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingHandle("min");
                            updatePriceByClientX("min", e.clientX);
                          }}
                        />

                        {/* 최대 핸들 */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-[3px] border-black"
                          style={{ left: `${maxPercent}%` }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingHandle("max");
                            updatePriceByClientX("max", e.clientX);
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* ============= 시간대 탭 ============= */}
                  {activeFilterTab === "time" && (
                    <div className="flex flex-wrap gap-3 text-[15px]">
                      {TIME_SLOTS.map((slot) => {
                        const isActive = selectedTimeSlot === slot.key;
                        return (
                          <button
                            key={slot.key}
                            className={`px-3 py-1.5 rounded-full transition-all
                  ${
                    isActive
                      ? "bg-white border border-[#2D7DF6] text-[#2D7DF6] font-semibold shadow"
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

                  {/* ============= 카테고리 탭 ============= */}
                  {activeFilterTab === "category" && (
                    <div className="flex flex-wrap gap-3 text-[15px]">
                      {[
                        { key: "artisan", label: "장인" },
                        { key: "youth", label: "청년사업가" },
                        { key: "alley", label: "골목상인" },
                        { key: "artist", label: "예술가" },
                      ].map((c) => (
                        <button
                          key={c.key}
                          className={`px-3 py-1.5 rounded-full border ${
                            activeCategory === c.key
                              ? "bg-white border border-[#2D7DF6] text-[#2D7DF6] font-semibold shadow"
                              : "bg-[#F5F5F7] text-[#222222] border border-transparent"
                          }`}
                          onClick={() =>
                            setActiveCategory((prev) =>
                              prev === c.key ? null : c.key
                            )
                          }
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ============= 전문분야 탭 ============= */}
                  {activeFilterTab === "field" && (
                    <div className="flex flex-wrap gap-3 text-[15px]">
                      {[
                        "공예·창작",
                        "음식·디저트",
                        "플라워·가드닝",
                        "문화·전통 체험",
                        "음악·예술",
                        "라이프·힐링",
                        "지역탐방·체험투어",
                        "사진·콘텐츠",
                      ].map((f) => (
                        <button
                          key={f}
                          className={`px-3 py-1.5 rounded-full border ${
                            selectedField === f
                              ? "bg-white border border-[#2D7DF6] text-[#2D7DF6] font-semibold shadow"
                              : "bg-[#F5F5F7] text-[#222222] border border-transparent"
                          }`}
                          onClick={() =>
                            setSelectedField((prev) => (prev === f ? null : f))
                          }
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ------------------ 하단 버튼 ------------------ */}
                <div className="flex gap-3 px-6 mt-2">
                  <button
                    className="w-[70px] h-12 text-[#C9C9C9] rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[20px]"
                    onClick={() => {
                      setPriceRange([MIN_PRICE, MAX_PRICE]);
                      setSelectedTimeSlot(null);
                      setActiveCategory(null);
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
          </>
        )}

        <BottomTab />
      </div>
    </div>
  );
}
