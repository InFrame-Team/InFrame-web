import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import HostProgramCard from "../../components/host/HostProgramCard";
import { fetchHostProgramsByHost } from "../../apis/host";

const formatDuration = (hours) => {
  if (hours == null) return null;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);

  return parts.join(" ") || null;
};

export default function HostProgramListPage() {
  const navigate = useNavigate();
  const { hostId } = useParams();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchHostProgramsByHost(hostId);
        setPrograms(data || []);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [hostId]);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] bg-white pb-4">
        {/* 상단 헤더 */}
        <header className="h-12 flex items-center px-4 border-b border-[#F2F2F2]">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center"
          >
            <IoChevronBack size={22} className="text-[#3A3A3A]" />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-semibold text-[#3A3A3A] mr-9">
            {loading
              ? "프로그램 불러오는 중..."
              : `${programs.length}개의 프로그램`}
          </h1>
        </header>

        {/* 리스트 */}
        <main className="px-5 pt-4">
          {error ? (
            <p className="text-sm text-red-500">
              프로그램 목록을 불러올 수 없습니다.
            </p>
          ) : programs.length === 0 && !loading ? (
            <p className="text-[13px] text-[#A0A0A0]">
              아직 등록된 프로그램이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {programs.map((p) => (
                <HostProgramCard
                  key={p.experienceId}
                  mainImageUrl={p.mainImageUrl}
                  title={p.title}
                  price={p.price}
                  durationInHours={formatDuration(p.durationInHours)}
                  rating={p.rating}
                  onClick={() => {
                    navigate(`/experiences/${p.experienceId}`);
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
