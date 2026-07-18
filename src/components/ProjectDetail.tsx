import React, { useEffect } from 'react';
import { Project } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion } from 'motion/react';
import { isYouTubeUrl, getFullEmbedUrl } from '../lib/videoUtils';
import { useResolveVideoUrl } from '../hooks/useResolveVideoUrl';
import { useResolveImageUrl } from '../hooks/useResolveImageUrl';
import { SafeImage } from './SafeImage';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
  const resolvedVideoUrl = useResolveVideoUrl(project.videoUrl);
  const resolvedThumbnail = useResolveImageUrl(project.thumbnail);

  // Prevent body scrolling when detail is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0F0F0F] text-white font-sans selection:bg-[#B021FF] selection:text-white"
    >
      {/* Dynamic Top Bar */}
      <div className="fixed top-0 inset-x-0 z-10 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md"
        >
          <LucideIcon name="ChevronLeft" size={14} /> Back to Work
        </button>
        <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
          PROJECT REVELATION // {project.category}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative h-[65vh] md:h-[75vh] w-full flex items-end overflow-hidden">
        {/* Widescreen Blurred Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 filter brightness-[0.45]"
          style={{ backgroundImage: `url(${resolvedThumbnail})` }}
        />
        {/* Gradient Shadow Map */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

        {/* Hero Meta Info */}
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pb-12 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="space-y-4"
          >
            <span className="inline-block text-[10px] font-mono tracking-widest uppercase text-[#B021FF] bg-[#B021FF]/10 border border-[#B021FF]/20 px-3 py-1 rounded">
              {project.category}
            </span>

            <h1 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-white leading-tight max-w-4xl uppercase">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-gray-300 border-t border-white/10 pt-4 max-w-2xl font-mono">
              <div className="flex items-center gap-1.5">
                <LucideIcon name="Calendar" size={14} className="text-gray-500" />
                <span className="text-gray-400">제작기간:</span> {project.period || '준비중'}
              </div>
              <div className="flex items-center gap-1.5">
                <LucideIcon name="Clock" size={14} className="text-gray-500" />
                <span className="text-gray-400">러닝타임:</span> {project.duration || '준비중'}
              </div>
              <div className="flex items-center gap-1.5">
                <LucideIcon name="Briefcase" size={14} className="text-gray-500" />
                <span className="text-gray-400">역할:</span> {(project.roles || []).join(' / ')}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Structural Body */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 space-y-16 md:space-y-24">
        
        {/* GRID: High Level Summary & Video Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Project core description & metadata */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
                01 // INTRODUCTION
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Overview</h2>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">{project.description}</p>
            </div>

            <div className="bg-[#121212] border border-white/10 p-5 rounded-lg space-y-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-400 font-mono">Technical Specifications</h3>
              <ul className="space-y-3.5 text-xs text-gray-300 font-mono">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Director</span>
                  <span>{project.directorName || '정승리 (Seungri Jeong)'}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Primary Role</span>
                  <span>{project.roles[0] || 'Director'}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Post-Production</span>
                  <span>{project.postProduction || 'DaVinci Resolve Studio'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Aspect Ratio</span>
                  <span>{project.aspectRatio || '2.39:1 (Cinematic Wide)'}</span>
                </li>
              </ul>
            </div>

            {/* Tags Box */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(project.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded text-gray-300 hover:border-white/25 hover:text-white transition-all cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Main Video Embed Player */}
          <div className="lg:col-span-8 space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
              02 // THE MASTERPIECE
            </span>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              {project.videoUrl ? (
                isYouTubeUrl(project.videoUrl) || project.videoUrl.includes('embed') ? (
                  <iframe
                    src={isYouTubeUrl(project.videoUrl) ? getFullEmbedUrl(project.videoUrl) : `${project.videoUrl}?autoplay=1&rel=0`}
                    title={project.title}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                ) : (
                  <video 
                    src={resolvedVideoUrl} 
                    controls 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <LucideIcon name="Video" size={48} className="mb-4 text-[#B021FF]/40 animate-pulse" />
                  <p className="text-sm font-semibold text-white">최종 영상 준비 중</p>
                  <p className="text-xs text-gray-400 mt-1">상세 최종본 편집 마스터링 단계에 있습니다.</p>
                </div>
              )}
            </div>
            <p className="text-xs text-center text-gray-500 font-mono">
              ▲ 2026 정승리 비디오 아카이브 — PLAY SCREENING (전체화면 지원)
            </p>
          </div>
        </div>

        {/* SECTION 3: Director's Notes & Intentions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-white/10 pt-16">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
              03 // INTENTIONS & PERSPECTIVES
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1 uppercase font-mono">Director Notes</h2>
            <p className="text-xs text-gray-400 mt-2">창작자로서 시청자에게 전하고자 했던 메시지, 시각 언어, 그리고 미학적 고집.</p>
          </div>
          <div className="lg:col-span-8 bg-[#121212] border border-white/10 p-8 md:p-12 rounded-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-white/5 pointer-events-none font-serif text-[180px] leading-none select-none">
              “
            </div>
            <p className="text-sm md:text-base text-gray-200 leading-relaxed whitespace-pre-line italic font-serif">
              {project.directorNotes}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#B021FF]"></span>
              <span className="text-xs text-gray-400 font-mono uppercase">감독 코멘터리 정승리</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Planning Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-white/10 pt-16">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
              04 // PLANNING & WORKFLOW
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1 uppercase font-mono">Production</h2>
            <p className="text-xs text-gray-400 mt-2">아이디어가 발아하여 기획, 촬영, 그리고 정교한 편집 과정을 거쳐 마스터피스가 되기까지.</p>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {(project.planningProcess || '').split('\n').map((step, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-[#121212] border border-white/5 rounded-lg hover:border-[#B021FF]/20 transition-all">
                  <div className="text-base font-bold font-mono text-[#B021FF] bg-[#B021FF]/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 font-medium whitespace-pre-line leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: Gallery / Behind Scenes & Captures */}
        {(project.behindScenes || []).length > 0 && (
          <div className="space-y-6 border-t border-white/10 pt-16">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
                05 // BEHIND THE SCENES
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1 uppercase font-mono">Production Stills</h2>
              <p className="text-xs text-gray-400 mt-2">빛과 인물의 조율, 앵글의 탐구, 그리고 촬영 현장의 긴장과 몰입을 기록한 스틸 컷.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(project.behindScenes || []).map((img, i) => (
                <div key={i} className="group relative aspect-[3/2] overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                  <SafeImage
                    src={img}
                    alt={`Behind the scenes ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/80">
                      STILL // BTS_{(i + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: Post Production Captures */}
        {project.editWorkspaceImg && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-white/10 pt-16">
            <div className="lg:col-span-4">
              <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
                06 // POST-PRODUCTION
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1 uppercase font-mono">Editing Desk</h2>
              <p className="text-xs text-gray-400 mt-2">다빈치 리졸브(DaVinci Resolve)를 사용하여 편집하는 모습, 그리고 중요한 편집 툴 노트북</p>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <div className="relative overflow-hidden rounded-lg border border-white/15 bg-zinc-950 aspect-[16/9] shadow-xl">
                <SafeImage
                  src={project.editWorkspaceImg}
                  alt="Post-production workspace capture"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/80 border border-white/10 px-2 py-1 rounded text-[9px] font-mono tracking-widest text-green-400 flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  DaVinci Resolve Timeline Active
                </div>
              </div>
              <p className="text-[11px] text-gray-500 text-center font-mono">
                ▲ 정승리의 노트북, 그리고 작업 상황
              </p>
            </div>
          </div>
        )}

        {/* SECTION 7: Reflections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-white/10 pt-16 pb-12">
          <div className="lg:col-span-4">
            <span className="text-[10px] font-mono tracking-widest text-[#B021FF] block uppercase">
              07 // SELF REFLECTION & PROGRESS
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1 uppercase font-mono">Reflection</h2>
            <p className="text-xs text-gray-400 mt-2">이 한편의 영화가 끝난 뒤, 영상 제작자 정승리가 거둔 성과와 배운 점.</p>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 md:p-8 bg-zinc-950/50 border border-white/10 rounded-xl">
              <h3 className="text-xs font-mono font-bold uppercase text-[#B021FF] mb-3">
                Key Takeaways // 배움의 기록
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                {project.reflection}
              </p>
            </div>
          </div>
        </div>

        {/* Footer closing block */}
        <div className="text-center border-t border-white/10 pt-16 pb-16 space-y-4">
          <p className="text-xs text-gray-400 font-mono">정승리의 또 다른 세계관을 보고 싶으신가요?</p>
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-white text-black hover:bg-gray-100 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg inline-flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            Close Page and View Work
          </button>
        </div>

      </div>
    </motion.div>
  );
};
