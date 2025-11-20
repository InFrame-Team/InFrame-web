import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
import ExperienceReviewSection from "./ExperienceReviewSection";

function formatContactTime(start, end) {
  if (!start || !end) return null;

  const toHM = (t) => (typeof t === "string" ? t.slice(0, 5) : t);
  return `${toHM(start)} ~ ${toHM(end)}`;
}

export default function ExperienceDetailInfoSection({
  location, // 주소 문자열
  phoneNumber,
  experienceId,
  totalReviewCount,
  caution,
  contactStartTime,
  contactEndTime,
  businessEmail,
  kakaoAddress,

  // ✅ 새로 추가: 위도/경도
  latitude,
  longitude,
}) {
  const contactTimeText = formatContactTime(contactStartTime, contactEndTime);
  const mapRef = useRef(null);
  const markerOverlayRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 카카오맵 + host-marker 마커 렌더링
  useEffect(() => {
    if (!mapRef.current) return;
    if (latitude == null || longitude == null) return;

    const drawMap = () => {
      const { kakao } = window;
      if (!kakao || !kakao.maps) return;

      const center = new kakao.maps.LatLng(Number(latitude), Number(longitude));

      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 3,
      });

      // 기존 오버레이 제거
      if (markerOverlayRef.current) {
        markerOverlayRef.current.setMap(null);
        markerOverlayRef.current = null;
      }

      // ✅ host-marker DOM 생성 (index.css 스타일 사용)
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

    // 스크립트 로드 여부에 따라 처리
    if (window.kakao && window.kakao.maps) {
      if (window.kakao.maps.load) {
        window.kakao.maps.load(drawMap);
      } else {
        drawMap();
      }
    } else {
      // 아직 카카오 스크립트 안 불러왔으면 동적으로 로드
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
  }, [latitude, longitude]);

  // 🔹 길찾기 버튼 → /map 으로 이동 + 위도/경도 전달
  const handleDirections = () => {
    if (latitude == null || longitude == null) {
      alert("위치 정보를 찾을 수 없어요.");
      return;
    }

    navigate("/map", {
      state: {
        focusLat: Number(latitude),
        focusLng: Number(longitude),
      },
    });
  };

  return (
    <div className="pb-10 space-y-8">
      {/* 장소 */}
      <section className="pt-6">
        <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">장소</h2>

        {/* ✅ 지도 영역: 카카오맵 + host-marker */}
        <div className="w-full h-[170px] rounded-[10px] bg-[#F5F5F5] mb-5 overflow-hidden">
          {latitude != null && longitude != null ? (
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

        {/* ✅ 길찾기 버튼 */}
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
