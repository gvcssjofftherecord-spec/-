import { Project, Skill, Software, Experience, Achievement, Testimonial, GalleryItem, ProfileInfo, ProcessStep } from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_SKILLS,
  INITIAL_SOFTWARE,
  INITIAL_EXPERIENCE,
  INITIAL_ACHIEVEMENTS,
  INITIAL_TESTIMONIALS,
  INITIAL_GALLERY,
  INITIAL_PROFILE_INFO,
  INITIAL_PROCESS_STEPS,
} from '../data/initialData';

const KEYS = {
  PROJECTS: 'jsr_portfolio_projects',
  SKILLS: 'jsr_portfolio_skills',
  SOFTWARE: 'jsr_portfolio_software',
  EXPERIENCE: 'jsr_portfolio_experience',
  ACHIEVEMENTS: 'jsr_portfolio_achievements',
  TESTIMONIALS: 'jsr_portfolio_testimonials',
  GALLERY: 'jsr_portfolio_gallery',
  PROFILE_INFO: 'jsr_portfolio_profile_info',
  PROCESS_STEPS: 'jsr_portfolio_process_steps',
};

export const getStoredData = () => {
  const load = <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage`, e);
    }
    // Initialize if empty
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  };

  return {
    projects: load<Project[]>(KEYS.PROJECTS, INITIAL_PROJECTS),
    skills: load<Skill[]>(KEYS.SKILLS, INITIAL_SKILLS),
    software: load<Software[]>(KEYS.SOFTWARE, INITIAL_SOFTWARE),
    experience: load<Experience[]>(KEYS.EXPERIENCE, INITIAL_EXPERIENCE),
    achievements: load<Achievement[]>(KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS),
    testimonials: load<Testimonial[]>(KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS),
    gallery: load<GalleryItem[]>(KEYS.GALLERY, INITIAL_GALLERY),
    profileInfo: load<ProfileInfo>(KEYS.PROFILE_INFO, INITIAL_PROFILE_INFO),
    processSteps: load<ProcessStep[]>(KEYS.PROCESS_STEPS, INITIAL_PROCESS_STEPS),
  };
};

const safeSave = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      alert('브라우저 저장 공간(용량)이 부족하여 데이터를 저장할 수 없습니다. 이미지 크기를 줄이거나, 사용하지 않는 사진을 삭제해주세요.');
    }
  }
};

export const saveStoredData = {
  projects: (data: Project[]) => safeSave(KEYS.PROJECTS, data),
  skills: (data: Skill[]) => safeSave(KEYS.SKILLS, data),
  software: (data: Software[]) => safeSave(KEYS.SOFTWARE, data),
  experience: (data: Experience[]) => safeSave(KEYS.EXPERIENCE, data),
  achievements: (data: Achievement[]) => safeSave(KEYS.ACHIEVEMENTS, data),
  testimonials: (data: Testimonial[]) => safeSave(KEYS.TESTIMONIALS, data),
  gallery: (data: GalleryItem[]) => safeSave(KEYS.GALLERY, data),
  profileInfo: (data: ProfileInfo) => safeSave(KEYS.PROFILE_INFO, data),
  processSteps: (data: ProcessStep[]) => safeSave(KEYS.PROCESS_STEPS, data),
};

export const resetToDefaults = () => {
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(KEYS.SKILLS, JSON.stringify(INITIAL_SKILLS));
  localStorage.setItem(KEYS.SOFTWARE, JSON.stringify(INITIAL_SOFTWARE));
  localStorage.setItem(KEYS.EXPERIENCE, JSON.stringify(INITIAL_EXPERIENCE));
  localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
  localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(INITIAL_TESTIMONIALS));
  localStorage.setItem(KEYS.GALLERY, JSON.stringify(INITIAL_GALLERY));
  localStorage.setItem(KEYS.PROFILE_INFO, JSON.stringify(INITIAL_PROFILE_INFO));
  localStorage.setItem(KEYS.PROCESS_STEPS, JSON.stringify(INITIAL_PROCESS_STEPS));
  return getStoredData();
};

export const exportBackupJSON = (): string => {
  const data = {
    projects: JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]'),
    skills: JSON.parse(localStorage.getItem(KEYS.SKILLS) || '[]'),
    software: JSON.parse(localStorage.getItem(KEYS.SOFTWARE) || '[]'),
    experience: JSON.parse(localStorage.getItem(KEYS.EXPERIENCE) || '[]'),
    achievements: JSON.parse(localStorage.getItem(KEYS.ACHIEVEMENTS) || '[]'),
    testimonials: JSON.parse(localStorage.getItem(KEYS.TESTIMONIALS) || '[]'),
    gallery: JSON.parse(localStorage.getItem(KEYS.GALLERY) || '[]'),
    profileInfo: JSON.parse(localStorage.getItem(KEYS.PROFILE_INFO) || '{}'),
    processSteps: JSON.parse(localStorage.getItem(KEYS.PROCESS_STEPS) || '[]'),
    version: '1.0',
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importBackupJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object') {
      if (parsed.projects) localStorage.setItem(KEYS.PROJECTS, JSON.stringify(parsed.projects));
      if (parsed.skills) localStorage.setItem(KEYS.SKILLS, JSON.stringify(parsed.skills));
      if (parsed.software) localStorage.setItem(KEYS.SOFTWARE, JSON.stringify(parsed.software));
      if (parsed.experience) localStorage.setItem(KEYS.EXPERIENCE, JSON.stringify(parsed.experience));
      if (parsed.achievements) localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(parsed.achievements));
      if (parsed.testimonials) localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(parsed.testimonials));
      if (parsed.gallery) localStorage.setItem(KEYS.GALLERY, JSON.stringify(parsed.gallery));
      if (parsed.profileInfo) localStorage.setItem(KEYS.PROFILE_INFO, JSON.stringify(parsed.profileInfo));
      if (parsed.processSteps) localStorage.setItem(KEYS.PROCESS_STEPS, JSON.stringify(parsed.processSteps));
      return true;
    }
  } catch (e) {
    console.error('Failed to import JSON backup', e);
  }
  return false;
};
