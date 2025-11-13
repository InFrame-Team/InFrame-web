import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { MdArrowForwardIos } from "react-icons/md";
import { LuCrosshair } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { MdArrowBackIos } from "react-icons/md";

export default function HostLocationPicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [step, setStep] = useState("search");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState(null);

  const runSearch = () => {
    const q = keyword.trim();
    if (!q) return;

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      alert("지도 검색 서비스를 불러오지 못했습니다.");
      return;
    }

    setSearching(true);
    const places = new window.kakao.maps.services.Places();

    places.keywordSearch(q, (data, status) => {
      setSearching(false);
      if (status !== window.kakao.maps.services.Status.OK) {
        setResults([]);
        alert("검색 결과가 없습니다.");
        return;
      }

      const list = data.map((item) => ({
        id: item.id,
        name: item.place_name,
        roadAddress: item.road_address_name || "",
        jibunAddress: item.address_name || "",
        lat: parseFloat(item.y),
        lng: parseFloat(item.x),
      }));

      setResults(list);
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("현재 위치를 사용할 수 없습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(lng, lat, (result, status) => {
            let addr = "";
            let detail = "";
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const r = result[0];
              addr =
                r.road_address?.address_name || r.address?.address_name || "";
              detail = r.address?.region_3depth_name || "";
            }

            setSelected({ address: addr, detail, lat, lng });
            setStep("map");
          });
        } else {
          setSelected({
            address: "현재 위치",
            detail: "",
            lat,
            lng,
          });
          setStep("map");
        }
      },
      () => {
        alert("현재 위치를 가져오지 못했어요.");
      }
    );
  };

  const handleSelectResult = (item) => {
    const addr = item.roadAddress || item.jibunAddress || item.name;
    setSelected({
      address: addr,
      detail: item.jibunAddress,
      lat: item.lat,
      lng: item.lng,
    });
    setStep("map");
  };

  useEffect(() => {
    if (step !== "map" || !selected) return;
    if (!window.kakao || !window.kakao.maps) return;

    const container = document.getElementById("host-location-map");
    if (!container) return;

    const center = new window.kakao.maps.LatLng(selected.lat, selected.lng);
    const map = new window.kakao.maps.Map(container, {
      center,
      level: 3,
    });

    const marker = new window.kakao.maps.Marker({ position: center });
    marker.setMap(map);
  }, [step, selected]);

  const handleConfirm = () => {
    if (!selected) return;

    navigate("/host/profile-settings", {
      replace: true,
      state: {
        ...prevState,
        addressBase: selected.address,
        latitude: selected.lat,
        longitude: selected.lng,
      },
    });
  };

  if (step === "search") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <img
              src="/inframe-logo.png"
              alt="in경산 로고"
              className="h-8 object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[18px] text-[#3A3A3A]"
          >
            ✕
          </button>
        </header>

        {/* 본문 */}
        <main className="px-5 pt-6 pb-4 flex-1 overflow-y-auto">
          {/* 타이틀 */}
          <h1 className="text-[26px] font-bold leading-snug mt-5">
            호스트님의 위치를
            <br />
            설정해주세요
          </h1>

          {/* 검색 바 */}
          <div className="mt-8">
            <div className="flex items-center bg-white border-2 border-[#D4D4D4] rounded-lg px-4 py-3">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="지번, 도로명, 건물명으로 검색"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#D4D4D4]"
              />
              <button
                type="button"
                onClick={runSearch}
                className="ml-2 text-[18px] text-[#D4D4D4] hover:text-[#b4b4b4]"
              >
                <MdArrowForwardIos />
              </button>
            </div>
          </div>

          {/* 현재 위치로 설정 */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-[14px] text-[#3A3A3A] hover:text-[#1f1f1f] transition-colors duration-200"
          >
            <span className="w-4 h-4 rounded-full flex items-center justify-center">
              <LuCrosshair />
            </span>
            <span>현재 위치로 설정</span>
          </button>

          <div className="h-[9px] w-full bg-[#EFEFEF] my-2" />

          {/* 검색 결과 리스트 */}
          <div className="mt-1">
            {searching && (
              <p className="text-[13px] text-neutral-400">검색 중...</p>
            )}

            <div className="divide-y divide-neutral-100">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left py-4"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 text-[20px] text-[#3A3A3A]">
                      <IoLocationOutline />
                    </span>
                    <div>
                      <p className="text-[16px] font-bold text-neutral-900">
                        {item.roadAddress || item.jibunAddress || item.name}
                      </p>
                      <p className="text-[14px] text-[#3A3A3A] mt-0.5">
                        {item.jibunAddress}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {!searching && results.length === 0 && (
                <p className="text-[12px] text-neutral-400 mt-3">
                  주소를 검색하거나 현재 위치를 설정해 주세요.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===================================================================
  // 2. 지도 + 이 위치로 등록 화면
  // ===================================================================
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 바 */}
      <header className="relative px-4 pt-6 pb-3 flex items-center justify-center border-b border-neutral-100">
        {/* 왼쪽 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={() => setStep("search")}
          className="absolute left-4 text-xl text-neutral-700"
        >
          <MdArrowBackIos />
        </button>

        {/* 중앙 타이틀 */}
        <span className="text-[15px] font-semibold">위치 설정</span>
      </header>

      <main className="flex-1 flex flex-col bg-neutral-100">
        <div id="host-location-map" className="w-full flex-1" />

        {selected && (
          <div className="bg-white pt-8 pb-10 px-4 border-t border-neutral-200">
            <p className="text-[18px] font-bold text-[#3A3A3A] mb-1">
              {selected.address}
            </p>
            {selected.detail && (
              <p className="text-[16px] text-[#3A3A3A] mb-4">
                {selected.detail}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full h-11 rounded-lg bg-[#e64a45] text-white text-[14px] font-semibold"
            >
              이 위치로 등록
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
