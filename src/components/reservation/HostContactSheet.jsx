import React, { useEffect, useState } from "react";
import BaseAppSheet from "../experience_create/BaseAppSheet";
import { fetchHostDetail } from "../../apis/host";
import callIcon from "../../assets/call.png";
import kakaoIcon from "../../assets/kakao.png";
import mailIcon from "../../assets/mail.png";

// HH:MM
function formatToHHMM(timeString) {
  if (!timeString) return "";
  const parts = String(timeString).split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  const d = new Date(timeString);
  if (!Number.isNaN(d.getTime())) {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  return timeString;
}

export default function HostContactSheet({ open, onClose, hostId }) {
  const [hostDetail, setHostDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !hostId) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHostDetail(hostId, controller.signal);
        setHostDetail(data);
      } catch (e) {
        if (e.name !== "CanceledError" && e.code !== "ERR_CANCELED") {
          console.error(e);
          setError("호스트 정보를 불러오는 중 오류가 발생했어요.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [open, hostId]);

  const phoneText = hostDetail?.businessPhoneNumber
    ? `연락처: ${hostDetail.businessPhoneNumber}`
    : "전화하기";

  const kakaoText = hostDetail?.kakaoAddress
    ? `카카오 채널: ${hostDetail.kakaoAddress}`
    : "카카오 채널로 연락하기";

  const emailText = hostDetail?.businessEmail
    ? `이메일: ${hostDetail.businessEmail}`
    : "이메일 보내기";

  const contactTime =
    hostDetail?.contactStartTime && hostDetail?.contactEndTime
      ? `${formatToHHMM(hostDetail.contactStartTime)} ~ ${formatToHHMM(
          hostDetail.contactEndTime
        )}`
      : "09:00 ~ 18:00";

  return (
    <BaseAppSheet
      open={open}
      onClose={onClose}
      title="도움이 필요하신가요?"
      topOffsetPx={490}
      footer={null}
    >
      <div className="px-5 pb-[24px] pt-1 ml-1">
        <p className="text-[15px] font-medium text-[#3A3A3A] mb-1">
          문의시간: {contactTime}
        </p>

        {error && <p className="text-[12px] text-[#F13030] mb-2">{error}</p>}

        <div className="space-y-4 opacity-100 mt-5">
          {/* 전화 */}
          <div className="w-full flex items-center gap-3 cursor-default select-none">
            <span className="w-8 h-8 rounded-full flex items-center justify-center">
              <img src={callIcon} alt="call" className="w-[30px] h-[30px]" />
            </span>
            <span className="text-[16px] font-medium text-[#3A3A3A]">
              {loading ? "전화 정보 불러오는 중..." : phoneText}
            </span>
          </div>

          {/* 카카오 */}
          <div className="w-full flex items-center gap-3 cursor-default select-none">
            <span className="w-8 h-8 rounded-full flex items-center justify-center">
              <img src={kakaoIcon} alt="kakao" className="w-[30px] h-[30px]" />
            </span>
            <span className="text-[16px] font-medium text-[#3A3A3A]">
              {loading ? "카카오 채널 불러오는 중..." : kakaoText}
            </span>
          </div>

          {/* 이메일 */}
          <div className="w-full flex items-center gap-3 cursor-default select-none">
            <span className="w-8 h-8 rounded-full flex items-center justify-center">
              <img src={mailIcon} alt="email" className="w-[30px] h-[30px]" />
            </span>
            <span className="text-[16px] font-medium text-[#3A3A3A]">
              {loading ? "이메일 정보 불러오는 중..." : emailText}
            </span>
          </div>
        </div>
      </div>
    </BaseAppSheet>
  );
}
