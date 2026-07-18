import { Project, Skill, Software, Experience, Achievement, Testimonial, GalleryItem, ProcessStep } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'goodbye-sejong',
    title: 'Goodbye Sejong (굿바이 세종)',
    category: 'Documentary',
    tags: ['다큐멘터리', '졸업작품', '학교기록', 'A24 감성'],
    roles: ['기획', '촬영', '편집', '연출'],
    duration: '12분 40초',
    period: '2026.01 ~ 2026.02',
    thumbnail: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/L13I9vVNo4Y', // High quality aesthetic video template or ambient clip
    hoverVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-camera-man-operating-a-camera-40679-large.mp4',
    description: '세종고등학교의 마지막 겨울을 담은 다큐멘터리. 정든 교정과 친구들의 진솔한 고백, 그리고 떠남과 남겨짐의 감정을 카메라 앵글에 시적으로 담아냈습니다.',
    directorNotes: '누구에게나 고등학교 시절은 인생에서 가장 눈부시고도 아련한 순간입니다. 이 작품은 단순히 학교를 졸업하는 과정을 기록한 기록물을 넘어, "상실"과 "성장"이라는 보편적인 인간의 감정을 A24 스타일의 미장센과 서정적인 톤앤매너로 시각화하고자 했습니다. 필름 룩의 그레인 효과와 자연광을 최대한 활용하여 인물의 눈빛과 대화의 호흡을 가장 자연스럽게 유도해 냈습니다.',
    planningProcess: '1단계: 주제 선정 및 캐릭터 리서치 (학기 초반, 학생들과 교사들을 인터뷰하며 핵심 감정선인 "아쉬움"과 "기대"를 관통하는 인물 3명 선정)\n2단계: 구성안 및 스토리보드 작성 (시간의 흐름에 따른 연대기적 구성 대신 공간의 흔적을 중심으로 역순 구성 기획)\n3단계: 음악 레퍼런스 확정 (클래식 피아노와 앰비언트 신스 사운드를 결합한 음악 구성 기획)',
    behindScenes: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80'
    ],
    editWorkspaceImg: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    reflection: '하나의 다큐멘터리를 기획부터 최종 마스터링까지 혼자 이끌어 가면서, 비디오 메이커가 지녀야 할 진정한 스탠스에 대해 배웠습니다. 카메라는 대상을 감시하는 도구가 아닌, 대상과 교감하는 거울이어야 함을 깨달았습니다. 다빈치 리졸브를 통한 세밀한 컬러 그레이딩 과정에서 웜톤과 쿨톤의 대비를 활용해 감정의 온도 변화를 표현하는 귀중한 기술적 성취도 얻었습니다.',
    isFeatured: true,
    createdAt: 1710600000
  },
  {
    id: 'gaze-shortfilm',
    title: '시선 (The Gaze)',
    category: 'Short',
    tags: ['단편영화', '내러티브', '영화제출품', '시네마틱'],
    roles: ['기획', '촬영', '편집'],
    duration: '8분 15초',
    period: '2026.04 ~ 2026.05',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    hoverVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lens-of-a-camera-focused-on-recording-40682-large.mp4',
    description: '스마트폰 너머로만 소통하는 현대 사회 속에서, 직접 눈을 마주치지 못하는 두 남녀의 심리적 거리감을 침묵과 프레이밍으로 묘사한 내러티브 단편 영화입니다.',
    directorNotes: 'Apple의 정제된 레이아웃과 A24 영화의 파격적이면서도 정돈된 앵글에서 영감을 얻었습니다. 대사를 최소화하고, 거친 바스락거림, 바람 소리, 발자국 소리 같은 환경 효과음(Foley)과 정적인 롱테이크를 메인으로 삼아 극도의 서스펜스와 감성을 극대화했습니다.',
    planningProcess: '1단계: 콘셉트 빌딩 (현대인의 디지털 소외감을 침묵으로 그리는 플롯 작성)\n2단계: 촬영지 헌팅 및 라이팅 계획 (실내 형광등의 차가운 톤과 노을빛의 따스한 톤의 대조를 이용한 조명 기획)\n3단계: 배우 오디션 및 액팅 가이드라인 수립',
    behindScenes: [
      'https://images.unsplash.com/photo-1505236858219-8359eb29e3a9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=600&q=80'
    ],
    editWorkspaceImg: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?auto=format&fit=crop&w=1200&q=80',
    reflection: '스토리텔링에서 사운드 디자인과 인물의 시선 처리가 얼마나 결정적인 영향력을 가지는지 배운 기회였습니다. 불필요한 테이크를 과감히 삭제하고 컷의 전환 타이밍을 0.1초 단위로 정교하게 맞추는 미니멀 편집 기법을 익혔습니다.',
    isFeatured: true,
    createdAt: 1715600000
  },
  {
    id: 'youth-records',
    title: '청춘의 기록 (Records of Youth)',
    category: 'Interview',
    tags: ['인터뷰', '휴먼다큐', '포트레이트', '자연광'],
    roles: ['기획', '촬영', '편집'],
    duration: '5분 50초',
    period: '2026.05 ~ 2026.06',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    hoverVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-editor-editing-on-a-computer-41484-large.mp4',
    description: '각자의 자리에서 꿈을 꾸는 다섯 청춘의 목소리를 가감 없이 기록한 심층 휴먼 인터뷰 시리즈. 그들의 고민과 눈부신 포부를 흑백 포트레이트 영상미로 전달합니다.',
    directorNotes: '최소한의 장비와 극도의 미니멀리즘을 핵심으로 두었습니다. 복잡한 배경을 배제하고 오직 흑백의 조명 대비만을 사용하여 인터뷰이의 눈빛과 주름, 목소리 떨림에만 집중할 수 있게 기획했습니다. 진실한 스토리를 담기 위한 깊이 있는 구성입니다.',
    planningProcess: '1단계: 인터뷰이 섭외 및 사전 친밀감 형성 (카메라 앞의 경직을 풀기 위한 대화 세션)\n2단계: 3점 조명(Key, Fill, Back)을 활용한 드라마틱 콘트라스트 빌딩\n3단계: 배경 오디오 노이즈 억제 및 보이스 톤 다이내믹 가공',
    behindScenes: [
      'https://images.unsplash.com/photo-1453060113865-968ce1ad0e57?auto=format&fit=crop&w=600&q=80'
    ],
    editWorkspaceImg: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    reflection: '스토리텔러는 답을 내리는 사람이 아닌 질문을 던지는 사람이라는 귀중한 통찰을 얻었습니다. 상대방이 진정성이 어린 고백을 시작하는 순간 카메라 셔터를 차분하게 지속하는 호흡의 미학을 배웠습니다.',
    isFeatured: true,
    createdAt: 1718200000
  },
  {
    id: 'festival-afterglow',
    title: 'Afterglow: 축제의 밤',
    category: 'Event',
    tags: ['학교축제', '애프터무비', '감각적편집', '하이라이트'],
    roles: ['촬영', '편집'],
    duration: '3분 15초',
    period: '2025.10 ~ 2025.10',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/L13I9vVNo4Y',
    hoverVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-countryside-landscape-at-sunset-41618-large.mp4',
    description: '가을의 열기가 가득했던 학교 축제의 찰나를 몽환적인 슬로우 모션과 트렌디한 편집 기법으로 풀어낸 고감도 라이브 하이라이트 영상.',
    directorNotes: '화려함 속에 스며있는 청춘들의 자취와 아쉬움을 담고자 했습니다. 빠른 비트의 컷 편집과 감성적인 아날로그 텍스처를 믹스하여 오랫동안 곱씹을 수 있는 아카이브 필름을 목표했습니다.',
    planningProcess: '1단계: 무대 라이브 현장 플래닝 및 동선 체크\n2단계: 짐벌 및 슬로우모션 촬영 계획 수립 (120fps 촬영 설계)\n3단계: 비트 매칭 편집 및 빈티지 톤 필름 컬러 그레이딩',
    behindScenes: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
    ],
    editWorkspaceImg: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?auto=format&fit=crop&w=1200&q=80',
    reflection: '급변하는 야외 라이팅 상황 및 공연장의 극단적인 암부 변화 속에서 카메라 노출 및 셔터스피드를 정교하고 기민하게 조절하는 현장 대응력을 갖출 수 있었습니다.',
    isFeatured: false,
    createdAt: 1698200000
  },
  {
    id: 'sejong-promo',
    title: '세종시 청소년 포럼 홍보 영상',
    category: 'Promotion',
    tags: ['홍보영상', '모션그래픽', '타이포그래피', '도시풍경'],
    roles: ['기획', '촬영', '편집', '그래픽'],
    duration: '1분 30초',
    period: '2025.07 ~ 2025.08',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    hoverVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lens-of-a-camera-focused-on-recording-40682-large.mp4',
    description: '세종시 Youth Forum의 메인 티저 비디오. 모던한 시티 레이아웃에 시선을 사로잡는 타이포그래피와 속도감 넘치는 교차 편집을 더한 공익 포럼 홍보 비디오입니다.',
    directorNotes: '청소년 대상 공익 영상이 갖는 전형적이고 지루한 형식을 깨고 싶었습니다. 테크니컬한 사운드 트랜지션과 감각적인 화면 분할(Split Screen), 오버레이 타이포그래피를 사용하여 한 순간도 눈을 뗄 수 없게 디자인했습니다.',
    planningProcess: '1단계: 주최 측 기획 미팅 및 타겟 분석\n2단계: 세종시 현대 랜드마크 및 미래적 구조물 스포트 촬영 계획 수립\n3단계: 애프터 이펙트를 결합한 타이포 애니메이션 및 스피드 램핑 설계',
    behindScenes: [
      'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=600&q=80'
    ],
    editWorkspaceImg: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    reflection: '디자인 레이아웃과 비주얼 밸런스가 영상 메시지의 전달력에 미치는 영향력을 다시금 절감했습니다. 정승리만의 정제된 세련미를 1분 30초의 쇼트폼에 압축 전송하는 연출 방식을 체득했습니다.',
    isFeatured: false,
    createdAt: 1693200000
  }
];

export const INITIAL_SKILLS: Skill[] = [
  { id: '1', name: '기획 (Planning & Concept)', percentage: 90, iconName: 'Video' },
  { id: '2', name: '촬영 (Cinematography)', percentage: 80, iconName: 'Camera' },
  { id: '3', name: '편집 (Editing)', percentage: 95, iconName: 'Film' },
  { id: '4', name: '디자인 (Visual Identity)', percentage: 70, iconName: 'Palette' },
  { id: '5', name: '사운드 (Sound Design)', percentage: 70, iconName: 'Music' }
];

export const INITIAL_SOFTWARE: Software[] = [
  { id: '1', name: 'DaVinci Resolve', rating: 5, desc: '주력 툴 / 정교한 흑백 및 시네마틱 컬러 그레이딩 및 퓨전 합성 가능' },
  { id: '2', name: 'Photoshop', rating: 3, desc: '영화 포스터 스타일 썸네일, 타이포그래피 에셋 제작에 활용' },
  { id: '3', name: 'Premiere Pro', rating: 2, desc: '가벼운 컷 편집 및 빠른 속도의 다량 워크플로우 지원' },
  { id: '4', name: 'After Effects', rating: 2, desc: '키네틱 인트로 타이포 및 시네마틱 오버레이 이펙트 제작' },
  { id: '5', name: 'Canva', rating: 4, desc: '기획안 레이아웃 구성 및 제안서 가공 시 하이엔드 템플릿 응용' },
  { id: '6', name: 'PowerPoint', rating: 5, desc: '학업 발표 및 프로덕션 협업 피칭 시 슬라이드 마스터링' }
];

export const INITIAL_EXPERIENCE: Experience[] = [
  { id: '1', year: '2025', title: '영상 프로덕션 입문', description: '독자적인 1인 미디어 제작 시스템 구축, 카메라 메커니즘과 조명, 포스 프로덕션 기초 지식 마스터.' },
  { id: '2', year: '2026.01', title: '시네마틱 다큐멘터리 [Goodbye Sejong] 제작', description: '기획부터 촬영, 사운드, 컬러 그레이딩까지 직접 올라운드 디렉팅하며 시네마틱 영상미 구현.' },
  { id: '3', year: '2026.04', title: '교내 예술제 및 주요 인터뷰 아카이브 제작 총괄', description: '인물 포트레이트 및 교내 이벤트의 다이내믹 무비 제작. 연출 및 편집 디렉터로 참여.' },
  { id: '4', year: '2026.06', title: '개인 시네마틱 브랜드 프로젝트 진행', description: 'A24 아트필름 감성을 담은 단편 영화 [시선] 제작 및 시네필 미학 구축.' },
  { id: '5', year: '현재', title: '개인 비주얼 브랜드 포트폴리오 론칭', description: '지속적인 영상 작업 업데이트와 취업, 대학 입시, 외주, 공모전을 위한 올인원 비주얼 허브 완비.' }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', label: 'Projects', value: '15+', iconName: 'FolderKanban' },
  { id: '2', label: 'Videos', value: '40+', iconName: 'Tv' },
  { id: '3', label: 'Editing', value: '700h+', iconName: 'Clock' },
  { id: '4', label: 'Filming Sessions', value: '55+', iconName: 'Radio' }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  { id: '1', name: '이민서', role: '세종고등학교 방송부 동료', content: '정승리 디렉터는 기획의 방향을 잃지 않고 프로젝트를 아주 책임감 있고 뚝심 있게 이끌어 갑니다. 촬영장에서도 배우들과 자연스러운 공감대를 이끌어내는 능력이 탁월합니다.', company: '세종고' },
  { id: '2', name: '박건우', role: '단편영화 [시선] 주연 배우', content: '정승리 피디의 컷 타이밍 감각과 사운드 조율은 정말 예술적입니다. 편집 퀄리티가 대단히 뛰어나서 무심히 지나친 장면도 시적이고 영화처럼 살려내 줍니다.', company: '시네필 클럽' },
  { id: '3', name: '지도교사 김형석', role: '예술 부장 교사', content: '프로그램에 대한 고집과 시각적 완결성을 함께 갖춘 뛰어난 인재입니다. 단순한 기능인이 아닌, 이야기가 지닌 힘을 이해하고 전하는 작가주의적 태도가 빛납니다.', company: '세종고등학교' }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    title: '렌즈 포커스',
    category: '카메라 사진'
  },
  {
    id: 'g2',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    title: '포트레이트 촬영 현장',
    category: '촬영 현장'
  },
  {
    id: 'g3',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    title: '노을 드론 숏',
    category: '드론 사진'
  },
  {
    id: 'g4',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    title: '다빈치 리졸브 그레이딩',
    category: '스크린샷'
  },
  {
    id: 'g5',
    imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e3a9?auto=format&fit=crop&w=800&q=80',
    title: '조명 셋업',
    category: '촬영 현장'
  },
  {
    id: 'g6',
    imageUrl: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=800&q=80',
    title: '시네 카메라 리그',
    category: '카메라 사진'
  }
];

export const PHILOSOPHY_QUOTE = {
  quote: "영상은 지나가버리는 찰나를 삶 속에 영원히 정지시키고 인화하는 기적적인 행위다.",
  author: "정승리"
};

export const INITIAL_PROFILE_INFO = {
  name: "정승리",
  subtitle: "CREATIVE VIDEO DIRECTING PORTFOLIO",
  roles: "VIDEO PRODUCER • EDITOR • STORYTELLER",
  introHeader: "사람들의 고유한 순간과 이야기를 영상 안에 시네마틱하게 기록합니다.",
  introBio: "안녕하세요. 영상 제작자 정승리입니다. 기획부터 촬영, 사운드 믹싱, 그리고 컬러 그레이딩까지 프로젝트의 시작과 완성을 끝까지 내 손으로 직접 책임지며, 서사가 있는 깊은 영상미를 빚어내는 것을 사랑합니다.",
  age: "19 // Youth",
  location: "Sejong City, Korea",
  experienceYears: "2+ Years // All-Rounder",
  email: "gvcssjofftherecord@gmail.com",
  phone: "010-XXXX-XXXX",
  kakao: "정승리 영상제작자",
  instagram: "@seungri_video",
  youtube: "Seungri Jeong YT",
  github: "github.com/seungri"
};

export const INITIAL_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'step1',
    title: '아이디어',
    sub: 'IDEA & INSPIRATION',
    icon: 'Sparkles',
    desc: '우연히 마주친 찰나, 흘려듣는 소리, 일상의 균열에서 서사를 발굴하고 핵심 영감을 구체화합니다.'
  },
  {
    id: 'step2',
    title: '기획',
    sub: 'PRE-PRODUCTION',
    icon: 'FolderKanban',
    desc: '시놉시스와 대본을 가공하고, 장소 섭외 및 촬영 동선, 조명 셋업 등을 한 치의 오차 없이 설계합니다.'
  },
  {
    id: 'step3',
    title: '촬영',
    sub: 'PRODUCTION',
    icon: 'Camera',
    desc: '자연광과 조명의 대비, 피사체의 감정선이 하나로 맞닿는 순간을 고감도 시네마 리그에 시적으로 포착합니다.'
  },
  {
    id: 'step4',
    title: '편집',
    sub: 'POST-PRODUCTION',
    icon: 'Film',
    desc: '컷 편집부터 정교한 다빈치 리졸브 그레이딩, 앰비언트 사운드 믹싱으로 시각적 쾌감을 조율합니다.'
  },
  {
    id: 'step5',
    title: '피드백',
    sub: 'FEEDBACK & REVISION',
    icon: 'MessageSquare',
    desc: '동료들과 관객의 피드백을 수렴하여 디테일한 0.1초의 호흡, 오디오 볼륨을 세밀하게 재조정합니다.'
  },
  {
    id: 'step6',
    title: '완성',
    sub: 'FINAL MASTERS',
    icon: 'Award',
    desc: '가장 완벽한 압축 코덱과 포맷으로 출력하여 세상과 마주할 준비가 된 독자적인 시네필 작품을 완성합니다.'
  }
];


