export type ProjectCategory = 'Documentary' | 'Short' | 'Event' | 'Interview' | 'Promotion';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  tags: string[];
  roles: string[]; // e.g., ['기획', '촬영', '편집']
  duration: string; // e.g., '5분 30초' or '15분'
  period: string; // e.g., '2026.03 ~ 2026.05'
  thumbnail: string; // high quality image URL
  videoUrl: string; // YouTube/Vimeo embed or MP4 URL
  hoverVideoUrl?: string; // Short ambient loop MP4 for card hover play
  directorName?: string; // Optional director name override
  postProduction?: string; // Optional post production override
  aspectRatio?: string; // Optional aspect ratio override
  description: string; // Brief summary
  directorNotes: string; // 제작 의도 & 감독 코멘트
  planningProcess: string; // 기획 과정
  behindScenes: string[]; // 촬영 및 비하인드 이미지 URLs
  editWorkspaceImg?: string; // 편집 화면 캡쳐 이미지 URL
  reflection: string; // 제작 후 느낀 점 및 배운 점
  isFeatured: boolean; // Featured project (shows on top grid)
  createdAt: number;
}

export interface Skill {
  id: string;
  name: string; // 기획, 촬영, 편집, 디자인, 사운드 등
  percentage: number;
  iconName: string; // Lucide icon identifier
}

export interface Software {
  id: string;
  name: string; // DaVinci Resolve, Premiere Pro, etc.
  rating: number; // 1 to 5 stars
  desc?: string;
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface Achievement {
  id: string;
  label: string; // e.g., 'Projects', 'Videos', 'Editing Time'
  value: string; // e.g., '15+', '40+', '700h+'
  iconName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  company?: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string; // 촬영현장, 드론, 카메라, 스크린샷 등
}

export interface ProfileInfo {
  name: string;
  subtitle: string;
  roles: string; // e.g., 'VIDEO PRODUCER • EDITOR • STORYTELLER'
  introHeader: string;
  introBio: string;
  age: string;
  location: string;
  experienceYears: string;
  email: string;
  phone: string;
  kakao: string;
  instagram: string;
  youtube: string;
  github: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  sub: string;
  icon: string;
  desc: string;
}


