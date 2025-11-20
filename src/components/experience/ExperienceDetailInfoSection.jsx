// src/components/experience/ExperienceDetailInfoSection.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
import ExperienceReviewSection from "./ExperienceReviewSection";
import { getHostMap } from "../../apis/map";

function formatContactTime(start, end) {
  if (!start || !end) return null;
  const toHM = (t) => (typeof t === "string" ? t.slice(0, 5) : t);
  return `${toHM(start)} ~ ${toHM(end)}`;
}

export default function ExperienceDetailInfoSection({
  location,
  phoneNumber,
  experienceId,
  totalReviewCount,
  caution,
  contactStartTime,
  contactEndTime,
  businessEmail,
  kakaoAddress,

  // 🔹 지도/길찾기용
  hostId,
  latitude,
  longitude,
}) {
  const contactTimeText = formatContactTime(contactStartTime, contactEndTime);
  const mapRef = useRef(null);
  const markerOverlayRef = useRef(null);
  const navigate = useNavigate();

  // 실제 사용할 좌표 상태 (props 우선)
  const [coords, setCoords] = useState(() => ({
    lat: latitude != null ? Number(latitude) : null,
    lng: longitude != null ? Number(longitude) : null,
  }));

  // props 변경 시 동기화
  useEffect(() => {
    setCoords({
      lat: latitude != null ? Number(latitude) : null,
      lng: longitude != null ? Number(longitude) : null,
    });
  }, [latitude, longitude]);

  // hostId 있고 좌표 없으면 getHostMap으로 좌표 보충
  useEffect(() => {
    if (!hostId) return;
    if (coords.lat != null && coords.lng != null) return;

    let mounted = true;

    (async () => {
      try {
        const res = await getHostMap();
        if (!mounted) return;
        if (!res?.success || !Array.isArray(res.data)) return;

        const found = res.data.find((h) => String(h.hostId) === String(hostId));
        if (!found) return;

        const latRaw = found.latitude ?? found.lat;
        const lngRaw = found.longitude ?? found.lng;
        if (latRaw == null || lngRaw == null) return;

        setCoords({
          lat: Number(latRaw),
          lng: Number(lngRaw),
        });
      } catch (e) {
        console.error("getHostMap 으로 호스트 위치 가져오는 중 오류:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [hostId, coords.lat, coords.lng]);

  // ✅ 카카오맵 + host-marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (coords.lat == null || coords.lng == null) return;

    const drawMap = () => {
      const { kakao } = window;
      if (!kakao || !kakao.maps) return;

      const center = new kakao.maps.LatLng(coords.lat, coords.lng);

      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 3,
      });

      // 기존 오버레이 제거
      if (markerOverlayRef.current) {
        markerOverlayRef.current.setMap(null);
        markerOverlayRef.current = null;
      }

      // host-marker DOM 생성 (index.css 의 .host-marker 사용)
      const el = document.createElement("div");
      el.className = "host-marker";
      el.innerHTML = `<span style="font-size:26px;">😊</span>`;

      const overlay = new kakao.maps.CustomOverlay({
        position: center,
        content: el,
        yAnchor: 1,
        zIndex: 1000,
        clickable: true,
      });

      overlay.setMap(map);
      markerOverlayRef.current = overlay;
    };

    if (window.kakao && window.kakao.maps) {
      if (window.kakao.maps.load) {
        window.kakao.maps.load(drawMap);
      } else {
        drawMap();
      }
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAO_JS_KEY
      }&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(drawMap);
      };
      document.head.appendChild(script);
    }

    return () => {
      if (markerOverlayRef.current) {
        markerOverlayRef.current.setMap(null);
        markerOverlayRef.current = null;
      }
    };
  }, [coords.lat, coords.lng]);

  // ✅ 길찾기 버튼: /map 으로 좌표 전달
  const handleDirections = () => {
    if (coords.lat == null || coords.lng == null) {
      alert("위치 정보를 찾을 수 없어요.");
      return;
    }

    navigate("/map", {
      state: {
        focusLat: coords.lat,
        focusLng: coords.lng,
        focusHostId: hostId ?? null,
      },
    });
  };

  return (
    <div className="pb-10 space-y-8">
      {/* 장소 */}
      <section className="pt-6">
        <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">장소</h2>

        {/* 지도 영역 */}
        <div className="w-full h-[170px] rounded-[10px] bg-[#F5F5F5] mb-5 overflow-hidden">
          {coords.lat != null && coords.lng != null ? (
            <div ref={mapRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[12px] text-[#B0B0B0]">
                위치 정보가 없습니다.
              </span>
            </div>
          )}
        </div>

        {/* 주소 */}
        <div className="flex items-center gap-2 mb-2">
          <MdLocationOn className="w-[16px] h-[16px] text-[#C9C9C9]" />
          <span className="text-[15px] font-semibold text-[#555558]">
            {location || "주소 정보가 없습니다."}
          </span>
        </div>

        {/* 연락처 */}
        <div className="flex items-center gap-2 mb-4">
          <IoIosCall className="w-[16px] h-[16px] text-[#C9C9C9]" />
          <span className="text-[15px] font-semibold text-[#555558]">
            {phoneNumber || "연락처 정보가 없습니다."}
          </span>
        </div>

        {/* 길찾기 버튼 */}
        <button
          type="button"
          onClick={handleDirections}
          className="w-full h-[35px] mt-1 rounded-[5px] border border-[#E9E9EC] text-[14px] font-medium text-[#3A3A3A]"
        >
          길찾기
        </button>
      </section>

      {/* 리뷰 섹션 */}
      <ExperienceReviewSection
        experienceId={experienceId}
        totalReviewCount={totalReviewCount}
      />

      {/* 유의사항 섹션 */}
      <section className="pt-6 border-t">
        <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">
          예약 시 꼭 확인해 주세요!
        </h2>

        <p className="text-[16px] font-medium text-[#555558] mb-1">
          프로그램 유의사항
        </p>
        <p className="text-[16px] leading-[1.6] text-[#555558] whitespace-pre-line mb-4">
          {caution
            ? caution
            : "호스트가 제공하는 유의사항을 예약 전·후에 한 번 더 확인해 주세요."}
        </p>

        {/* 문의시간 / 연락처 정보 */}
        <div className="mt-2 space-y-1.5 text-[15px] text-[#555558]">
          {contactTimeText && (
            <div className="flex gap-3">
              <span className="w-[70px] text-[#A0A0A0]">문의시간</span>
              <span className="flex-1">{contactTimeText}</span>
            </div>
          )}
          {phoneNumber && (
            <div className="flex gap-3">
              <span className="w-[70px] text-[#A0A0A0]">전화번호</span>
              <span className="flex-1">{phoneNumber}</span>
            </div>
          )}
          {kakaoAddress && (
            <div className="flex gap-3">
              <span className="w-[70px] text-[#A0A0A0]">카카오 채널</span>
              <span className="flex-1 break-all">{kakaoAddress}</span>
            </div>
          )}
          {businessEmail && (
            <div className="flex gap-3">
              <span className="w-[70px] text-[#A0A0A0]">이메일</span>
              <span className="flex-1">{businessEmail}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
