// src/contexts/ExperienceCreateContext.jsx
import React, { createContext, useContext, useState } from "react";
import { createExperience, uploadExperienceImages } from "../apis/experiences";

const ExperienceCreateContext = createContext(null);

const initialState = {
  // Step1
  professionalField: null, // 전문 분야 코드
  detailField: null, // 상세 분야 코드
  certifications: "", // "자격증1, 자격증2" 형식 (필요시 형식 변경)
  companyInfo: "", // 사업자/가게 정보 등 (필요시)

  // Step2
  title: "", // 프로그램 제목
  description: "", // 체험 설명
  price: "", // 문자열로 보관 후 전송 시 숫자로 변환
  durationInHours: null, // 숫자
  maxCapacityPerSlot: null, // 숫자
  mainImageFile: null, // 대표 이미지 (파일 객체)

  // Step3
  availableDaysOfWeek: [], // ["MONDAY", "SUNDAY", ...]
  availableTimes: [], // ["09:00","10:00", ...] - 실제 가능한 시간 슬롯 리스트
  notice: "", // 유의사항
};

export function ExperienceCreateProvider({ children }) {
  const [data, setData] = useState(initialState);

  const update = (partial) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const reset = () => setData(initialState);

  const submit = async (override = {}) => {
    const merged = { ...data, ...override };

    const {
      professionalField,
      detailField,
      certifications,
      companyInfo,
      title,
      description,
      price,
      durationInHours,
      maxCapacityPerSlot,
      availableDaysOfWeek,
      availableTimes,
      mainImageFile,
    } = merged;

    const body = {
      professionalField,
      detailField,
      certifications,
      companyInfo,
      title,
      description,
      price: Number(price || 0),
      durationInHours,
      maxCapacityPerSlot,
      availableDaysOfWeek,
      availableTimes,
    };

    // 1) 텍스트 정보 생성
    const created = await createExperience(body);
    const experienceId = created.id || created.experienceId;

    // 2) 이미지 업로드 (있을 때만) - 대표 이미지 1개만
    const imageFiles = [mainImageFile].filter(Boolean);
    if (experienceId && imageFiles.length > 0) {
      await uploadExperienceImages(experienceId, imageFiles);
    }

    return experienceId;
  };

  return (
    <ExperienceCreateContext.Provider value={{ data, update, reset, submit }}>
      {children}
    </ExperienceCreateContext.Provider>
  );
}

export function useExperienceCreate() {
  const ctx = useContext(ExperienceCreateContext);
  if (!ctx) {
    throw new Error(
      "useExperienceCreate는 ExperienceCreateProvider 안에서만 사용해야 합니다."
    );
  }
  return ctx;
}
