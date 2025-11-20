import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { fetchHostImages } from "../../apis/host";

export default function HostPhotosPage() {
  const navigate = useNavigate();
  const { hostId } = useParams();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchHostImages(hostId);

        // data = [{ experienceId, imageUrls: [...] }, ...]
        const flatImages = data.flatMap((item) => item.imageUrls || []);
        setImages(flatImages);
      } catch (e) {
        console.error("이미지 불러오기 실패:", e);
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
            프로그램 사진
          </h1>
        </header>

        {/* 로딩 상태 */}
        {loading && (
          <div className="px-4 py-6 text-center text-[#A0A0A0] text-sm">
            이미지를 불러오는 중입니다...
          </div>
        )}

        {/* 이미지 그리드 */}
        {!loading && (
          <main className="px-4 pt-4 pb-6">
            {images.length === 0 ? (
              <p className="text-center text-sm text-[#A0A0A0]">
                등록된 이미지가 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-[5px] overflow-hidden bg-[#F5F5F5]"
                  >
                    <img
                      src={src}
                      alt={`프로그램 이미지 ${idx + 1}`}
                      className="w-full h-[200px] object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
