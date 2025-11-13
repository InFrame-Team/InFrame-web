import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../components/BottomTab";

import { PiBellSimpleBold } from "react-icons/pi";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import { IoSearch } from "react-icons/io5";

export default function MainPage() {
  const navigate = useNavigate();

  const goMessages = () => navigate("/messages");
  const goNotifications = () => navigate("/notifications");

  const goCategory = (key) => navigate(`/map?category=${key}`);

  const goHostMore = () => navigate("/host/ezisub");

  const [likedMap, setLikedMap] = useState({});
  const toggleLike = (id) =>
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const [tab, setTab] = useState("host");
  const [savedLike, setSavedLike] = useState({ a: false, b: false });
  const toggleSavedLike = (key) =>
    setSavedLike((p) => ({ ...p, [key]: !p[key] }));

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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-200">
          <div className="px-5 py-3 flex items-center justify-between">
            <img
              src="/inframe-logo.png"
              alt=""
              className="w-30 h-9 object-contain"
              aria-hidden
            />

            <div className="flex items-center gap-1 text-neutral-600">
              <button
                type="button"
                onClick={goMessages}
                aria-label="메시지로 이동"
                className="p-2 text-[22px] hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                <IoSearch />
              </button>
              <button
                type="button"
                onClick={goNotifications}
                aria-label="알림으로 이동"
                className="p-2 text-[22px] hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                <PiBellSimpleBold />
              </button>
            </div>
          </div>
        </header>

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

            <div className="flex justify-between items-center rounded-2xl bg-[#e64a45] text-white p-6 mt-3 shadow-[0_8px_24px_rgba(230,74,69,0.25)]">
              <div>
                <div className="text-[18px] font-bold leading-snug">
                  내 주변
                  <br />
                  호스트 만나기
                </div>

                <div className="text-[12px] font-medium opacity-90 mt-5">
                  나와 가까이 있는 호스트를 만나보세요!
                </div>
              </div>

              <img
                src="/hand.png"
                alt="악수 아이콘"
                className="w-35 h-20 object-contain drop-shadow-md ml-6"
              />
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-bold">
                  나의 저장으로 만나보세요!
                </h2>
                <button
                  className="text-[#919191] text-[20px]"
                  aria-label="더보기"
                  onClick={() => navigate("/favorites")}
                >
                  <MdArrowForwardIos />
                </button>
              </div>

              <p className="text-[14px] font-medium text-[#919191]">
                최근 추가한 나의 즐겨찾기예요
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTab("host")}
                className={`px-4 py-2 rounded-full text-[13px] border transition ${
                  tab === "host"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-700 border-neutral-200"
                }`}
              >
                호스트
              </button>
              <button
                onClick={() => setTab("product")}
                className={`px-4 py-2 rounded-full text-[13px] border transition ${
                  tab === "product"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-700 border-neutral-200"
                }`}
              >
                상품
              </button>
            </div>

            {tab === "host" && (
              <div className="space-y-6">
                <article className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=240&auto=format&fit=crop"
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[15px] font-bold">
                            이서운 호스트
                          </div>
                          <div className="text-[12px] text-neutral-500">
                            전통을 익히고, 트렌드를 빚어내요.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSavedLike("a")}
                          aria-pressed={savedLike.a}
                          className="p-1 -mr-1"
                          title="찜"
                        >
                          {savedLike.a ? (
                            <FaHeart className="w-5 h-5 text-rose-600" />
                          ) : (
                            <CiHeart className="w-5 h-5 text-[#D8D8D8]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1514846326710-096e4a8035e6?q=80&w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=600&auto=format&fit=crop",
                    ].map((src, i) => (
                      <button
                        key={i}
                        onClick={goHostMore}
                        className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100"
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1611695434369-e6c5d2a9b9f2?q=80&w=240&auto=format&fit=crop"
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[15px] font-bold">
                            정민호 호스트
                          </div>
                          <div className="text-[12px] text-neutral-500">
                            가족의 질감을 디자인해 가치를 만듭니다.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSavedLike("b")}
                          aria-pressed={savedLike.b}
                          className="p-1 -mr-1"
                          title="찜"
                        >
                          {savedLike.b ? (
                            <FaHeart className="w-5 h-5 text-rose-600" />
                          ) : (
                            <CiHeart className="w-5 h-5 text-[#D8D8D8]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=600&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=600&auto=format&fit=crop",
                    ].map((src, i) => (
                      <button
                        key={i}
                        onClick={goHostMore}
                        className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100"
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            )}

            {tab === "product" && (
              <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
                곧 추가될 예정입니다.
              </div>
            )}
          </section>
        </main>

        <BottomTab />
      </div>
    </div>
  );
}
