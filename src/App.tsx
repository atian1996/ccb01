import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  User,
  LogOut,
  FileText,
  Award,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Search,
  Play,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  ExternalLink,
  X,
  Download,
  ArrowRight,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Terminal,
  LayoutDashboard,
  Trophy,
  Volume2,
  Newspaper,
  Film,
  MessageSquare,
  CreditCard,
  Landmark,
  QrCode,
  Check,
} from 'lucide-react';
import {
  BANNER_SLIDES,
  BANNER_POSTER_1,
  COMPETITION_TRACKS,
  NOTICE_ITEMS,
  NEWS_ITEMS,
  MOMENT_CATEGORIES,
  MOMENT_ITEMS,
  FAQ_ITEMS,
  CERTIFICATE_RECORDS,
  UNIVERSITY_PARTNERS,
  LEADERSHIP_ORGS,
  INITIAL_COMPETITION_CATALOG,
  INITIAL_HOME_BANNERS,
  INITIAL_RECOMMENDED_COMP_IDS,
  INITIAL_DIVISIONS,
  DEFAULT_NEWS_COVER_SVG,
  HELP_CENTER_MARKDOWN_DOC,
  type CompetitionCatalogItem,
  computeCompetitionStatus,
  getCompetitionStatusLabel,
  type CompetitionTrack,
  type NoticeItem,
  type MomentCategory,
  type CertificateRecord,
  type RegistrationSubmission,
  type LeadershipOrg,
  type HomeBannerConfig,
  type DivisionRecord,
} from './data/competitionData';
import {
  TrackCoverIllustration,
  FeaturedNewsIllustration,
  MomentCardVisual,
  CertificateTrophyIllustration,
  UniversityCrest,
} from './components/VisualArtwork';
import {
  StandaloneAuthPage,
  StandaloneUserCenterPage,
  INITIAL_PLATFORM_MESSAGES,
  type PlatformMessageItem,
  type AuditLogEntry,
  type UserProfileData,
} from './components/AuthAndUserCenter';
import {
  CompetitionDirectoryPage,
  CompetitionDetailPage,
  AdminDashboardPage,
} from './components/CatalogAndAdminPages';
import {
  TeamRegistrationFormPage,
  INITIAL_CAPTAIN_TEAMS,
  INITIAL_PARTICIPATED_TEAMS,
  PLATFORM_DIRECTORY_USERS,
  isTeamOwnedByUser,
  getEffectiveUserStatus,
  type CaptainTeamRecord,
  type ParticipatedTeamRecord,
  type PlatformDirectoryUser,
  type UserExtendedRole,
} from './components/TeamRegistrationSystem';
import {
  INITIAL_REGISTRATION_CONFIGS,
  type EventRegistrationConfig,
} from './components/AdminRegistrationManagement';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_MANAGED_NEWS,
  INITIAL_MANAGED_MOMENTS,
  INITIAL_MANAGED_NOTICES,
  INITIAL_VERIFICATION_RECORDS,
  type InstitutionRecord,
  type ManagedNewsItem,
  type ManagedMomentItem,
  type ManagedNoticeItem,
  type VerificationApplicationRecord,
  FrontendNoticesPage,
  FrontendNoticeDetailPage,
  FrontendHelpCenterPage,
  HelpMarkdownDocumentView,
  FrontendNewsPage,
  FrontendNewsDetailPage,
  FrontendMomentsPage,
  FrontendMomentDetailPage,
  GlobalSiteSearchModal,
} from './components/InstitutionAndContentManagement';

export default function App() {
  // --- Page Routing View State ('home' | 'directory' | 'competition-detail' | 'registration-form' | 'notices' | 'notice-detail' | 'news' | 'news-detail' | 'moments' | 'moment-detail' | 'help' | 'auth' | 'user-center' | 'admin') ---
  const [currentView, setCurrentView] = useState<
    | 'home'
    | 'directory'
    | 'competition-detail'
    | 'registration-form'
    | 'notices'
    | 'notice-detail'
    | 'news'
    | 'news-detail'
    | 'moments'
    | 'moment-detail'
    | 'help'
    | 'auth'
    | 'user-center'
    | 'admin'
  >('home');
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [userCenterInitialTab, setUserCenterInitialTab] = useState<
    'profile' | 'certification' | 'registrations' | 'competitions' | 'messages'
  >('profile');

  // --- 后台【院校管理】、【内容管理 -> 通知公告 / 赛事新闻 / 赛事动态】、【认证管理】与前台实时共享状态 ---
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>(INITIAL_INSTITUTIONS);
  const [platformUsers, setPlatformUsers] = useState<PlatformDirectoryUser[]>(
    PLATFORM_DIRECTORY_USERS
  );
  const [managedNotices, setManagedNotices] = useState<ManagedNoticeItem[]>(
    INITIAL_MANAGED_NOTICES
  );
  const [verificationRecords, setVerificationRecords] = useState<
    VerificationApplicationRecord[]
  >(INITIAL_VERIFICATION_RECORDS);
  const [managedNews, setManagedNews] = useState<ManagedNewsItem[]>(INITIAL_MANAGED_NEWS);
  const [managedMoments, setManagedMoments] = useState<ManagedMomentItem[]>(
    INITIAL_MANAGED_MOMENTS
  );
  const [initialSelectedNoticeId, setInitialSelectedNoticeId] = useState<string | null>(null);
  const [initialSelectedNewsId, setInitialSelectedNewsId] = useState<string | null>(null);
  const [initialSelectedMomentId, setInitialSelectedMomentId] = useState<string | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);

  // 前台展示的已发布通知公告列表（按置顶优先、发布日期倒序）
  const publishedNotices = useMemo<NoticeItem[]>(() => {
    return [...managedNotices]
      .filter((n) => n.publishStatus === 'published')
      .sort((a, b) => {
        if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
          return Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
        }
        return b.fullDate.localeCompare(a.fullDate);
      });
  }, [managedNotices]);

  // 合并后台管理的新闻/动态与首页静态精选条目，使首页点击任意条目也可无缝进入二级详情页
  const allFrontendNews = useMemo<ManagedNewsItem[]>(() => {
    const existingIds = new Set(managedNews.map((n) => n.id));
    const homeFallback: ManagedNewsItem[] = NEWS_ITEMS.filter((n) => !existingIds.has(n.id)).map(
      (n) => ({
        id: n.id,
        title: n.title,
        tags: [],
        coverImage: n.isFeaturedCover
          ? 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=960&q=80'
          : DEFAULT_NEWS_COVER_SVG,
        summary: n.summary,
        source: n.source,
        content: n.content.join('\n\n'),
        publishStatus: 'published',
        publishTime: `${n.date} 10:00`,
        isPinned: n.isFeaturedCover,
        viewsCount: 9680,
      })
    );
    return [...managedNews, ...homeFallback];
  }, [managedNews]);

  const allFrontendMoments = useMemo<ManagedMomentItem[]>(() => {
    const existingIds = new Set(managedMoments.map((m) => m.id));
    const coverPool = [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    ];
    const homeFallback: ManagedMomentItem[] = MOMENT_ITEMS.filter(
      (m) => !existingIds.has(m.id)
    ).map((m, idx) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      mediaType: m.mediaType,
      coverImage: coverPool[idx % coverPool.length],
      summary: m.summary,
      source: m.authorOrTeam,
      content: m.content.join('\n\n'),
      videoUrl:
        m.mediaType === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          : undefined,
      videoDuration: m.duration || (m.mediaType === 'video' ? '04:28' : undefined),
      videoHighlights: m.videoHighlights,
      publishStatus: 'published',
      publishTime: `${m.date} 14:00`,
      isPinned: false,
      viewsCount: 8420,
    }));
    return [...managedMoments, ...homeFallback];
  }, [managedMoments]);

  const enabledSchoolNames = useMemo(
    () => institutions.filter((inst) => inst.platformStatus === 'enabled').map((inst) => inst.name),
    [institutions]
  );

  // --- 赛事目录、后台赛事管理与【报名管理】配置共享状态 ---
  const [competitions, setCompetitions] = useState<CompetitionCatalogItem[]>(
    INITIAL_COMPETITION_CATALOG
  );
  const [registrationConfigs, setRegistrationConfigs] = useState<EventRegistrationConfig[]>(
    INITIAL_REGISTRATION_CONFIGS
  );
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(
    INITIAL_COMPETITION_CATALOG[0].id
  );

  // --- 报名表填写页 & 我的报名（队长视角 + 队员/老师视角）状态 ---
  const [captainTeams, setCaptainTeams] = useState<CaptainTeamRecord[]>(INITIAL_CAPTAIN_TEAMS);
  const [participatedTeams, setParticipatedTeams] = useState<ParticipatedTeamRecord[]>(
    INITIAL_PARTICIPATED_TEAMS
  );
  const [regInitialSubTrack, setRegInitialSubTrack] = useState<string | undefined>(undefined);
  const [editingDraftTeam, setEditingDraftTeam] = useState<CaptainTeamRecord | null>(null);

  // --- Auth & User Profile State（平台默认打开后为已登录状态） ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfileData>({
    username: 'linyuanhang',
    name: '林远航',
    idCard: '110108200305162819',
    role: 'student',
    roleLabel: '参赛学生',
    university: '北京航空航天大学',
    educationLevel: '本科',
    majorOrDept: '网络空间安全',
    enrollmentDate: '2024-09',
    graduationDate: '2028-06',
    studentId: 'BY2406118',
    email: 'linyuanhang@buaa.edu.cn',
    phone: '13810246921',
    isVerified: true,
    realNameStatus: 'verified',
    realNameVerifiedAt: '2026-10-15 10:00:00',
    identityType: 'student',
    academicStatus: 'verified',
    academicVerifiedAt: '2026-10-15',
    lastLoginIp: '202.112.128.45',
    lastLoginLocation: '北京市海淀区',
    currentLoginIp: '202.112.128.45',
    currentLoginLocation: '北京市海淀区',
  });

  // 前台个人中心修改资料或完成实名/学生/教师认证时，实时同步回写全平台用户总表 platformUsers
  const handleUpdateCurrentUser = (updated: UserProfileData) => {
    const prevUsername = currentUser.username;
    const prevPhone = currentUser.phone;
    const prevEmail = currentUser.email;
    setCurrentUser(updated);
    setPlatformUsers((prev) =>
      prev.map((u) => {
        if (
          (u.username || '').toLowerCase() === prevUsername.toLowerCase() ||
          (prevPhone && u.phone === prevPhone) ||
          (prevEmail && u.email.toLowerCase() === prevEmail.toLowerCase())
        ) {
          const nextIdentity = updated.identityType || u.identityType || 'student';
          const isRealVerified = updated.realNameStatus === 'verified';
          const isAcadVerified = updated.academicStatus === 'verified';
          const nextBaseRole = isAcadVerified
            ? nextIdentity === 'teacher'
              ? '教师'
              : '学生'
            : u.baseRole || '普通用户';
          return {
            ...u,
            username: updated.username,
            realName: isRealVerified ? updated.name : u.realName,
            name: isRealVerified && updated.name ? updated.name : updated.username,
            phone: updated.phone,
            email: updated.email,
            university: updated.university || u.university,
            educationLevel: updated.educationLevel || u.educationLevel,
            majorOrDept: updated.majorOrDept || u.majorOrDept,
            enrollmentDate: updated.enrollmentDate || u.enrollmentDate,
            graduationDate: updated.graduationDate || u.graduationDate,
            identityType: nextIdentity,
            baseRole: nextBaseRole,
            isRealNameVerified: isRealVerified,
            isAcademicOrTeacherVerified: isAcadVerified,
          };
        }
        return u;
      })
    );
  };

  // 后台【用户管理】修改当前登录用户信息、停用或删除账号时，实时联动前台登录态与个人资料
  useEffect(() => {
    if (!isLoggedIn) return;
    const matched = platformUsers.find(
      (u) => (u.username || '').toLowerCase() === currentUser.username.toLowerCase()
    );
    if (!matched) return;
    if (matched.isDeleted || getEffectiveUserStatus(matched) === '停用') {
      setIsLoggedIn(false);
      if (currentView === 'user-center' || currentView === 'registration-form') {
        setCurrentView('home');
      }
      return;
    }
    const nextRealNameStatus = matched.isRealNameVerified ? 'verified' : 'unverified';
    const nextRealName =
      matched.isRealNameVerified && matched.realName && matched.realName !== '-'
        ? matched.realName
        : '';
    const nextIdCard = matched.isRealNameVerified ? matched.idNumber || '' : '';
    const nextVerified = Boolean(
      matched.isRealNameVerified && matched.isAcademicOrTeacherVerified
    );
    if (
      matched.phone !== currentUser.phone ||
      matched.email !== currentUser.email ||
      (matched.university && matched.university !== currentUser.university) ||
      nextRealNameStatus !== currentUser.realNameStatus ||
      nextRealName !== currentUser.name ||
      nextIdCard !== currentUser.idCard ||
      nextVerified !== currentUser.isVerified
    ) {
      setCurrentUser((prev) => ({
        ...prev,
        name: nextRealName,
        idCard: nextIdCard,
        realNameStatus: nextRealNameStatus,
        isVerified: nextVerified,
        phone: matched.phone,
        email: matched.email,
        university: matched.university || prev.university,
      }));
    }
  }, [
    platformUsers,
    isLoggedIn,
    currentUser.username,
    currentUser.phone,
    currentUser.email,
    currentUser.university,
    currentUser.name,
    currentUser.idCard,
    currentUser.realNameStatus,
    currentUser.isVerified,
    currentView,
  ]);

  // 指标2：历史密码记录库（用于找回密码时校验新密码不能与原密码及最近N次历史密码相同）
  const [passwordHistory, setPasswordHistory] = useState<string[]>([
    'Sec2026Pass',
    'XxCup2025Abc',
    'Buaa2024Sec',
  ]);

  // 指标20：静默操作日志记录库
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-init-1',
      operator: 'linyuanhang',
      ip: '202.112.128.45',
      location: '北京市海淀区',
      time: '2026-10-28 09:15:02',
      device: 'Windows 11 / Chrome 130.0',
      action: '教育部学信网在线验证码核验',
      result: '成功',
      detail: '学籍验证码 A982-7310-5529-1840 自动核验通过',
    },
    {
      id: 'log-init-2',
      operator: 'tsinghua_admin',
      ip: '166.111.4.100',
      location: '北京市海淀区',
      time: '2026-10-28 08:40:19',
      device: 'macOS / Safari 18.0',
      action: '高校管理员双因子(2FA)登录',
      result: '成功',
      detail: '通过密码+动态6位验证码完成管理端登录',
    },
  ]);

  const handleAddAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'time'>) => {
    const now = new Date();
    const timeStr = `2026-10-28 ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setAuditLogs((prev) => [{ ...entry, id: `log-${Date.now()}-${Math.random()}`, time: timeStr }, ...prev]);
  };

  // 指标2：异地登录站内弹窗提醒状态
  const [abnormalLocationModal, setAbnormalLocationModal] = useState<{
    lastIp: string;
    lastLoc: string;
    currIp: string;
    currLoc: string;
    email: string;
  } | null>(null);

  // 1、未登录时点击“立即报名”的拦截弹窗与登录成功后返回赛事详情页标记
  const [unloggedInterceptModal, setUnloggedInterceptModal] = useState<{
    competitionId: string;
    competitionTitle: string;
  } | null>(null);
  const [postLoginRedirectView, setPostLoginRedirectView] = useState<'competition-detail' | null>(
    null
  );
  // 5、教师误点“立即报名”的拦截弹窗
  const [teacherInterceptModal, setTeacherInterceptModal] = useState<{
    competitionId: string;
    competitionTitle: string;
  } | null>(null);
  // 6、学生认证未完成（未实名、未申请、审核中、已驳回）时点击“立即报名”的拦截弹窗
  const [unverifiedInterceptModal, setUnverifiedInterceptModal] = useState<CompetitionTrack | null>(null);
  // 7、学生已有报名队伍 -> 弹窗提示已有队伍，并提供【取消】【前往我的报名】按钮
  const [existingTeamInterceptModal, setExistingTeamInterceptModal] = useState<{
    competitionId: string;
    competitionTitle: string;
    teamName: string;
    roleDesc: string;
    selectedSubTrackName?: string;
  } | null>(null);

  const [notifications, setNotifications] = useState<PlatformMessageItem[]>(
    INITIAL_PLATFORM_MESSAGES
  );

  // 消息卡片/顶部铃铛快捷点击【同意】加入队伍时的认证状态拦截弹窗
  const [inviteVerifyInterceptModal, setInviteVerifyInterceptModal] = useState<{
    open: boolean;
    teamLabel: string;
  } | null>(null);

  // 消息快捷操作成功反馈浮层
  const [msgActionToast, setMsgActionToast] = useState<string | null>(null);

  useEffect(() => {
    if (!msgActionToast) return;
    const t = setTimeout(() => setMsgActionToast(null), 3200);
    return () => clearTimeout(t);
  }, [msgActionToast]);

  // 快捷操作拦截 + 数据状态同步：在消息卡片或铃铛悬浮框中直接点击【同意】加入队伍
  const handleAcceptInviteFromMessage = (msg: PlatformMessageItem) => {
    // 1. 后台校验该用户的实名与学籍/教师认证状态
    if (
      !currentUser.isVerified ||
      currentUser.realNameStatus !== 'verified' ||
      currentUser.academicStatus !== 'verified'
    ) {
      setInviteVerifyInterceptModal({
        open: true,
        teamLabel: msg.inviteTeamPayload?.teamName || msg.title,
      });
      return;
    }

    // 2. 认证通过 -> 更新消息状态为“已同意”并标记已读
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === msg.id
          ? { ...item, inviteStatus: 'accepted', unread: false }
          : item
      )
    );

    // 3. 在“我的报名 - 我参与的队伍”中立刻同步出现该队伍（或更新状态为 joined）
    setParticipatedTeams((prev) => {
      if (msg.relatedParticipatedTeamId) {
        const exists = prev.some((p) => p.id === msg.relatedParticipatedTeamId);
        if (exists) {
          return prev.map((p) =>
            p.id === msg.relatedParticipatedTeamId ? { ...p, status: 'joined' } : p
          );
        }
      }
      if (msg.inviteTeamPayload) {
        return [{ ...msg.inviteTeamPayload, status: 'joined' }, ...prev];
      }
      return prev;
    });

    setMsgActionToast(
      `已同意入队邀请！该队伍已同步至【个人中心 -> 我的报名 -> 我参与的队伍】`
    );
  };

  // 在消息卡片或铃铛悬浮框中点击【拒绝】加入队伍
  const handleRejectInviteFromMessage = (msg: PlatformMessageItem) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === msg.id
          ? { ...item, inviteStatus: 'rejected', unread: false }
          : item
      )
    );

    if (msg.relatedParticipatedTeamId) {
      setParticipatedTeams((prev) =>
        prev.map((p) =>
          p.id === msg.relatedParticipatedTeamId
            ? { ...p, status: 'declined', declineReason: '在我的消息中拒绝邀请' }
            : p
        )
      );
    }

    setMsgActionToast('已拒绝该组队邀请，状态已同步更新');
  };

  // 当用户在“我的报名 - 我参与的队伍”中同意或拒绝邀请时，反向同步更新“我的消息”状态
  const handleUpdateParticipatedTeamsSync = (nextTeams: ParticipatedTeamRecord[]) => {
    setParticipatedTeams(nextTeams);
    setNotifications((prev) =>
      prev.map((msg) => {
        if (!msg.relatedParticipatedTeamId) return msg;
        const matchedTeam = nextTeams.find((t) => t.id === msg.relatedParticipatedTeamId);
        if (!matchedTeam) return msg;
        if (matchedTeam.status === 'joined' && msg.inviteStatus !== 'accepted') {
          return { ...msg, inviteStatus: 'accepted', unread: false };
        }
        if (matchedTeam.status === 'declined' && msg.inviteStatus !== 'rejected') {
          return { ...msg, inviteStatus: 'rejected', unread: false };
        }
        return msg;
      })
    );
  };

  const [myRegistrations, setMyRegistrations] = useState<RegistrationSubmission[]>([
    {
      id: 'reg-init-1',
      trackId: 'track-ai-2026',
      trackTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
      teamName: '北航智盾先锋队',
      university: '北京航空航天大学',
      captainName: '林远航',
      studentId: 'BY2406118',
      phone: '13810246921',
      email: 'linyuanhang@buaa.edu.cn',
      memberCount: 3,
      advisorName: '赵振宇 教授',
      submittedAt: '2026-06-12 14:30',
      status: '已通过初审',
    },
  ]);

  // --- Header Dropdown States ---
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // --- Module 1: Banner Carousel State & Homepage Config State ---
  const [homeBanners, setHomeBanners] = useState<HomeBannerConfig[]>(INITIAL_HOME_BANNERS);
  const [recommendedCompIds, setRecommendedCompIds] = useState<string[]>(
    INITIAL_RECOMMENDED_COMP_IDS
  );
  const [divisions, setDivisions] = useState<DivisionRecord[]>(INITIAL_DIVISIONS);
  const [helpCenterContent, setHelpCenterContent] = useState<string>(HELP_CENTER_MARKDOWN_DOC);

  const activeHomeBanners = useMemo(() => {
    const enabled = [...homeBanners]
      .filter((b) => b.isEnabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return enabled.length > 0 ? enabled : homeBanners;
  }, [homeBanners]);

  const homeRecommendedCompetitions = useMemo(() => {
    const picked: CompetitionCatalogItem[] = [];
    recommendedCompIds.forEach((cid) => {
      const found = competitions.find((c) => c.id === cid && c.isPublic !== false);
      if (found && !picked.some((p) => p.id === found.id)) {
        picked.push(found);
      }
    });
    if (picked.length < 3) {
      competitions
        .filter((c) => c.isPublic !== false)
        .forEach((c) => {
          if (picked.length < 3 && !picked.some((p) => p.id === c.id)) {
            picked.push(c);
          }
        });
    }
    return picked.slice(0, 3);
  }, [competitions, recommendedCompIds]);

  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);

  useEffect(() => {
    if (currentBannerIdx >= activeHomeBanners.length) {
      setCurrentBannerIdx(0);
    }
  }, [activeHomeBanners.length, currentBannerIdx]);

  useEffect(() => {
    if (bannerPaused || activeHomeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % activeHomeBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [bannerPaused, activeHomeBanners.length]);

  // --- Module 4: Moments Carousel & Category Tab State（联动后台内容管理 -> 赛事动态已发布数据，默认展示进展报道） ---
  const [activeMomentTab, setActiveMomentTab] = useState<MomentCategory>('进展报道');
  const [momentStartIndex, setMomentStartIndex] = useState(0);

  const publishedHomeMoments = useMemo(() => {
    const variantPool: Array<
      'arena' | 'defense' | 'hackathon' | 'team' | 'expert' | 'behind' | 'award' | 'interview'
    > = ['arena', 'defense', 'hackathon', 'team', 'expert', 'behind', 'award', 'interview'];
    const sorted = [...allFrontendMoments]
      .filter((m) => m.publishStatus === 'published')
      .sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));
    return sorted.map((m, idx) => {
      const staticMatch = MOMENT_ITEMS.find((sm) => sm.id === m.id);
      return {
        id: m.id,
        title: m.title,
        category: m.category,
        mediaType: m.mediaType,
        date: m.publishTime.split(' ')[0] || m.publishTime,
        visualVariant: staticMatch?.visualVariant || variantPool[idx % variantPool.length],
      };
    });
  }, [allFrontendMoments]);

  const orderedMoments = useMemo(() => {
    const primary = publishedHomeMoments.filter((m) => m.category === activeMomentTab);
    const others = publishedHomeMoments.filter((m) => m.category !== activeMomentTab).slice(0, 4);
    return [...primary, ...others];
  }, [activeMomentTab, publishedHomeMoments]);

  const handleMomentTabChange = (cat: MomentCategory) => {
    setActiveMomentTab(cat);
    setMomentStartIndex(0);
  };

  const maxMomentStartIndex = Math.max(0, orderedMoments.length - 5);

  // --- Module 5: FAQ Accordion & Certificate Query State ---
  const [openFaqId, setOpenFaqId] = useState<string>('');
  const [certIdentity, setCertIdentity] = useState<string>('');
  const [certNumber, setCertNumber] = useState<string>('');
  const [certQueryError, setCertQueryError] = useState<string | null>(null);
  const [certSearchResult, setCertSearchResult] = useState<{
    searched: boolean;
    query: string;
    records: CertificateRecord[];
  } | null>(null);

  // --- Module 6: Universities View Mode (Marquee vs Manual Step) ---
  const [uniAutoScroll, setUniAutoScroll] = useState<boolean>(false);
  const [uniManualOffset, setUniManualOffset] = useState<number>(0);

  // --- Active Modals State ---
  const [allUniversitiesModalOpen, setAllUniversitiesModalOpen] = useState(false);
  const [selectedOrgModal, setSelectedOrgModal] = useState<LeadershipOrg | null>(null);

  // --- Handlers ---
  const scrollToSection = (elementId: string) => {
    setHelpDropdownOpen(false);
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
      return;
    }
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 点击赛事卡片或Banner进入对应赛事详情页（二级页面）
  const handleNavigateToTrackDetail = (track: CompetitionTrack) => {
    const matchedComp =
      competitions.find((c) => c.id === track.catalogId) ||
      competitions.find((c) => c.title.includes(track.title) || track.title.includes(c.title)) ||
      competitions[0];
    setSelectedCompetitionId(matchedComp.id);
    setCurrentView('competition-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 在「赛事详情页」点击“立即报名”（仅报名在期限内可点击） -> 严格按7种用户情形方案执行：
  // 1、未登录 -> 弹窗提示去登录（登录成功后返回当前赛事详情页）
  // 5、教师误点报名 -> 弹窗提示仅支持学生创建队伍
  // 6、学生认证未完成（含未实名、未申请、审核中、已驳回） -> 弹窗提示前往用户认证
  // 7、学生已有报名队伍 -> 弹窗提示前往我的报名
  const handleCatalogCompetitionRegister = (
    comp: CompetitionCatalogItem,
    selectedSubTrackName?: string
  ) => {
    // 1、未登录 -> 弹窗提示：“您尚未登录，请先登录后再报名。”，操作：【稍后再说】/【去登录】
    if (!isLoggedIn) {
      setUnloggedInterceptModal({
        competitionId: comp.id,
        competitionTitle: comp.title,
      });
      return;
    }

    // 5、报名在期限内，教师误点报名
    const isCertifiedTeacher =
      (currentUser.identityType === 'teacher' &&
        currentUser.academicStatus === 'verified' &&
        currentUser.realNameStatus === 'verified') ||
      currentUser.role === 'teacher';
    if (isCertifiedTeacher) {
      setTeacherInterceptModal({
        competitionId: comp.id,
        competitionTitle: comp.title,
      });
      return;
    }

    // 6、报名在期限内，学生认证未完成（包含：未实名、未完成学生认证（未申请、审核中、已驳回））
    const isVerifiedStudent =
      currentUser.realNameStatus === 'verified' &&
      currentUser.identityType === 'student' &&
      currentUser.academicStatus === 'verified' &&
      currentUser.isVerified;
    if (!isVerifiedStudent) {
      const calcStatus = computeCompetitionStatus(comp.startDate, comp.endDate);
      const statusLabel = getCompetitionStatusLabel(calcStatus);
      setUnverifiedInterceptModal({
        id: comp.id,
        catalogId: comp.id,
        title: comp.title,
        category: comp.customTags.join(' · ') || '官方认证赛事',
        startDate: comp.startDate,
        endDate: comp.endDate,
        organizer: comp.organizer || '“XX杯”全国网数智安全大赛组委会',
        coOrganizer: '国家信息安全工程技术研究中心',
        status:
          calcStatus === 'ongoing'
            ? 'registering'
            : calcStatus === 'upcoming'
            ? 'upcoming'
            : 'ended',
        statusLabel,
        visualType: comp.coverTheme,
        prizePool: '¥ 500,000',
        teamSize: '1 - 4 人/队',
        targetGroup: '全国高等院校全日制在校学生',
        summary: comp.summary,
        schedule: [],
        requirements: [],
        registeredTeamsCount: 520,
      });
      return;
    }

    // 7、报名在期限内，学生已有报名队伍 -> 弹窗提示已有队伍，并提供【取消】【前往我的报名】按钮
    const isDefaultDemoStudent =
      currentUser.username === 'linyuanhang' || currentUser.name === '林远航';
    const existingAsCaptain = captainTeams.find(
      (t) => t.competitionId === comp.id && isTeamOwnedByUser(t, currentUser)
    );
    const existingAsMember = isDefaultDemoStudent
      ? participatedTeams.find(
          (p) =>
            p.competitionId === comp.id &&
            p.status !== 'declined' &&
            p.status !== 'pending_invite'
        )
      : undefined;
    if (existingAsCaptain || existingAsMember) {
      setExistingTeamInterceptModal({
        competitionId: comp.id,
        competitionTitle: comp.title,
        teamName: existingAsCaptain ? existingAsCaptain.teamName : existingAsMember!.teamName,
        roleDesc: existingAsCaptain ? '队长（我发起的队伍）' : existingAsMember!.myRoleInTeam,
        selectedSubTrackName,
      });
      return;
    }

    // 全部通过 -> 进入“报名表单填写页”
    setSelectedCompetitionId(comp.id);
    setRegInitialSubTrack(selectedSubTrackName);
    setEditingDraftTeam(null);
    setCurrentView('registration-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBannerConfigAction = (banner: HomeBannerConfig) => {
    const rawTarget = (banner.targetValue || '').trim();
    if (!rawTarget) return;

    // 兼容标准 URL 中的站内赛事路由（如 https://xxcup.edu.cn/competitions/comp-2026-main）或直接赛事 ID
    const compMatch = rawTarget.match(/\/competitions\/([a-zA-Z0-9_-]+)/);
    const matchedCompId = compMatch ? compMatch[1] : banner.linkType === 'competition' ? rawTarget : null;
    if (matchedCompId) {
      const foundComp =
        competitions.find((c) => c.id === matchedCompId) || competitions[0];
      if (foundComp) {
        setSelectedCompetitionId(foundComp.id);
        setCurrentView('competition-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 兼容标准 URL 中的站内栏目路由（如 https://xxcup.edu.cn/notices）或旧版 view 标识
    if (rawTarget === 'notices' || rawTarget.endsWith('/notices')) {
      setInitialSelectedNoticeId(null);
      setCurrentView('notices');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (rawTarget === 'news' || rawTarget.endsWith('/news')) {
      setInitialSelectedNewsId(null);
      setCurrentView('news');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (rawTarget === 'moments' || rawTarget.endsWith('/moments')) {
      setInitialSelectedMomentId(null);
      setCurrentView('moments');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (
      rawTarget === 'directory' ||
      rawTarget === 'competitions' ||
      rawTarget.endsWith('/directory') ||
      rawTarget.endsWith('/competitions')
    ) {
      setCurrentView('directory');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (rawTarget === 'help' || rawTarget.endsWith('/help')) {
      setCurrentView('help');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (rawTarget === 'utility-service-section' || rawTarget.endsWith('#utility-service-section')) {
      scrollToSection('utility-service-section');
      return;
    }
    if (rawTarget.startsWith('#')) {
      scrollToSection(rawTarget.slice(1));
      return;
    }

    // 统一标准外部 URL 跳转
    const a = document.createElement('a');
    a.href = rawTarget;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  const handleCertificateSearch = (
    e?: React.FormEvent,
    preset?: { identity?: string; certNo?: string }
  ) => {
    if (e) e.preventDefault();
    const idVal = (preset?.identity !== undefined ? preset.identity : certIdentity).trim();
    const noVal = (preset?.certNo !== undefined ? preset.certNo : certNumber).trim();

    if (preset) {
      if (preset.identity !== undefined) setCertIdentity(preset.identity);
      if (preset.certNo !== undefined) setCertNumber(preset.certNo);
    }

    if (!idVal && !noVal) {
      setCertQueryError('请填写姓名/身份证号或证书编号进行查询');
      return;
    }
    setCertQueryError(null);

    const matched = CERTIFICATE_RECORDS.filter((rec) => {
      const matchId =
        !idVal ||
        rec.holderName.toLowerCase().includes(idVal.toLowerCase()) ||
        rec.idCard.toLowerCase() === idVal.toLowerCase() ||
        rec.idCard.toLowerCase().includes(idVal.toLowerCase());
      const matchNo =
        !noVal ||
        rec.certId.toLowerCase() === noVal.toLowerCase() ||
        rec.certId.toLowerCase().includes(noVal.toLowerCase());
      return matchId && matchNo;
    });

    const queryLabel = [idVal, noVal].filter(Boolean).join(' / ');
    setCertSearchResult({
      searched: true,
      query: queryLabel,
      records: matched,
    });
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const publishedHomeNews = useMemo(() => {
    const list = [...managedNews]
      .filter((n) => n.publishStatus === 'published')
      .sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));
    return list.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      source: n.source,
      date: n.publishTime.split(' ')[0] || n.publishTime,
      isFeaturedCover: n.isPinned,
    }));
  }, [managedNews]);
  const featuredNews =
    publishedHomeNews.find((n) => n.isFeaturedCover) || publishedHomeNews[0] || NEWS_ITEMS[0];
  const listNews = publishedHomeNews.filter((n) => n.id !== featuredNews.id).slice(0, 4);

  // =========================================================================
  // 独立页面路由 1：注册 / 登录 / 找回密码 独立页面
  // =========================================================================
  if (currentView === 'auth') {
    return (
      <StandaloneAuthPage
        initialTab={authInitialTab}
        onBackHome={() => {
          if (postLoginRedirectView === 'competition-detail') {
            setPostLoginRedirectView(null);
            setCurrentView('competition-detail');
          } else {
            setCurrentView('home');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLoginSuccess={(user, redirectTarget, options) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          if (postLoginRedirectView === 'competition-detail') {
            setPostLoginRedirectView(null);
            setCurrentView('competition-detail');
          } else {
            if (redirectTarget === 'user-center') {
              setUserCenterInitialTab('profile');
            }
            setCurrentView(redirectTarget);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });

          if (options?.abnormalLocationAlert) {
            setAbnormalLocationModal({
              lastIp: user.lastLoginIp,
              lastLoc: user.lastLoginLocation,
              currIp: user.currentLoginIp,
              currLoc: user.currentLoginLocation,
              email: user.email,
            });
            setNotifications((prev) => [
              {
                id: `notif-loc-${Date.now()}`,
                title: '【安全告警】异地登录提醒',
                desc: `检测到您的账号于 ${user.currentLoginLocation} (${user.currentLoginIp}) 登录，与常用地(${user.lastLoginLocation})不符，已同步发送告警邮件。`,
                time: '刚刚',
                unread: true,
              },
              ...prev,
            ]);
          }
        }}
        auditLogs={auditLogs}
        onAddAuditLog={handleAddAuditLog}
        passwordHistory={passwordHistory}
        onAddPasswordHistory={(newPwd) =>
          setPasswordHistory((prev) => [newPwd, ...prev.filter((p) => p !== newPwd)].slice(0, 5))
        }
        platformUsers={platformUsers}
        onUpdatePlatformUsers={setPlatformUsers}
      />
    );
  }

  // =========================================================================
  // 独立页面路由 2：【运营管理后台】独立页面（左侧导航栏 + 赛事管理 + 报名管理 + 认证管理 + 内容管理 + 系统管理）
  // =========================================================================
  if (currentView === 'admin') {
    return (
      <AdminDashboardPage
        competitions={competitions}
        onUpdateCompetitions={(nextList) => setCompetitions(nextList)}
        registrationConfigs={registrationConfigs}
        onUpdateRegistrationConfigs={setRegistrationConfigs}
        captainTeams={captainTeams}
        onUpdateCaptainTeams={setCaptainTeams}
        institutions={institutions}
        onUpdateInstitutions={setInstitutions}
        platformUsers={platformUsers}
        onUpdatePlatformUsers={setPlatformUsers}
        managedNews={managedNews}
        onUpdateManagedNews={setManagedNews}
        managedMoments={managedMoments}
        onUpdateManagedMoments={setManagedMoments}
        managedNotices={managedNotices}
        onUpdateManagedNotices={setManagedNotices}
        homeBanners={homeBanners}
        onChangeHomeBanners={setHomeBanners}
        recommendedCompIds={recommendedCompIds}
        onChangeRecommendedCompIds={setRecommendedCompIds}
        divisions={divisions}
        onChangeDivisions={setDivisions}
        helpCenterContent={helpCenterContent}
        onChangeHelpCenterContent={setHelpCenterContent}
        verificationRecords={verificationRecords}
        onUpdateVerificationRecords={setVerificationRecords}
        onApproveVerificationSync={(record) => {
          if (record.applicantType === 'univ_admin') {
            setPlatformUsers((prev) =>
              prev.map((u) => {
                if (
                  (u.username || '').toLowerCase() === record.username.toLowerCase() ||
                  (record.phone && u.phone === record.phone)
                ) {
                  const existingRoles = u.extendedRoles || [];
                  const nextRoles: UserExtendedRole[] = existingRoles.includes('高校管理员')
                    ? existingRoles
                    : [...existingRoles, '高校管理员'];
                  const nextTags = Array.from(new Set([...(u.tags || []), '高校管理员']));
                  return {
                    ...u,
                    extendedRoles: nextRoles,
                    tags: nextTags,
                  };
                }
                return u;
              })
            );
            if (
              (currentUser.username || '').toLowerCase() === record.username.toLowerCase() ||
              (record.phone && currentUser.phone === record.phone)
            ) {
              setCurrentUser((prev) => ({
                ...prev,
                univAdminStatus: 'verified',
                univAdminVerifiedAt: '2026-10-28 15:20:00',
                univAdminReviewer: record.reviewer || '组委会超级管理员',
                univAdminReviewedAt: '2026-10-28 15:20:00',
                univAdminRejectReason: undefined,
              }));
            }
            setNotifications((prev) => [
              {
                id: `notif-admin-pass-${Date.now()}`,
                title: '【认证通过】高校管理员认证审核已通过',
                desc: `恭喜您！您提交的【${record.university}】高校管理员资质认证已由大赛组委会审核通过，您已正式开通本校高校管理员工作台权限。`,
                time: '刚刚',
                unread: true,
              },
              ...prev,
            ]);
            handleAddAuditLog({
              operator: currentUser.username || 'admin',
              ip: currentUser.currentLoginIp,
              location: currentUser.currentLoginLocation,
              device: 'Windows 11 / Chrome 130.0',
              action: '审核通过高校管理员认证',
              result: '成功',
              detail: `申请人：${record.realName} (${record.username})，所属高校：${record.university}`,
            });
            return;
          }

          const nextBaseRole = record.applicantType === 'teacher' ? '教师' : '学生';
          const nextIdentity = record.applicantType === 'teacher' ? 'teacher' : 'student';
          setPlatformUsers((prev) =>
            prev.map((u) => {
              if (
                (u.username || '').toLowerCase() === record.username.toLowerCase() ||
                (record.phone && u.phone === record.phone)
              ) {
                return {
                  ...u,
                  university: record.university,
                  educationLevel:
                    record.educationLevel ||
                    (record.applicantType === 'student' ? record.levelOrTitle : u.educationLevel),
                  majorOrDept: record.majorOrDept,
                  enrollmentDate: record.enrollmentDate || u.enrollmentDate,
                  graduationDate: record.graduationDate || u.graduationDate,
                  identityType: nextIdentity,
                  baseRole: nextBaseRole,
                  isRealNameVerified: true,
                  isAcademicOrTeacherVerified: true,
                };
              }
              return u;
            })
          );
          if (
            (currentUser.username || '').toLowerCase() === record.username.toLowerCase() ||
            (record.phone && currentUser.phone === record.phone)
          ) {
            setCurrentUser((prev) => ({
              ...prev,
              role: nextIdentity,
              roleLabel: nextIdentity === 'teacher' ? '指导教师' : '参赛学生',
              identityType: nextIdentity,
              university: record.university,
              educationLevel:
                record.educationLevel ||
                (record.applicantType === 'student' ? record.levelOrTitle : prev.educationLevel),
              majorOrDept: record.majorOrDept,
              teacherMajor: record.teacherMajor || prev.teacherMajor,
              enrollmentDate: record.enrollmentDate || prev.enrollmentDate,
              graduationDate: record.graduationDate || prev.graduationDate,
              studentId: record.studentOrStaffId,
              academicStatus: 'verified',
              academicVerifiedAt: '2026-10-28',
              academicRejectReason: undefined,
              isVerified: prev.realNameStatus === 'verified',
            }));
          }
          setNotifications((prev) => [
            {
              id: `notif-verify-pass-${Date.now()}`,
              title: `【认证通过】${
                record.applicantType === 'student' ? '学生认证' : '指导教师资格认证'
              }审核已通过`,
              desc: `您提交的 ${record.university}（${record.majorOrDept}）认证信息已由管理员审核通过，认证状态已更新为【验证成功】。`,
              time: '刚刚',
              unread: true,
            },
            ...prev,
          ]);
          handleAddAuditLog({
            operator: currentUser.username || 'admin',
            ip: currentUser.currentLoginIp,
            location: currentUser.currentLoginLocation,
            device: 'Windows 11 / Chrome 130.0',
            action: `审核通过${record.applicantType === 'student' ? '学生认证' : '教师认证'}`,
            result: '成功',
            detail: `申请人：${record.realName} (${record.username})，所属高校：${record.university}`,
          });
        }}
        onRejectVerificationSync={(record, reason) => {
          if (record.applicantType === 'univ_admin') {
            if (
              (currentUser.username || '').toLowerCase() === record.username.toLowerCase() ||
              (record.phone && currentUser.phone === record.phone)
            ) {
              setCurrentUser((prev) => ({
                ...prev,
                univAdminStatus: 'rejected',
                univAdminRejectReason: reason,
                univAdminReviewer: record.reviewer || '组委会超级管理员',
                univAdminReviewedAt: '2026-10-28 15:25:00',
              }));
            }
            setNotifications((prev) => [
              {
                id: `notif-admin-rej-${Date.now()}`,
                title: '【认证驳回】高校管理员认证审核未通过',
                desc: `您提交的【${record.university}】高校管理员认证申请被驳回（原因：${reason}），请前往【个人中心 -> 用户认证】查看驳回原因并可重新申请认证。`,
                time: '刚刚',
                unread: true,
              },
              ...prev,
            ]);
            handleAddAuditLog({
              operator: currentUser.username || 'admin',
              ip: currentUser.currentLoginIp,
              location: currentUser.currentLoginLocation,
              device: 'Windows 11 / Chrome 130.0',
              action: '驳回高校管理员认证申请',
              result: '失败',
              detail: `申请人：${record.realName} (${record.username})，驳回原因：${reason}`,
            });
            return;
          }

          setPlatformUsers((prev) =>
            prev.map((u) => {
              if (
                (u.username || '').toLowerCase() === record.username.toLowerCase() ||
                (record.phone && u.phone === record.phone)
              ) {
                return {
                  ...u,
                  isAcademicOrTeacherVerified: false,
                };
              }
              return u;
            })
          );
          if (
            (currentUser.username || '').toLowerCase() === record.username.toLowerCase() ||
            (record.phone && currentUser.phone === record.phone)
          ) {
            setCurrentUser((prev) => ({
              ...prev,
              university: record.university || prev.university,
              educationLevel:
                record.applicantType === 'student'
                  ? record.levelOrTitle || prev.educationLevel
                  : prev.educationLevel,
              majorOrDept: record.majorOrDept || prev.majorOrDept,
              studentId: record.studentOrStaffId || prev.studentId,
              enrollmentDate: record.enrollmentDate || prev.enrollmentDate,
              graduationDate: record.graduationDate || prev.graduationDate,
              academicStatus: 'rejected',
              academicRejectReason: reason,
              isVerified: false,
            }));
          }
          setNotifications((prev) => [
            {
              id: `notif-verify-rej-${Date.now()}`,
              title: `【认证驳回】${
                record.applicantType === 'student' ? '学生认证' : '指导教师资格认证'
              }审核未通过`,
              desc: `您提交的 ${record.university} 认证信息被驳回（原因：${reason}），请前往【个人中心 -> 用户认证】点击【重新验证】修改后提交。`,
              time: '刚刚',
              unread: true,
            },
            ...prev,
          ]);
          handleAddAuditLog({
            operator: currentUser.username || 'admin',
            ip: currentUser.currentLoginIp,
            location: currentUser.currentLoginLocation,
            device: 'Windows 11 / Chrome 130.0',
            action: `驳回${record.applicantType === 'student' ? '学生认证' : '教师认证'}`,
            result: '失败',
            detail: `申请人：${record.realName} (${record.username})，驳回原因：${reason}`,
          });
        }}
        onAddAuditLog={handleAddAuditLog}
        onSendSystemNotification={(title, desc) => {
          setNotifications((prev) => [
            {
              id: `notif-admin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title,
              desc,
              time: '刚刚',
              unread: true,
            },
            ...prev,
          ]);
        }}
        onBackToFrontend={() => {
          setCurrentView('directory');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onPreviewCompetitionInFrontend={(comp) => {
          setSelectedCompetitionId(comp.id);
          setCurrentView('competition-detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        adminName={currentUser.name || currentUser.username}
        adminUsername={currentUser.username || 'admin'}
        auditLogs={auditLogs}
      />
    );
  }

  const activeCatalogCompetition =
    competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];
  const activeRegistrationConfig = registrationConfigs.find(
    (rc) => rc.eventId === activeCatalogCompetition?.id
  );

  // =========================================================================
  // 独立页面路由 3：大赛前台（首页 / 赛事目录 / 赛事详情页）
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col aic-canvas text-[#232A65]">
      {/* 全局导航栏（顶部 - 参考 aicomp.cn 磨砂半透明白底导航栏） */}
      <header className="sticky top-0 z-40 aic-header">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">
          {/* 左侧：LOGO + 导航菜单 */}
          <div className="flex items-center gap-8 lg:gap-12">
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left group cursor-pointer shrink-0 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#256BF8] via-[#165CCC] to-[#134B91] border border-white/80 flex items-center justify-center text-white shadow-[0_6px_16px_rgba(22,92,204,0.28)] group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-extrabold text-[#165CCC] tracking-wider">
                  第五届“XX杯”
                </div>
                <div className="text-sm sm:text-base font-black tracking-tight text-[#134B91] whitespace-nowrap">
                  网数智安全大赛(防护赛)
                </div>
              </div>
            </button>

            {/* 导航菜单：首页、赛事目录、通知公告、赛事动态、赛事新闻、帮助中心 */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[15px] font-medium text-[#232A65] h-[68px]">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-full flex items-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'home'
                    ? 'text-[#165CCC] font-bold after:content-[""] after:absolute after:bottom-3 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#165CCC] after:rounded-full'
                    : 'hover:text-[#165CCC]'
                }`}
              >
                首页
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('directory');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-full flex items-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'directory' || currentView === 'competition-detail'
                    ? 'text-[#165CCC] font-bold after:content-[""] after:absolute after:bottom-3 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#165CCC] after:rounded-full'
                    : 'hover:text-[#165CCC]'
                }`}
              >
                赛事目录
              </button>
              <button
                type="button"
                onClick={() => {
                  setInitialSelectedNoticeId(null);
                  setCurrentView('notices');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-full flex items-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'notices' || currentView === 'notice-detail'
                    ? 'text-[#165CCC] font-bold after:content-[""] after:absolute after:bottom-3 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#165CCC] after:rounded-full'
                    : 'hover:text-[#165CCC]'
                }`}
              >
                通知公告
              </button>
              <button
                type="button"
                onClick={() => {
                  setInitialSelectedMomentId(null);
                  setCurrentView('moments');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-full flex items-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'moments' || currentView === 'moment-detail'
                    ? 'text-[#165CCC] font-bold after:content-[""] after:absolute after:bottom-3 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#165CCC] after:rounded-full'
                    : 'hover:text-[#165CCC]'
                }`}
              >
                赛事动态
              </button>
              <button
                type="button"
                onClick={() => {
                  setInitialSelectedNewsId(null);
                  setCurrentView('news');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-full flex items-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'news' || currentView === 'news-detail'
                    ? 'text-[#165CCC] font-bold after:content-[""] after:absolute after:bottom-3 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#165CCC] after:rounded-full'
                    : 'hover:text-[#165CCC]'
                }`}
              >
                赛事新闻
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('help');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative h-full flex items-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'help'
                    ? 'text-[#165CCC] font-bold after:content-[""] after:absolute after:bottom-3 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#165CCC] after:rounded-full'
                    : 'hover:text-[#165CCC]'
                }`}
              >
                帮助中心
              </button>
            </nav>
          </div>

          {/* 右侧：通知铃铛 + 用户头像下拉 / 登录注册胶囊按钮 */}
          <div className="flex items-center gap-3 shrink-0">
            {!isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthInitialTab('login');
                    setCurrentView('auth');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-blue-100 text-[#232A65] hover:text-[#165CCC] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  aria-label="登录入口"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthInitialTab('login');
                    setCurrentView('auth');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white aic-btn-gradient rounded-full whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span>登录 | 注册</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-85" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* 通知铃铛（消息提醒下拉面板：支持鼠标悬浮或点击触发，宽约350px，与个人中心“我的消息”100%同步） */}
                <div
                  className="relative"
                  onMouseEnter={() => {
                    setBellDropdownOpen(true);
                    setUserDropdownOpen(false);
                  }}
                  onMouseLeave={() => setBellDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setBellDropdownOpen((prev) => !prev);
                      setUserDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-full text-slate-600 hover:text-[#1664FF] hover:bg-blue-50 transition-colors cursor-pointer"
                    aria-label="消息通知"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#F53F3F] text-white text-[10px] font-bold flex items-center justify-center font-mono-num">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {bellDropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 z-50">
                      <div className="w-[350px] bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                        {/* 头部：左侧写“消息提醒”，右侧写“未读 (X)” */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">
                            消息提醒
                          </span>
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`text-xs font-bold font-mono-num ${
                                unreadCount > 0 ? 'text-[#F53F3F]' : 'text-slate-400'
                              }`}
                            >
                              未读 ({unreadCount > 99 ? '99+' : unreadCount})
                            </span>
                            {unreadCount > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setNotifications((prev) =>
                                    prev.map((n) => ({ ...n, unread: false }))
                                  )
                                }
                                className="text-[11px] text-[#1664FF] hover:underline font-medium cursor-pointer"
                              >
                                全部已读
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 列表区：展示最新 4 条未读消息（如果没有未读，展示最近 4 条已读消息，标灰） */}
                        <div className="divide-y divide-slate-100">
                          {(() => {
                            const unreadList = notifications.filter((n) => n.unread);
                            const isShowingReadFallback = unreadList.length === 0;
                            const displayItems = isShowingReadFallback
                              ? notifications.slice(0, 4)
                              : unreadList.slice(0, 4);

                            if (displayItems.length === 0) {
                              return (
                                <div className="py-8 text-center text-xs text-slate-400">
                                  暂无消息提醒
                                </div>
                              );
                            }

                            return displayItems.map((item) => {
                              const isInvitePending =
                                (item.actionType === 'invite_actions' ||
                                  item.scenarioType === 'team_invite') &&
                                (!item.inviteStatus || item.inviteStatus === 'pending');
                              const isAvatar =
                                item.iconStyle === 'avatar' || Boolean(item.senderName);
                              const compactText = item.shortTitle || item.title;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setNotifications((prev) =>
                                      prev.map((n) =>
                                        n.id === item.id ? { ...n, unread: false } : n
                                      )
                                    );
                                    setBellDropdownOpen(false);
                                    setUserCenterInitialTab('messages');
                                    setCurrentView('user-center');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className={`px-3.5 py-3 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                                    isShowingReadFallback
                                      ? 'bg-slate-50/40 text-slate-400 hover:bg-slate-100/70'
                                      : 'bg-white hover:bg-blue-50/40'
                                  }`}
                                >
                                  {/* 左侧极简小图标/对方头像小图 + 标题 + (时间) */}
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {isAvatar ? (
                                      item.senderAvatarUrl ? (
                                        <img
                                          src={item.senderAvatarUrl}
                                          alt={item.senderName || '头像'}
                                          className={`w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 ${
                                            isShowingReadFallback ? 'grayscale opacity-60' : ''
                                          }`}
                                        />
                                      ) : (
                                        <div
                                          className={`w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                            isShowingReadFallback
                                              ? 'bg-slate-300'
                                              : 'bg-[#1664FF]'
                                          }`}
                                        >
                                          {(item.senderName || item.title).slice(0, 1)}
                                        </div>
                                      )
                                    ) : item.iconStyle === 'error' ? (
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                          isShowingReadFallback
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-red-50 text-[#F53F3F] border border-red-200'
                                        }`}
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                      </div>
                                    ) : item.iconStyle === 'success' ? (
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                          isShowingReadFallback
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        }`}
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </div>
                                    ) : (
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                          isShowingReadFallback
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-blue-50 text-[#1664FF] border border-blue-200'
                                        }`}
                                      >
                                        <Bell className="w-3.5 h-3.5" />
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1 text-left">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        {item.unread && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#F53F3F] shrink-0" />
                                        )}
                                        <span
                                          className={`text-xs truncate ${
                                            isShowingReadFallback
                                              ? 'text-slate-400 font-normal'
                                              : 'text-slate-800 font-bold'
                                          }`}
                                          title={item.desc}
                                        >
                                          {compactText}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-mono-num shrink-0">
                                          ({item.time})
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 面板内的快捷交互：若为入队邀请类消息，右侧只保留一个【去处理】按钮，点击后跳转至我的报名的我参与的页面 */}
                                  {isInvitePending && (
                                    <button
                                      type="button"
                                      title="去处理入队邀请"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setNotifications((prev) =>
                                          prev.map((n) =>
                                            n.id === item.id ? { ...n, unread: false } : n
                                          )
                                        );
                                        setBellDropdownOpen(false);
                                        setUserCenterInitialTab('registrations');
                                        setCurrentView('user-center');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="px-2 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                                    >
                                      去处理
                                    </button>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* 底部操作区：居中展示【查看全部消息 >】按钮，点击跳转至“个人中心 - 我的消息”Tab */}
                        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setBellDropdownOpen(false);
                              setUserCenterInitialTab('messages');
                              setCurrentView('user-center');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full py-1 text-xs font-bold text-[#1664FF] hover:text-[#0E4FD6] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>查看全部消息</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 用户头像与蓝底胶囊菜单按钮 */}
                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen((prev) => !prev);
                      setBellDropdownOpen(false);
                    }}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-blue-200/80 text-[#232A65] hover:text-[#165CCC] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    aria-label="个人中心菜单"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen((prev) => !prev);
                      setBellDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full aic-btn-gradient text-white text-xs font-semibold cursor-pointer"
                  >
                    <span className="whitespace-nowrap">
                      {currentUser.name || currentUser.username}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-900">
                          {currentUser.name || currentUser.username}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {currentUser.academicStatus === 'verified' && currentUser.university
                            ? currentUser.university
                            : '未完成学籍/教师认证'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setUserCenterInitialTab('profile');
                          setCurrentView('user-center');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#1664FF] flex items-center gap-2.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#1664FF]" />
                        <span>个人中心</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setUserCenterInitialTab('registrations');
                          setCurrentView('user-center');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#1664FF] flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#1664FF]" />
                          <span>我的报名</span>
                        </span>
                        <span className="text-[11px] font-mono-num text-[#1664FF] font-bold">
                          {captainTeams.filter((t) => isTeamOwnedByUser(t, currentUser)).length +
                            (currentUser.username === 'linyuanhang' ||
                            currentUser.name === '林远航'
                              ? participatedTeams.length
                              : 0)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setUserCenterInitialTab('competitions');
                          setCurrentView('user-center');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#1664FF] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-[#1664FF]" />
                        <span>我的竞赛</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setUserCenterInitialTab('messages');
                          setCurrentView('user-center');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#1664FF] flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-[#1664FF]" />
                          <span>我的消息</span>
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#F53F3F] text-white text-[10px] font-bold font-mono-num">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setCurrentView('admin');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#1664FF] flex items-center gap-2.5 cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#1664FF]" />
                        <span>进入后台</span>
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsLoggedIn(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>退出</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {currentView === 'user-center' ? (
        <StandaloneUserCenterPage
          user={currentUser}
          initialTab={userCenterInitialTab}
          onUpdateUser={handleUpdateCurrentUser}
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={() => {
            setIsLoggedIn(false);
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          registrations={myRegistrations}
          captainTeams={captainTeams}
          onUpdateCaptainTeams={setCaptainTeams}
          participatedTeams={
            currentUser.username === 'linyuanhang' || currentUser.name === '林远航'
              ? participatedTeams
              : []
          }
          onUpdateParticipatedTeams={handleUpdateParticipatedTeamsSync}
          onContinueEditDraft={(team) => {
            setSelectedCompetitionId(team.competitionId);
            setRegInitialSubTrack(team.subTrackName);
            setEditingDraftTeam(team);
            setCurrentView('registration-form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAddAuditLog={handleAddAuditLog}
          enabledSchools={enabledSchoolNames}
          competitions={competitions}
          platformUsers={platformUsers}
          registrationConfigs={registrationConfigs}
          onViewCompetitionDetail={(compId) => {
            setSelectedCompetitionId(compId);
            setCurrentView('competition-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSubmitVerificationApplication={(newRec) => {
            setVerificationRecords((prev) => [
              {
                ...newRec,
                id: `ver-${
                  newRec.applicantType === 'student'
                    ? 'stu'
                    : newRec.applicantType === 'univ_admin'
                    ? 'admin'
                    : 'tea'
                }-${Date.now()}`,
                reviewStatus: 'pending',
              },
              ...prev,
            ]);
          }}
          messages={notifications}
          onMarkAllMessagesRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
          }
          onMarkMessageRead={(msgId) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === msgId ? { ...n, unread: false } : n))
            )
          }
          onAcceptInviteMessage={handleAcceptInviteFromMessage}
          onRejectInviteMessage={handleRejectInviteFromMessage}
          onGoToAdminBackend={() => {
            setCurrentView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDisbandTeamNotify={(disbandedTeam) => {
            const invitedNames = [
              ...disbandedTeam.members.map((m) => m.name),
              ...disbandedTeam.advisors.map((a) => a.name),
            ];
            setNotifications((prev) => [
              {
                id: `notif-disband-${Date.now()}`,
                title: `所在队伍【${disbandedTeam.teamName}】已解散通知`,
                shortTitle: `队伍【${disbandedTeam.teamName}】已解散`,
                desc: `您受邀参与的【${disbandedTeam.competitionTitle}】参赛队伍【${disbandedTeam.teamName}】已被队长【${disbandedTeam.captainName}】解散（已同步通知受邀队员与指导教师：${
                  invitedNames.length > 0 ? invitedNames.join('、') : '拟邀成员'
                }），对应的报名数据已从【我的报名】中删除。`,
                time: '刚刚',
                unread: true,
                category: 'invite',
                rolePerspective: '队员视角',
                scenarioType: 'team_status_change',
                messageTypeLabel: '队伍解散通知',
                iconStyle: 'warning',
                actionType: 'view_detail',
              },
              ...prev,
            ]);
            handleAddAuditLog({
              operator: currentUser.username,
              ip: currentUser.currentLoginIp,
              location: currentUser.currentLoginLocation,
              device: 'Windows 11 / Chrome 130.0',
              action: `解散报名队伍（${disbandedTeam.teamName}）`,
              result: '成功',
              detail: `赛事：${disbandedTeam.competitionTitle}，已通知受邀成员并将对应报名数据从“我的报名”中直接删除`,
            });
          }}
        />
      ) : currentView === 'notices' ? (
        <FrontendNoticesPage
          noticesList={publishedNotices}
          onSelectNotice={(noticeId) => {
            setInitialSelectedNoticeId(noticeId);
            setCurrentView('notice-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'notice-detail' ? (
        <FrontendNoticeDetailPage
          noticesList={publishedNotices}
          selectedNoticeId={initialSelectedNoticeId || publishedNotices[0]?.id || ''}
          onSelectNotice={(noticeId) => {
            setInitialSelectedNoticeId(noticeId);
            setCurrentView('notice-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToList={() => {
            setCurrentView('notices');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'help' ? (
        <FrontendHelpCenterPage
          faqList={FAQ_ITEMS}
          markdownContent={helpCenterContent}
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'news' ? (
        <FrontendNewsPage
          newsList={managedNews}
          onSelectNews={(newsId) => {
            setInitialSelectedNewsId(newsId);
            setCurrentView('news-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'news-detail' ? (
        <FrontendNewsDetailPage
          newsList={allFrontendNews}
          selectedNewsId={initialSelectedNewsId || managedNews[0]?.id || ''}
          onSelectNews={(newsId) => {
            setInitialSelectedNewsId(newsId);
            setCurrentView('news-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToList={() => {
            setCurrentView('news');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'moments' ? (
        <FrontendMomentsPage
          momentsList={managedMoments}
          onSelectMoment={(momentId) => {
            setInitialSelectedMomentId(momentId);
            setCurrentView('moment-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'moment-detail' ? (
        <FrontendMomentDetailPage
          momentsList={allFrontendMoments}
          selectedMomentId={initialSelectedMomentId || managedMoments[0]?.id || ''}
          onSelectMoment={(momentId) => {
            setInitialSelectedMomentId(momentId);
            setCurrentView('moment-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToList={() => {
            setCurrentView('moments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'directory' ? (
        <CompetitionDirectoryPage
          competitions={competitions}
          onSelectCompetition={(comp) => {
            setSelectedCompetitionId(comp.id);
            setCurrentView('competition-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'competition-detail' && activeCatalogCompetition ? (
        <CompetitionDetailPage
          competition={activeCatalogCompetition}
          registrationConfig={activeRegistrationConfig}
          onBackToDirectory={() => {
            setCurrentView('directory');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onRegisterClick={handleCatalogCompetitionRegister}
        />
      ) : currentView === 'registration-form' && activeCatalogCompetition ? (
        <TeamRegistrationFormPage
          competition={activeCatalogCompetition}
          registrationConfig={activeRegistrationConfig}
          initialSubTrackName={regInitialSubTrack}
          currentUser={currentUser}
          existingTeam={editingDraftTeam}
          platformUsers={platformUsers}
          onBack={() => {
            if (editingDraftTeam) {
              setEditingDraftTeam(null);
              setUserCenterInitialTab('registrations');
              setCurrentView('user-center');
            } else {
              setCurrentView('competition-detail');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSaveDraft={(draftTeam) => {
            setCaptainTeams((prev) => {
              const exists = prev.some((t) => t.id === draftTeam.id);
              return exists
                ? prev.map((t) => (t.id === draftTeam.id ? draftTeam : t))
                : [draftTeam, ...prev];
            });
            handleAddAuditLog({
              operator: currentUser.username,
              ip: currentUser.currentLoginIp,
              location: currentUser.currentLoginLocation,
              device: 'Windows 11 / Chrome 130.0',
              action: `暂存报名队伍草稿（${draftTeam.teamName}）`,
              result: '成功',
              detail: `赛事：${draftTeam.competitionTitle}，状态设为「组建中」，未下发通知`,
            });
            setEditingDraftTeam(null);
            setUserCenterInitialTab('registrations');
            setCurrentView('user-center');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSendInvitations={(invitingTeam) => {
            setCaptainTeams((prev) => {
              const exists = prev.some((t) => t.id === invitingTeam.id);
              return exists
                ? prev.map((t) => (t.id === invitingTeam.id ? invitingTeam : t))
                : [invitingTeam, ...prev];
            });
            setNotifications((prev) => [
              {
                id: `notif-inv-${Date.now()}`,
                title: `【组队邀请已发出】${invitingTeam.teamName}`,
                desc: `已向名单中的 ${invitingTeam.members.length} 名队员与 ${invitingTeam.advisors.length} 名指导教师发送站内信与短信通知，队伍状态已变更为「邀请中」。`,
                time: '刚刚',
                unread: true,
                category: 'invite',
              },
              ...prev,
            ]);
            handleAddAuditLog({
              operator: currentUser.username,
              ip: currentUser.currentLoginIp,
              location: currentUser.currentLoginLocation,
              device: 'Windows 11 / Chrome 130.0',
              action: `发出组队邀请（${invitingTeam.teamName}）`,
              result: '成功',
              detail: `赛事：${invitingTeam.competitionTitle}，赛道：${invitingTeam.subTrackName}，状态变更为「邀请中」`,
            });
            setEditingDraftTeam(null);
            setUserCenterInitialTab('registrations');
            setCurrentView('user-center');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDisbandDraftTeam={(draftTeam) => {
            setCaptainTeams((prev) => prev.filter((t) => t.id !== draftTeam.id));
            setParticipatedTeams((prev) =>
              prev.filter(
                (item) => item.id !== draftTeam.id && item.teamName !== draftTeam.teamName
              )
            );
            const invitedNames = [
              ...draftTeam.members.map((m) => m.name),
              ...draftTeam.advisors.map((a) => a.name),
            ];
            setNotifications((prev) => [
              {
                id: `notif-disband-${Date.now()}`,
                title: `所在队伍【${draftTeam.teamName}】已解散通知`,
                shortTitle: `队伍【${draftTeam.teamName}】已解散`,
                desc: `您受邀参与的【${draftTeam.competitionTitle}】参赛队伍【${draftTeam.teamName}】已被队长【${draftTeam.captainName}】解散（已同步通知受邀队员与指导教师：${
                  invitedNames.length > 0 ? invitedNames.join('、') : '拟邀成员'
                }），对应的报名数据已从【我的报名】中删除。`,
                time: '刚刚',
                unread: true,
                category: 'invite',
                rolePerspective: '队员视角',
                scenarioType: 'team_status_change',
                messageTypeLabel: '队伍解散通知',
                iconStyle: 'warning',
                actionType: 'view_detail',
              },
              ...prev,
            ]);
            handleAddAuditLog({
              operator: currentUser.username,
              ip: currentUser.currentLoginIp,
              location: currentUser.currentLoginLocation,
              device: 'Windows 11 / Chrome 130.0',
              action: `解散组建中报名队伍（${draftTeam.teamName}）`,
              result: '成功',
              detail: `赛事：${draftTeam.competitionTitle}，已通知受邀成员并将对应报名数据从“我的报名”中直接删除`,
            });
            setEditingDraftTeam(null);
            setUserCenterInitialTab('registrations');
            setCurrentView('user-center');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <>
          {/* 模块一：全宽浅色科技感 3D 护盾 Banner 轮播（严格还原 UI 设计图风格） */}
          <section
            className="relative w-full h-[380px] sm:h-[430px] xl:h-[460px] overflow-hidden select-none bg-[#DCEBFF]"
            onMouseEnter={() => setBannerPaused(true)}
            onMouseLeave={() => setBannerPaused(false)}
          >
            {activeHomeBanners.map((slide, index) => {
              const isActive = index === currentBannerIdx;
              return (
                <div
                  key={slide.id}
                  onClick={() => handleBannerConfigAction(slide)}
                  className={`absolute inset-0 transition-opacity duration-500 cursor-pointer ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    draggable={false}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== BANNER_POSTER_1) {
                        target.src = BANNER_POSTER_1;
                      }
                    }}
                    className="w-full h-full object-cover block"
                  />
                </div>
              );
            })}

            {/* 左右切换箭头（参考 aicomp.cn .swiper-button 样式） */}
            <button
              type="button"
              onClick={() =>
                setCurrentBannerIdx(
                  (prev) => (prev - 1 + activeHomeBanners.length) % activeHomeBanners.length
                )
              }
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-[#232A65]/40 hover:bg-[#165CCC] border border-white/30 text-white flex items-center justify-center shadow-sm backdrop-blur-md transition-all cursor-pointer"
              aria-label="上一张海报"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentBannerIdx((prev) => (prev + 1) % activeHomeBanners.length)
              }
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-[#232A65]/40 hover:bg-[#165CCC] border border-white/30 text-white flex items-center justify-center shadow-sm backdrop-blur-md transition-all cursor-pointer"
              aria-label="下一张海报"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 底部指示器小圆点 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white shadow-sm">
              {activeHomeBanners.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentBannerIdx(idx)}
                  aria-label={`切换到第 ${idx + 1} 张轮播图`}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentBannerIdx
                      ? 'w-7 bg-[#165CCC]'
                      : 'w-2 bg-[#232A65]/25 hover:bg-[#165CCC]/60'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Main Content Container */}
          <main className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7 flex-1 w-full">
            {/* 模块二：核心双栏（赛事通道 + 通知公告） */}
            <section id="tracks-notice-section" className="scroll-mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
                {/* 左侧：赛事通道（磨砂白边圆角卡片容器，占 7 列） */}
                <div className="lg:col-span-7 aic-card p-6 sm:p-7 flex flex-col">
                  {/* 卡片头部 */}
                  <div className="relative flex items-center justify-between pb-4 mb-4 border-b border-blue-100/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">赛事通道</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('directory');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1 rounded-full bg-white/80 hover:bg-[#165CCC] text-xs font-semibold text-[#232A65]/75 hover:text-white border border-blue-100/80 flex items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <span>更多赛事</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
                  </div>

                  {/* 赛事列表 */}
                  <div className="flex-1 divide-y divide-blue-100/60 flex flex-col justify-between">
                    {homeRecommendedCompetitions.map((comp) => {
                        const matchedTrack = COMPETITION_TRACKS.find(
                          (t) => t.catalogId === comp.id
                        );
                        const calcStatus = computeCompetitionStatus(
                          comp.startDate,
                          comp.endDate
                        );
                        const displayStatusLabel = getCompetitionStatusLabel(calcStatus);
                        const trackVisualStatus =
                          calcStatus === 'ongoing'
                            ? 'registering'
                            : calcStatus === 'upcoming'
                            ? 'upcoming'
                            : 'ended';
                        const statusBadgeClass =
                          calcStatus === 'ongoing'
                            ? 'bg-emerald-500 text-white'
                            : calcStatus === 'upcoming'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-400 text-white';

                        return (
                          <div
                            key={comp.id}
                            onClick={() => {
                              setSelectedCompetitionId(comp.id);
                              setCurrentView('competition-detail');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 cursor-pointer rounded-xl hover:bg-white/60 px-2 -mx-2 transition-colors"
                          >
                            {/* 左侧缩略海报图 */}
                            <div className="w-full sm:w-[224px] h-[126px] shrink-0 overflow-hidden rounded-[14px] border border-white shadow-xs group-hover:shadow-md transition-all">
                              <TrackCoverIllustration
                                type={matchedTrack?.visualType || comp.coverTheme}
                                status={trackVisualStatus}
                              />
                            </div>

                            {/* 右侧赛事信息 */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                              <div>
                                <div className="flex items-center gap-2.5 mb-2.5">
                                  <h3 className="text-base font-bold text-[#232A65] group-hover:text-[#165CCC] transition-colors truncate">
                                    {comp.title}
                                  </h3>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${statusBadgeClass}`}
                                  >
                                    {displayStatusLabel}
                                  </span>
                                </div>

                                <div className="space-y-1.5 text-xs text-[#232A65]/70">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-[#165CCC]/70 shrink-0" />
                                    <span className="font-mono-num">
                                      {comp.startDate} ~ {comp.endDate}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-[#165CCC]/70 shrink-0" />
                                    <span className="truncate" title={comp.organizer}>
                                      主办方：{comp.organizer}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 右侧：通知公告（磨砂白边圆角卡片容器，占 5 列） */}
                <div className="lg:col-span-5 aic-card p-6 sm:p-7 flex flex-col">
                  {/* 卡片头部 */}
                  <div className="relative flex items-center justify-between pb-4 mb-4 border-b border-blue-100/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">通知公告</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInitialSelectedNoticeId(null);
                        setCurrentView('notices');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1 rounded-full bg-white/80 hover:bg-[#165CCC] text-xs font-semibold text-[#232A65]/75 hover:text-white border border-blue-100/80 flex items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <span>更多公告</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
                  </div>

                  {/* 通知公告列表 */}
                  <div className="flex-1 divide-y divide-blue-100/60 flex flex-col justify-between">
                    {publishedNotices.slice(0, 6).map((notice, index) => (
                      <div
                        key={notice.id}
                        onClick={() => {
                          setInitialSelectedNoticeId(notice.id);
                          setCurrentView('notice-detail');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3 cursor-pointer rounded-lg hover:bg-white/60 px-2 -mx-2 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {notice.isPinned ? (
                            <span className="mt-0.5 px-2 py-0.5 rounded-full bg-red-50 text-[#F53F3F] border border-red-200/80 text-[11px] font-bold leading-none shrink-0">
                              置顶
                            </span>
                          ) : (
                            <span className="mt-0.5 px-2 py-0.5 rounded-full bg-[#165CCC]/10 text-[#165CCC] border border-[#165CCC]/20 text-[11px] font-semibold leading-none shrink-0">
                              {notice.category || '通知'}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`text-sm leading-snug line-clamp-1 transition-colors ${
                                index === 0 || notice.isPinned
                                  ? 'font-bold text-[#232A65] group-hover:text-[#165CCC]'
                                  : 'font-medium text-[#232A65]/85 group-hover:text-[#165CCC]'
                              }`}
                              title={notice.title}
                            >
                              {notice.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#232A65]/55">
                              <span className="truncate">{notice.department}</span>
                              {notice.attachments && notice.attachments.length > 0 && (
                                <span className="text-[#165CCC] font-medium shrink-0">
                                  · 含附件
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs text-[#232A65]/55 group-hover:text-[#165CCC] font-mono-num shrink-0 pt-0.5 transition-colors">
                          {notice.fullDate || notice.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 模块三：赛事新闻（磨砂白边通栏卡片，左图右文列表） */}
            <section
              id="news-section"
              className="scroll-mt-20 aic-card p-6 sm:p-7"
            >
              {/* 卡片头部 */}
              <div className="relative flex items-center justify-between pb-4 mb-5 border-b border-blue-100/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">赛事新闻</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInitialSelectedNewsId(null);
                    setCurrentView('news');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1 rounded-full bg-white/80 hover:bg-[#165CCC] text-xs font-semibold text-[#232A65]/75 hover:text-white border border-blue-100/80 flex items-center gap-0.5 transition-all cursor-pointer"
                >
                  <span>更多新闻</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 左侧：头条大图新闻 */}
                <div
                  onClick={() => {
                    setInitialSelectedNewsId(featuredNews.id);
                    setCurrentView('news-detail');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="lg:col-span-5 flex flex-col justify-between cursor-pointer group bg-white/60 hover:bg-white p-4 rounded-2xl border border-white transition-all shadow-2xs hover:shadow-md"
                >
                  <div className="mb-3.5 overflow-hidden rounded-[14px]">
                    <FeaturedNewsIllustration />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#232A65] group-hover:text-[#165CCC] transition-colors line-clamp-1 mb-2">
                    {featuredNews.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#232A65]/70 line-clamp-2 leading-relaxed mb-3">
                    {featuredNews.summary}
                  </p>
                  <div className="text-xs text-[#232A65]/55 flex items-center gap-3">
                    <span>来源：{featuredNews.source}</span>
                    <span>|</span>
                    <span className="font-mono-num">{featuredNews.date}</span>
                  </div>
                </div>

                {/* 右侧：新闻列表 */}
                <div className="lg:col-span-7 divide-y divide-blue-100/60 flex flex-col justify-between">
                  {listNews.slice(0, 3).map((item, idx) => (
                    <article
                      key={item.id}
                      onClick={() => {
                        setInitialSelectedNewsId(item.id);
                        setCurrentView('news-detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="py-4 first:pt-1 last:pb-1 group cursor-pointer rounded-xl hover:bg-white/60 px-3 -mx-3 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {idx === 0 && (
                          <span
                            className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-[#165CCC] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <h3
                          className={`text-base font-bold transition-colors leading-snug truncate ${
                            idx === 0
                              ? 'text-[#165CCC]'
                              : 'text-[#232A65] group-hover:text-[#165CCC]'
                          }`}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-[#232A65]/70 line-clamp-1 mb-2">
                        {item.summary}
                      </p>
                      <div className="text-xs text-[#232A65]/55 flex items-center gap-3">
                        <span>来源：{item.source}</span>
                        <span>|</span>
                        <span className="font-mono-num">{item.date}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 模块四：赛事动态（参考 aicomp.cn 胶囊分类切换 + .newsLink 磨砂白边卡片阵列） */}
            <section
              id="moments-section"
              className="scroll-mt-20 aic-card p-6 sm:p-7"
            >
              {/* 卡片头部 */}
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-blue-100/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                    <Film className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">赛事动态</h2>
                </div>

                {/* 居中分类切换 Tab：采用 aicomp.cn 的 .sort-list 磨砂胶囊切换栏 */}
                <div className="aic-sort-list">
                  {(['进展报道', '团队风采', '赛事花絮', '专家观点'] as const).map(
                    (cat) => {
                      const active = activeMomentTab === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleMomentTabChange(cat)}
                          className={`aic-sort-item !py-1.5 !px-4 !text-xs sm:!text-sm ${
                            active ? 'aic-sort-item-active' : ''
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInitialSelectedMomentId(null);
                    setCurrentView('moments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1 rounded-full bg-white/80 hover:bg-[#165CCC] text-xs font-semibold text-[#232A65]/75 hover:text-white border border-blue-100/80 flex items-center gap-0.5 transition-all cursor-pointer self-end sm:self-auto"
                >
                  <span>更多动态</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
              </div>

              {/* 横向卡片轮播区（左右箭头 + 5列卡片） */}
              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMomentStartIndex((prev) => Math.max(0, prev - 1))}
                  disabled={momentStartIndex === 0}
                  aria-label="向左滚动动态卡片"
                  className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center shrink-0 transition-colors ${
                    momentStartIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-500 hover:text-[#1664FF] hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {orderedMoments.slice(momentStartIndex, momentStartIndex + 5).map((moment) => (
                    <div
                      key={moment.id}
                      onClick={() => {
                        setInitialSelectedMomentId(moment.id);
                        setCurrentView('moment-detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="relative overflow-hidden rounded-lg mb-2.5 group-hover:shadow-md transition-shadow">
                        <MomentCardVisual
                          variant={moment.visualVariant}
                          category={moment.category}
                        />
                        {moment.mediaType === 'video' && (
                          <div className="absolute inset-0 bg-slate-950/15 group-hover:bg-slate-950/5 transition-colors flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-[#1664FF] text-[#1664FF] group-hover:text-white shadow-sm flex items-center justify-center transition-all duration-200">
                              <Play className="w-4 h-4 ml-0.5 fill-current" />
                            </div>
                          </div>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1664FF] transition-colors truncate mb-1">
                        {moment.title}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono-num">{moment.date}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMomentStartIndex((prev) => Math.min(maxMomentStartIndex, prev + 1))
                  }
                  disabled={momentStartIndex >= maxMomentStartIndex}
                  aria-label="向右滚动动态卡片"
                  className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center shrink-0 transition-colors ${
                    momentStartIndex >= maxMomentStartIndex
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-500 hover:text-[#1664FF] hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* 模块五：实用服务区（左：帮助中心 Markdown 文档节选 + 右：电子证书查询与验证） */}
            <section id="utility-service-section" className="scroll-mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
                {/* 左卡片：帮助中心 */}
                <div className="lg:col-span-6 aic-card p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="relative flex items-center justify-between pb-4 mb-4 border-b border-blue-100/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">
                          帮助中心
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('help');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1 rounded-full bg-white/80 hover:bg-[#165CCC] text-xs font-semibold text-[#232A65]/75 hover:text-white border border-blue-100/80 flex items-center gap-0.5 transition-all cursor-pointer"
                      >
                        <span>阅读完整帮助文档</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
                    </div>

                    <div className="relative max-h-[290px] overflow-hidden pr-1">
                      <HelpMarkdownDocumentView
                        content={helpCenterContent}
                        compact
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/95 via-white/80 to-transparent" />
                    </div>
                  </div>

                  <div className="pt-3.5 mt-2 border-t border-blue-100/60 flex items-center justify-between">
                    <span className="text-xs text-[#232A65]/55">
                      已为您节选帮助中心文档顶部高频问题指引
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('help');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#165CCC] hover:text-[#134B91] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>进入帮助中心查看全文</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 右卡片：电子证书查询与验证 */}
                <div
                  id="cert-section"
                  className="lg:col-span-6 aic-card p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div className="relative flex items-center justify-between pb-4 mb-4 border-b border-blue-100/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">
                        电子证书查询与验证
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-[#165CCC]/75">获奖查询</span>
                    <span className="absolute bottom-0 left-0 w-40 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
                  </div>

                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#EDF5FF] via-[#E3EFFF] to-[#D4E6FF] border border-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-inner">
                    <form
                      onSubmit={(e) => handleCertificateSearch(e)}
                      className="flex-1 w-full space-y-3 z-10"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-[#232A65]/80 mb-1">
                          身份信息（请输入姓名或身份证号）
                        </label>
                        <input
                          type="text"
                          value={certIdentity}
                          onChange={(e) => {
                            setCertIdentity(e.target.value);
                            if (certQueryError) setCertQueryError(null);
                          }}
                          placeholder="请填写姓名或身份证号"
                          className="w-full px-3.5 py-2 bg-white/95 border border-white focus:border-[#165CCC] rounded-xl text-xs sm:text-sm text-[#232A65] placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#232A65]/80 mb-1">
                          证书编号（请输入证书编号）
                        </label>
                        <input
                          type="text"
                          value={certNumber}
                          onChange={(e) => {
                            setCertNumber(e.target.value);
                            if (certQueryError) setCertQueryError(null);
                          }}
                          placeholder="请填写证书编号"
                          className="w-full px-3.5 py-2 bg-white/95 border border-white focus:border-[#165CCC] rounded-xl text-xs sm:text-sm text-[#232A65] placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      {certQueryError && (
                        <div className="text-xs text-red-600 font-medium">{certQueryError}</div>
                      )}

                      <div className="pt-1">
                        <button
                          type="submit"
                          className="w-full py-2.5 aic-btn-gradient text-white text-xs sm:text-sm font-bold rounded-full cursor-pointer"
                        >
                          点击查询
                        </button>
                      </div>

                      {/* 快捷测试样例填入 */}
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[#232A65]/60">示例：</span>
                        {CERTIFICATE_RECORDS.slice(0, 3).map((rec) => (
                          <button
                            key={rec.certId}
                            type="button"
                            onClick={() =>
                              handleCertificateSearch(undefined, {
                                identity: rec.holderName,
                                certNo: rec.certId,
                              })
                            }
                            className="px-2.5 py-0.5 rounded-full bg-white/85 hover:bg-[#165CCC] text-[#232A65] hover:text-white border border-white transition-colors cursor-pointer font-mono-num"
                          >
                            {rec.holderName}
                          </button>
                        ))}
                      </div>
                    </form>

                    {/* 右侧 3D 奖杯与获奖证书插画 */}
                    <div className="hidden sm:flex items-center justify-center shrink-0">
                      <CertificateTrophyIllustration />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 模块六：参赛高校（磨砂白边通栏卡片 + 6列圆形校徽矩阵） */}
            <section
              id="universities-section"
              className="scroll-mt-20 aic-card p-6 sm:p-7"
            >
              <div className="relative flex items-center justify-between pb-4 mb-6 border-b border-blue-100/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">参赛高校</h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1 bg-white/75 border border-white p-1 rounded-full text-xs shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setUniAutoScroll(false)}
                      className={`px-3 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
                        !uniAutoScroll ? 'bg-[#165CCC] text-white shadow-2xs' : 'text-[#232A65]/70 hover:text-[#165CCC]'
                      }`}
                    >
                      校徽展示
                    </button>
                    <button
                      type="button"
                      onClick={() => setUniAutoScroll(true)}
                      className={`px-3 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
                        uniAutoScroll ? 'bg-[#165CCC] text-white shadow-2xs' : 'text-[#232A65]/70 hover:text-[#165CCC]'
                      }`}
                    >
                      自动轮播
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAllUniversitiesModalOpen(true)}
                    className="px-3.5 py-1 rounded-full bg-white/80 hover:bg-[#165CCC] text-xs font-semibold text-[#232A65]/75 hover:text-white border border-blue-100/80 flex items-center gap-0.5 transition-all cursor-pointer"
                  >
                    <span>更多高校</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
              </div>

              {uniAutoScroll ? (
                <div className="relative overflow-hidden py-2">
                  <div className="animate-marquee gap-6">
                    {[...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS].map((uni, idx) => (
                      <div
                        key={`${uni.id}-${idx}`}
                        onClick={() => setAllUniversitiesModalOpen(true)}
                        className="group w-44 shrink-0 flex flex-col items-center text-center cursor-pointer"
                      >
                        <div className="w-28 h-28 rounded-full border-2 border-white bg-white/90 group-hover:bg-white group-hover:border-[#165CCC] shadow-[0_6px_20px_rgba(19,75,145,0.06)] group-hover:shadow-[0_12px_28px_rgba(22,92,204,0.16)] flex items-center justify-center transition-all duration-200 mb-3">
                          <UniversityCrest uni={uni} />
                        </div>
                        <div className="text-sm font-bold text-[#232A65] group-hover:text-[#165CCC] transition-colors">
                          {uni.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 py-2">
                  {UNIVERSITY_PARTNERS.slice(uniManualOffset, uniManualOffset + 6).map((uni) => (
                    <div
                      key={uni.id}
                      onClick={() => setAllUniversitiesModalOpen(true)}
                      className="group flex flex-col items-center text-center cursor-pointer"
                    >
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-white bg-white/90 group-hover:bg-white group-hover:border-[#165CCC] shadow-[0_6px_20px_rgba(19,75,145,0.06)] group-hover:shadow-[0_12px_28px_rgba(22,92,204,0.16)] flex items-center justify-center transition-all duration-200 mb-3">
                        <UniversityCrest uni={uni} />
                      </div>
                      <div className="text-sm font-bold text-[#232A65] group-hover:text-[#165CCC] transition-colors">
                        {uni.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 模块七：领导机构（磨砂白边卡片 + 胶囊形浅蓝光感按钮阵列） */}
            <section
              id="leadership-section"
              className="scroll-mt-20 aic-card p-6 sm:p-7"
            >
              <div className="relative flex items-center justify-between pb-4 mb-6 border-b border-blue-100/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#165CCC]/10 text-[#165CCC] flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#232A65] tracking-tight">领导机构</h2>
                </div>
                <span className="text-xs font-medium text-[#232A65]/60">指导单位 · 主办单位 · 承办与技术支撑</span>
                <span className="absolute bottom-0 left-0 w-24 h-[2.5px] bg-gradient-to-r from-[#165CCC] to-[#84AFFF] rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {LEADERSHIP_ORGS.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setSelectedOrgModal(org)}
                    className="group rounded-full border border-white bg-white/80 hover:bg-white hover:border-[#165CCC]/40 shadow-[0_4px_16px_rgba(19,75,145,0.05)] hover:shadow-[0_12px_28px_rgba(22,92,204,0.14)] px-6 py-4 text-center transition-all duration-200 cursor-pointer flex items-center justify-center"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#232A65] group-hover:text-[#165CCC] truncate">
                      {org.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* 页脚（参考 aicomp.cn 的 .Str-footer 清透冰蓝科技感建筑波纹页脚，取代沉闷纯黑底色） */}
      <footer className="aic-footer mt-12">
        {/* 底部科技几何流线装饰背景 */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-55"
          viewBox="0 0 1920 360"
          fill="none"
          preserveAspectRatio="xMidYBottom slice"
        >
          <path
            d="M-100 320 C 380 180, 920 380, 1460 210 C 1690 140, 1840 220, 2020 180 L 2020 360 L -100 360 Z"
            fill="#FFFFFF"
            fillOpacity="0.45"
          />
          <path
            d="M-60 260 C 460 360, 1040 120, 1620 280 C 1780 320, 1900 260, 2000 240"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeOpacity="0.7"
          />
        </svg>

        <div className="relative z-10 max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-8 pb-10 border-b-2 border-[#232A65]/10">
            {/* 第 1 列：关于我们 */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-extrabold text-[#134B91]">关于我们</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#232A65]/75">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('directory');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    关于大赛
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setAllUniversitiesModalOpen(true)}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    参赛高校名录
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedOrgModal(LEADERSHIP_ORGS[0])}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    组委会架构
                  </button>
                </li>
              </ul>
            </div>

            {/* 第 2 列：赛事功能 */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-extrabold text-[#134B91]">赛事功能</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#232A65]/75">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('directory');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    赛事目录
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setInitialSelectedMomentId(null);
                      setCurrentView('moments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    赛事动态
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('utility-service-section')}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    电子证书核验
                  </button>
                </li>
              </ul>
            </div>

            {/* 第 3 列：权威机构与服务 */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-sm font-extrabold text-[#134B91]">权威机构与服务</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#232A65]/75">
                <li>
                  <a
                    href="https://www.cac.gov.cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#165CCC] transition-colors"
                  >
                    中国网信网 (cac.gov.cn)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.moe.gov.cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#165CCC] transition-colors"
                  >
                    中华人民共和国教育部
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('help');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#165CCC] transition-colors cursor-pointer"
                  >
                    参赛常见问题 (FAQ)
                  </button>
                </li>
              </ul>
            </div>

            {/* 第 4 列：关注大赛 / 联系组委会 */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-sm font-extrabold text-[#134B91]">关注“XX杯”组委会</h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#232A65]/75">
                <div>官方赛事咨询：010-6899-2026</div>
                <div className="font-mono-num">联赛交流群：271910967</div>
                <div className="font-mono-num">组委会邮箱：committee@xxcup-sec.org.cn</div>
              </div>
            </div>

            {/* 第 5 列：右侧二维码卡片 */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2 flex flex-col items-start lg:items-center justify-center">
              <div className="w-24 h-24 rounded-xl bg-white p-2 border border-white flex items-center justify-center shadow-[0_8px_20px_rgba(19,75,145,0.10)]">
                <QrCode className="w-full h-full text-[#134B91]" />
              </div>
              <div className="text-xs text-[#232A65]/70 font-medium text-center mt-2 leading-tight">
                <div>扫一扫二维码</div>
                <div>关注大赛公众号</div>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-[#232A65]/65 font-mono-num">
            Copyright © 中国信息安全测评中心 版权所有 · 京ICP备14044185号-4
          </div>
        </div>
      </footer>

      {/* =====================================================================
          安全风控提醒：异地登录站内弹出提醒（指标2）
         ===================================================================== */}
      {abnormalLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-base">异地登录安全提醒</span>
              </div>
              <button
                type="button"
                onClick={() => setAbnormalLocationModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-800 leading-relaxed">
                系统检测到您本次登录的 IP 归属地与常用登录地不符，请注意账号安全：
              </p>
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 font-mono-num text-slate-700">
                <div>常用登录 IP：{abnormalLocationModal.lastIp} ({abnormalLocationModal.lastLoc})</div>
                <div className="text-amber-900 font-bold">
                  本次登录 IP：{abnormalLocationModal.currIp} ({abnormalLocationModal.currLoc})
                </div>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                系统已同步向您的预留邮箱（<span className="font-mono-num">{abnormalLocationModal.email}</span>）异步发送异地登录安全提醒邮件。如非本人操作，请立即前往个人中心修改密码。
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAbnormalLocationModal(null)}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  我知道了（确认是本人操作）
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          情形 1：未登录时点击“立即报名”拦截弹窗
          提示：“您尚未登录，请先登录后再报名。”
          操作：【稍后再说】/【去登录】（跳转登录页，登录成功后返回当前赛事详情页）
         ===================================================================== */}
      {unloggedInterceptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#134B91] to-[#165CCC] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-200" />
                <span className="font-bold text-base">登录提示</span>
              </div>
              <button
                type="button"
                onClick={() => setUnloggedInterceptModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                您尚未登录，请先登录后再报名。
              </p>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setUnloggedInterceptModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  稍后再说
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const compId = unloggedInterceptModal.competitionId;
                    setUnloggedInterceptModal(null);
                    setSelectedCompetitionId(compId);
                    setPostLoginRedirectView('competition-detail');
                    setAuthInitialTab('login');
                    setCurrentView('auth');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 aic-btn-gradient text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  去登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          情形 5：报名在期限内，教师误点报名拦截弹窗
          提示：本赛事仅支持学生创建队伍。您当前的认证身份为教师，请等待学生队长向您发起组队邀请。
          按钮：【我知道了】（点击后关闭弹窗）
         ===================================================================== */}
      {teacherInterceptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#134B91] to-[#165CCC] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-base">报名提示</span>
              </div>
              <button
                type="button"
                onClick={() => setTeacherInterceptModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                本赛事仅支持学生创建队伍。您当前的认证身份为教师，请等待学生队长向您发起组队邀请。
              </p>
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setTeacherInterceptModal(null)}
                  className="px-5 py-2.5 aic-btn-gradient text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          情形 6：报名在期限内，学生认证未完成（包含：未实名、未完成学生认证（未申请、审核中、已驳回））
          提示：“报名参赛需完成【学生认证】。请前往个人中心完成认证或查看审核进度，审核通过后方可发起报名。”
          操作：【稍后再说】/【前往用户认证】（点击后进入个人中心用户认证）
         ===================================================================== */}
      {unverifiedInterceptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <span className="font-bold text-base">报名资格拦截校验</span>
              <button
                type="button"
                onClick={() => setUnverifiedInterceptModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                报名参赛需完成【学生认证】。请前往个人中心完成认证或查看审核进度，审核通过后方可发起报名。
              </p>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setUnverifiedInterceptModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  稍后再说
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnverifiedInterceptModal(null);
                    setUserCenterInitialTab('certification');
                    setCurrentView('user-center');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  前往用户认证
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          情形 7：报名在期限内，学生已有报名队伍 -> 弹窗提示已有队伍，并提供【取消】【前往我的报名】按钮
         ===================================================================== */}
      {existingTeamInterceptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#072A47] to-[#0284C7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-base">已有报名队伍提示</span>
              </div>
              <button
                type="button"
                onClick={() => setExistingTeamInterceptModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                系统检测到您已在该赛事《{existingTeamInterceptModal.competitionTitle}》下拥有队伍，同一赛事每人仅限归属一支参赛队伍。
              </p>
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-1.5 text-slate-700">
                <div>
                  当前关联队伍：<strong className="text-[#0369A1]">{existingTeamInterceptModal.teamName}</strong>
                </div>
                <div>
                  您的队内身份：<span className="font-semibold">{existingTeamInterceptModal.roleDesc}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                您可以直接前往个人中心【我的报名】查看队伍进度、管理成员或继续编辑草稿。
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const compId = existingTeamInterceptModal.competitionId;
                    const trk = existingTeamInterceptModal.selectedSubTrackName;
                    setExistingTeamInterceptModal(null);
                    setSelectedCompetitionId(compId);
                    setRegInitialSubTrack(trk);
                    setEditingDraftTeam(null);
                    setCurrentView('registration-form');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[11px] text-slate-400 hover:text-[#0284C7] underline cursor-pointer"
                  title="供演示体验报名表单填写页"
                >
                  演示辅助：忽略拦截进入填表页
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExistingTeamInterceptModal(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingTeamInterceptModal(null);
                      setUserCenterInitialTab('registrations');
                      setCurrentView('user-center');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    前往我的报名
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 赛事详情页、通知公告详情页、赛事新闻详情页、赛事动态详情页、帮助中心均已采用独立二级页面展示 */}

      {/* 电子证书查询与防伪验证结果弹窗 */}
      {certSearchResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#072A47] to-[#0284C7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-300" />
                <span className="font-bold text-base">“XX杯”获奖查询与电子证书核验结果</span>
              </div>
              <button
                type="button"
                onClick={() => setCertSearchResult(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {certSearchResult.records.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="text-base font-bold text-slate-800">
                    未查询到与“{certSearchResult.query}”匹配的获奖证书记录
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    请核对填写的姓名、身份证号或证书编号是否准确，或点击下方测试样例体验查询效果：
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {CERTIFICATE_RECORDS.slice(0, 4).map((r) => (
                      <button
                        key={r.certId}
                        type="button"
                        onClick={() =>
                          handleCertificateSearch(undefined, {
                            identity: r.holderName,
                            certNo: r.certId,
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-sky-50 text-[#0284C7] border border-sky-200 rounded-lg font-mono-num cursor-pointer"
                      >
                        查询：{r.holderName} ({r.certId})
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {certSearchResult.records.map((rec) => (
                    <div
                      key={rec.certId}
                      className="rounded-xl border-2 border-[#0284C7]/30 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0F9FF] p-6 relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                        <div>
                          <div className="text-xs text-[#0284C7] font-bold">
                            核验状态：真实有效 · 官方数字签章已验证
                          </div>
                          <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">
                            {rec.trackTitle}
                          </h4>
                        </div>
                        <div className="text-right font-mono-num">
                          <div className="text-xs text-slate-400">证书编号</div>
                          <div className="text-sm font-bold text-slate-900">{rec.certId}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-xs">
                        <div>
                          <div className="text-slate-400">获奖选手姓名</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">{rec.holderName}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">身份证号（脱敏）</div>
                          <div className="text-sm font-mono-num font-semibold text-slate-800 mt-0.5">
                            {rec.idCard.replace(/^(\d{6})\d{8}(\w{4})$/, '$1********$2')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">所属高等院校</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">{rec.university}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">参赛战队名称</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">{rec.teamName}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">获奖等级</div>
                          <div className="text-sm font-extrabold text-[#0284C7] mt-0.5">{rec.awardLevel}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">指导教师 / 签发日期</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">
                            {rec.advisor} · <span className="font-mono-num">{rec.issueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-mono-num">
                        <span>防伪摘要：{rec.verifyHash}</span>
                        <span className="text-emerald-700 font-semibold">
                          ✓ 国家信息安全工程技术研究中心核准
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {allUniversitiesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">全国重点参赛高校名录（部分展示）</span>
              <button
                type="button"
                onClick={() => setAllUniversitiesModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
              {UNIVERSITY_PARTNERS.map((uni) => (
                <div
                  key={uni.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center text-center"
                >
                  <UniversityCrest uni={uni} />
                  <div className="text-sm font-bold text-slate-900 mt-2">{uni.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {uni.region} · 已报{' '}
                    <span className="font-mono-num font-bold text-[#0284C7]">{uni.teamsCount}</span> 队
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-sm">领导机构职责说明 · {selectedOrgModal.role}</span>
              <button
                type="button"
                onClick={() => setSelectedOrgModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">{selectedOrgModal.name}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedOrgModal.description}
              </p>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrgModal(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  关闭
                </button>
                <a
                  href={selectedOrgModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <span>访问机构官网</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 消息操作顶部轻提示 Toast */}
      {msgActionToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] px-5 py-2.5 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{msgActionToast}</span>
        </div>
      )}

      {/* 入队邀请快捷操作拦截弹窗：未完成实名/学籍认证时弹窗提示并跳转【用户认证】Tab */}
      {inviteVerifyInterceptModal && (
        <div className="fixed inset-0 z-[75] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">请先完成认证</span>
              </div>
              <button
                type="button"
                onClick={() => setInviteVerifyInterceptModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                系统检测到您的账号尚未完成<strong>实名认证与学籍/教职工认证</strong>，暂无法同意加入队伍
                {inviteVerifyInterceptModal.teamLabel ? (
                  <span className="font-bold text-[#0284C7]">【{inviteVerifyInterceptModal.teamLabel}】</span>
                ) : null}
                。请先完成认证后再处理入队邀请。
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInviteVerifyInterceptModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  稍后再说
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInviteVerifyInterceptModal(null);
                    setBellDropdownOpen(false);
                    setUserCenterInitialTab('certification');
                    setCurrentView('user-center');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  确定（去认证）
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 站内全局全文检索弹窗（覆盖赛事新闻、通知公告、赛事动态） */}
      <GlobalSiteSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        newsList={allFrontendNews}
        momentsList={allFrontendMoments}
        noticesList={publishedNotices}
        onNavigateToNews={(newsId) => {
          setInitialSelectedNewsId(newsId);
          setCurrentView('news-detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToMoment={(momentId) => {
          setInitialSelectedMomentId(momentId);
          setCurrentView('moment-detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToNotice={(noticeId) => {
          setInitialSelectedNoticeId(noticeId);
          setCurrentView('notice-detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
