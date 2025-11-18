import React, { useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import fakeProfile2 from "../../assets/fakeProfile2.png";
import { fetchMyReservations } from "../../apis/reservations";

function formatDateTimeKorean(isoString) {
  if (!isoString) return "-";

  const d = new Date(isoString);
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const day = days[d.getDay()];

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const meridiem = hours < 12 ? "오전" : "오후";
  let displayHour = hours % 12;
  if (displayHour === 0) displayHour = 12;

  const minuteStr = String(minutes).padStart(2, "0");

  return `${year}년 ${month}월 ${date}일 (${day}) · ${meridiem} ${displayHour}:${minuteStr}`;
}

export default function ReservationDetailPage() {
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const location = useLocation();

  const [reservation, setReservation] = useState(
    location.state?.reservation || null
  );
  const [loading, setLoading] = useState(!location.state?.reservation);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 리스트에서 state로 넘어온 값이 있으면 API 호출 안 함
    if (location.state?.reservation) return;

    const controller = new AbortController();
    const loadReservation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyReservations(controller.signal);

        const found = data.find(
          (item) => String(item.reservationId) === String(reservationId)
        );
        if (!found) {
          setError("예약 정보를 찾을 수 없어요.");
        } else {
          setReservation(found);
        }
      } catch (err) {
        if (err.name === "CanceledError") return;
        setError("예약 정보를 불러오는 중 오류가 발생했어요.");
      } finally {
        setLoading(false);
      }
    };

    loadReservation();

    return () => controller.abort();
  }, [location.state, reservationId]);

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F5F5] flex justify-center">
        <div className="w-full max-w-[480px] bg-white flex flex-col">
          <header className="sticky top-0 z-20 bg-white border-b border-[#F2F2F2]">
            <div className="h-12 flex items-center px-3">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={handleBack}
                className="w-9 h-9 flex items-center justify-center"
              >
                <IoChevronBack size={22} className="text-[#3A3A3A]" />
              </button>
              <h1 className="flex-1 text-center text-[16px] font-semibold text-[#3A3A3A] -ml-9">
                예약 상세
              </h1>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center text-[14px] text-[#8C8C8C]">
            예약 정보를 불러오는 중입니다...
          </div>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F5F5] flex justify-center">
        <div className="w-full max-w-[480px] bg-white flex flex-col">
          <header className="sticky top-0 z-20 bg-white border-b border-[#F2F2F2]">
            <div className="h-12 flex items-center px-3">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={handleBack}
                className="w-9 h-9 flex items-center justify-center"
              >
                <IoChevronBack size={22} className="text-[#3A3A3A]" />
              </button>
              <h1 className="flex-1 text-center text-[16px] font-semibold text-[#3A3A3A] -ml-9">
                예약 상세
              </h1>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center text-[14px] text-[#FF4B4B] px-6 text-center">
            {error || "예약 정보를 찾을 수 없어요."}
          </div>
        </div>
      </div>
    );
  }

  const {
    hostName,
    hostProfileImageUrl,
    experienceTitle,
    experienceThumbnailUrl, // 🔹 썸네일 필드 추가
    reservedStartTime,
    totalPrice,
  } = reservation;

  const avatarSrc = hostProfileImageUrl || fakeProfile2;

  const handleGoReview = () => {
    navigate(`/my/reservations/${reservation.reservationId}/review`, {
      state: {
        title: experienceTitle,
        hostName,
        thumbnailUrl: experienceThumbnailUrl, // 🔹 ReviewCreatePage로 넘길 값
      },
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[480px] bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#F2F2F2]">
          <div className="h-12 flex items-center px-3">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={handleBack}
              className="w-9 h-9 flex items-center justify-center"
            >
              <IoChevronBack size={22} className="text-[#3A3A3A]" />
            </button>
            <h1 className="flex-1 text-center text-[16px] font-semibold text-[#3A3A3A] -ml-9">
              예약 상세
            </h1>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-1 overflow-y-auto pb-24">
          {/* 호스트 정보 */}
          <section className="px-5 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-[#FFEFEF] overflow-hidden flex items-center justify-center">
                <img
                  src={avatarSrc}
                  alt={hostName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[15px] font-semibold text-[#3A3A3A]">
                  {hostName} 호스트
                </p>
                <p className="text-[12px] text-[#A0A0A0]">3회 차 만나는 중</p>
              </div>
            </div>
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center"
            >
              <IoChevronForward size={18} className="text-[#C4C4C4]" />
            </button>
          </section>

          {/* 예약 정보 */}
          <section className="px-5 pt-5 pb-4 border-b border-[#F5F5F5]">
            <h2 className="text-[15px] font-semibold text-[#3A3A3A] mb-3">
              예약 정보
            </h2>
            <dl className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">클래스명</dt>
                <dd className="text-right text-[#3A3A3A]">{experienceTitle}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">일시</dt>
                <dd className="text-right text-[#3A3A3A]">
                  {formatDateTimeKorean(reservedStartTime)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">예약 인원</dt>
                <dd className="text-right text-[#3A3A3A]">1명</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">예약 번호</dt>
                <dd className="text-right text-[#3A3A3A]">
                  {reservation.reservationId ?? "-"}
                </dd>
              </div>
            </dl>
          </section>

          {/* 클래스 정보 (주소 섹션 생략) */}
          <section className="px-5 pt-5 pb-4 border-b border-[#F5F5F5]">
            <h2 className="text-[15px] font-semibold text-[#3A3A3A] mb-3">
              클래스 정보
            </h2>
            <dl className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">소요시간</dt>
                <dd className="text-right text-[#3A3A3A]">2시간</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] leading-relaxed text-[#7E8082]">
              15분 이상 지각 시 체험 시간이 단축될 수 있어요.
              <br />
              마감 하루 전부터 일정 변경 및 취소는 불가하니
              <br />
              일정을 꼭 확인하시고 예약해주세요.
            </p>
          </section>

          {/* 결제 안내 */}
          <section className="px-5 pt-5 pb-4">
            <h2 className="text-[15px] font-semibold text-[#3A3A3A] mb-3">
              결제 안내
            </h2>
            <dl className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">이용 금액</dt>
                <dd className="text-right text-[#3A3A3A]">
                  {totalPrice?.toLocaleString()}원
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9E9E9E]">이용료</dt>
                <dd className="text-right text-[#3A3A3A]">0원</dd>
              </div>
              <div className="flex justify-between pt-2 mt-1 border-t border-[#F2F2F2]">
                <dt className="text-[#9E9E9E]">총 결제 금액</dt>
                <dd className="text-right text-[15px] font-semibold text-[#3A3A3A]">
                  {totalPrice?.toLocaleString()}원
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] text-[#B0B0B0] leading-relaxed">
              취소 수수료는 호스트의 취소 규정에 따라 적용됩니다.
            </p>
          </section>
        </main>

        {/* 하단 버튼 */}
        <footer className="sticky bottom-0 bg-white border-t border-[#EEEEEE] px-5 py-3 flex gap-2">
          <button
            type="button"
            className="flex-1 h-[48px] rounded-[8px] border border-[#E0E0E0] text-[15px] font-medium text-[#7E8082] bg-white"
          >
            예약 취소
          </button>
          <button
            type="button"
            onClick={handleGoReview}
            className="flex-1 h-[48px] rounded-[8px] text-[15px] font-semibold text-white bg-[#F13030]"
          >
            리뷰 작성하기
          </button>
        </footer>
      </div>
    </div>
  );
}
