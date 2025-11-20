import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { RiHome5Line } from "react-icons/ri";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import fakeProfile from "../../assets/fakeProfile.svg";
import programImg1 from "../../assets/programImg1.png";
import programIcon1 from "../../assets/programIcon1.png";
import { fetchHostDetail, fetchHostProgramsByHost } from "../../apis/host";
import { toggleHostLikes } from "../../apis/likes";
import BottomTab from "../../components/BottomTab";
import HostProgramCard from "../../components/host/HostProgramCard";

const toHM = (time) => (typeof time === "string" ? time.slice(0, 5) : time);
const formatDuration = (hours) => {
  if (hours == null) return null;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);

  return parts.join(" ") || null;
};

export default function HostDetailPage() {
  const { hostId } = useParams();
  const navigate = useNavigate();

  const [host, setHost] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [hostData, programList] = await Promise.all([
          fetchHostDetail(hostId),
          fetchHostProgramsByHost(hostId),
        ]);

        setHost(hostData);
        setPrograms(programList || []);

        if (hostData && typeof hostData.isLiked !== "undefined") {
          setLiked(!!hostData.isLiked);
        }
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [hostId]);

  const handleToggleLike = async () => {
    if (!hostId) return;
    const next = !liked;
    setLiked(next);

    try {
      await toggleHostLikes(hostId);
    } catch (e) {
      console.error(e);
      setLiked(!next);
      alert("호스트 좋아요 처리 중 오류가 발생했어요.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-sm text-gray-500">
          호스트 정보를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-sm text-red-500">
          호스트 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const {
    name,
    profileImageUrl,
    description,
    detailedDescription,
    businessName,
    addressBase,
    addressDetail,
    contactStartTime,
    contactEndTime,
    cancellationPolicy,
    reviewCount,
    averageRating,
    companyLogoUrl,
    businessPhoneNumber,
    businessEmail,
    kakaoAddress,
  } = host;

  const profileSrc = profileImageUrl || fakeProfile;
  const hasReview = reviewCount > 0;
  const displayBusinessName = businessName || name;

  const contactStartHM = contactStartTime ? toHM(contactStartTime) : null;
  const contactEndHM = contactEndTime ? toHM(contactEndTime) : null;

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] bg-white pb-[72px]">
        {/* 상단 이미지 영역 (배경) */}
        <div className="relative h-[210px] w-full">
          <div className="absolute inset-0">
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt="호스트 배경 이미지"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#2B2B2B]" />
            )}
          </div>

          {/* 어두운 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />

          {/* 헤더 */}
          <header className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 pt-3">
            <div className="flex items-center">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70"
              >
                <IoChevronBack size={22} />
              </button>
              <button
                type="button"
                aria-label="홈"
                onClick={() => navigate("/main")}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70"
              >
                <RiHome5Line size={22} />
              </button>
            </div>

            {/* 호스트 좋아요 */}
            <button
              type="button"
              aria-label="호스트 좋아요"
              onClick={handleToggleLike}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80"
            >
              {liked ? (
                <FaHeart size={20} className="text-[#FF4B4B]" />
              ) : (
                <FaRegHeart size={20} className="text-white" />
              )}
            </button>
          </header>

          {/* 프로필 아바타 */}
          <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-white">
              <img
                src={profileSrc}
                alt={`${name} 프로필 이미지`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 내용 영역 */}
        <main className="px-5 pt-12 pb-6">
          {/* 이름 + 한줄소개 */}
          <section className="text-center mb-2">
            <h1 className="text-[24px] font-bold text-[#3A3A3A] mb-1.5">
              {name}
            </h1>
            {description && (
              <p className="text-[13px] text-[#A0A0A0] font-medium leading-snug">
                {description}
              </p>
            )}
          </section>

          {/* 평점 / 후기 수 */}
          <section className="flex items-center justify-center gap-2 mb-6 border-b pb-5">
            <div className="flex items-center gap-1">
              <AiFillStar className="text-[#F13030]" size={16} />
              <span className="text-[14px] font-medium text-[#3A3A3A]">
                {hasReview ? averageRating.toFixed(2) : "0.00"}
              </span>
            </div>
            <span className="text-[14px] font-medium text-[#3A3A3A]">
              ·&nbsp;&nbsp;후기 {reviewCount}개&nbsp;&nbsp; · &nbsp;&nbsp;경북
              경산시
            </span>
          </section>

          {/* 호스트의 전체 프로그램 */}
          <section className="mb-8">
            <div className="flex items-center mb-5">
              <h2 className="text-[20px] font-bold text-[#3A3A3A]">
                {name}님의 전체 프로그램
              </h2>
              <button
                type="button"
                className="text-[#3A3A3A] ml-2"
                onClick={() => navigate(`/host/${hostId}/programs`)}
              >
                <IoChevronForward size={22} />
              </button>
            </div>

            {/* 카드 리스트 (최대 2개 미리보기) */}
            {programs.length === 0 ? (
              <p className="text-[13px] text-[#A0A0A0]">
                아직 등록된 프로그램이 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {programs.slice(0, 2).map((p) => (
                  <HostProgramCard
                    key={p.experienceId}
                    experienceId={p.experienceId}
                    mainImageUrl={p.mainImageUrl}
                    title={p.title}
                    price={p.price}
                    durationInHours={formatDuration(p.durationInHours)}
                    rating={p.rating}
                    isLiked={p.isLiked}
                    onClick={() => navigate(`/experiences/${p.experienceId}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 프로그램 엿보기 배너 */}
          <section className="mb-4 -mx-5">
            <div className="relative w-full h-[228px] overflow-hidden">
              <img
                src={programImg1}
                alt="프로그램 엿보기"
                className="w-full h-full object-cover"
              />
              {/* 어두운 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* 왼쪽 아래 텍스트 */}
              <div className="absolute left-5 bottom-3">
                <p className="text-white text-[21px] font-bold">
                  프로그램 엿보기
                </p>
              </div>

              {/* 오른쪽 아래 아이콘 */}
              <div className="absolute right-4 bottom-4">
                <button
                  type="button"
                  onClick={() => navigate(`/host/${hostId}/photos`)}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <img src={programIcon1} alt="프로그램 아이콘" />
                </button>
              </div>
            </div>
          </section>

          {/* 자기소개 섹션 */}
          <section className="pt-2">
            <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-6">
              자기소개
            </h2>

            {/* 로고 + 회사 이름 */}
            <div className="flex flex-col items-center mb-3">
              {companyLogoUrl && (
                <div className="w-full h-[96px] flex items-center justify-center overflow-hidden mb-4 bg-white">
                  <img
                    src={companyLogoUrl}
                    alt={`${displayBusinessName} 로고`}
                    className="w-full h-[140px] object-contain"
                  />
                </div>
              )}
              <p className="text-[24px] font-bold text-[#3A3A3A]">
                {displayBusinessName}
              </p>
            </div>

            {/* 상세 설명 */}
            {detailedDescription && (
              <p className="text-[13px] leading-relaxed text-[#6D6D6D] border-b pb-6">
                {detailedDescription}
              </p>
            )}
          </section>

          {/* 알아두어야 할 사항 */}
          <section className="pt-5 mt-2">
            <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-4">
              알아두어야 할 사항
            </h2>

            <div className="text-[16px] font-medium text-[#555558] space-y-2">
              {cancellationPolicy && (
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-[#555558]">취소 정책</span>
                  <span>{cancellationPolicy}</span>
                </div>
              )}

              {(contactStartHM || contactEndHM) && (
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-[#555558]">문의시간</span>
                  <span>
                    {contactStartHM && contactEndHM
                      ? `${contactStartHM} ~ ${contactEndHM}`
                      : contactStartHM || contactEndHM}
                  </span>
                </div>
              )}

              {businessPhoneNumber && (
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-[#555558]">전화번호</span>
                  <span>{businessPhoneNumber}</span>
                </div>
              )}

              {kakaoAddress && (
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-[#555558]">카카오 채널</span>
                  <span className="break-all">{kakaoAddress}</span>
                </div>
              )}

              {businessEmail && (
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-[#555558]">이메일</span>
                  <span className="break-all">{businessEmail}</span>
                </div>
              )}
            </div>
          </section>
        </main>

        <BottomTab />
      </div>
    </div>
  );
}
