import React, { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import fakeProfile from "../../assets/fakeProfile.svg";
import fakeImg from "../../assets/fakeImg.svg";
import { fetchLikedHosts } from "../../apis/likes";

const TABS = {
  HOST: "HOST",
  PRODUCT: "PRODUCT",
};

// 상품 쪽은 아직 API 미정이라 mock 유지
const mockProducts = [
  {
    id: 1,
    title: "한 입의 예술, 핸드메이드 초콜릿 클래스",
    price: 50000,
    mainImageUrl: fakeImg,
    hostName: "정민호 호스트",
    rating: 4.88,
  },
  {
    id: 2,
    title: "입문자를 위한 도자기 핸드 빌딩",
    price: 35000,
    mainImageUrl: fakeImg,
    hostName: "이서윤 호스트",
    rating: 4.36,
  },
  {
    id: 3,
    title: "나의 첫 브랜드 워크숍",
    price: 30000,
    mainImageUrl: fakeImg,
    hostName: "김다연 호스트",
    rating: 4.72,
  },
  {
    id: 4,
    title: "향기로 그리는 드로잉 캔들 클래스",
    price: 40000,
    mainImageUrl: fakeImg,
    hostName: "윤소희 호스트",
    rating: 4.55,
  },
];

// ---- 카드 컴포넌트들 ----
function SavedHostCard({ host }) {
  const [liked, setLiked] = useState(true);

  const {
    hostName,
    profileImageUrl,
    experienceImageUrls,
    averageRating,
    reviewCount,
  } = host;

  const thumbnail =
    (experienceImageUrls && experienceImageUrls[0]) ||
    profileImageUrl ||
    fakeProfile;

  return (
    <div
      role="button"
      className="w-full flex items-center justify-between gap-3 py-5 border-b border-[#F0F0F0]"
    >
      {/* 왼쪽 텍스트 영역 */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[21px] font-bold text-[#3A3A3A] mb-1.5">
          {hostName}
        </p>
        {/* 소개 문구 필드가 생기면 여기에 매핑 */}
        {/* <p className="text-[12px] text-[#3A3A3A] mb-4 line-clamp-2">
          {intro}
        </p> */}
        <div className="flex items-center gap-1 mt-2">
          <AiFillStar className="w-[16px] h-[16px] text-[#F13030]" />
          <span className="text-[14px] font-medium text-[#3A3A3A]">
            {averageRating?.toFixed(1)}
          </span>
          <span className="text-[14px] font-medium text-[#3A3A3A] ml-1.5">
            후기 {reviewCount?.toLocaleString()}개
          </span>
        </div>
      </div>

      {/* 오른쪽 이미지 영역 */}
      <div className="relative w-[88px] h-[88px] rounded-[5px] overflow-hidden flex-shrink-0">
        <img
          src={thumbnail}
          alt={hostName}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          className="absolute top-1.5 right-1.5"
          onClick={(e) => {
            e.stopPropagation();
            setLiked((prev) => !prev);
          }}
        >
          {liked ? (
            <FaHeart className="w-5 h-5 text-[#F13030]" />
          ) : (
            <FaRegHeart className="w-5 h-5 text-white drop-shadow" />
          )}
        </button>
      </div>
    </div>
  );
}

function SavedProductCard({ product }) {
  const [liked, setLiked] = useState(true);

  return (
    <div role="button" className="w-full text-left">
      <div className="relative w-full rounded-[8px] overflow-hidden mb-3">
        <img
          src={product.mainImageUrl || fakeImg}
          alt={product.title}
          className="w-full h-[160px] object-cover"
        />
        <button
          type="button"
          className="absolute top-2 right-2"
          onClick={(e) => {
            e.stopPropagation();
            setLiked((prev) => !prev);
          }}
        >
          {liked ? (
            <FaHeart className="w-5 h-5 text-[#F13030]" />
          ) : (
            <FaRegHeart className="w-5 h-5 text-white drop-shadow" />
          )}
        </button>
      </div>

      <p className="text-[16px] font-bold text-[#3A3A3A] mb-0.5">
        {product.price.toLocaleString()}원
      </p>
      <p className="text-[14px] font-medium text-[#6D6D6D] line-clamp-1 mb-1">
        {product.title}
      </p>
      <div className="flex justify-between">
        <p className="text-[12px] font-medium text-[#A0A0A0] mb-0.5">
          {product.hostName}
        </p>
        <div className="flex items-center gap-0.5">
          <AiFillStar className="text-[#A0A0A0] w-[10px] h-[10px]" />
          <span className="text-[10px] font-medium text-[#A0A0A0] mt-0.5">
            {product.rating}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- 메인 페이지 ----
export default function SavedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.HOST);

  const [hostList, setHostList] = useState([]);
  const [hostsLoading, setHostsLoading] = useState(false);
  const [hostsError, setHostsError] = useState(null);

  useEffect(() => {
    const loadHosts = async () => {
      try {
        setHostsLoading(true);
        setHostsError(null);
        const data = await fetchLikedHosts();
        setHostList(data);
      } catch (error) {
        console.error(error);
        setHostsError("저장한 호스트를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setHostsLoading(false);
      }
    };

    loadHosts();
  }, []);

  const totalCount =
    activeTab === TABS.HOST ? hostList.length : mockProducts.length;
  const unitLabel = activeTab === TABS.HOST ? "명" : "개";

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 헤더 */}
        <header className="relative h-[56px] flex items-center justify-center">
          <button
            type="button"
            className="absolute left-4"
            onClick={() => navigate(-1)}
          >
            <IoChevronBack className="w-5 h-5 text-[#222]" />
          </button>
          <h1 className="text-[15px] font-semibold text-[#3A3A3A]">저장</h1>
        </header>

        {/* 탭 영역 */}
        <div className="border-b border-[#F3F3F3]">
          <div className="flex h-[44px]">
            <button
              type="button"
              onClick={() => setActiveTab(TABS.HOST)}
              className={`flex-1 flex items-center justify-center text-[15px] ${
                activeTab === TABS.HOST
                  ? "font-bold text-[#222] border-b-2 border-[#3A3A3A]"
                  : "text-[#C5C5C7] font-medium"
              }`}
            >
              호스트
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(TABS.PRODUCT)}
              className={`flex-1 flex items-center justify-center text-[15px] ${
                activeTab === TABS.PRODUCT
                  ? "font-semibold text-[#222] border-b-[2px] border-[#222]"
                  : "text-[#A0A0A0]"
              }`}
            >
              상품
            </button>
          </div>
        </div>

        {/* 개수 */}
        <div className="px-4 pt-7 pb-1">
          <p className="text-[14px] font-medium text-[#3A3A3A]">
            총 <span className="font-bold">{totalCount}</span>
            {unitLabel}
          </p>
        </div>

        {/* 리스트 영역 */}
        <main className="px-4 pb-24">
          {activeTab === TABS.HOST ? (
            <>
              {hostsLoading && (
                <p className="text-[13px] text-[#A0A0A0] py-4">
                  저장한 호스트를 불러오는 중입니다...
                </p>
              )}
              {hostsError && (
                <p className="text-[13px] text-[#F13030] py-4">{hostsError}</p>
              )}
              {!hostsLoading && !hostsError && hostList.length === 0 && (
                <p className="text-[13px] text-[#A0A0A0] py-4">
                  아직 저장한 호스트가 없습니다.
                </p>
              )}
              {!hostsLoading &&
                !hostsError &&
                hostList.map((host) => (
                  <SavedHostCard key={host.hostId} host={host} />
                ))}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8">
              {mockProducts.map((product) => (
                <SavedProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
