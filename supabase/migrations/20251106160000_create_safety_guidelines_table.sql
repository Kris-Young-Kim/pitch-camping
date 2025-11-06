-- 캠핑 안전 수칙 테이블 생성
-- 고캠핑 사이트의 안전 수칙 정보를 저장하는 테이블

CREATE TABLE safety_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- 안전 수칙 제목
  content TEXT NOT NULL, -- 안전 수칙 내용 (마크다운 형식 지원)
  season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'all')), -- 계절 구분
  topic TEXT NOT NULL CHECK (topic IN (
    'food_poisoning', -- 식중독
    'water_play', -- 물놀이
    'insects', -- 벌레
    'wildlife', -- 야생동물
    'weather', -- 이상기후/자연재해
    'heat', -- 폭염
    'heater', -- 난로
    'gas', -- 가스 사고
    'co', -- 일산화탄소 중독
    'preparation', -- 캠핑 준비사항
    'general' -- 일반 안전 수칙
  )),
  image_url TEXT, -- 이미지 URL
  video_url TEXT, -- 동영상 URL
  video_type TEXT CHECK (video_type IN ('youtube', 'external', 'internal')), -- 동영상 타입
  source_url TEXT, -- 출처 URL (고캠핑 사이트)
  view_count INTEGER DEFAULT 0, -- 조회수
  priority INTEGER DEFAULT 0, -- 우선순위 (높을수록 먼저 표시)
  is_active BOOLEAN DEFAULT true, -- 활성화 여부
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_safety_guidelines_season ON safety_guidelines(season) WHERE is_active = true;
CREATE INDEX idx_safety_guidelines_topic ON safety_guidelines(topic) WHERE is_active = true;
CREATE INDEX idx_safety_guidelines_priority ON safety_guidelines(priority DESC) WHERE is_active = true;
CREATE INDEX idx_safety_guidelines_created_at ON safety_guidelines(created_at DESC);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_safety_guidelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_safety_guidelines_updated_at
  BEFORE UPDATE ON safety_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_safety_guidelines_updated_at();

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_safety_guideline_view_count(guideline_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE safety_guidelines
  SET view_count = view_count + 1
  WHERE id = guideline_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 코멘트 추가
COMMENT ON TABLE safety_guidelines IS '캠핑 안전 수칙 정보 저장 테이블 (고캠핑 사이트 참고)';
COMMENT ON COLUMN safety_guidelines.season IS '계절 구분: spring(봄), summer(여름), autumn(가을), winter(겨울), all(전체)';
COMMENT ON COLUMN safety_guidelines.topic IS '주제 구분: food_poisoning(식중독), water_play(물놀이), insects(벌레), wildlife(야생동물), weather(이상기후), heat(폭염), heater(난로), gas(가스), co(일산화탄소), preparation(준비사항), general(일반)';
COMMENT ON COLUMN safety_guidelines.video_type IS '동영상 타입: youtube(YouTube), external(외부 링크), internal(내부 저장)';
COMMENT ON COLUMN safety_guidelines.source_url IS '출처 URL (고캠핑 사이트)';

