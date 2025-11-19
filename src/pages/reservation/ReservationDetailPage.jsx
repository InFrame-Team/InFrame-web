import React, { useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import fakeProfile2 from "../../assets/fakeProfile2.png";
import { fetchMyReservations } from "../../apis/reservations";
import HostContactSheet from "../../components/reservation/HostContactSheet"; // ✅ 추가

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
  const [contactSheetOpen, setContactSheetOpen] = useState(false);

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

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F5F5] flex justify-center">
        <div className="w-full max-w-[480px] bg-white flex flex-col">
          <header className="sticky top-0 z-10 bg-white">
            <div className="h-12 flex items-center px-3 border-b border-[#F1F1F1]">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={handleBack}
                className="w-9 h-9 flex items-center justify-center"
              >
                <IoChevronBack size={22} className="text-[#3A3A3A]" />
              </button>
              <h1 className="flex-1 text-center text-[16px] font-semibold text-[#222]">
                예약 상세
              </h1>
              <div className="w-9 h-9" />
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
          <header className="sticky top-0 z-10 bg-white">
            <div className="h-12 flex items-center px-3 border-b border-[#F1F1F1]">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={handleBack}
                className="w-9 h-9 flex items-center justify-center"
              >
                <IoChevronBack size={22} className="text-[#3A3A3A]" />
              </button>
              <h1 className="flex-1 text-center text-[16px] font-semibold text-[#222]">
                예약 상세
              </h1>
              <div className="w-9 h-9" />
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
    title,
    totalParticipants,
    caution,
    reservedStartTime,
    totalPrice,
    hostSubtitle,
    amount,
    reservationId: idFromData,
    status,
    hostId,
  } = reservation;

  const avatarSrc = hostProfileImageUrl || fakeProfile2;
  const finalPrice = totalPrice ?? amount ?? 0;
  const displayedTitle = experienceTitle || title || "";
  const idForPath = idFromData ?? reservationId;
  const isCancelled = status === "CANCELLED";
  const isCompleted = status === "COMPLETED";

  const safeParticipants =
    typeof totalParticipants === "number" && totalParticipants > 0
      ? totalParticipants
      : 1;

  const perPersonPrice = finalPrice / safeParticipants;

  const handleGoCancel = () => {
    if (isCancelled || isCompleted) return;
    navigate(`/my/reservations/${idForPath}/cancel`, {
      state: { reservation },
    });
  };

  const handleOpenContactSheet = () => {
    setContactSheetOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[480px] bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="h-12 flex items-center px-3 border-b border-[#F1F1F1]">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center"
            >
              <IoChevronBack size={22} className="text-[#3A3A3A]" />
            </button>
            <h1 className="flex-1 text-center text-[16px] font-semibold text-[#222]">
              예약 상세
            </h1>
            <div className="w-9 h-9" />
          </div>
        </header>

        {/* 본문 */}
        <main className="flex-1 overflow-y-auto pt-3.5 pb-24">
          {/* 호스트 정보 */}
          <section className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[55px] h-[55px] rounded-full overflow-hidden bg-[#FFEFEF] mr-1">
                <img
                  src={avatarSrc}
                  alt={hostName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[20px] font-bold text-[#3A3A3A]">
                  {hostName}
                </p>
                <p className="text-[14px] text-[#3A3A3A] font-medium">
                  {hostSubtitle ?? ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center"
            >
              <IoChevronForward size={25} className="text-[#9D9D9D]" />
            </button>
          </section>

          {/* 예약 정보 */}
          <section className="px-5 pt-6 pb-4">
            <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-4">
              예약 정보
            </h2>

            <div className="space-y-3 text-[15px] font-medium">
              <div className="flex items-start">
                <span className="w-[100px] text-[#969696]">클래스명</span>
                <p className="flex-1 text-[#3A3A3A] break-keep">
                  {displayedTitle}
                </p>
              </div>

              <div className="flex items-start">
                <span className="w-[100px] text-[#969696]">일시</span>
                <p className="flex-1 text-[#3A3A3A]">
                  {formatDateTimeKorean(reservedStartTime)}
                </p>
              </div>

              <div className="flex items-start">
                <span className="w-[100px] text-[#969696]">예약 인원</span>
                <p className="flex-1 text-[#3A3A3A]">{safeParticipants}명</p>
              </div>
            </div>
          </section>

          {/* 클래스 정보 */}
          <section className="px-5 pt-5 pb-4">
            <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">
              클래스 정보
            </h2>

            <div className="space-y-2 text-[15px] font-medium pb-3">
              <div className="flex items-start">
                <span className="w-[100px] text-[#969696]">소요시간</span>
                <p className="flex-1 text-[#3A3A3A]">2시간</p>
              </div>
            </div>

            <div className="space-y-2 text-[15px] font-medium">
              <div className="flex items-start">
                <span className="w-[100px] text-[#969696]">유의사항</span>
                <p className="flex-1 text-[#3A3A3A] leading-[1.5] break-keep">
                  {caution ? (
                    caution
                  ) : (
                    <>
                      15분 이상 지각 시 체험 시간이 단축될 수 있어요.
                      <br />
                      마감 하루 전부터 일정 변경 및 취소는 불가하니 꼭
                      확인해주세요.
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* 결제 안내 */}
          <section className="px-5 pt-5 pb-4">
            <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">
              결제 안내
            </h2>

            <div className="space-y-3 text-[15px] font-medium">
              <div className="flex items-start">
                <span className="w-[100px] text-[#969696]">클래스 이용료</span>
                <p className="flex-1 text-[#3A3A3A]">
                  1인 {perPersonPrice.toLocaleString()}원
                </p>
              </div>

              <div className="flex items-start">
                <span className="w-[100px] text-[#9E9E9E]">총 이용료</span>
                <p className="flex-1 text-[#3A3A3A]">
                  {finalPrice.toLocaleString()}원
                </p>
              </div>

              <div className="flex items-start">
                <span className="w-[100px] text-[#9E9E9E]">결제 방법</span>
                <p className="flex-1 text-[#3A3A3A] leading-[1.5] break-keep">
                  현장 결제 (현금 / 계좌이체 / 간편결제)
                  <br />
                  <span className="text-[12px] text-[#F13030] mt-1.5 inline-block">
                    결제는 호스트의 사전 안내를 통해 진행됩니다.
                  </span>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* 하단 버튼 */}
        {!isCompleted && (
          <footer className="sticky bottom-0 bg-white border-t border-[#EEEEEE] px-5 py-3 flex gap-2">
            <button
              type="button"
              onClick={handleGoCancel}
              disabled={isCancelled}
              className={`flex-[2] h-[48px] rounded-[8px] text-[16px] font-semibold
                ${
                  isCancelled
                    ? "bg-[#D8D8D8] text-white border-none cursor-not-allowed"
                    : "border border-[#B6B6B6] text-[#3A3A3A] bg-white"
                }`}
            >
              예약 취소
            </button>

            <button
              type="button"
              onClick={handleOpenContactSheet}
              className="flex-[3] h-[48px] rounded-[8px] border border-[#B6B6B6] text-[16px] font-semibold text-[#3A3A3A] bg-white"
            >
              호스트에게 연락하기
            </button>
          </footer>
        )}

        {/* 호스트 연락 시트 */}
        <HostContactSheet
          open={contactSheetOpen}
          onClose={() => setContactSheetOpen(false)}
          hostId={hostId}
          hostName={hostName}
        />
      </div>
    </div>
  );
}
