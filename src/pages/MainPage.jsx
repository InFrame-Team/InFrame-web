import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { PiBellSimple } from "react-icons/pi";
import { CiHeart } from "react-icons/ci";
import { BiSolidMessageDetail } from "react-icons/bi";
import { HiMiniMapPin } from "react-icons/hi2";
import { FaHeart } from "react-icons/fa";

export default function MainPage() {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goMessages = () => navigate("/messages");
  const goNotifications = () => navigate("/notifications");

  const goCategory = (key) => navigate(`/category/${key}`);
  const goHostMore = () => navigate("/host/ezisub");

  const [hostLiked, setHostLiked] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const toggleLike = (id) =>
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const categories = useMemo(
    () => [
      { key: "artisan", label: "장인/명인", img: "/artisan.png" },
      { key: "youth", label: "청년 사업가", img: "/youth.png" },
      { key: "alley", label: "골목 상인", img: "/alley.png" },
      { key: "artist", label: "예술가/문화인", img: "/artist.png" },
    ],
    []
  );

  const favorites = useMemo(
    () =>
      new Array(8).fill(0).map((_, i) => ({
        id: i + 1,
        name: "이지현",
        avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${i + 1}`,
        active: i % 2 === 0,
      })),
    []
  );

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] relative pb-24">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-200">
          <div className="px-5 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goHome}
              className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              aria-label="홈으로 이동"
            >
              <img
                src="/inframe-logo.png"
                alt=""
                className="w-30 h-10 object-contain"
                aria-hidden
              />
            </button>

            <div className="flex items-center gap-1 text-neutral-600">
              <button
                type="button"
                onClick={goMessages}
                aria-label="메시지로 이동"
                className="p-2 text-[22px] hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                <FiMessageCircle />
              </button>
              <button
                type="button"
                onClick={goNotifications}
                aria-label="알림으로 이동"
                className="p-2 text-[22px] hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                <PiBellSimple />
              </button>
            </div>
          </div>
        </header>

        {/* 컨텐츠 */}
        <main className="px-5 pt-4 pb-6 space-y-8">
          <section>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => goCategory(c.key)}
                  aria-label={`${c.label} 페이지로 이동`}
                  className="relative h-32 w-full rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <span className="absolute top-4 left-4 text-[17px] font-bold text-neutral-900">
                    {c.label}
                  </span>

                  <div className="absolute bottom-3 right-3">
                    <img
                      src={c.img}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="w-14 h-14 object-contain drop-shadow-sm"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 관심 있을 만한 호스트 */}
          <section className="space-y-3">
            <h2 className="text-[20px] font-bold">
              이지혜님이 관심있어할 호스트
            </h2>
            <p className="text-[14px] text-neutral-500 -mt-2">
              이전에 전통 공예 장인을 만나보았군요!
            </p>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src="https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=host"
                  className="w-10 h-10 rounded-full"
                  alt="호스트"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div className="text-[18px] font-bold truncate">홍길동</div>

                    <button
                      type="button"
                      onClick={() => setHostLiked((v) => !v)}
                      aria-pressed={hostLiked}
                      className="p-1 -mr-1"
                    >
                      {hostLiked ? (
                        <FaHeart className="w-5 h-5 text-rose-600" />
                      ) : (
                        <CiHeart
                          className="w-5 h-5 text-[#D8D8D8]"
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                  </div>
                  <div className="text-[13px] font-medium text-[#A0A0A0] truncate">
                    흙을 담아 삶의 이야기에 녹여냅니다.
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {new Array(3).fill(0).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={goHostMore}
                    className="aspect-[4/3] rounded-xl bg-neutral-100 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    aria-label="호스트 상세 보기"
                  />
                ))}
              </div>
              {/* 후기/위치/거리 메타 */}
              <div className="mt-2 flex items-center gap-5 text-[13px] text-neutral-600">
                <span className="inline-flex items-center gap-1">
                  <BiSolidMessageDetail className="w-4 h-4 -mt-[1px]" />
                  후기 129
                </span>
                <div className="flex gap-1">
                  <span className="inline-flex items-center gap-1">
                    <HiMiniMapPin className="w-4 h-4 -mt-[1px]" />내 위치에서
                  </span>
                  <span className="text-rose-500 font-medium">210m</span>
                </div>
              </div>

              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={goHostMore}
                  className="w-30 items-center text-[13px] font-medium rounded-3xl text-[#919191] border border-[#F1F1F1] px-3 py-2 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2"
                >
                  더 둘러보기
                </button>
              </div>
            </div>
          </section>

          {/* 오늘의 인물 */}
          <section className="space-y-3">
            <h2 className="text-[20px] font-bold">
              오늘, 새로운 인물을 만나보세요
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
              {[
                {
                  title: "창업 실험실",
                  host: "한서준 호스트의",
                  img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
                },
                {
                  title: "단골 비법 이야기",
                  host: "최광호 호스트의",
                  img: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1200&auto=format&fit=crop",
                },
              ].map((card, i) => (
                <article
                  key={i}
                  className="relative min-w-[240px] w-[240px] h-[300px] rounded-2xl overflow-hidden shadow-sm"
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 p-4 text-white">
                    <div className="text-[15px] font-semibold">{card.host}</div>
                    <div className="text-[17px] font-bold leading-snug">
                      {card.title}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 지난 추억 */}
          <section className="space-y-3">
            <h2 className="text-[20px] font-bold">
              지난 추억들을 기억해보세요!
            </h2>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
              {[
                {
                  host: "오민서 호스트",
                  when: "4일전 만났어요",
                  avatar:
                    "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=minseo",
                  img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
                },
                {
                  host: "손가원 호스트",
                  when: "26일전 만났어요",
                  avatar:
                    "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=gawon",
                  img: "https://images.unsplash.com/photo-1611242320536-261f4d41fbe0?q=80&w=1200&auto=format&fit=crop",
                },
              ].map((m, i) => (
                <article
                  key={i}
                  className="min-w-[220px] w-[220px] rounded-2xl overflow-hidden bg-white shadow-md"
                >
                  {/* 상단 정보 영역 */}
                  <div className="flex items-center gap-3 px-3 py-3">
                    <img
                      src={m.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-[15px] font-bold text-neutral-900">
                        {m.host}
                      </div>
                      <div className="text-[13px] text-neutral-500">
                        {m.when}
                      </div>
                    </div>
                  </div>

                  {/* 하단 이미지 */}
                  <div className="w-full h-[140px] bg-neutral-200">
                    <img
                      src={m.img}
                      alt={m.host}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 즐겨찾기 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold">즐겨찾기</h2>
              <button className="text-[13px] text-neutral-400 inline-flex items-center gap-1">
                <span className="text-neutral-300">三</span> 최근 추가한 순
              </button>
            </div>

            {/* 상단 아바타 탭 */}
            <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
              <div className="flex items-end gap-4 py-2">
                <button className="flex flex-col items-center">
                  <span className="w-10 h-10 rounded-full bg-rose-500 text-white grid place-items-center">
                    ★
                  </span>
                  <span className="mt-1 text-[11px] text-neutral-600">
                    모아보기
                  </span>
                  <span className="mt-1 h-[2px] w-10 bg-neutral-400 rounded-full" />
                </button>
                {["이지원", "이지섭", "손가원", "김영덕", "오민서"].map(
                  (name, i) => (
                    <button key={i} className="flex flex-col items-center">
                      <img
                        src={`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${i}`}
                        alt=""
                        className="w-10 h-10 rounded-full ring-2 ring-transparent"
                      />
                      <span className="mt-1 text-[11px] text-neutral-600">
                        {name}
                      </span>
                      <span className="mt-1 h-[2px] w-10 bg-transparent rounded-full" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 카드 리스트 */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {[
                {
                  id: 1,
                  title: "창업가의 비밀 노트,\n맥주 한 잔에 풀어드립니다.",
                  host: "이지원 호스트",
                  img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop",
                },
                {
                  id: 2,
                  title: "골목상인의 하루,\n닫힌 문 뒤의 이야기.",
                  host: "손가원 호스트",
                  img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
                },
              ].map((card) => (
                <article
                  key={card.id}
                  className="relative min-w-[220px] w-[220px] h-[280px] rounded-2xl overflow-hidden shadow-md bg-neutral-200"
                >
                  {/* 배경 이미지 */}
                  <img
                    src={card.img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* 상단 텍스트 */}
                  <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent text-white">
                    <p className="text-[14px] font-semibold leading-snug whitespace-pre-line">
                      {card.title}
                    </p>
                  </div>

                  {/* 하단 바 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#3a2d25]/70 px-4 py-3 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-white">
                      {card.host}
                    </span>
                    {/* 카드별 토글 적용 */}
                    <button
                      type="button"
                      onClick={() => toggleLike(card.id)}
                      aria-pressed={!!likedMap[card.id]}
                      className="p-1 -mr-1"
                    >
                      {likedMap[card.id] ? (
                        <FaHeart className="w-5 h-5 text-rose-600" />
                      ) : (
                        <CiHeart
                          className="w-5 h-5 text-[#D8D8D8]"
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        {/* 하단 탭 바 */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-200">
          <div className="grid grid-cols-5 text-[11px]">
            {[
              { label: "홈", icon: HomeIcon, onClick: () => navigate("/") },
              {
                label: "즐겨찾기",
                icon: HeartIcon,
                onClick: () => navigate("/favorites"),
              },
              {
                label: "인물지도",
                icon: MapPinIcon,
                onClick: () => navigate("/map"),
              },
              {
                label: "예약하기",
                icon: CalendarIcon,
                onClick: () => navigate("/booking"),
              },
              {
                label: "마이페이지",
                icon: UserIcon,
                onClick: () => navigate("/me"),
              },
            ].map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={t.onClick}
                className="py-2 flex flex-col items-center gap-1 text-neutral-500 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <t.icon />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.8 11c1.5-3.8-2.8-7.6-6.5-4.7L12 8l-2.3-1.7C6 3.4 1.7 7.2 3.2 11c1.1 2.8 4.4 5.4 8.8 9 4.4-3.6 7.7-6.2 8.8-9z" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
