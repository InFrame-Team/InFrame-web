import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoChevronBack, IoSearch } from "react-icons/io5";
import ReservationCard from "../../components/reservation/ReservationCard";
import { fetchMyReservations } from "../../apis/reservations";
import { formatKoreanDate, getDDayLabel } from "../../utils/dateUtils";

function isUpcomingReservation(reservedStartTime) {
  if (!reservedStartTime) return false;

  const today = new Date();
  const target = new Date(reservedStartTime);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return target.getTime() >= today.getTime(); // 오늘 포함 미래
}

export default function ReservationHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchMyReservations(controller.signal);

        const mapped = data.map((item) => {
          const isUpcoming = isUpcomingReservation(item.reservedStartTime);

          return {
            id: item.reservationId,
            reservationId: item.reservationId,
            experienceId: item.experienceId,
            status: item.status,
            hostName: `${item.hostName} 호스트`,
            hostProfileImageUrl: item.hostProfileImageUrl,
            title: item.experienceTitle,
            amount: item.totalPrice,
            dateLabel: formatKoreanDate(item.createdAt),
            hostSubtitle: getDDayLabel(item.reservedStartTime),

            createdAt: item.createdAt,
            reservedStartTime: item.reservedStartTime,

            reviewWritten: item.reviewWritten,
            isUpcoming,
            experienceThumbnailUrl: item.experienceThumbnailUrl,
          };
        });

        setReservations(mapped);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error(err);
          setError("예약 내역을 불러오는 중 오류가 발생했어요.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const reviewedId = location.state?.reviewedReservationId;
    if (!reviewedId) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === reviewedId ? { ...r, reviewWritten: true } : r))
    );
  }, [location.state?.reviewedReservationId]);

  const filteredReservations = useMemo(() => {
    const keyword = searchText.trim();
    if (!keyword) return reservations;

    return reservations.filter((r) => {
      const target = `${r.hostName} ${r.title}`.toLowerCase();
      return target.includes(keyword.toLowerCase());
    });
  }, [reservations, searchText]);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative overflow-hidden flex flex-col">
        {/* 헤더 */}
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
              예약내역
            </h1>
            <div className="w-9 h-9" />
          </div>

          {/* 검색 */}
          <div className="px-5 py-3">
            <div className="relative h-[40px] rounded-full bg-[#EFEFEF]">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="호스트나 프로그램 이름을 검색해보세요"
                className="absolute inset-y-0 left-5 right-10 bg-transparent text-[14px] font-medium text-[#3A3A3A] placeholder:text-[#7E8082] outline-none"
              />
              <IoSearch
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4E4E51]"
              />
            </div>
          </div>
        </header>

        {/* 목록 */}
        <main className="flex-1 bg-[#F5F5F5]">
          <div className="px-5 pt-3 pb-6 space-y-3">
            {loading && (
              <p className="py-6 text-center text-[13px] text-[#777]">
                예약 내역을 불러오는 중입니다...
              </p>
            )}

            {!loading && error && (
              <p className="py-6 text-center text-[13px] text-[#F13030]">
                {error}
              </p>
            )}

            {!loading && !error && filteredReservations.length === 0 && (
              <p className="py-6 text-center text-[13px] text-[#777]">
                예약 내역이 없습니다.
              </p>
            )}

            {!loading &&
              !error &&
              filteredReservations.map((item) => (
                <ReservationCard
                  key={item.id}
                  reservation={item}
                  onClickReview={() =>
                    navigate(`/my/reservations/${item.id}/review`, {
                      state: {
                        title: item.title,
                        hostName: item.hostName,
                        thumbnailUrl: item.experienceThumbnailUrl,
                        reservation: item,
                      },
                    })
                  }
                />
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
