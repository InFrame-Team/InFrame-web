import React, { useState, useMemo, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { TiStarFullOutline } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { BiSolidCamera } from "react-icons/bi";
import fakeProgramImg from "../../assets/fakeProgramImg.png";
import { createReview } from "../../apis/reviews";

export default function ReviewCreatePage() {
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const location = useLocation();

  const reservationFromState = location.state?.reservation;

  // 제목/호스트 이름도 reservation이 넘어온 경우까지 고려해서 fallback
  const defaultTitle =
    location.state?.title ??
    reservationFromState?.experienceTitle ??
    "프로그램 제목";

  const defaultHostName =
    location.state?.hostName ?? reservationFromState?.hostName ?? "호스트 이름";

  // 🔹 썸네일 URL 우선순위:
  // 1) state.thumbnailUrl
  // 2) state.experienceThumbnailUrl
  // 3) state.reservation.experienceThumbnailUrl
  // 4) fallback: fake 이미지
  const defaultThumbnailUrl =
    location.state?.thumbnailUrl ??
    location.state?.experienceThumbnailUrl ??
    reservationFromState?.experienceThumbnailUrl ??
    fakeProgramImg;

  const [rating, setRating] = useState(0); // 0~5 (정수)
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);

  const fileInputRef = useRef(null);

  const trimmedContent = content.trim();
  const hasContent = trimmedContent.length > 0;

  const countText = useMemo(() => `${images.length}/10`, [images.length]);
  const descCount = useMemo(() => content.length, [content]);

  // 버튼 활성화 조건: 별점 + 내용 + 동의 + 제출 중 아님
  const canSubmit = rating > 0 && hasContent && agree && !isSubmitting;

  /** 파일 업로드 */
  const openFileDialog = () => {
    if (images.length >= 10) return;
    fileInputRef.current?.click();
  };

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [...images];
    for (const file of files) {
      if (next.length >= 10) break;
      next.push({
        id: `${Date.now()}-${file.name}`,
        url: URL.createObjectURL(file),
        file,
      });
    }
    setImages(next);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleStarClick = (index) => {
    if (rating === index) setRating(0);
    else setRating(index);
  };

  /** 리뷰 등록 */
  const handleSubmit = async () => {
    if (!rating) return alert("별점을 선택해주세요.");
    if (!hasContent) return alert("후기 내용을 작성해주세요.");
    if (!agree) return alert("리뷰 정책에 동의해주세요.");

    try {
      setIsSubmitting(true);

      const reviewData = {
        rating,
        comment: trimmedContent,
      };

      await createReview(
        reservationId,
        reviewData,
        images.map((i) => i.file)
      );

      alert("리뷰가 등록되었습니다.");
      navigate("/my/reservations", {
        replace: true,
        state: { reviewedReservationId: Number(reservationId) },
      });
    } catch (err) {
      console.error(err);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative overflow-hidden flex flex-col">
        {/* 헤더 */}
        <header className="h-12 flex items-center px-3 border-b border-[#F1F1F1]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center"
          >
            <IoClose size={22} className="text-[#3A3A3A]" />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-semibold text-[#222]">
            리뷰 작성하기
          </h1>
          <div className="w-9 h-9" />
        </header>

        {/* 본문 */}
        <main className="px-5 pt-4 pb-24 overflow-y-auto">
          {/* 프로그램 + 호스트 정보 */}
          <section className="mb-5">
            <div className="flex items-center gap-3">
              <img
                src={defaultThumbnailUrl}
                alt="program"
                className="w-[60px] h-[60px] rounded-[4px] object-cover"
              />
              <div className="flex flex-col">
                <p className="text-[15px] font-medium text-[#969696]">
                  {defaultTitle}
                </p>
                <p className="text-[20px] font-bold text-[#3A3A3A]">
                  {defaultHostName}
                </p>
              </div>
            </div>
          </section>

          {/* 별점 */}
          <section className="mb-6">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => {
                const index = i + 1;
                const active = index <= rating;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleStarClick(index)}
                    className="w-9 h-9 flex items-center justify-center"
                  >
                    <TiStarFullOutline
                      size={40}
                      className={active ? "text-[#F13030]" : "text-[#E7E7E7]"}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* 사진 첨부 */}
          <section className="mb-6">
            <h2 className="text-[18px] font-bold text-[#3A3A3A] mb-2">
              사진 첨부 (선택)
            </h2>

            <div className="flex items-center gap-3 flex-wrap">
              {/* 업로드 버튼 */}
              <button
                type="button"
                onClick={openFileDialog}
                className="shrink-0 w-[64px] h-[64px] rounded-[5px] border-[2px] border-[#E6E6E6] bg-white flex flex-col items-center justify-center"
              >
                <BiSolidCamera size={26} className="text-[#969696]" />
                <span className="text-[12px] text-[#969696]">{countText}</span>
              </button>

              {/* 썸네일 */}
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative w-[64px] h-[64px] rounded-[5px] overflow-hidden border border-[#EDEDED]"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <RxCross2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFilesChange}
            />
          </section>

          {/* 후기 작성 */}
          <section className="mb-4">
            <h2 className="text-[18px] font-bold text-[#3A3A3A] mb-3">
              후기 작성
            </h2>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                rows={5}
                placeholder={"후기를 솔직하게 공유해주세요"}
                className="w-full h-[150px] rounded-[5px] border-[2px] border-[#E6E6E6] px-4 py-3 text-[13px] text-[#3A3A3A] placeholder:text-[#B6B6B6] outline-none resize-none"
              />
              <div className="text-[12px] mt-1 text-right">
                <span className="text-[#3A3A3A] font-medium">{descCount}</span>
                <span className="text-[#8E8E93]"> / 500</span>
              </div>
            </div>
          </section>

          {/* 안내 박스 */}
          <section className="-mx-5">
            <div className="w-full h-[103px] bg-[#F1F1F1] px-5 py-3 leading-relaxed">
              <p className="mb-2.5 text-[13px] font-semibold text-[#7F7F7F] border-b border-[#DBDBDB] pb-1">
                in 경산 리뷰 정책
              </p>
              <p className="text-[11px] font-medium text-[#7F7F7F]">
                프로그램과 관련 없는 사진이나 내용 등의 부적합한 내용은 삭제될
                수 있습니다.
              </p>
              {/* 체크박스 영역 */}
              <label className="flex items-center gap-2 mt-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree((prev) => !prev)}
                  className="w-[12px] h-[12px] accent-[#3A3A3A]"
                />
                <span className="text-[11px] font-medium text-[#1D1D1D]">
                  in 경산 리뷰 정책에 동의합니다.
                </span>
              </label>
            </div>
          </section>
        </main>

        {/* 하단 버튼 */}
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full h-[48px] rounded-[10px] text-[16px] font-bold ${
              canSubmit
                ? "bg-[#3A3A3A] text-white"
                : "bg-[#EDEDED] text-[#B1B1B1] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "등록 중..." : "등록하기"}
          </button>
        </footer>
      </div>
    </div>
  );
}
