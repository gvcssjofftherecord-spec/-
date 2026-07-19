import React, { useState } from 'react';
import { Project, Skill, Software, Experience, Achievement, Testimonial, GalleryItem, ProjectCategory, ProfileInfo, ProcessStep } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';
import { compressImageDataUrl, compressImageFile } from '../lib/videoUtils';
import { saveVideoToIndexedDB } from '../lib/videoStorage';
import { useResolveImageUrl } from '../hooks/useResolveImageUrl';
import { uploadMediaToFirestore } from '../lib/firebase';
import { SafeImage } from './SafeImage';

async function uploadFileToServer(file: File | Blob): Promise<string> {
  const name = (file as File).name || `upload-${Date.now()}`;
  let filename = name;
  if (!filename.includes('.') && file.type) {
    const ext = file.type.split('/')[1];
    if (ext) {
      filename = `${filename}.${ext}`;
    }
  }

  try {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const result = await response.json();
    if (result && result.url) {
      return result.url;
    }
    throw new Error('No URL in server response');
  } catch (err) {
    console.warn('Server upload failed, falling back to local/cloud hybrid storage:', err);
    if (file.type.startsWith('image/')) {
      // For images, read as base64 data URL and compress it as a fallback
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (typeof reader.result === 'string') {
            try {
              const compressed = await compressImageDataUrl(reader.result);
              resolve(compressed);
            } catch (compressErr) {
              resolve(reader.result);
            }
          } else {
            reject(new Error('Failed to convert file to base64'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(file);
      });
    } else {
      // For video or other media, use IndexedDB + Firestore backup
      const storageKey = `fallback-media-${Date.now()}`;
      try {
        await saveVideoToIndexedDB(storageKey, file);
        uploadMediaToFirestore(storageKey, file).catch(console.error);
        return `local-video:${storageKey}`;
      } catch (dbErr) {
        console.error('IndexedDB backup also failed:', dbErr);
        throw err; // throw original upload error if backup fails too
      }
    }
  }
}

interface AdminPanelProps {
  onClose: () => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  software: Software[];
  setSoftware: React.Dispatch<React.SetStateAction<Software[]>>;
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  aboutProfileImg: string;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  profileInfo: ProfileInfo;
  processSteps: ProcessStep[];
  setProcessSteps: React.Dispatch<React.SetStateAction<ProcessStep[]>>;
  onSaveAll: (updatedData: {
    projects?: Project[];
    skills?: Skill[];
    software?: Software[];
    experience?: Experience[];
    achievements?: Achievement[];
    testimonials?: Testimonial[];
    aboutProfileImg?: string;
    gallery?: GalleryItem[];
    profileInfo?: ProfileInfo;
    processSteps?: ProcessStep[];
  }) => void;
  onReset: () => void;
  onImport: (json: string) => boolean;
  onExport: () => string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onClose,
  projects,
  setProjects,
  skills,
  setSkills,
  software,
  setSoftware,
  experience,
  setExperience,
  achievements,
  setAchievements,
  testimonials,
  setTestimonials,
  aboutProfileImg,
  gallery,
  setGallery,
  profileInfo,
  processSteps,
  setProcessSteps,
  onSaveAll,
  onReset,
  onImport,
  onExport,
}) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'process' | 'skills-software' | 'timeline' | 'gallery' | 'achievements' | 'backup'>('profile');
  
  // Profile Info editing states
  const [profName, setProfName] = useState(profileInfo?.name || '');
  const [profSubtitle, setProfSubtitle] = useState(profileInfo?.subtitle || '');
  const [profRoles, setProfRoles] = useState(profileInfo?.roles || '');
  const [profIntroHeader, setProfIntroHeader] = useState(profileInfo?.introHeader || '');
  const [profIntroBio, setProfIntroBio] = useState(profileInfo?.introBio || '');
  const [profAge, setProfAge] = useState(profileInfo?.age || '');
  const [profLocation, setProfLocation] = useState(profileInfo?.location || '');
  const [profExperienceYears, setProfExperienceYears] = useState(profileInfo?.experienceYears || '');
  const [profEmail, setProfEmail] = useState(profileInfo?.email || '');
  const [profPhone, setProfPhone] = useState(profileInfo?.phone || '');
  const [profKakao, setProfKakao] = useState(profileInfo?.kakao || '');
  const [profInstagram, setProfInstagram] = useState(profileInfo?.instagram || '');
  const [profYoutube, setProfYoutube] = useState(profileInfo?.youtube || '');
  const [profGithub, setProfGithub] = useState(profileInfo?.github || '');
  const [profHeroVideoUrl, setProfHeroVideoUrl] = useState(profileInfo?.heroVideoUrl || '');

  // Synchronize state when profileInfo prop changes (e.g., loaded from Firestore)
  React.useEffect(() => {
    if (profileInfo) {
      setProfName(profileInfo.name || '');
      setProfSubtitle(profileInfo.subtitle || '');
      setProfRoles(profileInfo.roles || '');
      setProfIntroHeader(profileInfo.introHeader || '');
      setProfIntroBio(profileInfo.introBio || '');
      setProfAge(profileInfo.age || '');
      setProfLocation(profileInfo.location || '');
      setProfExperienceYears(profileInfo.experienceYears || '');
      setProfEmail(profileInfo.email || '');
      setProfPhone(profileInfo.phone || '');
      setProfKakao(profileInfo.kakao || '');
      setProfInstagram(profileInfo.instagram || '');
      setProfYoutube(profileInfo.youtube || '');
      setProfGithub(profileInfo.github || '');
      setProfHeroVideoUrl(profileInfo.heroVideoUrl || '');
    }
  }, [profileInfo]);

  // Delete confirmation states to prevent sandboxed iframe blockages
  const [deletingSwId, setDeletingSwId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);
  const [deletingExpId, setDeletingExpId] = useState<string | null>(null);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);

  // Project editing state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [tempTags, setTempTags] = useState('');
  const [tempRoles, setTempRoles] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [hoverVideoUploading, setHoverVideoUploading] = useState(false);
  const [heroVideoUploading, setHeroVideoUploading] = useState(false);

  // Experience state
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [isNewExp, setIsNewExp] = useState(false);

  // Testimonial state
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isNewTestimonial, setIsNewTestimonial] = useState(false);

  // Software states and handlers
  const [isAddingSoftware, setIsAddingSoftware] = useState(false);
  const [newSoftwareName, setNewSoftwareName] = useState('');
  const [newSoftwareDesc, setNewSoftwareDesc] = useState('');
  const [newSoftwareRating, setNewSoftwareRating] = useState(5);

  const handleAddSoftware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftwareName.trim()) {
      showToast('프로그램 이름을 입력해주세요.');
      return;
    }
    const newSw: Software = {
      id: `software-${Date.now()}`,
      name: newSoftwareName.trim(),
      rating: newSoftwareRating,
      desc: newSoftwareDesc.trim() || undefined,
    };
    const updated = [...software, newSw];
    setSoftware(updated);
    onSaveAll({ software: updated });
    setIsAddingSoftware(false);
    setNewSoftwareName('');
    setNewSoftwareDesc('');
    setNewSoftwareRating(5);
    showToast('프로그램이 추가되었습니다.');
  };

  const handleDeleteSoftware = (id: string) => {
    const updated = software.filter((sw) => sw.id !== id);
    setSoftware(updated);
    onSaveAll({ software: updated });
    showToast('프로그램이 삭제되었습니다.');
  };

  // Gallery CRUD handlers and state variables
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('촬영현장');
  const [newGalleryImg, setNewGalleryImg] = useState('');

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImg) {
      showToast('이미지를 선택하거나 URL을 입력해주세요.');
      return;
    }
    const newItem: GalleryItem = {
      id: `gallery-${Date.now()}`,
      imageUrl: newGalleryImg,
      title: newGalleryTitle.trim() || '무제 촬영 클립',
      category: newGalleryCategory,
    };
    const updated = [...gallery, newItem];
    setGallery(updated);
    onSaveAll({ gallery: updated });
    setNewGalleryTitle('');
    setNewGalleryImg('');
    showToast('미디어 갤러리에 추가되었습니다.');
  };

  const handleDeleteGalleryItem = (id: string) => {
    const updated = gallery.filter((item) => item.id !== id);
    setGallery(updated);
    onSaveAll({ gallery: updated });
    showToast('갤러리 항목이 삭제되었습니다.');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0808') {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      setPassword('');
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    if (!editingProject.title.trim()) {
      showToast('프로젝트 제목을 입력해주세요.');
      return;
    }

    const savedProject: Project = {
      ...editingProject,
      tags: tempTags.split(',').map((t) => t.trim()).filter(Boolean),
      roles: tempRoles.split(',').map((r) => r.trim()).filter(Boolean),
    };

    let updatedProjects: Project[];
    if (isNewProject) {
      updatedProjects = [savedProject, ...projects];
    } else {
      updatedProjects = projects.map((p) => (p.id === savedProject.id ? savedProject : p));
    }

    setProjects(updatedProjects);
    onSaveAll({ projects: updatedProjects });
    setEditingProject(null);
    setIsNewProject(false);
    showToast('프로젝트가 성공적으로 저장되었습니다.');
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    onSaveAll({ projects: updated });
    showToast('프로젝트가 삭제되었습니다.');
  };

  const handleCreateNewProject = () => {
    const newId = `project-${Date.now()}`;
    const newProj: Project = {
      id: newId,
      title: '',
      category: 'Documentary',
      tags: [],
      roles: [],
      duration: '',
      period: '',
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
      videoUrl: '',
      hoverVideoUrl: '',
      description: '',
      directorNotes: '',
      planningProcess: '',
      behindScenes: [],
      reflection: '',
      isFeatured: false,
      createdAt: Date.now(),
    };
    setEditingProject(newProj);
    setIsNewProject(true);
    setTempTags('');
    setTempRoles('');
  };

  // Skill percentage update
  const handleSkillChange = (id: string, percentage: number) => {
    const updated = skills.map((s) => (s.id === id ? { ...s, percentage: Math.min(100, Math.max(0, percentage)) } : s));
    setSkills(updated);
    onSaveAll({ skills: updated });
  };

  // Process step update
  const handleProcessStepChange = (id: string, field: keyof ProcessStep, value: string) => {
    const updated = processSteps.map((step) => step.id === id ? { ...step, [field]: value } : step);
    setProcessSteps(updated);
    onSaveAll({ processSteps: updated });
  };

  // Software rating update
  const handleSoftwareRatingChange = (id: string, rating: number) => {
    const updated = software.map((s) => (s.id === id ? { ...s, rating: Math.min(5, Math.max(1, rating)) } : s));
    setSoftware(updated);
    onSaveAll({ software: updated });
  };

  // Achievement update
  const handleAchievementChange = (id: string, value: string) => {
    const updated = achievements.map((a) => (a.id === id ? { ...a, value } : a));
    setAchievements(updated);
    onSaveAll({ achievements: updated });
  };

  // Experience Timeline CRUD
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;

    let updated: Experience[];
    if (isNewExp) {
      updated = [...experience, editingExp].sort((a, b) => b.year.localeCompare(a.year));
    } else {
      updated = experience.map((exp) => (exp.id === editingExp.id ? editingExp : exp));
    }

    setExperience(updated);
    onSaveAll({ experience: updated });
    setEditingExp(null);
    setIsNewExp(false);
    showToast('타임라인이 저장되었습니다.');
  };

  const handleDeleteExp = (id: string) => {
    const updated = experience.filter((exp) => exp.id !== id);
    setExperience(updated);
    onSaveAll({ experience: updated });
    showToast('타임라인 항목이 삭제되었습니다.');
  };

  const handleCreateNewExp = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: '',
      description: '',
    };
    setEditingExp(newExp);
    setIsNewExp(true);
  };

  // Testimonials CRUD
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;

    let updated: Testimonial[];
    if (isNewTestimonial) {
      updated = [...testimonials, editingTestimonial];
    } else {
      updated = testimonials.map((t) => (t.id === editingTestimonial.id ? editingTestimonial : t));
    }

    setTestimonials(updated);
    onSaveAll({ testimonials: updated });
    setEditingTestimonial(null);
    setIsNewTestimonial(false);
    showToast('추천사가 저장되었습니다.');
  };

  const handleDeleteTestimonial = (id: string) => {
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    onSaveAll({ testimonials: updated });
    showToast('추천사가 삭제되었습니다.');
  };

  const handleCreateNewTestimonial = () => {
    const newTest: Testimonial = {
      id: `test-${Date.now()}`,
      name: '',
      role: '',
      content: '',
      company: '',
    };
    setEditingTestimonial(newTest);
    setIsNewTestimonial(true);
  };

  // Export & Import backup
  const handleExportData = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jsr-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('백업 파일이 다운로드되었습니다.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImport(content);
      if (success) {
        showToast('성공적으로 데이터를 가져왔습니다! 페이지가 갱신됩니다.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert('백업 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('정말 모든 데이터를 기본 설정(초기화)으로 되돌리시겠습니까? 추가된 모든 데이터가 손실됩니다.')) {
      onReset();
      showToast('기본 설정으로 초기화되었습니다.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex items-center justify-center p-4 text-white font-sans">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 z-50 bg-[#B021FF] text-white px-6 py-3 rounded-md shadow-lg font-medium tracking-wide flex items-center gap-2 border border-purple-400"
          >
            <LucideIcon name="Check" className="text-white" size={18} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-5xl bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-black border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B021FF] animate-pulse"></span>
            <h2 className="text-lg font-medium tracking-wider text-white flex items-center gap-1.5 uppercase font-mono">
              <LucideIcon name="Settings" size={16} /> Portfolio Control Console
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <LucideIcon name="X" size={20} />
          </button>
        </div>

        {/* Lock Screen */}
        {!isUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-[#B021FF]/10 border border-[#B021FF]/30 rounded-full flex items-center justify-center mx-auto mb-6 text-[#B021FF]">
                <LucideIcon name="Lock" size={28} />
              </div>
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">관리자 모드 활성화</h3>
              <p className="text-xs text-gray-400 mb-6 font-sans">포트폴리오 내용 수정을 위해 비밀번호를 입력해주세요.</p>
              
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded px-4 py-3 text-sm text-white text-center font-mono tracking-widest"
                    autoFocus
                  />
                </div>
                {errorMsg && (
                  <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1">
                    <LucideIcon name="AlertCircle" size={14} /> {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#B021FF] hover:bg-[#991be0] active:scale-[0.98] transition-all rounded text-sm font-semibold tracking-wide uppercase shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  Unlock Access
                </button>
              </form>
            </motion.div>
          </div>
        ) : (
          /* Main Content - Unlocked state */
          <div className="flex flex-1 overflow-hidden min-h-[500px]">
            {/* Sidebar Navigation */}
            <div className="w-56 bg-black border-r border-white/10 p-4 flex flex-col justify-between">
              <div className="space-y-1">
                {[
                  { id: 'profile', label: '프로필 & 연락처', icon: 'User' },
                  { id: 'projects', label: '프로젝트 관리', icon: 'Film' },
                  { id: 'process', label: '제작 프로세스', icon: 'Sparkles' },
                  { id: 'skills-software', label: '역량 및 소프트웨어', icon: 'Palette' },
                  { id: 'timeline', label: '경력 타임라인', icon: 'Clock' },
                  { id: 'gallery', label: '미디어 갤러리', icon: 'Image' },
                  { id: 'achievements', label: '성과 지표', icon: 'Award' },
                  { id: 'backup', label: '백업 & 데이터관리', icon: 'Download' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setEditingProject(null);
                      setEditingExp(null);
                      setEditingTestimonial(null);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#B021FF] text-white shadow-md shadow-purple-600/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LucideIcon name={tab.icon} size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="text-xs text-gray-500 hover:text-red-400 flex items-center justify-center gap-1.5 w-full py-2 hover:bg-white/5 rounded transition-all cursor-pointer"
                >
                  <LucideIcon name="Unlock" size={12} /> Console Lock
                </button>
              </div>
            </div>

            {/* Editing Panel */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#161616]">
              {/* TAB: PROFILE & CONTACTS */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight text-left">프로필 & 인적사항 수정</h3>
                    <p className="text-xs text-gray-400 mt-1 text-left">포트폴리오 대문, 소개 문구, 그리고 연락처 정보를 모두 여기서 수정해보세요.</p>
                  </div>

                  {/* Profile Image Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">대표 프로필 사진</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-white/10 rounded-lg p-4">
                      {/* Preview */}
                      <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-lg bg-black/20 overflow-hidden aspect-[4/5] max-w-[150px] mx-auto relative group">
                        {aboutProfileImg ? (
                          <img
                            src={aboutProfileImg}
                            alt="Profile Preview"
                            className="w-full h-full object-cover filter grayscale contrast-125"
                          />
                        ) : (
                          <div className="text-center p-3 text-gray-500">
                            <LucideIcon name="Image" size={24} className="mx-auto mb-1 text-gray-600" />
                            <span className="text-[10px] block font-mono">NO IMAGE</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                        <div className="space-y-1.5 text-left">
                          <span className="text-[10px] text-gray-400 font-medium block">방법 1: 내 컴퓨터에서 프로필 사진 파일 업로드</span>
                          <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                            <LucideIcon name="Upload" size={14} />
                            <span>프로필 사진 선택...</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImageFile(file);
                                    const serverUrl = await uploadFileToServer(compressed);
                                    onSaveAll({ aboutProfileImg: serverUrl });
                                    showToast('프로필 이미지가 변경되었습니다.');
                                  } catch (err) {
                                    console.error('Profile photo upload failed:', err);
                                    alert('프로필 사진 저장에 실패했습니다. (서버 연결 실패)');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-gray-500">PNG, JPG, WEBP 이미지 파일을 권장합니다. (4:5 비율 최적)</p>
                        </div>

                        <div className="border-t border-white/5 pt-2 space-y-1.5 text-left">
                          <span className="text-[10px] text-gray-400 font-medium block">방법 2: 외부 이미지 URL 직접 입력</span>
                          <input
                            type="text"
                            value={aboutProfileImg}
                            onChange={(e) => {
                              onSaveAll({ aboutProfileImg: e.target.value });
                            }}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="https://images.unsplash.com/... 등 이미지 주소 입력"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const updatedInfo: ProfileInfo = {
                        name: profName,
                        subtitle: profSubtitle,
                        roles: profRoles,
                        introHeader: profIntroHeader,
                        introBio: profIntroBio,
                        age: profAge,
                        location: profLocation,
                        experienceYears: profExperienceYears,
                        email: profEmail,
                        phone: profPhone,
                        kakao: profKakao,
                        instagram: profInstagram,
                        youtube: profYoutube,
                        github: profGithub,
                        heroVideoUrl: profHeroVideoUrl,
                      };
                      onSaveAll({ profileInfo: updatedInfo });
                      showToast('프로필 정보가 안전하게 저장되었습니다!');
                    }}
                    className="space-y-6 bg-black/40 border border-white/10 rounded-lg p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">이름</label>
                        <input
                          type="text"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: 정승리"
                          required
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">메인 슬로건 / 서브타이틀</label>
                        <input
                          type="text"
                          value={profSubtitle}
                          onChange={(e) => setProfSubtitle(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: CREATIVE VIDEO DIRECTING PORTFOLIO"
                        />
                      </div>

                      {/* Roles */}
                      <div className="space-y-1 md:col-span-2 text-left">
                        <label className="text-xs text-gray-300 block font-medium">직무 분야 (구분자 • 포함)</label>
                        <input
                          type="text"
                          value={profRoles}
                          onChange={(e) => setProfRoles(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: VIDEO PRODUCER • EDITOR • STORYTELLER"
                        />
                      </div>

                      {/* Intro Header */}
                      <div className="space-y-1 md:col-span-2 text-left">
                        <label className="text-xs text-gray-300 block font-medium">자기소개 헤드라인 (HTML 줄바꿈 가능)</label>
                        <input
                          type="text"
                          value={profIntroHeader}
                          onChange={(e) => setProfIntroHeader(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="소개 헤드라인 입력"
                        />
                      </div>

                      {/* Intro Bio */}
                      <div className="space-y-1 md:col-span-2 text-left">
                        <label className="text-xs text-gray-300 block font-medium">자기소개 본문</label>
                        <textarea
                          value={profIntroBio}
                          onChange={(e) => setProfIntroBio(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white min-h-[80px]"
                          placeholder="자기소개를 자세히 작성해주세요."
                        />
                      </div>

                      {/* Age */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">나이 / 연도구분</label>
                        <input
                          type="text"
                          value={profAge}
                          onChange={(e) => setProfAge(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: 19 // Youth"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">활동 지역</label>
                        <input
                          type="text"
                          value={profLocation}
                          onChange={(e) => setProfLocation(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: Sejong City, Korea"
                        />
                      </div>

                      {/* Experience Years */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">경력 및 숙련도 설명</label>
                        <input
                          type="text"
                          value={profExperienceYears}
                          onChange={(e) => setProfExperienceYears(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: 2+ Years // All-Rounder"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">이메일 주소</label>
                        <input
                          type="email"
                          value={profEmail}
                          onChange={(e) => setProfEmail(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: gvcssjofftherecord@gmail.com"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">연락처 전화번호</label>
                        <input
                          type="text"
                          value={profPhone}
                          onChange={(e) => setProfPhone(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: 010-XXXX-XXXX"
                        />
                      </div>

                      {/* Instagram */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">인스타그램 아이디 또는 주소</label>
                        <input
                          type="text"
                          value={profInstagram}
                          onChange={(e) => setProfInstagram(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: @seungri_video"
                        />
                      </div>

                      {/* Youtube */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs text-gray-300 block font-medium">유튜브 채널 또는 비디오 주소</label>
                        <input
                          type="text"
                          value={profYoutube}
                          onChange={(e) => setProfYoutube(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          placeholder="예: Seungri Jeong YT"
                        />
                      </div>

                      {/* Main Background Hero Video */}
                      <div className="space-y-2 md:col-span-2 border-t border-white/5 pt-4">
                        <label className="text-xs font-semibold text-[#B021FF] uppercase tracking-wider block text-left">
                          메인 화면 배경 비디오 설정 (Subtle Background Video)
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 border border-white/10 rounded-lg p-4">
                          {/* URL Input */}
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] text-gray-400 font-medium block">방법 1: 외부 비디오 직접 링크 주소 입력 (.mp4 등)</span>
                            <input
                              type="text"
                              value={profHeroVideoUrl}
                              onChange={(e) => setProfHeroVideoUrl(e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-mono"
                              placeholder="예: https://assets.mixkit.co/videos/preview/...mp4"
                            />
                            {profHeroVideoUrl && (
                              <button
                                type="button"
                                onClick={() => setProfHeroVideoUrl('')}
                                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 cursor-pointer font-sans"
                              >
                                <LucideIcon name="Trash2" size={10} /> 배경 비디오 초기화
                              </button>
                            )}
                          </div>

                          {/* Direct File Upload */}
                          <div className="space-y-1.5 text-left border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400 font-medium block">방법 2: 내 컴퓨터에서 배경 비디오 파일 직접 업로드 (최대 300MB)</span>
                            <div className="flex items-center gap-3 mt-1">
                              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                                {heroVideoUploading ? (
                                  <>
                                    <LucideIcon name="Loader" size={14} className="animate-spin" />
                                    <span>서버로 업로드 중...</span>
                                  </>
                                ) : (
                                  <>
                                    <LucideIcon name="Upload" size={14} />
                                    <span>배경 비디오 선택 (MP4)...</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="video/*"
                                  disabled={heroVideoUploading}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 300 * 1024 * 1024) {
                                        alert('파일 크기가 너무 큽니다. (최대 300MB)');
                                        return;
                                      }
                                      setHeroVideoUploading(true);
                                      try {
                                        const serverUrl = await uploadFileToServer(file);
                                        setProfHeroVideoUrl(serverUrl);
                                        showToast('배경 비디오가 성공적으로 업로드 및 동기화되었습니다!');
                                      } catch (err) {
                                        console.error('Hero video upload failed:', err);
                                        alert('배경 비디오 파일 업로드에 실패했습니다. (서버 연결 실패)');
                                      } finally {
                                        setHeroVideoUploading(false);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              {profHeroVideoUrl && (
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                  <LucideIcon name="Check" size={12} /> 적용됨
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                          💡 <span className="text-[#B021FF] font-semibold">동기화 완료:</span> 
                          서버 업로드를 통해 크롬, 모바일, 태블릿 등 모든 환경에서 완벽히 동일한 배경 비디오가 실시간으로 동기화되어 재생됩니다. (서버가 변경 사항을 직접 서빙하며, 최대 300MB 고용량 파일을 지원합니다)
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98]"
                      >
                        <LucideIcon name="Save" size={14} /> 프로필 정보 저장하기
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: PROJECTS */}
              {activeTab === 'projects' && (
                <div>
                  {!editingProject ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-semibold text-white tracking-tight">작품 목록</h3>
                          <p className="text-xs text-gray-400 mt-1">포트폴리오에 표시될 영상을 기획안과 함께 등록해보세요.</p>
                        </div>
                        <button
                          onClick={handleCreateNewProject}
                          className="px-4 py-2 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold tracking-wider flex items-center gap-1.5 uppercase transition-all cursor-pointer"
                        >
                          <LucideIcon name="Plus" size={14} /> Add Project
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {projects.map((proj) => (
                          <div
                            key={proj.id}
                            className="bg-black/40 border border-white/10 hover:border-white/20 p-4 rounded-lg flex justify-between items-center transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <SafeImage
                                src={proj.thumbnail}
                                alt={proj.title}
                                className="w-20 h-12 object-cover rounded border border-white/10 bg-zinc-900"
                              />
                              <div className="text-left">
                                <h4 className="text-xs font-semibold text-white">{proj.title}</h4>
                                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-1 block">
                                  {proj.category} • {proj.period}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProject(proj);
                                  setIsNewProject(false);
                                  setTempTags((proj.tags || []).join(', '));
                                  setTempRoles((proj.roles || []).join(', '));
                                }}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-gray-300 hover:text-white transition-all cursor-pointer"
                                title="수정"
                              >
                                <LucideIcon name="Edit" size={14} />
                              </button>
                              
                              {deletingProjectId === proj.id ? (
                                <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded p-1">
                                  <span className="text-[10px] text-red-400 font-semibold px-1">삭제?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteProject(proj.id);
                                      setDeletingProjectId(null);
                                    }}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    확인
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingProjectId(null)}
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[10px] font-medium cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingProjectId(proj.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                  title="삭제"
                                >
                                  <LucideIcon name="Trash2" size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Project Editing Form */
                    <form onSubmit={handleSaveProject} className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h3 className="text-base font-semibold text-white">
                          {isNewProject ? '새 프로젝트 추가' : '프로젝트 수정'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProject(null);
                            setIsNewProject(false);
                          }}
                          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-all"
                        >
                          돌아가기
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">프로젝트 제목</label>
                          <input
                            type="text"
                            value={editingProject.title}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="예: Goodbye Sejong"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">카테고리</label>
                          <select
                            value={editingProject.category}
                            onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as ProjectCategory })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          >
                            <option value="Documentary">Documentary</option>
                            <option value="Short">Short (단편영화)</option>
                            <option value="Event">Event (학교 행사 등)</option>
                            <option value="Interview">Interview (인터뷰)</option>
                            <option value="Promotion">Promotion (홍보영상)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">제작 기간</label>
                          <input
                            type="text"
                            value={editingProject.period}
                            onChange={(e) => setEditingProject({ ...editingProject, period: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="예: 2026.01 ~ 2026.02"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium flex items-center gap-1">
                            프로젝트 등록일 <span className="text-[10px] text-[#C154FF]">(최신순 정렬 기준일)</span>
                          </label>
                          <input
                            type="date"
                            value={editingProject.createdAt ? new Date(editingProject.createdAt < 10000000000 ? editingProject.createdAt * 1000 : editingProject.createdAt).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const dateStr = e.target.value;
                              if (dateStr) {
                                setEditingProject({ ...editingProject, createdAt: new Date(dateStr).getTime() });
                              }
                            }}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">영상 분량</label>
                          <input
                            type="text"
                            value={editingProject.duration}
                            onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="예: 12분 40초"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">태그 (쉼표로 구분)</label>
                          <input
                            type="text"
                            value={tempTags}
                            onChange={(e) => setTempTags(e.target.value)}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="예: 다큐멘터리, 졸업, 감성"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">담당 역할 (쉼표로 구분)</label>
                          <input
                            type="text"
                            value={tempRoles}
                            onChange={(e) => setTempRoles(e.target.value)}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="예: 기획, 촬영, 편집"
                          />
                        </div>

                        {/* Technical Specifications Fields */}
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">감독명 (Technical Specifications)</label>
                          <input
                            type="text"
                            value={editingProject.directorName || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, directorName: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="기본값: 정승리 (Seungri Jeong)"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">후반 작업 소프트웨어</label>
                          <input
                            type="text"
                            value={editingProject.postProduction || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, postProduction: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="기본값: DaVinci Resolve Studio"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">영상 화면비 (Aspect Ratio)</label>
                          <input
                            type="text"
                            value={editingProject.aspectRatio || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, aspectRatio: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="기본값: 2.39:1 (Cinematic Wide)"
                          />
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-xs text-gray-300 block font-medium">대표 썸네일 이미지</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-white/10 rounded-lg p-4">
                            {/* Preview Area */}
                            <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-lg bg-black/20 overflow-hidden aspect-video relative group">
                              {editingProject.thumbnail ? (
                                <>
                                  <SafeImage
                                    src={editingProject.thumbnail}
                                    alt="Thumbnail Preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingProject({ ...editingProject, thumbnail: '' })}
                                      className="p-1.5 bg-red-500 hover:bg-red-600 rounded text-white text-xs transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <LucideIcon name="X" size={12} /> 삭제
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center p-3 text-gray-500">
                                  <LucideIcon name="Image" size={24} className="mx-auto mb-1 text-gray-600" />
                                  <span className="text-[10px] block font-mono">NO IMAGE</span>
                                </div>
                              )}
                            </div>

                            {/* Upload Area & URL Input */}
                            <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] text-gray-400 font-medium block">방법 1: 내 컴퓨터에서 사진 파일 업로드 (서버 직접 업로드)</span>
                                <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                                  <LucideIcon name="Upload" size={14} />
                                  <span>사진 파일 선택...</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const compressed = await compressImageFile(file);
                                          const serverUrl = await uploadFileToServer(compressed);
                                          setEditingProject({ ...editingProject, thumbnail: serverUrl });
                                          showToast('대표 썸네일 이미지가 업로드되었습니다.');
                                        } catch (err) {
                                          console.error('Thumbnail upload failed:', err);
                                          alert('썸네일 저장 중 에러가 발생했습니다.');
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <p className="text-[10px] text-gray-500">PNG, JPG, WEBP 이미지 파일을 지원합니다.</p>
                              </div>

                              <div className="border-t border-white/5 pt-2 space-y-1.5 text-left">
                                <span className="text-[10px] text-gray-400 font-medium block">방법 2: 외부 이미지 URL 직접 입력</span>
                                <input
                                  type="text"
                                  value={editingProject.thumbnail}
                                  onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                                  className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                                  placeholder="https://images.unsplash.com/... 등 이미지 주소 입력"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Video Field */}
                        <div className="space-y-2 col-span-1 md:col-span-2 border-t border-white/5 pt-4">
                          <label className="text-xs font-semibold text-[#B021FF] uppercase tracking-wider block text-left">
                            메인 상영 비디오 설정
                          </label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 border border-white/10 rounded-lg p-4">
                            {/* URL input */}
                            <div className="space-y-1.5 text-left">
                              <span className="text-[10px] text-gray-400 font-medium block">방법 1: 유튜브/비메오 주소 또는 동영상 파일 URL 입력</span>
                              <input
                                type="text"
                                value={editingProject.videoUrl}
                                onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                                className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-mono"
                                placeholder="예: https://www.youtube.com/watch?v=ScMzIvxBSi4 등"
                              />
                              {editingProject.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setEditingProject({ ...editingProject, videoUrl: '' })}
                                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 cursor-pointer font-sans"
                                >
                                  <LucideIcon name="Trash2" size={10} /> 영상 경로 초기화
                                </button>
                              )}
                            </div>

                            {/* Local File Upload */}
                            <div className="space-y-1.5 text-left border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
                              <span className="text-[10px] text-gray-400 font-medium block">방법 2: 내 컴퓨터에서 고용량 비디오 파일 직접 업로드 (최대 300MB)</span>
                              <div className="flex items-center gap-3 mt-1">
                                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                                  {videoUploading ? (
                                    <>
                                      <LucideIcon name="Loader" size={14} className="animate-spin" />
                                      <span>서버로 업로드 중...</span>
                                    </>
                                  ) : (
                                    <>
                                      <LucideIcon name="Upload" size={14} />
                                      <span>영상 파일 선택...</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="video/*"
                                    disabled={videoUploading}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 300 * 1024 * 1024) {
                                          alert('파일 크기가 너무 큽니다. (최대 300MB)');
                                          return;
                                        }
                                        setVideoUploading(true);
                                        try {
                                          const serverUrl = await uploadFileToServer(file);
                                          setEditingProject({
                                            ...editingProject,
                                            videoUrl: serverUrl
                                          });
                                          showToast('영상 파일이 서버에 성공적으로 업로드 및 동기화되었습니다!');
                                        } catch (err) {
                                          console.error('Video upload failed:', err);
                                          alert('비디오 파일 업로드에 실패했습니다. (서버 연결 실패)');
                                        } finally {
                                          setVideoUploading(false);
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                {editingProject.videoUrl && (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                    <LucideIcon name="Check" size={12} /> 적용됨
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                업로드된 영상은 서버에 직접 보관되어 모든 장치(크롬, 모바일)에서 새로고침 후에도 유지 및 스트리밍됩니다.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Hover Video Field */}
                        <div className="space-y-2 col-span-1 md:col-span-2 border-t border-white/5 pt-4">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block text-left">
                            마우스 오버 재생용 프리뷰 비디오 설정
                          </label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 border border-white/10 rounded-lg p-4">
                            {/* URL input */}
                            <div className="space-y-1.5 text-left">
                              <span className="text-[10px] text-gray-400 font-medium block">방법 1: 프리뷰용 외부 영상 주소 입력 (MP4 등)</span>
                              <input
                                type="text"
                                value={editingProject.hoverVideoUrl || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, hoverVideoUrl: e.target.value })}
                                className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-mono"
                                placeholder="예: https://assets.mixkit.co/... 또는 유튜브 주소"
                              />
                              {editingProject.hoverVideoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setEditingProject({ ...editingProject, hoverVideoUrl: '' })}
                                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 cursor-pointer font-sans"
                                >
                                  <LucideIcon name="Trash2" size={10} /> 프리뷰 영상 초기화
                                </button>
                              )}
                            </div>

                            {/* Local File Upload */}
                            <div className="space-y-1.5 text-left border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
                              <span className="text-[10px] text-gray-400 font-medium block">방법 2: 내 컴퓨터에서 프리뷰용 짤막한 영상 파일 직접 업로드 (최대 300MB)</span>
                              <div className="flex items-center gap-3 mt-1">
                                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                                  {hoverVideoUploading ? (
                                    <>
                                      <LucideIcon name="Loader" size={14} className="animate-spin" />
                                      <span>서버로 업로드 중...</span>
                                    </>
                                  ) : (
                                    <>
                                      <LucideIcon name="Upload" size={14} />
                                      <span>프리뷰 영상 선택...</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="video/*"
                                    disabled={hoverVideoUploading}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 300 * 1024 * 1024) {
                                          alert('파일 크기가 너무 큽니다. (최대 300MB)');
                                          return;
                                        }
                                        setHoverVideoUploading(true);
                                        try {
                                          const serverUrl = await uploadFileToServer(file);
                                          setEditingProject({
                                            ...editingProject,
                                            hoverVideoUrl: serverUrl
                                          });
                                          showToast('마우스 오버 프리뷰 영상이 성공적으로 업로드 및 동기화되었습니다!');
                                        } catch (err) {
                                          console.error('Preview video upload failed:', err);
                                          alert('프리뷰 비디오 파일 업로드에 실패했습니다. (서버 연결 실패)');
                                        } finally {
                                          setHoverVideoUploading(false);
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                {editingProject.hoverVideoUrl && (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                    <LucideIcon name="Check" size={12} /> 적용됨
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                카드 위에 마우스를 올렸을 때 소리 없이 반복 재생(Loop)되는 짧고 가벼운 무음 영상을 추천합니다.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer py-2">
                            <input
                              type="checkbox"
                              checked={editingProject.isFeatured}
                              onChange={(e) => setEditingProject({ ...editingProject, isFeatured: e.target.checked })}
                              className="w-4 h-4 rounded text-[#B021FF] bg-black/60 border-white/15 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-xs text-gray-300 font-medium">메인 화면 대표작(FEATURED)으로 설정</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">한줄 및 간단 요약</label>
                          <textarea
                            value={editingProject.description}
                            onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white min-h-[60px]"
                            placeholder="작품에 대한 간단한 소개를 작성해주세요."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">제작 의도 & 감독 코멘트</label>
                          <textarea
                            value={editingProject.directorNotes}
                            onChange={(e) => setEditingProject({ ...editingProject, directorNotes: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white min-h-[100px]"
                            placeholder="감독으로서 이 작품을 통해 담고 싶었던 메시지나 기획 철학을 입력하세요."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 block font-medium">기획 과정 및 프로덕션 단계</label>
                          <textarea
                            value={editingProject.planningProcess}
                            onChange={(e) => setEditingProject({ ...editingProject, planningProcess: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white min-h-[100px]"
                            placeholder="예: 1단계: 아이디어 회의 -> 2단계: 프리 프로덕션..."
                          />
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-xs text-gray-300 block font-medium">비하인드 컷 이미지 목록</label>
                          <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-4">
                            {/* Grid of existing behindScenes */}
                            {editingProject.behindScenes.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {editingProject.behindScenes.map((url, idx) => (
                                  <div key={idx} className="relative aspect-video rounded-lg border border-white/10 overflow-hidden bg-black/20 group">
                                    <SafeImage src={url} alt={`Behind Cut ${idx+1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-1 text-center">
                                      <span className="text-[9px] font-mono text-gray-400 mb-1 block">BEHIND #{idx+1}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = editingProject.behindScenes.filter((_, i) => i !== idx);
                                          setEditingProject({ ...editingProject, behindScenes: updated });
                                        }}
                                        className="p-1 bg-red-500 hover:bg-red-600 rounded text-white text-[10px] transition-all flex items-center gap-0.5 cursor-pointer active:scale-95"
                                      >
                                        <LucideIcon name="Trash2" size={10} /> 삭제
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500 border border-dashed border-white/10 rounded-lg bg-black/10">
                                <LucideIcon name="Image" size={24} className="mx-auto mb-1 text-gray-600" />
                                <span className="text-[11px] font-mono">등록된 비하인드 사진이 없습니다.</span>
                              </div>
                            )}

                            {/* Add actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                              {/* Upload */}
                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] text-gray-400 font-medium block">방법 1: 내 컴퓨터에서 사진 파일 추가</span>
                                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                                  <LucideIcon name="Upload" size={12} />
                                  <span>사진 선택 및 추가...</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) {
                                        for (let i = 0; i < files.length; i++) {
                                          const file = files[i];
                                          try {
                                            const storageKey = `behind-${editingProject.id}-${Date.now()}-${i}`;
                                            const compressed = await compressImageFile(file);
                                            await saveVideoToIndexedDB(storageKey, compressed);
                                            uploadMediaToFirestore(storageKey, compressed).catch(console.error);
                                            setEditingProject((prev) => {
                                              if (!prev) return prev;
                                              const localUrl = `local-image:${storageKey}`;
                                              if (prev.behindScenes.includes(localUrl)) return prev;
                                              return {
                                                ...prev,
                                                behindScenes: [...prev.behindScenes, localUrl]
                                              };
                                            });
                                          } catch (err) {
                                            console.error('Behind image upload failed:', err);
                                          }
                                        }
                                        showToast('비하인드 사진이 안전하게 추가되었습니다.');
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              {/* URL Add */}
                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] text-gray-400 font-medium block">방법 2: 외부 이미지 URL로 추가</span>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    id="newBehindSceneUrlInput"
                                    placeholder="https://images.unsplash.com/... 등 주소 입력"
                                    className="flex-1 bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded px-2 py-1 text-xs text-white"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.currentTarget;
                                        const val = input.value.trim();
                                        if (val) {
                                          setEditingProject({
                                            ...editingProject,
                                            behindScenes: [...editingProject.behindScenes, val]
                                          });
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById('newBehindSceneUrlInput') as HTMLInputElement;
                                      const val = input?.value.trim();
                                      if (val) {
                                        setEditingProject({
                                          ...editingProject,
                                          behindScenes: [...editingProject.behindScenes, val]
                                        });
                                        input.value = '';
                                      }
                                    }}
                                    className="px-3 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-95"
                                  >
                                    추가
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-1 md:col-span-2 border-t border-white/5 pt-4">
                            <label className="text-xs text-gray-300 block font-medium">편집 작업실/워크스페이스 캡쳐 이미지</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-white/10 rounded-lg p-4">
                              {/* Preview Area */}
                              <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-lg bg-black/20 overflow-hidden aspect-video relative group">
                                {editingProject.editWorkspaceImg ? (
                                  <>
                                    <img
                                      src={editingProject.editWorkspaceImg}
                                      alt="Workspace Preview"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingProject({ ...editingProject, editWorkspaceImg: '' })}
                                        className="p-1.5 bg-red-500 hover:bg-red-600 rounded text-white text-xs transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <LucideIcon name="X" size={12} /> 삭제
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-3 text-gray-500">
                                    <LucideIcon name="Image" size={24} className="mx-auto mb-1 text-gray-600" />
                                    <span className="text-[10px] block font-mono">NO IMAGE</span>
                                  </div>
                                )}
                              </div>

                              {/* Upload & URL */}
                              <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                                <div className="space-y-1.5 text-left">
                                  <span className="text-[10px] text-gray-400 font-medium block">방법 1: 내 컴퓨터에서 작업실 캡쳐 사진 업로드</span>
                                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                                    <LucideIcon name="Upload" size={14} />
                                    <span>작업실 캡쳐 선택...</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const storageKey = `workspace-${editingProject.id}-${Date.now()}`;
                                            const compressed = await compressImageFile(file);
                                            await saveVideoToIndexedDB(storageKey, compressed);
                                            uploadMediaToFirestore(storageKey, compressed).catch(console.error);
                                            setEditingProject({ ...editingProject, editWorkspaceImg: `local-image:${storageKey}` });
                                            showToast('작업실 캡쳐 사진이 등록되었습니다.');
                                          } catch (err) {
                                            console.error('Workspace image upload failed:', err);
                                            alert('작업실 사진 저장 중 에러가 발생했습니다.');
                                          }
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                <div className="border-t border-white/5 pt-2 space-y-1.5 text-left">
                                  <span className="text-[10px] text-gray-400 font-medium block">방법 2: 외부 이미지 URL 직접 입력</span>
                                  <input
                                    type="text"
                                    value={editingProject.editWorkspaceImg || ''}
                                    onChange={(e) => setEditingProject({ ...editingProject, editWorkspaceImg: e.target.value })}
                                    className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                                    placeholder="https://images.unsplash.com/... 등 작업 이미지 주소"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 col-span-1 md:col-span-2">
                            <label className="text-xs text-gray-300 block font-medium">소감 및 배운 점</label>
                            <textarea
                              value={editingProject.reflection}
                              onChange={(e) => setEditingProject({ ...editingProject, reflection: e.target.value })}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white min-h-[60px]"
                              placeholder="제작이 끝난 뒤 깨달은 교훈이나 스펙 성장 포인트를 입력하세요."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProject(null);
                            setIsNewProject(false);
                          }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300 transition-all cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <LucideIcon name="Save" size={14} /> Save Project
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB: SKILLS & SOFTWARE */}
              {activeTab === 'skills-software' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Profile Image Section */}
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight">About 프로필 사진 수정</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-4">About 소개 단락 옆에 노출되는 프로필 대표 사진을 관리합니다.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-white/10 rounded-lg p-4">
                      {/* Preview */}
                      <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-lg bg-black/20 overflow-hidden aspect-[4/5] max-w-[180px] mx-auto relative group">
                        {aboutProfileImg ? (
                          <SafeImage
                            src={aboutProfileImg}
                            alt="Profile Preview"
                            className="w-full h-full object-cover filter grayscale contrast-125"
                          />
                        ) : (
                          <div className="text-center p-3 text-gray-500">
                            <LucideIcon name="Image" size={24} className="mx-auto mb-1 text-gray-600" />
                            <span className="text-[10px] block font-mono">NO IMAGE</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                        <div className="space-y-1.5 text-left">
                          <span className="text-[10px] text-gray-400 font-medium block">방법 1: 내 컴퓨터에서 프로필 사진 파일 업로드 (서버 직접 업로드)</span>
                          <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#B021FF]/10 hover:bg-[#B021FF]/20 border border-[#B021FF]/30 hover:border-[#B021FF]/50 text-[#C154FF] hover:text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]">
                            <LucideIcon name="Upload" size={14} />
                            <span>프로필 사진 선택...</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImageFile(file);
                                    const serverUrl = await uploadFileToServer(compressed);
                                    onSaveAll({ aboutProfileImg: serverUrl });
                                    showToast('프로필 이미지가 안전하게 저장되었습니다.');
                                  } catch (err) {
                                    console.error('Profile image upload failed:', err);
                                    alert('프로필 이미지 저장에 실패했습니다. (서버 연결 실패)');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-gray-500">PNG, JPG, WEBP 이미지 파일을 권장합니다. (4:5 비율 최적)</p>
                        </div>

                        <div className="border-t border-white/5 pt-2 space-y-1.5 text-left">
                          <span className="text-[10px] text-gray-400 font-medium block">방법 2: 외부 이미지 URL 직접 입력</span>
                          <input
                            type="text"
                            value={aboutProfileImg}
                            onChange={(e) => {
                              onSaveAll({ aboutProfileImg: e.target.value });
                            }}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="https://images.unsplash.com/... 등 이미지 주소 입력"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-base font-semibold text-white tracking-tight">핵심 역량 그래프 조절</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-4">정승리님의 주요 강점 역량을 수치로 입력해보세요 (0~100%).</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="bg-black/40 border border-white/10 p-3.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-[#B021FF]/10 text-[#B021FF] rounded-md">
                              <LucideIcon name={skill.iconName} size={16} />
                            </div>
                            <span className="text-xs font-medium text-white">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={skill.percentage}
                              onChange={(e) => handleSkillChange(skill.id, parseInt(e.target.value) || 0)}
                              className="w-16 bg-black/60 border border-white/15 rounded p-1 text-center font-mono text-xs text-white"
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Software Section */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">사용 가능 프로그램 (별점)</h3>
                        <p className="text-xs text-gray-400 mt-1">각 소프트웨어 숙련도를 1~5성으로 평정하고 부가 설명을 달거나 목록을 구성해보세요.</p>
                      </div>
                      {!isAddingSoftware && (
                        <button
                          type="button"
                          onClick={() => setIsAddingSoftware(true)}
                          className="px-3 py-1.5 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <LucideIcon name="Plus" size={12} /> 프로그램 추가
                        </button>
                      )}
                    </div>

                    {isAddingSoftware && (
                      <form onSubmit={handleAddSoftware} className="bg-black/50 border border-[#B021FF]/30 p-4 rounded-lg space-y-3 mb-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-400">프로그램 이름</label>
                            <input
                              type="text"
                              value={newSoftwareName}
                              onChange={(e) => setNewSoftwareName(e.target.value)}
                              className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                              placeholder="예: DaVinci Resolve, Premiere Pro 등"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-400">숙련도 별점</label>
                            <div className="flex gap-2.5 mt-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewSoftwareRating(star)}
                                  className="text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <LucideIcon name="Star" size={18} className={star <= newSoftwareRating ? 'fill-yellow-400' : 'text-gray-600'} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400">간단한 능력 설명 (선택)</label>
                          <input
                            type="text"
                            value={newSoftwareDesc}
                            onChange={(e) => setNewSoftwareDesc(e.target.value)}
                            className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                            placeholder="예: 멀티캠 편집 및 오디오 노이즈 감쇄 숙련"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingSoftware(false)}
                            className="px-3 py-1 bg-white/5 rounded text-[11px] text-gray-400 hover:text-white"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 bg-[#B021FF] rounded text-[11px] font-semibold text-white"
                          >
                            추가하기
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {software.map((sw) => (
                        <div key={sw.id} className="bg-black/40 border border-white/10 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 relative group">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-white">{sw.name}</h4>
                              {deletingSwId === sw.id ? (
                                <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded px-1.5 py-0.5">
                                  <span className="text-[9px] text-red-400 font-semibold">삭제?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteSoftware(sw.id);
                                      setDeletingSwId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold cursor-pointer"
                                  >
                                    확인
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingSwId(null)}
                                    className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[9px] font-medium cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingSwId(sw.id)}
                                  className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-all cursor-pointer flex items-center justify-center"
                                  title="프로그램 삭제"
                                >
                                  <LucideIcon name="Trash2" size={11} />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={sw.desc || ''}
                              onChange={(e) => {
                                const updated = software.map((s) => (s.id === sw.id ? { ...s, desc: e.target.value } : s));
                                setSoftware(updated);
                                onSaveAll({ software: updated });
                              }}
                              className="w-full bg-black/30 border border-white/5 rounded px-2 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-[#B021FF]"
                              placeholder="프로그램 활용 역량 상세 설명"
                            />
                          </div>
                          <div className="flex items-center gap-2 self-start md:self-center">
                            <span className="text-[11px] text-gray-400">숙련도 별점:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => handleSoftwareRatingChange(sw.id, star)}
                                  className="text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <LucideIcon name="Star" size={16} className={star <= sw.rating ? 'fill-yellow-400' : 'text-gray-600'} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TIMELINE & TESTIMONIALS */}
              {activeTab === 'timeline' && (
                <div className="space-y-8">
                  {/* Timeline (Experience) Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-white">경력 및 활동 타임라인</h3>
                        <p className="text-xs text-gray-400 mt-1">포트폴리오 하단 연혁을 한눈에 추가/수정해보세요.</p>
                      </div>
                      {!editingExp && (
                        <button
                          type="button"
                          onClick={handleCreateNewExp}
                          className="px-3 py-1.5 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <LucideIcon name="Plus" size={12} /> Add Event
                        </button>
                      )}
                    </div>

                    {editingExp && (
                      <form onSubmit={handleSaveExperience} className="bg-black/50 border border-[#B021FF]/30 p-4 rounded-lg space-y-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-400">연도/월 (예: 2026.04)</label>
                            <input
                              type="text"
                              value={editingExp.year}
                              onChange={(e) => setEditingExp({ ...editingExp, year: e.target.value })}
                              className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                              placeholder="2026.04"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-400">이벤트/활동명</label>
                            <input
                              type="text"
                              value={editingExp.title}
                              onChange={(e) => setEditingExp({ ...editingExp, title: e.target.value })}
                              className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                              placeholder="예: 단편 영화 제작"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400">설명</label>
                          <textarea
                            value={editingExp.description}
                            onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white min-h-[60px]"
                            placeholder="활동 내용을 간략히 요약하여 입력해주세요."
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingExp(null)}
                            className="px-3 py-1 bg-white/5 rounded text-[11px] text-gray-400 hover:text-white"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 bg-[#B021FF] rounded text-[11px] font-semibold text-white"
                          >
                            저장
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {experience.map((exp) => (
                        <div key={exp.id} className="bg-black/30 border border-white/10 p-3 rounded-lg flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[#B021FF] font-semibold">{exp.year}</span>
                            <div>
                              <span className="font-semibold text-white">{exp.title}</span>
                              <span className="text-gray-400 ml-2 block sm:inline">{exp.description}</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => {
                                setEditingExp(exp);
                                setIsNewExp(false);
                              }}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                            >
                              <LucideIcon name="Edit" size={12} />
                            </button>
                            {deletingExpId === exp.id ? (
                              <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded p-1">
                                <span className="text-[9px] text-red-400 font-semibold px-1">삭제?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteExp(exp.id);
                                    setDeletingExpId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold cursor-pointer"
                                >
                                  확인
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingExpId(null)}
                                  className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[9px] font-medium cursor-pointer"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingExpId(exp.id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded cursor-pointer"
                              >
                                <LucideIcon name="Trash2" size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4 border-t border-white/10 pt-6">
                      <div>
                        <h3 className="text-base font-semibold text-white">협업 동료 및 교사 추천사</h3>
                        <p className="text-xs text-gray-400 mt-1">포트폴리오의 신뢰도를 높여주는 한마디 후기를 추가해보세요.</p>
                      </div>
                      {!editingTestimonial && (
                        <button
                          type="button"
                          onClick={handleCreateNewTestimonial}
                          className="px-3 py-1.5 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <LucideIcon name="Plus" size={12} /> Add Review
                        </button>
                      )}
                    </div>

                    {editingTestimonial && (
                      <form onSubmit={handleSaveTestimonial} className="bg-black/50 border border-[#B021FF]/30 p-4 rounded-lg space-y-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-400">작성자 이름</label>
                            <input
                              type="text"
                              value={editingTestimonial.name}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                              className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                              placeholder="예: 홍길동"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-400">직책 및 직무</label>
                            <input
                              type="text"
                              value={editingTestimonial.role}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                              className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                              placeholder="예: 방송부 부장, 영화제 디렉터"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-400">소속 단체</label>
                            <input
                              type="text"
                              value={editingTestimonial.company || ''}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                              className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white"
                              placeholder="예: 세종고등학교, 비디오 동아리"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400">추천사 내용</label>
                          <textarea
                            value={editingTestimonial.content}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 rounded p-2 text-xs text-white min-h-[80px]"
                            placeholder="추천사 내용을 입력하세요."
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingTestimonial(null)}
                            className="px-3 py-1 bg-white/5 rounded text-[11px] text-gray-400 hover:text-white"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 bg-[#B021FF] rounded text-[11px] font-semibold text-white"
                          >
                            저장
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {testimonials.map((test) => (
                        <div key={test.id} className="bg-black/30 border border-white/10 p-3 rounded-lg flex justify-between items-center text-xs">
                          <div className="flex-1 pr-4">
                            <span className="font-semibold text-white">{test.name}</span>
                            <span className="text-gray-400 ml-1.5">({test.role} {test.company ? `| ${test.company}` : ''})</span>
                            <p className="text-[11px] text-gray-300 mt-1 line-clamp-1 italic">"{test.content}"</p>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => {
                                setEditingTestimonial(test);
                                setIsNewTestimonial(false);
                              }}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                            >
                              <LucideIcon name="Edit" size={12} />
                            </button>
                            {deletingTestimonialId === test.id ? (
                              <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 rounded p-1">
                                <span className="text-[9px] text-red-400 font-semibold px-1">삭제?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteTestimonial(test.id);
                                    setDeletingTestimonialId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold cursor-pointer"
                                >
                                  확인
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingTestimonialId(null)}
                                  className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[9px] font-medium cursor-pointer"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingTestimonialId(test.id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded cursor-pointer"
                              >
                                <LucideIcon name="Trash2" size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MEDIA GALLERY */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-white">미디어 갤러리 관리</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-6">촬영현장, 드론 캡쳐, 촬영 장비 및 연출 사진들을 직접 올리고 관리할 수 있습니다.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form to Add Gallery Item */}
                    <div className="lg:col-span-1 bg-black/40 border border-white/10 rounded-xl p-5 space-y-4 h-fit">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white border-b border-white/10 pb-2">새 미디어 등록</h4>
                      
                      <form onSubmit={handleAddGalleryItem} className="space-y-4">
                        <div className="space-y-1 text-left">
                          <label className="text-xs text-gray-300 block font-medium">카테고리 구분</label>
                          <select
                            value={newGalleryCategory}
                            onChange={(e) => setNewGalleryCategory(e.target.value)}
                            className="w-full bg-[#121212] border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                          >
                            <option value="촬영현장">🎥 촬영현장 (On Set)</option>
                            <option value="드론">🚁 드론 (Drone Capture)</option>
                            <option value="카메라">📷 카메라 & 연출 (Cam/Stills)</option>
                            <option value="스크린샷">🖥️ 스크린샷 (Workspace)</option>
                          </select>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-xs text-gray-300 block font-medium">사진 타이틀 / 한 줄 설명</label>
                          <input
                            type="text"
                            value={newGalleryTitle}
                            onChange={(e) => setNewGalleryTitle(e.target.value)}
                            className="w-full bg-[#121212] border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white"
                            placeholder="예: 촬영용 리그 세팅, 무제 등"
                          />
                        </div>

                        <div className="space-y-2 text-left">
                          <label className="text-xs text-gray-300 block font-medium">미디어 사진 첨부</label>
                          
                          <div className="border border-dashed border-white/15 rounded-lg bg-[#121212]/50 p-4 text-center flex flex-col items-center justify-center aspect-video overflow-hidden relative group">
                            {newGalleryImg ? (
                              <>
                                <SafeImage src={newGalleryImg} alt="New Gallery Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setNewGalleryImg('')}
                                  className="absolute top-2 right-2 p-1 bg-black/75 hover:bg-red-600 rounded-full text-white transition-all cursor-pointer"
                                  title="사진 제거"
                                >
                                  <LucideIcon name="X" size={12} />
                                </button>
                              </>
                            ) : (
                              <div className="space-y-2 text-gray-500">
                                <LucideIcon name="UploadCloud" size={24} className="mx-auto text-gray-600 animate-pulse" />
                                <p className="text-[10px] font-mono uppercase tracking-wider">사진 파일 업로드</p>
                                <label className="inline-block px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded text-[10px] font-semibold text-white transition-all cursor-pointer active:scale-95">
                                  컴퓨터에서 선택...
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const compressed = await compressImageFile(file);
                                          const serverUrl = await uploadFileToServer(compressed);
                                          setNewGalleryImg(serverUrl);
                                          showToast('갤러리 사진이 준비되었습니다.');
                                        } catch (err) {
                                          console.error('Gallery image upload failed:', err);
                                          alert('갤러리 사진 저장에 실패했습니다. (서버 연결 실패)');
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-left pt-2">
                            <span className="text-[10px] text-gray-500 font-medium block">또는 외부 이미지 URL 직접 입력</span>
                            <input
                              type="text"
                              value={newGalleryImg.startsWith('data:') ? '' : newGalleryImg}
                              onChange={(e) => setNewGalleryImg(e.target.value)}
                              className="w-full bg-[#121212] border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-1.5 text-xs text-white"
                              placeholder="https://images.unsplash.com/..."
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-[#B021FF] hover:bg-[#991be0] rounded text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <LucideIcon name="Plus" size={12} /> 추가하기
                        </button>
                      </form>
                    </div>

                    {/* Gallery Items Grid */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-white">등록된 미디어 ({gallery.length}개)</h4>
                      </div>

                      {gallery.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {gallery.map((item) => (
                            <div key={item.id} className="bg-black/30 border border-white/10 rounded-lg overflow-hidden group relative aspect-video flex flex-col justify-end">
                              <SafeImage src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2.5">
                                <div className="flex justify-between items-start">
                                  <span className="px-1.5 py-0.5 bg-[#B021FF] text-white rounded text-[9px] font-bold tracking-wide">
                                    {item.category}
                                  </span>
                                  {deletingGalleryId === item.id ? (
                                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 rounded p-1 z-10">
                                      <span className="text-[8px] text-red-400 font-semibold px-0.5">삭제?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleDeleteGalleryItem(item.id);
                                          setDeletingGalleryId(null);
                                        }}
                                        className="px-1 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[8px] font-bold cursor-pointer"
                                      >
                                        예
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingGalleryId(null)}
                                        className="px-1 py-0.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[8px] font-medium cursor-pointer"
                                      >
                                        아니오
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingGalleryId(item.id)}
                                      className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white transition-all cursor-pointer z-10"
                                      title="이 항목 삭제"
                                    >
                                      <LucideIcon name="Trash2" size={10} />
                                    </button>
                                  )}
                                </div>
                                <span className="text-[11px] font-medium text-white truncate block">
                                  {item.title}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-lg bg-black/10">
                          <LucideIcon name="Image" size={32} className="mx-auto mb-2 text-gray-600 animate-bounce" />
                          <span className="text-xs font-mono">미디어 갤러리에 등록된 사진이 없습니다.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PROCESS STEPS */}
              {activeTab === 'process' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h3 className="text-base font-semibold text-white">비디오 제작 프로세스 수정</h3>
                    <p className="text-xs text-gray-400 mt-1">포트폴리오의 "Video Production Process" 섹션 내용을 실시간으로 직접 수정해보세요.</p>
                  </div>

                  <div className="space-y-4">
                    {processSteps.map((step, idx) => (
                      <div key={step.id || idx} className="bg-black/40 border border-white/10 p-5 rounded-lg space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 bg-[#B021FF]/10 text-[#B021FF] rounded-full">
                              Step {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-semibold text-white">{step.title || '새 단계'}</span>
                          </div>
                          
                          {/* Live preview icon */}
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <span>현재 아이콘:</span>
                            <div className="w-6 h-6 rounded bg-black/40 border border-white/10 flex items-center justify-center text-[#B021FF]">
                              <LucideIcon name={step.icon || 'Sparkles'} size={12} />
                            </div>
                            <span className="font-mono text-white text-[10px] bg-white/5 px-1 py-0.5 rounded">{step.icon}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-300 block font-medium">단계 이름 (한국어)</label>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleProcessStepChange(step.id, 'title', e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-sans"
                              placeholder="예: 아이디어"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-300 block font-medium">영문 서브타이틀</label>
                            <input
                              type="text"
                              value={step.sub}
                              onChange={(e) => handleProcessStepChange(step.id, 'sub', e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-mono uppercase"
                              placeholder="예: IDEA & INSPIRATION"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-300 block font-medium">Lucide 아이콘명</label>
                            <input
                              type="text"
                              value={step.icon}
                              onChange={(e) => handleProcessStepChange(step.id, 'icon', e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-mono"
                              placeholder="예: Sparkles, Camera, Film"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-300 block font-medium">상세 설명</label>
                          <textarea
                            value={step.desc}
                            onChange={(e) => handleProcessStepChange(step.id, 'desc', e.target.value)}
                            rows={2}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded p-2 text-xs text-white font-sans resize-none"
                            placeholder="이 단계의 진행 과정에 대해 설명해주세요..."
                          />
                        </div>

                        {/* Recommend popular icon tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9px] text-gray-500 mr-1 font-sans">추천 아이콘 단축키:</span>
                          {['Sparkles', 'FolderKanban', 'Camera', 'Film', 'MessageSquare', 'Award', 'Play', 'Eye', 'Tv', 'Sliders', 'Music'].map((iconName) => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => handleProcessStepChange(step.id, 'icon', iconName)}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                step.icon === iconName 
                                  ? 'bg-[#B021FF]/20 text-[#B021FF] border border-[#B021FF]/30' 
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {iconName}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: ACHIEVEMENTS */}
              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-white">시네마틱 성과 지표 수정</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-6">포트폴리오의 하이라이트 숫자를 직접 조절해보세요.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#B021FF]/10 text-[#B021FF] rounded">
                            <LucideIcon name={ach.iconName} size={16} />
                          </div>
                          <span className="text-xs font-semibold text-white">{ach.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">지표 값 (예: 15+)</label>
                            <input
                              type="text"
                              value={ach.value}
                              onChange={(e) => handleAchievementChange(ach.id, e.target.value)}
                              className="w-full bg-black/60 border border-white/15 rounded p-1.5 font-mono text-xs text-white"
                              placeholder="15+"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">지표 라벨</label>
                            <input
                              type="text"
                              value={ach.label}
                              onChange={(e) => {
                                const updated = achievements.map((a) => (a.id === ach.id ? { ...a, label: e.target.value } : a));
                                setAchievements(updated);
                                onSaveAll({ achievements: updated });
                              }}
                              className="w-full bg-black/60 border border-white/15 rounded p-1.5 text-xs text-white"
                              placeholder="Projects"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: BACKUP & DATA MANAGEMENT */}
              {activeTab === 'backup' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-base font-semibold text-white">포트폴리오 백업 및 복원</h3>
                    <p className="text-xs text-gray-400 mt-1">대학 입시, 외주 및 취업 시즌에 입력한 소중한 영상 정보들을 로컬 파일로 백업할 수 있습니다.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Backup box */}
                    <div className="bg-black/40 border border-white/10 p-6 rounded-lg space-y-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                        <LucideIcon name="Download" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">데이터 내보내기 (Backup)</h4>
                        <p className="text-xs text-gray-400 mt-1">현재까지의 프로젝트, 스킬, 타임라인 및 모든 수정 사항을 단일 JSON 백업 파일로 내보냅니다.</p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer"
                      >
                        Export JSON Backup
                      </button>
                    </div>

                    {/* Restore box */}
                    <div className="bg-black/40 border border-white/10 p-6 rounded-lg space-y-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center">
                        <LucideIcon name="Upload" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">데이터 가져오기 (Restore)</h4>
                        <p className="text-xs text-gray-400 mt-1">이전에 다운로드한 JSON 백업 파일을 올려서 포트폴리오를 완벽하게 복구합니다.</p>
                      </div>
                      <label className="w-full py-2.5 bg-green-600 hover:bg-green-700 active:scale-[0.98] rounded text-xs font-semibold uppercase tracking-wide text-center transition-all block cursor-pointer">
                        Import JSON Backup
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Reset to Default */}
                  <div className="bg-red-500/5 border border-red-500/25 p-5 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-xs font-semibold text-red-400 flex items-center justify-center sm:justify-start gap-1">
                        <LucideIcon name="AlertCircle" size={14} /> 공장 초기화 (Reset to Default)
                      </h4>
                      <p className="text-[11px] text-gray-400">모든 커스텀 등록 정보들을 영구적으로 지우고 "정승리 시네마틱 디폴트 포트폴리오" 상태로 되돌립니다.</p>
                    </div>
                    <button
                      onClick={handleResetData}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap"
                    >
                      Reset All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
