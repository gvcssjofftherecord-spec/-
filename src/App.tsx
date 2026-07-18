import React, { useState, useEffect, useRef } from 'react';
import { Project, Skill, Software, Experience, Achievement, Testimonial, GalleryItem, ProfileInfo, ProcessStep } from './types';
import { getStoredData, saveStoredData, resetToDefaults, exportBackupJSON, importBackupJSON } from './lib/storage';
import { savePortfolioToFirestore, subscribePortfolio } from './lib/firebase';
import { LucideIcon } from './components/LucideIcon';
import { ProcessSection } from './components/ProcessSection';
import { ProjectDetail } from './components/ProjectDetail';
import { AdminPanel } from './components/AdminPanel';
import { HoverVideoPlayer } from './components/HoverVideoPlayer';
import { SafeImage } from './components/SafeImage';
import { useResolveVideoUrl } from './hooks/useResolveVideoUrl';
import { isYouTubeUrl, getHoverEmbedUrl } from './lib/videoUtils';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PROFILE_INFO, INITIAL_PROCESS_STEPS } from './data/initialData';

export default function App() {
  // Primary state loaded from storage
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [aboutProfileImg, setAboutProfileImg] = useState<string>(() => {
    return localStorage.getItem('jsr_portfolio_about_profile_img') || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
  });

  // Navigation and UI control states
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState<GalleryItem | null>(null);

  // Hover states for dynamic video play
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  
  // Direct Contact message state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Initialize data on component mount and subscribe to Firestore
  useEffect(() => {
    // 1. Load from local cache for instant render
    const localData = getStoredData();
    setProjects(localData.projects);
    setSkills(localData.skills);
    setSoftware(localData.software);
    setExperience(localData.experience);
    setAchievements(localData.achievements);
    setTestimonials(localData.testimonials);
    setGallery(localData.gallery);
    setProfileInfo(localData.profileInfo);
    setProcessSteps(localData.processSteps);

    const localImg = localStorage.getItem('jsr_portfolio_about_profile_img') || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
    setAboutProfileImg(localImg);

    // 2. Subscribe to Firebase Firestore for real-time synchronization
    const unsubscribe = subscribePortfolio((remoteData) => {
      if (remoteData) {
        let hasMissingKeys = false;
        const missingDataToSeed: any = {};

        // Update states from Firestore, or fall back to local cached/default data and seed it back to Firestore
        if (remoteData.projects && Array.isArray(remoteData.projects) && remoteData.projects.length > 0) {
          setProjects(remoteData.projects);
          saveStoredData.projects(remoteData.projects);
        } else {
          missingDataToSeed.projects = localData.projects;
          hasMissingKeys = true;
        }

        if (remoteData.skills && Array.isArray(remoteData.skills) && remoteData.skills.length > 0) {
          setSkills(remoteData.skills);
          saveStoredData.skills(remoteData.skills);
        } else {
          missingDataToSeed.skills = localData.skills;
          hasMissingKeys = true;
        }

        if (remoteData.software && Array.isArray(remoteData.software) && remoteData.software.length > 0) {
          setSoftware(remoteData.software);
          saveStoredData.software(remoteData.software);
        } else {
          missingDataToSeed.software = localData.software;
          hasMissingKeys = true;
        }

        if (remoteData.experience && Array.isArray(remoteData.experience) && remoteData.experience.length > 0) {
          setExperience(remoteData.experience);
          saveStoredData.experience(remoteData.experience);
        } else {
          missingDataToSeed.experience = localData.experience;
          hasMissingKeys = true;
        }

        if (remoteData.achievements && Array.isArray(remoteData.achievements) && remoteData.achievements.length > 0) {
          setAchievements(remoteData.achievements);
          saveStoredData.achievements(remoteData.achievements);
        } else {
          missingDataToSeed.achievements = localData.achievements;
          hasMissingKeys = true;
        }

        if (remoteData.testimonials && Array.isArray(remoteData.testimonials) && remoteData.testimonials.length > 0) {
          setTestimonials(remoteData.testimonials);
          saveStoredData.testimonials(remoteData.testimonials);
        } else {
          missingDataToSeed.testimonials = localData.testimonials;
          hasMissingKeys = true;
        }

        if (remoteData.gallery && Array.isArray(remoteData.gallery) && remoteData.gallery.length > 0) {
          setGallery(remoteData.gallery);
          saveStoredData.gallery(remoteData.gallery);
        } else {
          missingDataToSeed.gallery = localData.gallery;
          hasMissingKeys = true;
        }

        if (remoteData.profileInfo && typeof remoteData.profileInfo === 'object') {
          setProfileInfo(remoteData.profileInfo);
          saveStoredData.profileInfo(remoteData.profileInfo);
        } else {
          missingDataToSeed.profileInfo = localData.profileInfo;
          hasMissingKeys = true;
        }

        if (remoteData.processSteps && Array.isArray(remoteData.processSteps) && remoteData.processSteps.length > 0) {
          setProcessSteps(remoteData.processSteps);
          saveStoredData.processSteps(remoteData.processSteps);
        } else {
          missingDataToSeed.processSteps = localData.processSteps;
          hasMissingKeys = true;
        }

        if (remoteData.aboutProfileImg) {
          setAboutProfileImg(remoteData.aboutProfileImg);
          localStorage.setItem('jsr_portfolio_about_profile_img', remoteData.aboutProfileImg);
        } else {
          missingDataToSeed.aboutProfileImg = localImg;
          hasMissingKeys = true;
        }

        // If some keys were missing from the remote document, save them back to Firestore to ensure sync
        if (hasMissingKeys) {
          savePortfolioToFirestore(missingDataToSeed)
            .then(() => console.log("Missing Firestore keys seeded successfully."))
            .catch((err) => console.error("Failed to seed missing keys to Firestore:", err));
        }
      } else {
        // If Firestore document does not exist at all, seed it with initial/local data
        const initialToSeed = {
          projects: localData.projects,
          skills: localData.skills,
          software: localData.software,
          experience: localData.experience,
          achievements: localData.achievements,
          testimonials: localData.testimonials,
          gallery: localData.gallery,
          profileInfo: localData.profileInfo,
          processSteps: localData.processSteps,
          aboutProfileImg: localImg,
        };
        savePortfolioToFirestore(initialToSeed)
          .then(() => console.log("Firestore successfully seeded with initial local data."))
          .catch((err) => console.error("Failed to seed Firestore:", err));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen to window scroll to trigger nav frosted-blur background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveAll = async (updated: {
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
  }) => {
    // 1. Update React state & localStorage as usual
    if (updated.projects) {
      setProjects(updated.projects);
      saveStoredData.projects(updated.projects);
    }
    if (updated.skills) {
      setSkills(updated.skills);
      saveStoredData.skills(updated.skills);
    }
    if (updated.software) {
      setSoftware(updated.software);
      saveStoredData.software(updated.software);
    }
    if (updated.experience) {
      setExperience(updated.experience);
      saveStoredData.experience(updated.experience);
    }
    if (updated.achievements) {
      setAchievements(updated.achievements);
      saveStoredData.achievements(updated.achievements);
    }
    if (updated.testimonials) {
      setTestimonials(updated.testimonials);
      saveStoredData.testimonials(updated.testimonials);
    }
    if (updated.aboutProfileImg !== undefined) {
      setAboutProfileImg(updated.aboutProfileImg);
      localStorage.setItem('jsr_portfolio_about_profile_img', updated.aboutProfileImg);
    }
    if (updated.gallery) {
      setGallery(updated.gallery);
      saveStoredData.gallery(updated.gallery);
    }
    if (updated.profileInfo) {
      setProfileInfo(updated.profileInfo);
      saveStoredData.profileInfo(updated.profileInfo);
    }
    if (updated.processSteps) {
      setProcessSteps(updated.processSteps);
      saveStoredData.processSteps(updated.processSteps);
    }

    // 2. Sync to Firestore (construct full current + updated object)
    const dataToSync = {
      projects: updated.projects || projects,
      skills: updated.skills || skills,
      software: updated.software || software,
      experience: updated.experience || experience,
      achievements: updated.achievements || achievements,
      testimonials: updated.testimonials || testimonials,
      gallery: updated.gallery || gallery,
      profileInfo: updated.profileInfo || profileInfo,
      processSteps: updated.processSteps || processSteps,
      aboutProfileImg: updated.aboutProfileImg !== undefined ? updated.aboutProfileImg : aboutProfileImg,
    };

    try {
      await savePortfolioToFirestore(dataToSync);
    } catch (error) {
      console.error("Firestore sync failed during save:", error);
    }
  };

  const handleReset = async () => {
    const fresh = resetToDefaults();
    setProjects(fresh.projects);
    setSkills(fresh.skills);
    setSoftware(fresh.software);
    setExperience(fresh.experience);
    setAchievements(fresh.achievements);
    setTestimonials(fresh.testimonials);
    setGallery(fresh.gallery);
    setProfileInfo(fresh.profileInfo);
    setProcessSteps(fresh.processSteps);
    const defaultImg = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
    setAboutProfileImg(defaultImg);
    localStorage.removeItem('jsr_portfolio_about_profile_img');

    // Sync reset to Firestore
    try {
      await savePortfolioToFirestore({
        projects: fresh.projects,
        skills: fresh.skills,
        software: fresh.software,
        experience: fresh.experience,
        achievements: fresh.achievements,
        testimonials: fresh.testimonials,
        gallery: fresh.gallery,
        profileInfo: fresh.profileInfo,
        processSteps: fresh.processSteps,
        aboutProfileImg: defaultImg,
      });
    } catch (err) {
      console.error("Firestore sync failed during reset:", err);
    }
  };

  const info = profileInfo || INITIAL_PROFILE_INFO;
  const resolvedHeroVideoUrl = useResolveVideoUrl(info.heroVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-camera-man-operating-a-camera-40679-large.mp4");

  // Normalizes 10-digit (seconds) and 13-digit (milliseconds) timestamps
  const getProjectTime = (proj: Project) => {
    const val = proj.createdAt;
    if (!val) return 0;
    const num = Number(val);
    if (isNaN(num)) return 0;
    return num < 10000000000 ? num * 1000 : num;
  };

  // Filter projects by category and search, sorted by date (most recent first)
  const categories = ['ALL', 'Documentary', 'Short', 'Event', 'Interview', 'Promotion'];
  const filteredProjects = projects.filter((proj) => {
    const matchesCategory = activeCategory === 'ALL' || proj.category === activeCategory;
    const matchesSearch =
      (proj.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.tags || []).some((t) => (t || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => getProjectTime(b) - getProjectTime(a));

  const featuredProjects = projects.filter((proj) => proj.isFeatured).sort((a, b) => getProjectTime(b) - getProjectTime(a));

  // Form submit simulator
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white selection:bg-[#B021FF] selection:text-white font-sans scroll-smooth">
      
      {/* 1. CINEMATIC STICKY NAVBAR */}
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-350 px-6 md:px-12 py-4 flex justify-between items-center ${
          isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B021FF] animate-pulse"></span>
          <a href="#home" className="text-sm font-bold tracking-widest uppercase font-mono hover:text-[#B021FF] transition-all">
            VICTORY.mp4
          </a>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase text-gray-400">
          <a href="#about" className="hover:text-white transition-all">About</a>
          <a href="#featured" className="hover:text-white transition-all">Featured</a>
          <a href="#projects" className="hover:text-white transition-all">Projects</a>
          <a href="#process" className="hover:text-white transition-all">Process</a>
          <a href="#timeline" className="hover:text-white transition-all">Timeline</a>
          <a href="#gallery" className="hover:text-white transition-all">Gallery</a>
          <a href="#contact" className="hover:text-white transition-all">Contact</a>
        </div>

        {/* Actions Gateway */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            title="콘솔 열기 (비밀번호 0808)"
          >
            <LucideIcon name="Settings" size={14} />
          </button>
          <a
            href="#contact"
            className="px-4 py-1.5 bg-[#B021FF] hover:bg-[#991be0] text-white rounded text-[10px] font-bold font-mono uppercase tracking-widest shadow-md shadow-purple-500/10 transition-all"
          >
            Hire Me
          </a>
        </div>
      </nav>

      {/* 2. IMMERSIVE HERO VIEW (HOME) */}
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Looped Ambient Video / Aesthetic Blur Canvas */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-35 filter brightness-50"
            src={resolvedHeroVideoUrl}
          />
          {/* Overlay Matte Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-black/40" />
          <div className="absolute inset-0 bg-radial-gradient" />
        </div>

        {/* Content Overlays */}
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-4"
          >
            <p className="text-[#B021FF] text-xs font-mono tracking-[0.25em] uppercase">
              {info.subtitle}
            </p>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white uppercase leading-none font-sans">
              {info.name}
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-mono tracking-widest font-light flex items-center justify-center gap-2 flex-wrap">
              {info.roles.split('•').map((r, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-600">•</span>}
                  <span>{r.trim()}</span>
                </React.Fragment>
              ))}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="pt-8"
          >
            <a
              href="#featured"
              className="px-8 py-3.5 border border-white/10 bg-white/5 hover:bg-white text-gray-300 hover:text-black rounded-full text-xs font-bold font-mono tracking-widest uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
            >
              Explore Portfolio <LucideIcon name="ArrowRight" size={12} />
            </a>
          </motion.div>
        </div>

        {/* Scroll Prompt */}
        <div className="absolute bottom-8 inset-x-0 z-10 text-center">
          <a
            href="#about"
            className="inline-flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 text-[10px] font-mono tracking-widest uppercase"
          >
            SCROLL DOWN
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <LucideIcon name="ChevronLeft" className="rotate-270" size={14} />
            </motion.div>
          </a>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="relative py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Profile Media Frame */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-[#B021FF] opacity-10 blur-xl group-hover:opacity-20 transition-all duration-500" />
            <div className="relative aspect-[4/5] bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <SafeImage
                src={aboutProfileImg}
                alt="Jeong Seungri Cinematic Frame"
                className="w-full h-full object-cover filter grayscale contrast-125 brightness-90 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] text-gray-400 bg-black/60 px-3 py-1.5 rounded border border-white/10">
                ACTIVE ON CAM // 2026_SEUNGRI
              </div>
            </div>
          </div>

          {/* Right Info Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
                01 // AUTHOR PREFACE
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                {info.introHeader}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
                {info.introBio}
              </p>
            </div>

            {/* Attributes List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
              {[
                { label: 'Age', val: info.age },
                { label: 'Location', val: info.location },
                { label: 'Experience', val: info.experienceYears },
                { label: 'Email', val: info.email },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">{item.label}</span>
                  <span className="text-xs font-medium text-white block truncate" title={item.val}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* 4. SKILLS SECTION */}
            <div className="space-y-4 pt-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 font-mono">
                Key Production Skills
              </h3>
              <div className="space-y-4 max-w-2xl">
                {skills.map((skill) => (
                  <div key={skill.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                        <LucideIcon name={skill.iconName} size={14} className="text-[#B021FF]" />
                        {skill.name}
                      </span>
                      <span className="font-mono text-[#B021FF] font-semibold">{skill.percentage}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#B021FF] to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SOFTWARE SECTION */}
            <div className="space-y-4 pt-8 border-t border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 font-mono">
                Software Proficiency
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {software.map((sw) => (
                  <div
                    key={sw.id}
                    className="bg-[#121212] border border-white/5 hover:border-white/10 p-3.5 rounded-lg flex flex-col justify-between transition-all"
                  >
                    <span className="text-xs font-semibold text-white block">{sw.name}</span>
                    <div className="flex gap-1 mt-2 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <LucideIcon
                          key={star}
                          name="Star"
                          size={11}
                          className={star <= sw.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
                        />
                      ))}
                    </div>
                    {sw.desc && (
                      <p className="text-[10px] text-gray-500 leading-tight line-clamp-2 mt-1">{sw.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FEATURED PROJECTS (CAROUSEL / BENTO GRID) */}
      <section id="featured" className="py-24 bg-black/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
                02 // DIRECTORS CHOICES
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase font-sans">
                Featured Projects
              </h2>
              <p className="text-xs text-gray-400 max-w-lg">정승리가 기획, 촬영, 컬러 그레이딩까지 직접 디렉팅한 가장 대표적인 메인 아카이브입니다.</p>
            </div>
            <a
              href="#projects"
              className="text-xs text-gray-400 hover:text-[#B021FF] font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all"
            >
              View Full Gallery <LucideIcon name="ChevronRight" size={14} />
            </a>
          </div>

          {/* Featured Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                onMouseEnter={() => setHoveredProjectId(proj.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                className="group relative bg-[#121212] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300"
              >
                {/* Image/Video Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                  {hoveredProjectId === proj.id && proj.hoverVideoUrl ? (
                    <HoverVideoPlayer hoverVideoUrl={proj.hoverVideoUrl} title={proj.title} />
                  ) : (
                    <SafeImage
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                  )}
                  {/* Aspect vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 text-[9px] font-mono tracking-widest uppercase bg-black/80 border border-white/10 px-2.5 py-1 rounded text-white/95">
                    {proj.category}
                  </span>
                </div>

                {/* Info Metadata */}
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight text-white group-hover:text-[#B021FF] transition-all">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed h-8">
                      {proj.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 border-t border-white/5 pt-3.5">
                    <span className="text-[#B021FF]">{proj.period}</span>
                    <span className="flex items-center gap-1">
                      <LucideIcon name="Briefcase" size={10} />
                      {proj.roles.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. ALL PROJECTS (FILTERABLE PORTFOLIO) */}
      <section id="projects" className="py-24 max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="space-y-6">
          <div className="text-center md:text-left space-y-2">
            <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
              03 // COMPLETE ARCHIVES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase font-sans">
              All Creations
            </h2>
            <p className="text-xs text-gray-400 max-w-lg mx-auto md:mx-0">
              다양한 포맷의 영상 성과들을 한곳에서 편히 찾아보세요. 카테고리별 아카이브 검색이 지원됩니다.
            </p>
          </div>

          {/* Filtering Tools Layout */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-white/5 pb-6">
            {/* Categories filters */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 bg-[#121212]/50 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="제목, 태그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-[#121212] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B021FF]"
              />
              <span className="absolute right-3 top-2 text-gray-500">
                <LucideIcon name="Camera" size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Project Grid list */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                onMouseEnter={() => setHoveredProjectId(proj.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                className="group relative bg-[#121212]/50 hover:bg-[#121212] border border-white/5 hover:border-white/10 rounded-lg overflow-hidden cursor-pointer transition-all"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                  {hoveredProjectId === proj.id && proj.hoverVideoUrl ? (
                    <HoverVideoPlayer hoverVideoUrl={proj.hoverVideoUrl} title={proj.title} />
                  ) : (
                    <SafeImage
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest uppercase text-gray-500">
                      {proj.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#B021FF] transition-all line-clamp-1">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                    <span>{proj.period}</span>
                    <span className="text-[#B021FF]">{proj.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#121212]/30 rounded-xl border border-dashed border-white/5">
            <LucideIcon name="Video" size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">필터에 매칭되는 영상 작품이 없습니다.</p>
          </div>
        )}
      </section>

      {/* 8. MY PROCESS SECTION */}
      <section id="process" className="py-24 bg-[#0A0A0A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
              04 // HOW I WORK
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase font-sans">
              Video Production Process
            </h2>
            <p className="text-xs text-gray-400 max-w-lg mx-auto">
              정승리 크리에이티브는 한 편의 영화가 완성될 때까지 다음의 정량화되고 체계적인 프로세스를 준수합니다.
            </p>
          </div>

          <ProcessSection steps={processSteps} />
        </div>
      </section>

      {/* 9. EXPERIENCES TIMELINE */}
      <section id="timeline" className="py-24 max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
              05 // STORY OF WORK
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white uppercase">Experience</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              성실하게 구축해 온 정승리 비디오 작가 히스토리입니다. 한 편 한 편의 비디오를 제작할 때마다 기획안을 단단히 쌓고 있습니다.
            </p>

            {/* 10. ACHIEVEMENTS STATS PANEL */}
            <div className="grid grid-cols-2 gap-3 pt-6">
              {achievements.map((ach) => (
                <div key={ach.id} className="bg-[#121212] border border-white/10 p-4 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <LucideIcon name={ach.iconName} size={14} className="text-[#B021FF]" />
                    <span className="text-[10px] font-mono tracking-wider uppercase">{ach.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight font-sans">
                    {ach.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Path */}
          <div className="lg:col-span-8 pl-0 md:pl-8 relative border-l border-white/5 space-y-8">
            {experience.map((exp, index) => (
              <div key={exp.id} className="relative pl-6 group">
                {/* Timeline dot */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-black border border-[#B021FF] group-hover:bg-[#B021FF] rounded-full transition-all duration-300" />
                
                <div className="space-y-1">
                  <span className="font-mono text-xs text-[#B021FF] font-semibold block">{exp.year}</span>
                  <h3 className="text-base font-bold text-white tracking-tight">{exp.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. AMB_GALLERY (BEHIND PHOTOGRAPHY) */}
      <section id="gallery" className="py-24 bg-black/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
              06 // PRODUCTION STILLS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase font-sans">
              Production Gallery
            </h2>
            <p className="text-xs text-gray-400 max-w-lg mx-auto">
              드론 항공뷰, 시네마 카메라 셋업, 다빈치 리졸브 타임라인 캡쳐 등 정승리의 프로페셔널한 제작 현장 아카이브입니다.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveGalleryItem(g)}
                className="group relative aspect-[4/3] bg-[#121212] border border-white/10 rounded-lg overflow-hidden cursor-pointer shadow-lg"
              >
                <SafeImage
                  src={g.imageUrl}
                  alt={g.title}
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-104 filter saturate-75 brightness-90 group-hover:brightness-100"
                />
                {/* Overlay filter view */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#B021FF]">{g.category}</span>
                    <h4 className="text-xs font-semibold text-white">{g.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. TESTIMONIALS SLIDER SECTION */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase">
                07 // WORDS FROM PEERS
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">Testimonials</h2>
            </div>

            {/* Testimonial Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {testimonials.map((test) => (
                <div key={test.id} className="bg-[#121212] border border-white/10 p-6 rounded-lg relative space-y-4">
                  <div className="text-white/5 absolute right-4 top-4 font-serif text-5xl select-none">“</div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans italic">"{test.content}"</p>
                  <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white font-semibold">{test.name}</span>
                    <span className="text-gray-500">{test.role} // {test.company}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 13. CONTACT TERMINAL (THE MOST CRITICAL ACTION) */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Call to action info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono tracking-widest text-[#B021FF] uppercase block">
                08 // INITIATE PROPOSAL
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase font-sans">
                Get In Touch
              </h2>
            </div>

            {/* Social channels listing */}
            <div className="space-y-3 pt-4 border-t border-white/5 font-mono text-xs">
              {info.email && (
                <a
                  href={`mailto:${info.email}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all py-1.5"
                >
                  <LucideIcon name="Mail" size={16} className="text-[#B021FF]" />
                  {info.email}
                </a>
              )}
              {info.instagram && (
                <a
                  href={info.instagram.startsWith('http') ? info.instagram : `https://instagram.com/${info.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all py-1.5"
                >
                  <LucideIcon name="Instagram" size={16} className="text-[#B021FF]" />
                  {info.instagram}
                </a>
              )}
              {info.youtube && (
                <a
                  href={info.youtube.startsWith('http') ? info.youtube : 'https://youtube.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all py-1.5"
                >
                  <LucideIcon name="Youtube" size={16} className="text-[#B021FF]" />
                  {info.youtube}
                </a>
              )}
              {info.phone && (
                <div className="flex items-center gap-3 text-gray-400 py-1.5">
                  <LucideIcon name="Phone" size={16} className="text-[#B021FF]" />
                  {info.phone}
                </div>
              )}
            </div>
          </div>

          {/* Right Direct Message Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-white/10 p-6 md:p-8 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider font-mono">
              Direct Pitch Message
            </h3>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-mono uppercase">Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded px-3 py-2 text-xs text-white"
                    placeholder="성함 또는 기관명"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-mono uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded px-3 py-2 text-xs text-white"
                    placeholder="연락받으실 이메일 주소"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block font-mono uppercase">Message Proposal</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#B021FF] focus:outline-none focus:ring-1 focus:ring-[#B021FF] rounded px-3 py-2 text-xs text-white min-h-[100px]"
                  placeholder="의뢰하실 프로젝트 규모, 마감 기한, 제작 형태 등 자유로운 기획안을 기재해 주세요."
                />
              </div>

              {contactSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs text-center">
                  감사합니다! 메시지가 성공적으로 전달되었습니다. 정승리 디렉터가 빠르게 연락드리겠습니다.
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-white text-black hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-400 transition-all rounded text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSending ? 'Sending...' : 'Transmit Proposal'}
                <LucideIcon name="Send" size={12} />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 font-mono">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-white font-semibold">{info.name} // {info.roles.split('•')[0].trim() || 'Video Producer'}</span>
            <span>© 2026 {info.name.toUpperCase()}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#featured" className="hover:text-white transition-colors">Featured</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* 15. PORTFOLIO DETAIL OVERLAY MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* 16. CONTROL CENTER ADMIN CONSOLE MODAL */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            onClose={() => setIsAdminOpen(false)}
            projects={projects}
            setProjects={setProjects}
            skills={skills}
            setSkills={setSkills}
            software={software}
            setSoftware={setSoftware}
            experience={experience}
            setExperience={setExperience}
            achievements={achievements}
            setAchievements={setAchievements}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            aboutProfileImg={aboutProfileImg}
            gallery={gallery}
            setGallery={setGallery}
            profileInfo={info}
            processSteps={processSteps}
            setProcessSteps={setProcessSteps}
            onSaveAll={handleSaveAll}
            onReset={handleReset}
            onExport={exportBackupJSON}
            onImport={importBackupJSON}
          />
        )}
      </AnimatePresence>

      {/* 17. GALLERY ZOOM LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeGalleryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGalleryItem(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-lg border border-white/15">
              <SafeImage
                src={activeGalleryItem.imageUrl}
                alt={activeGalleryItem.title}
                className="w-full h-auto object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-4 border-t border-white/5 text-center text-xs space-y-1">
                <span className="text-[10px] text-[#B021FF] font-mono tracking-widest uppercase">{activeGalleryItem.category}</span>
                <p className="font-semibold text-white">{activeGalleryItem.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
