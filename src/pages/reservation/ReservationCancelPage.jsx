import React, { useEffect, useState, useMemo } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchMyReservations,
  cancelReservation,
} from "../../apis/reservations";
import checkIcon from "../../assets/checkIcon.png";
import checkedIcon from "../../assets/checkedIcon.png";

export default function ReservationCancelPage() {
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const location = useLocation();

  const [reservation, setReservation] = useState(
    location.state?.reservation || null
  );
  const [loading, setLoading] = useState(!location.state?.reservation);
  const [error, setError] = useState(null);

  const [reason, setReason] = useState("");
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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

  // 모든 조건이 만족되어야 취소 버튼 활성화
  const isCancelable = useMemo(() => {
    return reason.trim().length > 0 && agree1 && agree2 && agree3;
  }, [reason, agree1, agree2, agree3]);

  const handleSubmitCancel = async () => {
    if (!isCancelable || submitting) return;
    if (!reservation) return;

    try {
      setSubmitting(true);
      await cancelReservation(reservation.reservationId);

      // 취소 완료 페이지로 이동하면서 예약 정보 같이 넘기기
      navigate(`/my/reservations/${reservation.reservationId}/cancel/done`, {
        state: { reservation },
      });
    } catch (e) {
      console.error(e);
      alert("예약 취소 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

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
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center text-[14px] text-[#FF4B4B] px-6 text-center">
            {error || "예약 정보를 찾을 수 없어요."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={handleBack}
              className="text-[18px] text-[#3A3A3A]"
            >
              <IoChevronBack size={24} />
            </button>
          </div>
        </header>

        {/* 본문 */}
        <main className="px-5 pt-10 pb-28">
          <h1 className="text-[26px] font-bold text-[#3A3A3A] mb-10">
            예약을 취소할까요?
          </h1>

          {/* 취소 사유 입력 */}
          <div className="mb-8">
            <label className="block text-[15px] text-[#3A3A3A] font-semibold mb-3">
              취소 사유 <span className="text-[#F13030]">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="작성해주세요"
              className="w-full h-[48px] border border-[#E1E1E1] rounded-[6px] px-3 py-3 text-[15px] text-[#3A3A3A] font-medium placeholder:text-[#969696] resize-none outline-none focus:border-[#F13030]"
            />
          </div>

          {/* 체크박스 */}
          <div className="space-y-5">
            <div
              className="flex items-start gap-2 cursor-pointer"
              onClick={() => setAgree1(!agree1)}
            >
              <img
                src={agree1 ? checkedIcon : checkIcon}
                className="w-6 h-6 mt-[2px]"
                alt="agree"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A] leading-relaxed mt-0.5">
                취소 시 예약 정보와 사전 조율된 내용이 모두 초기화됩니다.
              </p>
            </div>

            <div
              className="flex items-start gap-2 cursor-pointer"
              onClick={() => setAgree2(!agree2)}
            >
              <img
                src={agree2 ? checkedIcon : checkIcon}
                className="w-6 h-6 mt-[2px]"
                alt="agree"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A] leading-relaxed mt-0.5">
                잦은 취소 발생 시, 일부 프로그램 예약이 제한될 수 있음을
                이해합니다.
              </p>
            </div>

            <div
              className="flex items-start gap-2 cursor-pointer"
              onClick={() => setAgree3(!agree3)}
            >
              <img
                src={agree3 ? checkedIcon : checkIcon}
                className="w-6 h-6 mt-[2px]"
                alt="agree"
              />
              <p className="text-[15px] font-medium text-[#3A3A3A] leading-relaxed mt-0.5">
                서비스 이용 규정에 따라 취소 내역이 기록될 수 있음을 확인합니다.
              </p>
            </div>
          </div>
        </main>

        {/* 하단 실제 취소 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-6 pb-6 pt-3 border-t border-[#F2F2F2]">
          <button
            type="button"
            disabled={!isCancelable || submitting}
            onClick={handleSubmitCancel}
            className={`w-full rounded-[8px] text-white text-[16px] font-bold py-3 transition ${
              isCancelable && !submitting
                ? "bg-[#F13030]"
                : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
            }`}
          >
            {submitting ? "취소 중..." : "예약 취소하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
