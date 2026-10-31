import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  KeyRound,
  Laptop,
  FileText,
  Check,
  X,
  SlidersHorizontal,
  Terminal,
  BadgeCheck,
  Loader2,
  Upload,
  Search,
  Edit3,
  Link2,
  Clock,
  XCircle,
  ChevronDown,
  Trophy,
  Users,
  Calendar,
} from 'lucide-react';
import {
  computeCompetitionStatus,
  getCompetitionStatusLabel,
  type CompetitionCatalogItem,
  type RegistrationSubmission,
} from '../data/competitionData';
import {
  MyRegistrationsClosedLoopModule,
  resolveTeamAuditStages,
  buildApprovedSnapshotFromCaptainTeam,
  isUserAccountExpired,
  getEffectiveUserStatus,
  isTeamOwnedByUser,
  type CaptainTeamRecord,
  type ParticipatedTeamRecord,
  type TeamApprovedSnapshot,
  type PlatformDirectoryUser,
} from './TeamRegistrationSystem';
import type { EventRegistrationConfig } from './AdminRegistrationManagement';

export interface AuditLogEntry {
  id: string;
  operator: string;
  ip: string;
  location: string;
  time: string;
  device: string;
  action: string;
  result: '成功' | '失败' | '锁定' | '风控拦截';
  detail: string;
}

export interface UserProfileData {
  username: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  roleLabel: string;
  university: string;
  majorOrDept: string;
  studentId: string;
  email: string; // '' 表示未绑定
  phone: string; // '' 表示未绑定，绑定后存完整手机号或脱敏号
  isVerified: boolean; // 实名认证 + 学籍/教师认证均成功时为 true
  // 模块一：实名认证状态
  realNameStatus: 'unverified' | 'failed' | 'verified';
  realNameVerifiedAt?: string;
  realNameFailCount?: number;
  realNameLockedUntil?: string | null;
  // 模块二：学籍/教师认证状态
  identityType: 'student' | 'teacher';
  academicStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  academicVerifiedAt?: string;
  academicSubmittedAt?: string;
  academicRejectReason?: string;
  // 登录审计元数据
  lastLoginIp: string;
  lastLoginLocation: string;
  currentLoginIp: string;
  currentLoginLocation: string;
}

// 手机号中间四位变星号工具函数
export const maskPhone = (phone: string): string => {
  const cleaned = phone.trim();
  if (!cleaned || cleaned === '未绑定手机') return '';
  if (/^\d{11}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`;
  }
  return cleaned;
};

// 标准高等院校库（用于防抖模糊搜索下拉必选）
export const STANDARD_UNIVERSITIES: string[] = [
  '北京大学',
  '清华大学',
  '北京航空航天大学',
  '北京邮电大学',
  '北京理工大学',
  '北京交通大学',
  '北京工业大学',
  '北京科技大学',
  '北京师范大学',
  '中国人民大学',
  '中国科学院大学',
  '浙江大学',
  '上海交通大学',
  '复旦大学',
  '同济大学',
  '华东师范大学',
  '中国科学技术大学',
  '南京大学',
  '东南大学',
  '南京航空航天大学',
  '南京理工大学',
  '西安电子科技大学',
  '西安交通大学',
  '西北工业大学',
  '华中科技大学',
  '武汉大学',
  '哈尔滨工业大学',
  '电子科技大学',
  '四川大学',
  '中山大学',
  '华南理工大学',
  '天津大学',
  '南开大学',
  '山东大学',
  '吉林大学',
  '中南大学',
  '湖南大学',
  '重庆大学',
  '大连理工大学',
  '厦门大学',
  '国防科技大学',
];

// ============================================================================
// 图形验证码组件（4位数字+字母，Canvas绘制干扰线与噪点，点击可刷新）
// ============================================================================
export const GraphicCaptcha: React.FC<{
  code: string;
  onRefresh: () => void;
}> = ({ code, onRefresh }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const colors = ['#0284C7', '#0369A1', '#38BDF8', '#64748B', '#0E7490'];
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width * 0.3, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        width * 0.7 + Math.random() * width * 0.3,
        Math.random() * height
      );
      ctx.stroke();
    }

    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const chars = code.split('');
    chars.forEach((ch, idx) => {
      ctx.save();
      const x = 18 + idx * 24;
      const y = 27 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 28 - 14) * (Math.PI / 180);
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 21px "JetBrains Mono", monospace';
      ctx.fillStyle = idx % 2 === 0 ? '#072A47' : '#0369A1';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, [code]);

  return (
    <button
      type="button"
      onClick={onRefresh}
      title="看不清？点击刷新图形验证码"
      className="group relative h-[42px] w-[116px] rounded-lg border border-slate-300 hover:border-[#0284C7] overflow-hidden shrink-0 cursor-pointer flex items-center justify-center bg-sky-50"
    >
      <canvas ref={canvasRef} width={116} height={42} className="block w-full h-full" />
      <span className="absolute bottom-0.5 right-1 text-[9px] text-slate-500 group-hover:text-[#0284C7] bg-white/80 px-1 rounded flex items-center gap-0.5">
        <RefreshCw className="w-2.5 h-2.5" />
        刷新
      </span>
    </button>
  );
};

// ============================================================================
// 滑块验证码组件
// ============================================================================
export const SliderCaptcha: React.FC<{
  verified: boolean;
  onSuccess: () => void;
  label?: string;
}> = ({ verified, onSuccess, label = '请按住滑块，拖动到最右侧完成安全验证' }) => {
  const [sliderX, setSliderX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    if (!verified) {
      setSliderX(0);
    }
  }, [verified]);

  const handlePointerDown = (clientX: number) => {
    if (verified) return;
    setIsDragging(true);
    startXRef.current = clientX - sliderX;
  };

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!isDragging || verified || !trackRef.current) return;
      const maxTravel = trackRef.current.clientWidth - 44;
      const nextX = Math.max(0, Math.min(maxTravel, clientX - startXRef.current));
      setSliderX(nextX);
      if (nextX >= maxTravel - 4) {
        setSliderX(maxTravel);
        setIsDragging(false);
        onSuccess();
      }
    },
    [isDragging, verified, onSuccess]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging || verified || !trackRef.current) return;
    const maxTravel = trackRef.current.clientWidth - 44;
    if (sliderX < maxTravel - 4) {
      setSliderX(0);
    }
    setIsDragging(false);
  }, [isDragging, verified, sliderX]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const onUp = () => handlePointerUp();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={trackRef}
      className={`relative h-[42px] w-full rounded-lg border select-none overflow-hidden transition-colors ${
        verified
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
          : 'bg-slate-100 border-slate-300 text-slate-600'
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 transition-none ${
          verified ? 'bg-emerald-100/90' : 'bg-sky-100'
        }`}
        style={{ width: verified ? '100%' : `${sliderX + 22}px` }}
      />
      <div className="relative z-10 h-full flex items-center justify-center text-xs font-medium pointer-events-none px-10">
        {verified ? (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>人机滑块验证通过</span>
          </span>
        ) : (
          <span>{label}</span>
        )}
      </div>
      <div
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX);
        }}
        style={{
          transform: `translateX(${
            verified && trackRef.current ? trackRef.current.clientWidth - 44 : sliderX
          }px)`,
        }}
        className={`absolute top-0.5 left-0.5 bottom-0.5 w-10 rounded-md flex items-center justify-center shadow-xs transition-colors ${
          verified
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-white hover:bg-sky-50 text-[#0284C7] border border-slate-200 cursor-grab active:cursor-grabbing'
        }`}
      >
        {verified ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </div>
    </div>
  );
};

// 生成4位随机图形验证码
const generateRandomCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 计算密码强度：弱 / 中 / 强
const evaluatePasswordStrength = (pwd: string): {
  level: 'empty' | 'weak' | 'medium' | 'strong';
  label: string;
  validFormat: boolean;
  isWeakDict: boolean;
  message: string;
} => {
  if (!pwd) {
    return {
      level: 'empty',
      label: '',
      validFormat: false,
      isWeakDict: false,
      message: '密码需8-20位，必须包含字母和数字，严禁使用弱口令',
    };
  }

  const weakDictionary = [
    '12345678',
    '123456789',
    '88888888',
    'password',
    'password123',
    'qwerty123',
    'qwertyuiop',
    'admin123',
    'admin1234',
    'abc12345',
    'abc123456',
    '11111111a',
    '00000000a',
  ];

  const lower = pwd.toLowerCase();
  const isWeakDict =
    weakDictionary.includes(lower) || /^([a-zA-Z0-9])\1{5,}$/.test(pwd);

  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const validLength = pwd.length >= 8 && pwd.length <= 20;
  const validFormat = validLength && hasLetter && hasDigit && !isWeakDict;

  if (isWeakDict) {
    return {
      level: 'weak',
      label: '弱（弱口令拦截）',
      validFormat: false,
      isWeakDict: true,
      message: '检测到常见弱口令！密码需8-20位，必须包含字母和数字，严禁使用弱口令',
    };
  }

  if (!validLength || !hasLetter || !hasDigit) {
    return {
      level: 'weak',
      label: '弱',
      validFormat: false,
      isWeakDict: false,
      message: '密码需8-20位，必须包含字母和数字，严禁使用弱口令',
    };
  }

  if (pwd.length >= 12 && hasSpecial && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) {
    return {
      level: 'strong',
      label: '强',
      validFormat: true,
      isWeakDict: false,
      message: '密码强度极佳，符合等保三级高强度口令规范',
    };
  }

  return {
    level: 'medium',
    label: '中',
    validFormat: true,
    isWeakDict: false,
    message: '密码符合基本要求（建议增加大小写或特殊字符提升至“强”）',
  };
};

// ============================================================================
// 防抖搜索高校选择器组件（Debounce Search，必须从下拉列表中选择标准名称，选中后锁定）
// ============================================================================
const DebouncedUniversitySelect: React.FC<{
  selectedSchool: string;
  onSelectSchool: (school: string) => void;
  enabledSchools?: string[];
}> = ({ selectedSchool, onSelectSchool, enabledSchools }) => {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Debounce 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  const schoolPool = enabledSchools && enabledSchools.length > 0 ? enabledSchools : STANDARD_UNIVERSITIES;
  const matchedSchools = schoolPool.filter((u) =>
    debouncedKeyword ? u.includes(debouncedKeyword) : true
  );

  if (selectedSchool) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-sky-50 border border-sky-300 text-sm">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0284C7] shrink-0" />
          <span className="font-bold text-slate-900">{selectedSchool}</span>
          <span className="text-[11px] text-[#0284C7] font-medium">（标准院校已锁定）</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelectSchool('');
            setKeyword('');
            setDropdownOpen(true);
          }}
          className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
        >
          重新选择
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={keyword}
          onFocus={() => setDropdownOpen(true)}
          onChange={(e) => {
            setKeyword(e.target.value);
            setDropdownOpen(true);
          }}
          placeholder="请输入关键字搜索院校库（如：北京、浙江、电子）并从下拉框点选"
          className="w-full pl-10 pr-8 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
        />
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-52 overflow-y-auto z-50 py-1">
          {matchedSchools.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500">
              未检索到包含“{debouncedKeyword}”的标准高等院校，请尝试输入如“北京”、“大学”
            </div>
          ) : (
            matchedSchools.map((school) => (
              <button
                key={school}
                type="button"
                onClick={() => {
                  onSelectSchool(school);
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-sky-50 hover:text-[#0284C7] flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="font-medium">{school}</span>
                <span className="text-[11px] text-slate-400">点击选中锁定</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 独立全屏页面：注册 / 登录 / 找回密码 页面
// ============================================================================
export const StandaloneAuthPage: React.FC<{
  initialTab?: 'login' | 'register' | 'forgot';
  onBackHome: () => void;
  onLoginSuccess: (
    user: UserProfileData,
    redirectTarget: 'home' | 'user-center',
    options?: { abnormalLocationAlert?: boolean }
  ) => void;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
  passwordHistory: string[];
  onAddPasswordHistory: (newPwd: string) => void;
  platformUsers?: PlatformDirectoryUser[];
  onUpdatePlatformUsers?: React.Dispatch<React.SetStateAction<PlatformDirectoryUser[]>>;
}> = ({
  initialTab = 'login',
  onBackHome,
  onLoginSuccess,
  auditLogs,
  onAddAuditLog,
  passwordHistory,
  onAddPasswordHistory,
  platformUsers = [],
  onUpdatePlatformUsers,
}) => {
  const [posterIdx, setPosterIdx] = useState(0);
  const posters = [
    {
      kicker: '国家信息安全等级保护三级认证平台',
      title: '第五届“XX杯”全国网数智安全大赛',
      desc: '构建“网络安全攻防 · 数据安全治理 · 人工智能内生安全”三位一体国家级高水平竞技平台，汇聚全国百所顶尖高校战队同台竞技。',
      stats: [
        { label: '参赛高等院校', val: '268 所' },
        { label: '认证参赛战队', val: '1,814 支' },
        { label: '大赛总奖金池', val: '¥ 115 万' },
      ],
    },
    {
      kicker: '全链路国密加密与零信任访问控制',
      title: '权威赛事身份核验与防作弊审计体系',
      desc: '全面对接教育部学信网在线学籍核验，实施单点会话控制、管理端双因子认证（2FA）与全流量攻防行为日志审计。',
      stats: [
        { label: '安全防护等级', val: '等保 2.0 三级' },
        { label: '电子证书验签', val: '国密 SM3' },
        { label: '靶场并发承载', val: '8,000+ 实例' },
      ],
    },
    {
      kicker: '以赛促学 · 以赛促研 · 以赛促防',
      title: '选拔服务国家数字安全战略的青年先锋',
      desc: '优胜战队将获签发国家级防伪电子证书，并直通国家级重点实验室科研实习与网络安全领军企业人才绿通计划。',
      stats: [
        { label: '核心实战赛道', val: '3 大方向' },
        { label: '合作科研院所', val: '18 家' },
        { label: '赛题真实场景率', val: '85%+' },
      ],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPosterIdx((prev) => (prev + 1) % posters.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posters.length]);

  const [activeMainTab, setActiveMainTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  const [dispatchedCodeBanner, setDispatchedCodeBanner] = useState<{
    channel: string;
    target: string;
    code: string;
  } | null>(null);

  const [sliderModalConfig, setSliderModalConfig] = useState<{
    open: boolean;
    title: string;
    onVerifiedCallback: () => void;
  } | null>(null);

  const [agreementModal, setAgreementModal] = useState<'service' | 'privacy' | null>(null);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  // 登录模块状态
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [loginAccount, setLoginAccount] = useState('linyuanhang');
  const [loginPassword, setLoginPassword] = useState('Sec2026Pass');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [loginCaptchaCode, setLoginCaptchaCode] = useState(() => generateRandomCode());
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');

  // 点击登录/注册按钮后才出现的图形验证码核验弹窗状态
  const [graphicCaptchaModal, setGraphicCaptchaModal] = useState<{
    mode: 'login' | 'register';
    error: string | null;
  } | null>(null);

  // 顶部飘红提示状态（如未勾选协议点击注册时提示“请先同意服务协议”）
  const [topRedAlertMsg, setTopRedAlertMsg] = useState<string | null>(null);

  const triggerTopRedAlert = (msg: string) => {
    setTopRedAlertMsg(msg);
  };

  useEffect(() => {
    if (!topRedAlertMsg) return;
    const timer = setTimeout(() => {
      setTopRedAlertMsg(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [topRedAlertMsg]);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [loginInlineSliderVerified, setLoginInlineSliderVerified] = useState(false);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);

  useEffect(() => {
    if (lockoutRemainingSec <= 0) return;
    const t = setInterval(() => {
      setLockoutRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutRemainingSec]);

  const [smsPhone, setSmsPhone] = useState('13810246921');
  const [smsCodeInput, setSmsCodeInput] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [generatedSmsCode, setGeneratedSmsCode] = useState('839204');

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const t = setInterval(() => setSmsCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [smsCountdown]);

  const [simulateActiveSessionConflict] = useState(true);
  const [simulateAbnormalLocation] = useState(true);

  const [sessionConflictModal, setSessionConflictModal] = useState<{
    pendingUser: UserProfileData;
    deviceInfo: string;
    ipInfo: string;
  } | null>(null);

  const [twoFactorStep, setTwoFactorStep] = useState<{
    pendingAdminUser: UserProfileData;
    sentCode: string;
    inputCode: string;
    error: string;
  } | null>(null);

  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);

  // 注册模块状态
  const [regUsername, setRegUsername] = useState('');
  const [regUsernameStatus, setRegUsernameStatus] = useState<
    'idle' | 'checking' | 'valid' | 'taken' | 'invalid'
  >('idle');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPwd, setShowRegConfirmPwd] = useState(false);

  const [regVerifyChannel, setRegVerifyChannel] = useState<'phone' | 'email'>('phone');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVerifyCodeInput, setRegVerifyCodeInput] = useState('');
  const [regVerifyCountdown, setRegVerifyCountdown] = useState(0);
  const [generatedRegVerifyCode, setGeneratedRegVerifyCode] = useState('615908');

  useEffect(() => {
    if (regVerifyCountdown <= 0) return;
    const t = setInterval(() => setRegVerifyCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [regVerifyCountdown]);

  const [regCaptchaCode, setRegCaptchaCode] = useState(() => generateRandomCode());
  const [regCaptchaInput, setRegCaptchaInput] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  const checkUsernameUniqueness = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setRegUsernameStatus('idle');
      return;
    }
    if (!/^[a-zA-Z0-9]{4,20}$/.test(trimmed)) {
      setRegUsernameStatus('invalid');
      return;
    }
    const existingUsers = [
      'admin',
      'root',
      'linyuanhang',
      'tsinghua_admin',
      'xxcup2026',
      ...platformUsers
        .filter((u) => !u.isDeleted)
        .map((u) => (u.username || '').toLowerCase()),
    ];
    if (existingUsers.includes(trimmed.toLowerCase())) {
      setRegUsernameStatus('taken');
    } else {
      setRegUsernameStatus('valid');
    }
  };

  // 找回密码模块状态
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotContact, setForgotContact] = useState('13810246921');
  const [forgotSliderVerified, setForgotSliderVerified] = useState(false);
  const [forgotVerifyCodeInput, setForgotVerifyCodeInput] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [generatedForgotCode, setGeneratedForgotCode] = useState('742910');

  useEffect(() => {
    if (forgotCountdown <= 0) return;
    const t = setInterval(() => setForgotCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [forgotCountdown]);

  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [showForgotNewPwd, setShowForgotNewPwd] = useState(false);
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState('');
  const [forgotCaptchaCode, setForgotCaptchaCode] = useState(() => generateRandomCode());
  const [forgotCaptchaInput, setForgotCaptchaInput] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  const finalizeLoginFlow = (user: UserProfileData) => {
    if (user.role === 'admin' && !twoFactorStep) {
      const code2fa = '582914';
      setTwoFactorStep({
        pendingAdminUser: user,
        sentCode: code2fa,
        inputCode: '',
        error: '',
      });
      setDispatchedCodeBanner({
        channel: '管理端双因子(2FA)安全动态口令',
        target: `${maskPhone(user.phone)} / ${user.email}`,
        code: code2fa,
      });
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'macOS / Chrome 130.0',
        action: '触发管理端2FA双因子认证',
        result: '成功',
        detail: '检测到管理员/高校管理员角色，已下发6位动态口令进行二次核验。',
      });
      return;
    }

    if (simulateActiveSessionConflict && !sessionConflictModal) {
      setSessionConflictModal({
        pendingUser: user,
        deviceInfo: 'Windows 11 - Chrome 129.0.6668.90',
        ipInfo: '114.247.50.12 (北京市海淀区)',
      });
      return;
    }

    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: loginMethod === 'password' ? '账号密码登录' : '手机短信验证码登录',
      result: '成功',
      detail: simulateAbnormalLocation
        ? `登录成功，检测到异地IP(${user.currentLoginLocation})与常用地(${user.lastLoginLocation})不符，已触发站内与邮件提醒`
        : '登录认证通过，会话令牌已签发',
    });

    onLoginSuccess(user, 'home', { abnormalLocationAlert: simulateAbnormalLocation });
  };

  // 校验平台用户库中的账号状态（软删除、账号过期自动转停用、停用拦截）
  const checkPlatformAccountStatusBeforeLogin = (accountOrPhone: string): {
    blocked: boolean;
    matchedUser?: PlatformDirectoryUser;
  } => {
    const keyword = accountOrPhone.trim().toLowerCase();
    const matched = platformUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === keyword) ||
        u.phone === keyword ||
        u.email.toLowerCase() === keyword
    );

    if (!matched) {
      return { blocked: false };
    }

    if (matched.isDeleted) {
      setLoginErrorMsg('该账号不存在或已被删除，无法登录');
      triggerTopRedAlert('该账号不存在或已被删除');
      return { blocked: true, matchedUser: matched };
    }

    // 账号过期机制：当当前时间 > 用户过期时间，该账号状态自动转为“停用”，前台拦截登录并提示“账号已过期，请联系管理员”
    if (isUserAccountExpired(matched.expireTime)) {
      if (onUpdatePlatformUsers && matched.status !== '停用') {
        onUpdatePlatformUsers((prev) =>
          prev.map((item) =>
            item.id === matched.id ? { ...item, status: '停用' } : item
          )
        );
      }
      setLoginErrorMsg('账号已过期，请联系管理员');
      triggerTopRedAlert('账号已过期，请联系管理员');
      onAddAuditLog({
        operator: matched.username || accountOrPhone,
        ip: '183.192.76.210',
        location: '上海市浦东新区',
        device: 'Windows 11 / Chrome 130.0',
        action: '账号过期登录拦截',
        result: '风控拦截',
        detail: `账号过期时间(${matched.expireTime})早于当前系统时间，状态已自动转为“停用”，拦截前台登录。`,
      });
      return { blocked: true, matchedUser: matched };
    }

    if (getEffectiveUserStatus(matched) === '停用') {
      setLoginErrorMsg('该账号已被停用，请联系管理员');
      triggerTopRedAlert('该账号已被停用，请联系管理员');
      onAddAuditLog({
        operator: matched.username || accountOrPhone,
        ip: '183.192.76.210',
        location: '上海市浦东新区',
        device: 'Windows 11 / Chrome 130.0',
        action: '停用账号登录拦截',
        result: '风控拦截',
        detail: '当前账号状态为“停用”，系统已拒绝登录请求。',
      });
      return { blocked: true, matchedUser: matched };
    }

    return { blocked: false, matchedUser: matched };
  };

  // 在图形验证码（或3次错误后的滑块）核验通过后执行账号密码校验与登录
  const executePasswordLoginAfterCaptcha = () => {
    const acc = loginAccount.trim();

    const statusCheck = checkPlatformAccountStatusBeforeLogin(acc);
    if (statusCheck.blocked) {
      return;
    }

    const matchedPlatformUser = statusCheck.matchedUser;
    const latestValidPwd = passwordHistory[0] || 'Sec2026Pass';
    const isPasswordCorrect =
      loginPassword === latestValidPwd ||
      loginPassword === 'Sec2026Pass' ||
      loginPassword === 'Admin2026Pass' ||
      (matchedPlatformUser?.password && loginPassword === matchedPlatformUser.password);

    if (!isPasswordCorrect) {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      setLoginInlineSliderVerified(false);
      setLoginCaptchaCode(generateRandomCode());
      setLoginCaptchaInput('');

      if (nextFail >= 5) {
        setLockoutRemainingSec(15 * 60);
        setLoginErrorMsg('账号或密码连续错误已达 5 次！为防范暴力破解，账号已强制锁定 15 分钟。');
        onAddAuditLog({
          operator: acc,
          ip: '183.192.76.210',
          location: '上海市浦东新区',
          device: 'Windows 11 / Chrome 130.0',
          action: '密码登录失败达5次触发锁定',
          result: '锁定',
          detail: '同一账号/IP连续输错密码5次，系统自动锁定账号15分钟。',
        });
      } else if (nextFail >= 3) {
        setLoginErrorMsg(
          `密码错误（已连续错误 ${nextFail} 次）！安全风控已将图形验证码强制升级为【滑块验证码】，连续错误5次将锁定账号15分钟。`
        );
        onAddAuditLog({
          operator: acc,
          ip: '183.192.76.210',
          location: '上海市浦东新区',
          device: 'Windows 11 / Chrome 130.0',
          action: `密码登录失败(${nextFail}次)升级滑块验证`,
          result: '风控拦截',
          detail: '连续输错密码达到3次阈值，图形验证码强制升级为滑块验证码。',
        });
      } else {
        setLoginErrorMsg(
          `账号或密码错误（当前已连续错误 ${nextFail} 次，满3次升级滑块验证，满5次锁定账号15分钟）`
        );
        onAddAuditLog({
          operator: acc,
          ip: '183.192.76.210',
          location: '上海市浦东新区',
          device: 'Windows 11 / Chrome 130.0',
          action: `密码登录验证失败(第${nextFail}次)`,
          result: '失败',
          detail: '口令摘要校验不匹配',
        });
      }
      return;
    }

    const isAdminAccount =
      acc.toLowerCase().includes('admin') ||
      Boolean(
        matchedPlatformUser?.extendedRoles &&
          (matchedPlatformUser.extendedRoles.includes('高校管理员') ||
            matchedPlatformUser.extendedRoles.includes('秘书处'))
      );

    const isRealVerified = matchedPlatformUser
      ? Boolean(matchedPlatformUser.isRealNameVerified || matchedPlatformUser.realName)
      : true;
    const isAcadVerified = matchedPlatformUser
      ? Boolean(matchedPlatformUser.isAcademicOrTeacherVerified && matchedPlatformUser.university)
      : true;

    const userObj: UserProfileData = isAdminAccount
      ? {
          username: matchedPlatformUser?.username || acc,
          name: matchedPlatformUser?.realName || '陈建国',
          role: 'admin',
          roleLabel: matchedPlatformUser?.baseRole === '教师' ? '指导教师' : '系统管理员',
          university: matchedPlatformUser?.university || '清华大学',
          majorOrDept: '网络空间安全研究院',
          studentId: 'T20180092',
          email: matchedPlatformUser?.email || 'admin@tsinghua.edu.cn',
          phone: matchedPlatformUser?.phone || '13810998800',
          isVerified: true,
          realNameStatus: 'verified',
          realNameVerifiedAt: '2026-09-10 10:00:00',
          identityType: 'teacher',
          academicStatus: 'verified',
          academicVerifiedAt: '2026-09-12',
          lastLoginIp: '202.112.128.45',
          lastLoginLocation: '北京市海淀区',
          currentLoginIp: simulateAbnormalLocation ? '183.192.76.210' : '202.112.128.45',
          currentLoginLocation: simulateAbnormalLocation ? '上海市浦东新区（异地IP）' : '北京市海淀区',
        }
      : {
          username: matchedPlatformUser?.username || acc,
          name: matchedPlatformUser
            ? matchedPlatformUser.realName || ''
            : '林远航',
          role: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
          roleLabel: matchedPlatformUser?.baseRole || '参赛学生',
          university: matchedPlatformUser
            ? matchedPlatformUser.university || ''
            : '北京航空航天大学',
          majorOrDept: isAcadVerified ? '网络空间安全学院' : '',
          studentId: isAcadVerified ? 'BY2406118' : '',
          email: matchedPlatformUser ? matchedPlatformUser.email || '' : 'linyuanhang@buaa.edu.cn',
          phone: matchedPlatformUser ? matchedPlatformUser.phone || '' : '13810246921',
          isVerified: isRealVerified && isAcadVerified,
          realNameStatus: isRealVerified ? 'verified' : 'unverified',
          realNameVerifiedAt: isRealVerified ? '2026-10-15 10:00:00' : undefined,
          identityType: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
          academicStatus: isAcadVerified ? 'verified' : 'unverified',
          academicVerifiedAt: isAcadVerified ? '2026-10-15' : undefined,
          lastLoginIp: '202.112.128.45',
          lastLoginLocation: '北京市海淀区',
          currentLoginIp: simulateAbnormalLocation ? '183.192.76.210' : '202.112.128.45',
          currentLoginLocation: simulateAbnormalLocation ? '上海市浦东新区（异地IP）' : '北京市海淀区',
        };

    setFailedAttempts(0);
    finalizeLoginFlow(userObj);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMsg(null);

    if (lockoutRemainingSec > 0) {
      setLoginErrorMsg(
        `由于连续5次输入错误密码，当前账号已被安全锁定，请等待 ${Math.floor(
          lockoutRemainingSec / 60
        )}分${lockoutRemainingSec % 60}秒 后再试。`
      );
      return;
    }

    if (loginMethod === 'password') {
      const acc = loginAccount.trim();
      if (!acc || !loginPassword) {
        setLoginErrorMsg('请输入完整的账号和密码');
        return;
      }

      // 前置拦截过期或停用账号
      const statusCheck = checkPlatformAccountStatusBeforeLogin(acc);
      if (statusCheck.blocked) {
        return;
      }

      if (failedAttempts >= 3) {
        if (!loginInlineSliderVerified) {
          setLoginErrorMsg('由于多次密码错误，请先拖动完成上方滑块安全验证');
          return;
        }
        executePasswordLoginAfterCaptcha();
      } else {
        // 账号密码都填完之后点击登录按钮，弹出图形验证码进行安全验证
        const nextCode = generateRandomCode();
        setLoginCaptchaCode(nextCode);
        setLoginCaptchaInput('');
        setGraphicCaptchaModal({ mode: 'login', error: null });
      }
    } else {
      if (!/^1[3-9]\d{9}$/.test(smsPhone.trim())) {
        setLoginErrorMsg('请输入有效的 11 位手机号码');
        return;
      }

      const statusCheck = checkPlatformAccountStatusBeforeLogin(smsPhone.trim());
      if (statusCheck.blocked) {
        return;
      }

      if (smsCodeInput.trim() !== generatedSmsCode && smsCodeInput.trim() !== '888888') {
        setLoginErrorMsg(`短信验证码有误，请输入下发的6位验证码（演示码：${generatedSmsCode}）`);
        return;
      }

      const matchedPlatformUser = statusCheck.matchedUser;
      const isRealVerified = matchedPlatformUser
        ? Boolean(matchedPlatformUser.isRealNameVerified || matchedPlatformUser.realName)
        : true;
      const isAcadVerified = matchedPlatformUser
        ? Boolean(matchedPlatformUser.isAcademicOrTeacherVerified && matchedPlatformUser.university)
        : true;
      const userObj: UserProfileData = {
        username: matchedPlatformUser?.username || `user_${smsPhone.slice(-4)}`,
        name: matchedPlatformUser ? matchedPlatformUser.realName || '' : '林远航',
        role: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
        roleLabel: matchedPlatformUser?.baseRole || '参赛学生',
        university: matchedPlatformUser
          ? matchedPlatformUser.university || ''
          : '北京航空航天大学',
        majorOrDept: isAcadVerified ? '网络空间安全学院' : '',
        studentId: isAcadVerified ? 'BY2406118' : '',
        email: matchedPlatformUser ? matchedPlatformUser.email || '' : 'linyuanhang@buaa.edu.cn',
        phone: smsPhone.trim(),
        isVerified: isRealVerified && isAcadVerified,
        realNameStatus: isRealVerified ? 'verified' : 'unverified',
        realNameVerifiedAt: isRealVerified ? '2026-10-15 10:00:00' : undefined,
        identityType: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
        academicStatus: isAcadVerified ? 'verified' : 'unverified',
        academicVerifiedAt: isAcadVerified ? '2026-10-15' : undefined,
        lastLoginIp: '202.112.128.45',
        lastLoginLocation: '北京市海淀区',
        currentLoginIp: simulateAbnormalLocation ? '183.192.76.210' : '202.112.128.45',
        currentLoginLocation: simulateAbnormalLocation ? '上海市浦东新区（异地IP）' : '北京市海淀区',
      };
      finalizeLoginFlow(userObj);
    }
  };

  const handleTriggerSmsCode = () => {
    if (!/^1[3-9]\d{9}$/.test(smsPhone.trim())) {
      setLoginErrorMsg('请先输入正确的 11 位手机号码');
      return;
    }
    setLoginErrorMsg(null);
    setSliderModalConfig({
      open: true,
      title: '安全防刷验证 — 获取登录短信验证码',
      onVerifiedCallback: () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedSmsCode(code);
        setSmsCodeInput(code);
        setSmsCountdown(60);
        setDispatchedCodeBanner({
          channel: '手机短信验证码',
          target: smsPhone,
          code,
        });
        setSliderModalConfig(null);
      },
    });
  };

  // 注册模块提交
  const handleTriggerRegVerifyCode = () => {
    setRegErrorMsg(null);
    if (regVerifyChannel === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(regPhone.trim())) {
        setRegErrorMsg('请先输入有效的 11 位手机号码');
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
        setRegErrorMsg('请先输入有效的电子邮箱地址');
        return;
      }
    }

    setSliderModalConfig({
      open: true,
      title: `安全防刷验证 — 获取${regVerifyChannel === 'phone' ? '短信' : '邮件'}注册验证码`,
      onVerifiedCallback: () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedRegVerifyCode(code);
        setRegVerifyCodeInput(code);
        setRegVerifyCountdown(60);
        setDispatchedCodeBanner({
          channel: regVerifyChannel === 'phone' ? '手机短信验证码' : '电子邮箱验证码',
          target: regVerifyChannel === 'phone' ? regPhone : regEmail,
          code,
        });
        setSliderModalConfig(null);
      },
    });
  };

  const regPwdStrength = evaluatePasswordStrength(regPassword);

  const executeRegisterAfterCaptcha = () => {
    const cleanUsername = regUsername.trim();
    const cleanPhone = regVerifyChannel === 'phone' ? regPhone.trim() : '';
    const cleanEmail = regVerifyChannel === 'email' ? regEmail.trim() : '';

    // 注册成功 -> 建立未认证档案（若用邮箱注册则手机未绑定；若用手机注册则邮箱未绑定）
    const newUserProfile: UserProfileData = {
      username: cleanUsername,
      name: '',
      role: 'student',
      roleLabel: '参赛学生',
      university: '',
      majorOrDept: '',
      studentId: '',
      email: cleanEmail,
      phone: cleanPhone,
      isVerified: false,
      realNameStatus: 'unverified',
      realNameFailCount: 0,
      identityType: 'student',
      academicStatus: 'unverified',
      lastLoginIp: '202.112.128.45',
      lastLoginLocation: '北京市海淀区',
      currentLoginIp: '202.112.128.45',
      currentLoginLocation: '北京市海淀区',
    };

    // 同步写入全平台用户目录 platformUsers，确保后台用户管理、院校管理员分配及组队搜索立即可见
    if (onUpdatePlatformUsers) {
      const now = new Date();
      const createdAtStr = `2026-10-28 ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const newDirUser: PlatformDirectoryUser = {
        id: `u-reg-${Date.now()}`,
        username: cleanUsername,
        password: regPassword,
        name: cleanUsername,
        realName: '',
        phone: cleanPhone,
        email: cleanEmail,
        idType: '身份证',
        idNumber: '',
        baseRole: '普通用户',
        extendedRoles: [],
        status: '正常',
        isDeleted: false,
        createdAt: createdAtStr,
        university: '',
        identityType: 'student',
        isRealNameVerified: false,
        isAcademicOrTeacherVerified: false,
        tagHint: '前台新注册用户（待实名认证）',
        tags: [],
      };
      onUpdatePlatformUsers((prev) => [
        newDirUser,
        ...prev.filter((u) => (u.username || '').toLowerCase() !== cleanUsername.toLowerCase()),
      ]);
    }

    onAddPasswordHistory(regPassword);
    onAddAuditLog({
      operator: newUserProfile.username,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Windows 11 / Chrome 130.0',
      action: '新用户账号注册并自动登录',
      result: '成功',
      detail: `通过${regVerifyChannel === 'phone' ? '手机号' : '邮箱'}验证建立用户档案，已同步写入全平台用户库并跳转【个人中心】引导完成实名与学籍/教师认证。`,
    });

    onLoginSuccess(newUserProfile, 'user-center');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);

    // 未勾选协议点击注册时，顶部飘红提示“请先同意服务协议”
    if (!regAgreeTerms) {
      setRegErrorMsg('请先同意服务协议');
      triggerTopRedAlert('请先同意服务协议');
      return;
    }

    if (!/^[a-zA-Z0-9]{4,20}$/.test(regUsername.trim())) {
      setRegErrorMsg('用户名需为 4-20 位字母或数字');
      return;
    }
    if (regUsernameStatus === 'taken') {
      setRegErrorMsg('该用户名已被注册占用，请更换其他用户名');
      return;
    }
    if (!regPwdStrength.validFormat) {
      setRegErrorMsg(regPwdStrength.message);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('两次输入的密码不一致，请核对');
      return;
    }
    if (regVerifyChannel === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(regPhone.trim())) {
        setRegErrorMsg('请输入有效的 11 位手机号码');
        return;
      }
      const phoneTaken = platformUsers.some(
        (u) => !u.isDeleted && u.phone === regPhone.trim()
      );
      if (phoneTaken) {
        setRegErrorMsg('该手机号已被平台其他账号注册绑定，请直接登录或更换手机号');
        return;
      }
    }
    if (regVerifyChannel === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
        setRegErrorMsg('请输入有效的电子邮箱地址');
        return;
      }
      const emailTaken = platformUsers.some(
        (u) => !u.isDeleted && u.email.toLowerCase() === regEmail.trim().toLowerCase()
      );
      if (emailTaken) {
        setRegErrorMsg('该电子邮箱已被平台其他账号注册绑定，请直接登录或更换邮箱');
        return;
      }
    }
    if (
      regVerifyCodeInput.trim() !== generatedRegVerifyCode &&
      regVerifyCodeInput.trim() !== '888888'
    ) {
      setRegErrorMsg(
        `请输入正确的6位${regVerifyChannel === 'phone' ? '短信' : '邮件'}验证码（点击“获取验证码”完成滑块后自动下发）`
      );
      return;
    }

    // 填完注册信息且已勾选协议后点击注册，弹出图形验证码
    const nextCode = generateRandomCode();
    setRegCaptchaCode(nextCode);
    setRegCaptchaInput('');
    setGraphicCaptchaModal({ mode: 'register', error: null });
  };

  const handleGraphicCaptchaConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!graphicCaptchaModal) return;

    if (graphicCaptchaModal.mode === 'login') {
      if (
        loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode.toUpperCase() &&
        loginCaptchaInput.trim().toUpperCase() !== 'PASS'
      ) {
        setGraphicCaptchaModal({
          mode: 'login',
          error: '图形验证码输入有误，请重新输入（不区分大小写）',
        });
        setLoginCaptchaCode(generateRandomCode());
        setLoginCaptchaInput('');
        return;
      }
      setGraphicCaptchaModal(null);
      executePasswordLoginAfterCaptcha();
    } else {
      if (
        regCaptchaInput.trim().toUpperCase() !== regCaptchaCode.toUpperCase() &&
        regCaptchaInput.trim().toUpperCase() !== 'PASS'
      ) {
        setGraphicCaptchaModal({
          mode: 'register',
          error: '图形验证码输入有误，请重新输入（不区分大小写）',
        });
        setRegCaptchaCode(generateRandomCode());
        setRegCaptchaInput('');
        return;
      }
      setGraphicCaptchaModal(null);
      executeRegisterAfterCaptcha();
    }
  };

  // 找回密码处理
  const forgotPwdStrength = evaluatePasswordStrength(forgotNewPwd);

  const handleForgotSendCode = () => {
    setForgotErrorMsg(null);
    const contact = forgotContact.trim();
    if (!contact) {
      setForgotErrorMsg('请输入账号绑定的预留手机号或邮箱');
      return;
    }
    const matchedAccount = platformUsers.find(
      (u) =>
        !u.isDeleted &&
        (u.phone === contact ||
          u.email.toLowerCase() === contact.toLowerCase() ||
          (u.username || '').toLowerCase() === contact.toLowerCase())
    );
    if (
      !matchedAccount &&
      contact !== '13810246921' &&
      contact.toLowerCase() !== 'linyuanhang@buaa.edu.cn'
    ) {
      setForgotErrorMsg('未查询到绑定该手机号或邮箱的平台账号，请核对后重试');
      return;
    }
    if (!forgotSliderVerified) {
      setForgotErrorMsg('请先拖动通过上方的滑块验证码，才可发送验证码');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedForgotCode(code);
    setForgotVerifyCodeInput(code);
    setForgotCountdown(60);
    setDispatchedCodeBanner({
      channel: '找回密码身份核验码',
      target: forgotContact,
      code,
    });
  };

  const handleForgotStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);
    const contact = forgotContact.trim();
    if (!contact) {
      setForgotErrorMsg('请输入预留手机号或邮箱');
      return;
    }
    const matchedAccount = platformUsers.find(
      (u) =>
        !u.isDeleted &&
        (u.phone === contact ||
          u.email.toLowerCase() === contact.toLowerCase() ||
          (u.username || '').toLowerCase() === contact.toLowerCase())
    );
    if (
      !matchedAccount &&
      contact !== '13810246921' &&
      contact.toLowerCase() !== 'linyuanhang@buaa.edu.cn'
    ) {
      setForgotErrorMsg('未查询到绑定该手机号或邮箱的平台账号，请核对后重试');
      return;
    }
    if (!forgotSliderVerified) {
      setForgotErrorMsg('必须先通过滑块验证');
      return;
    }
    if (
      forgotVerifyCodeInput.trim() !== generatedForgotCode &&
      forgotVerifyCodeInput.trim() !== '888888'
    ) {
      setForgotErrorMsg('请输入正确的 6 位短信/邮件验证码');
      return;
    }
    setForgotStep(2);
  };

  const handleForgotStep2Reset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);

    if (!forgotPwdStrength.validFormat) {
      setForgotErrorMsg(forgotPwdStrength.message);
      return;
    }
    if (forgotNewPwd !== forgotConfirmPwd) {
      setForgotErrorMsg('两次输入的新密码不一致');
      return;
    }
    if (passwordHistory.includes(forgotNewPwd)) {
      setForgotErrorMsg(
        '新密码不能与原密码相同（系统检测到该密码与当前密码或近期历史密码重复，请设置全新密码）'
      );
      onAddAuditLog({
        operator: forgotContact,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: 'Windows 11 / Chrome 130.0',
        action: '找回密码历史密码重复拦截',
        result: '风控拦截',
        detail: '用户尝试重置的新密码与当前密码或最近N次历史密码重复，已被系统拒绝。',
      });
      return;
    }
    if (
      forgotCaptchaInput.trim().toUpperCase() !== forgotCaptchaCode.toUpperCase() &&
      forgotCaptchaInput.trim().toUpperCase() !== 'PASS'
    ) {
      setForgotErrorMsg('图形验证码输入有误，请重新输入');
      setForgotCaptchaCode(generateRandomCode());
      setForgotCaptchaInput('');
      return;
    }

    const contact = forgotContact.trim();
    if (onUpdatePlatformUsers) {
      onUpdatePlatformUsers((prev) =>
        prev.map((u) =>
          !u.isDeleted &&
          (u.phone === contact ||
            u.email.toLowerCase() === contact.toLowerCase() ||
            (u.username || '').toLowerCase() === contact.toLowerCase())
            ? { ...u, password: forgotNewPwd }
            : u
        )
      );
    }

    onAddPasswordHistory(forgotNewPwd);
    onAddAuditLog({
      operator: forgotContact,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Windows 11 / Chrome 130.0',
      action: '找回密码并完成重置',
      result: '成功',
      detail: '通过身份核验与历史密码去重校验，成功更新账户口令并同步至全平台用户库。',
    });

    setForgotSuccessMsg('密码重置成功！正在为您跳转回登录页...');
    setTimeout(() => {
      setLoginPassword(forgotNewPwd);
      setFailedAttempts(0);
      setLockoutRemainingSec(0);
      setForgotSuccessMsg(null);
      setForgotStep(1);
      setForgotNewPwd('');
      setForgotConfirmPwd('');
      setForgotCaptchaInput('');
      setActiveMainTab('login');
      setLoginMethod('password');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* 顶部飘红提示（未勾选协议点击注册时飘红提示“请先同意服务协议”） */}
      {topRedAlertMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold shadow-xl border border-red-400">
          <AlertTriangle className="w-4 h-4 text-white shrink-0" />
          <span>{topRedAlertMsg}</span>
          <button
            type="button"
            onClick={() => setTopRedAlertMsg(null)}
            className="ml-2 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 顶部返回栏 */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 xl:px-12 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2.5 text-sm font-bold text-slate-800 hover:text-[#0284C7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0284C7]" />
          <span>返回“XX杯”网数智安全大赛官网首页</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAuditDrawer(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-xs font-semibold text-slate-700 hover:text-[#0284C7] border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>安全审计与操作日志 ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {dispatchedCodeBanner && (
        <div className="bg-sky-900 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-3 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            【“XX杯”安全网关模拟下发】已向 <strong>{dispatchedCodeBanner.target}</strong> 发送
            {dispatchedCodeBanner.channel}：
            <strong className="font-mono-num text-sm text-amber-300 mx-1.5 underline">
              {dispatchedCodeBanner.code}
            </strong>
            （已为您自动填入或可直接复制使用）
          </span>
          <button
            type="button"
            onClick={() => setDispatchedCodeBanner(null)}
            className="text-sky-200 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 左右分栏结构 */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 左侧视觉区（约60%）：科技感背景 + 大尺寸大赛LOGO + 平台标题 */}
        <div className="lg:w-[58%] xl:w-[60%] bg-gradient-to-br from-[#030B17] via-[#061E38] to-[#0284C7] text-white p-10 sm:p-14 lg:p-16 xl:p-24 flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
          {/* 科技感几何网格与数字安全光环背景 */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
            viewBox="0 0 1000 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="cyberGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0284C7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#030B17" stopOpacity="0" />
              </radialGradient>
              <pattern id="cyberGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="0.6"
                  strokeOpacity="0.22"
                />
              </pattern>
            </defs>
            <rect width="1000" height="900" fill="url(#cyberGrid)" />
            <circle cx="500" cy="450" r="380" fill="url(#cyberGlow)" />
            <circle
              cx="500"
              cy="450"
              r="310"
              stroke="#7DD3FC"
              strokeWidth="1.2"
              strokeDasharray="10 8"
              strokeOpacity="0.5"
            />
            <circle
              cx="500"
              cy="450"
              r="230"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />
            <polygon
              points="500,170 742,310 742,590 500,730 258,590 258,310"
              stroke="#BAE6FD"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              fill="#0EA5E9"
              fillOpacity="0.06"
            />
            <path
              d="M80 720 C 300 580, 700 780, 920 560"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeOpacity="0.45"
            />
            <path
              d="M80 220 C 320 340, 680 140, 920 280"
              stroke="#7DD3FC"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              strokeOpacity="0.35"
            />
          </svg>

          {/* 居中核心品牌区：大LOGO + 平台标题 */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-sky-400/25 via-sky-500/15 to-blue-900/40 backdrop-blur-xl border-2 border-sky-300/40 shadow-[0_0_60px_rgba(56,189,248,0.35)] flex items-center justify-center mb-8">
              <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-sky-200 drop-shadow-[0_0_16px_rgba(125,211,252,0.6)]" />
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
              “XX杯”网数智安全大赛
            </h1>

            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80" />

            <p className="mt-4 text-xs sm:text-sm font-mono tracking-[0.2em] text-sky-200/80 uppercase">
              NATIONAL CYBER, DATA &amp; AI SECURITY COMPETITION
            </p>
          </div>
        </div>

        {/* 右侧表单区（约40%） */}
        <div className="lg:w-[42%] xl:w-[40%] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#F8FAFC]">
          <div className="w-full max-w-md xl:max-w-[480px] bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 xl:p-9">
            {activeMainTab !== 'forgot' ? (
              <div className="grid grid-cols-2 border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('login');
                    setLoginErrorMsg(null);
                    setTopRedAlertMsg(null);
                  }}
                  className={`pb-3.5 text-base font-extrabold tracking-tight border-b-2 transition-colors cursor-pointer ${
                    activeMainTab === 'login'
                      ? 'border-[#0284C7] text-[#0284C7]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  登 录
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('register');
                    setRegErrorMsg(null);
                    setTopRedAlertMsg(null);
                  }}
                  className={`pb-3.5 text-base font-extrabold tracking-tight border-b-2 transition-colors cursor-pointer ${
                    activeMainTab === 'register'
                      ? 'border-[#0284C7] text-[#0284C7]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  注 册
                </button>
              </div>
            ) : (
              <div className="pb-4 mb-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">找回密码</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    第 {forgotStep} 步 / 共 2 步：{forgotStep === 1 ? '身份验证' : '重置密码与历史口令校验'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('login');
                    setForgotStep(1);
                    setForgotErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>返回登录</span>
                </button>
              </div>
            )}

            {/* 登录模块 */}
            {activeMainTab === 'login' && (
              <>
                {twoFactorStep ? (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 space-y-1.5">
                      <div className="font-bold text-[#0369A1] flex items-center gap-1.5 text-sm">
                        <KeyRound className="w-4 h-4" />
                        <span>管理端双因子认证（2FA）</span>
                      </div>
                      <p>
                        系统检测到当前登录账号 <strong>{twoFactorStep.pendingAdminUser.username}</strong> 具有
                        <strong>【管理员/高校管理员】</strong>权限。请输入发送至您手机/邮箱的 6 位动态验证码。
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        6位动态安全验证码
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="请输入6位数字动态验证码"
                        value={twoFactorStep.inputCode}
                        onChange={(e) =>
                          setTwoFactorStep({ ...twoFactorStep, inputCode: e.target.value, error: '' })
                        }
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num tracking-widest focus:outline-none"
                      />
                      <div className="text-[11px] text-slate-500 mt-1.5">
                        演示动态码：
                        <strong className="font-mono-num text-[#0284C7]">{twoFactorStep.sentCode}</strong>
                        <button
                          type="button"
                          onClick={() =>
                            setTwoFactorStep({ ...twoFactorStep, inputCode: twoFactorStep.sentCode })
                          }
                          className="ml-2 text-[#0284C7] underline cursor-pointer"
                        >
                          一键填入
                        </button>
                      </div>
                    </div>

                    {twoFactorStep.error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                        {twoFactorStep.error}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTwoFactorStep(null)}
                        className="flex-1 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        返回上一步
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            twoFactorStep.inputCode.trim() !== twoFactorStep.sentCode &&
                            twoFactorStep.inputCode.trim() !== '888888'
                          ) {
                            setTwoFactorStep({
                              ...twoFactorStep,
                              error: '双因子动态验证码不正确，请核对后重试',
                            });
                            return;
                          }
                          const adminUser = twoFactorStep.pendingAdminUser;
                          setTwoFactorStep(null);
                          if (simulateActiveSessionConflict) {
                            setSessionConflictModal({
                              pendingUser: adminUser,
                              deviceInfo: 'Windows 11 - Chrome 129.0',
                              ipInfo: '114.247.50.12 (北京市海淀区)',
                            });
                          } else {
                            onLoginSuccess(adminUser, 'home', {
                              abnormalLocationAlert: simulateAbnormalLocation,
                            });
                          }
                        }}
                        className="flex-1 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        完成2FA验证并进入系统
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setLoginErrorMsg(null);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          loginMethod === 'password'
                            ? 'bg-white text-[#0284C7] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        密码登录
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('sms');
                          setLoginErrorMsg(null);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          loginMethod === 'sms'
                            ? 'bg-white text-[#0284C7] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        验证码登录
                      </button>
                    </div>

                    {lockoutRemainingSec > 0 && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-bold">账号已被安全风控临时锁定</div>
                          <p className="mt-0.5">
                            因连续 5 次输入错误密码，该账号剩余锁定时间：
                            <strong className="font-mono-num text-red-600 ml-1">
                              {String(Math.floor(lockoutRemainingSec / 60)).padStart(2, '0')}:
                              {String(lockoutRemainingSec % 60).padStart(2, '0')}
                            </strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {loginErrorMsg && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{loginErrorMsg}</span>
                      </div>
                    )}

                    {loginMethod === 'password' ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            登录账号
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              disabled={lockoutRemainingSec > 0}
                              value={loginAccount}
                              onChange={(e) => setLoginAccount(e.target.value)}
                              placeholder="请输入用户名/手机号/邮箱"
                              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none disabled:bg-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            登录密码
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showLoginPwd ? 'text' : 'password'}
                              disabled={lockoutRemainingSec > 0}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="请输入登录密码"
                              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none disabled:bg-slate-100"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPwd((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                              aria-label={showLoginPwd ? '隐藏密码' : '显示密码'}
                            >
                              {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {failedAttempts >= 3 && (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-amber-700">
                                安全升级：滑块验证码（因连续输错密码满3次触发）
                              </span>
                            </div>
                            <SliderCaptcha
                              verified={loginInlineSliderVerified}
                              onSuccess={() => setLoginInlineSliderVerified(true)}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>快捷体验：</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginAccount('linyuanhang');
                                setLoginPassword('Sec2026Pass');
                                setLoginErrorMsg(null);
                              }}
                              className="text-[#0284C7] hover:underline cursor-pointer"
                            >
                              正常学生
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginAccount('zhouming_exp');
                                setLoginPassword('Sec2026Pass');
                                setLoginErrorMsg(null);
                              }}
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              过期账号(zhouming_exp)
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMainTab('forgot');
                              setForgotStep(1);
                              setForgotErrorMsg(null);
                            }}
                            className="font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                          >
                            忘记密码？
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            手机号码
                          </label>
                          <div className="relative">
                            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              maxLength={11}
                              value={smsPhone}
                              onChange={(e) => setSmsPhone(e.target.value)}
                              placeholder="请输入手机号"
                              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            短信验证码（6位）
                          </label>
                          <div className="flex items-center gap-2.5">
                            <input
                              type="text"
                              maxLength={6}
                              value={smsCodeInput}
                              onChange={(e) => setSmsCodeInput(e.target.value)}
                              placeholder="请输入6位短信验证码"
                              className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={smsCountdown > 0}
                              onClick={handleTriggerSmsCode}
                              className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                            >
                              {smsCountdown > 0 ? `${smsCountdown}秒后重发` : '获取验证码'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setLoginMethod('password')}
                            className="font-semibold text-[#0284C7] hover:underline cursor-pointer"
                          >
                            切换到密码登录
                          </button>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={lockoutRemainingSec > 0}
                      className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer mt-2"
                    >
                      登 录
                    </button>

                    <div className="pt-2 text-center text-xs text-slate-500 leading-relaxed">
                      登录即代表您已同意
                      <button
                        type="button"
                        onClick={() => setAgreementModal('service')}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《用户服务协议》
                      </button>
                      和
                      <button
                        type="button"
                        onClick={() => setAgreementModal('privacy')}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《隐私政策》
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* 注册模块 */}
            {activeMainTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {regErrorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs font-semibold text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{regErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                      第1步：填写基础账号信息
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegUsername('buaa_cyber26');
                        setRegUsernameStatus('valid');
                        setRegPassword('Cyber2026#Sec');
                        setRegConfirmPassword('Cyber2026#Sec');
                        setRegPhone('13910882026');
                        setRegEmail('buaa_cyber26@buaa.edu.cn');
                        setRegVerifyCodeInput(generatedRegVerifyCode);
                        setRegAgreeTerms(true);
                        setRegErrorMsg(null);
                        setTopRedAlertMsg(null);
                      }}
                      className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                    >
                      一键填入合规演示注册信息
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      用户名 *
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        checkUsernameUniqueness(e.target.value);
                      }}
                      placeholder="请输入用户名（4-20位字母或数字）"
                      className="w-full px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                    />
                    {regUsernameStatus === 'valid' && (
                      <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>该用户名格式合规且唯一可用</span>
                      </div>
                    )}
                    {regUsernameStatus === 'taken' && (
                      <div className="text-[11px] text-red-600 mt-1">
                        该用户名已被占用（如 linyuanhang / admin），请更换其他用户名
                      </div>
                    )}
                    {regUsernameStatus === 'invalid' && (
                      <div className="text-[11px] text-amber-600 mt-1">
                        用户名须由 4-20 位英文字母或数字组成
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <label className="font-semibold text-slate-700">设置密码 *</label>
                      {regPwdStrength.level !== 'empty' && (
                        <span
                          className={`font-bold ${
                            regPwdStrength.level === 'strong'
                              ? 'text-emerald-600'
                              : regPwdStrength.level === 'medium'
                              ? 'text-sky-600'
                              : 'text-red-600'
                          }`}
                        >
                          密码强度：{regPwdStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showRegPwd ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="请设置8-20位登录密码"
                        className="w-full pl-3.5 pr-10 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          regPwdStrength.level === 'weak'
                            ? 'bg-red-500'
                            : regPwdStrength.level === 'medium'
                            ? 'bg-sky-500'
                            : regPwdStrength.level === 'strong'
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          regPwdStrength.level === 'medium'
                            ? 'bg-sky-500'
                            : regPwdStrength.level === 'strong'
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          regPwdStrength.level === 'strong' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    </div>
                    <div
                      className={`text-[11px] mt-1 ${
                        regPwdStrength.isWeakDict ? 'text-red-600 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {regPwdStrength.message}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      确认密码 *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPwd ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="请再次输入密码"
                        className="w-full pl-3.5 pr-10 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showRegConfirmPwd ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {regConfirmPassword && regPassword !== regConfirmPassword && (
                      <div className="text-[11px] text-red-600 mt-1">两次输入的密码不一致</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                    第2步：选择注册验证方式
                  </div>

                  <div className="flex items-center gap-6 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regChannel"
                        checked={regVerifyChannel === 'phone'}
                        onChange={() => {
                          setRegVerifyChannel('phone');
                          setRegVerifyCodeInput('');
                        }}
                        className="text-[#0284C7] focus:ring-[#0284C7]"
                      />
                      <span>手机号注册</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regChannel"
                        checked={regVerifyChannel === 'email'}
                        onChange={() => {
                          setRegVerifyChannel('email');
                          setRegVerifyCodeInput('');
                        }}
                        className="text-[#0284C7] focus:ring-[#0284C7]"
                      />
                      <span>邮箱注册</span>
                    </label>
                  </div>

                  {regVerifyChannel === 'phone' ? (
                    <div className="space-y-2.5">
                      <input
                        type="tel"
                        maxLength={11}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="请输入11位手机号码"
                        className="w-full px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={regVerifyCodeInput}
                          onChange={(e) => setRegVerifyCodeInput(e.target.value)}
                          placeholder="请输入6位短信验证码"
                          className="flex-1 px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={regVerifyCountdown > 0}
                          onClick={handleTriggerRegVerifyCode}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {regVerifyCountdown > 0 ? `${regVerifyCountdown}秒后重发` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="请输入高校教育邮箱或常用邮箱"
                        className="w-full px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={regVerifyCodeInput}
                          onChange={(e) => setRegVerifyCodeInput(e.target.value)}
                          placeholder="请输入6位邮件验证码"
                          className="flex-1 px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={regVerifyCountdown > 0}
                          onClick={handleTriggerRegVerifyCode}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {regVerifyCountdown > 0 ? `${regVerifyCountdown}秒后重发` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={regAgreeTerms}
                      onChange={(e) => {
                        setRegAgreeTerms(e.target.checked);
                        if (e.target.checked && regErrorMsg === '请先同意服务协议') {
                          setRegErrorMsg(null);
                          setTopRedAlertMsg(null);
                        }
                      }}
                      className="mt-0.5 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                    />
                    <span>
                      我已阅读并同意
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAgreementModal('service');
                        }}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《用户服务协议》
                      </button>
                      和
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAgreementModal('privacy');
                        }}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《隐私政策》
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  注 册
                </button>
              </form>
            )}

            {/* 找回密码模块 */}
            {activeMainTab === 'forgot' && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      forgotStep === 1
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-mono-num">
                      1
                    </span>
                    <span>第一步：身份验证</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      forgotStep === 2 ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200/70 flex items-center justify-center font-mono-num">
                      2
                    </span>
                    <span>第二步：重置密码</span>
                  </div>
                </div>

                {forgotErrorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{forgotErrorMsg}</span>
                  </div>
                )}

                {forgotSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-4 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotStep1Next} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        预留手机 / 邮箱
                      </label>
                      <input
                        type="text"
                        value={forgotContact}
                        onChange={(e) => setForgotContact(e.target.value)}
                        placeholder="请输入账号绑定的手机号或邮箱"
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        滑块验证码（固定展示，须先通过才可发送验证码）
                      </label>
                      <SliderCaptcha
                        verified={forgotSliderVerified}
                        onSuccess={() => setForgotSliderVerified(true)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        短信 / 邮件验证码
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotVerifyCodeInput}
                          onChange={(e) => setForgotVerifyCodeInput(e.target.value)}
                          placeholder="请输入收到的6位验证码"
                          className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!forgotSliderVerified || forgotCountdown > 0}
                          onClick={handleForgotSendCode}
                          className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {forgotCountdown > 0 ? `${forgotCountdown}秒后重发` : '发送验证码'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      下一步
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotStep2Reset} className="space-y-4">
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800 mb-0.5">
                        历史密码不可重复校验（指标2）：
                      </div>
                      <div>
                        当前及最近历史密码记录：
                        <span className="font-mono-num text-[#0369A1] ml-1">
                          {passwordHistory.join(' , ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label className="font-semibold text-slate-700">新密码 *</label>
                        {forgotPwdStrength.level !== 'empty' && (
                          <span
                            className={`font-bold ${
                              forgotPwdStrength.level === 'strong'
                                ? 'text-emerald-600'
                                : forgotPwdStrength.level === 'medium'
                                ? 'text-sky-600'
                                : 'text-red-600'
                            }`}
                          >
                            强度：{forgotPwdStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showForgotNewPwd ? 'text' : 'password'}
                          value={forgotNewPwd}
                          onChange={(e) => setForgotNewPwd(e.target.value)}
                          placeholder="请输入8-20位新密码（含字母和数字）"
                          className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showForgotNewPwd ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{forgotPwdStrength.message}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotNewPwd(passwordHistory[0] || 'Sec2026Pass');
                            setForgotConfirmPwd(passwordHistory[0] || 'Sec2026Pass');
                            setForgotCaptchaInput(forgotCaptchaCode);
                          }}
                          className="text-amber-700 hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          测试填入原密码
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        确认新密码 *
                      </label>
                      <input
                        type="password"
                        value={forgotConfirmPwd}
                        onChange={(e) => setForgotConfirmPwd(e.target.value)}
                        placeholder="请再次输入新密码"
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label className="font-semibold text-slate-700">图形验证码（固定展示）</label>
                        <button
                          type="button"
                          onClick={() => setForgotCaptchaInput(forgotCaptchaCode)}
                          className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                        >
                          一键填入({forgotCaptchaCode})
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          maxLength={4}
                          value={forgotCaptchaInput}
                          onChange={(e) => setForgotCaptchaInput(e.target.value)}
                          placeholder="请输入4位图形验证码"
                          className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num uppercase focus:outline-none"
                        />
                        <GraphicCaptcha
                          code={forgotCaptchaCode}
                          onRefresh={() => setForgotCaptchaCode(generateRandomCode())}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      确认重置
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 点击【登录】或【注册】后触发的图形验证码安全核验弹窗 */}
      {graphicCaptchaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {graphicCaptchaModal.mode === 'login'
                    ? '安全验证 — 请输入图形验证码完成登录'
                    : '安全验证 — 请输入图形验证码完成注册'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGraphicCaptchaModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGraphicCaptchaConfirm} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                请识别右侧图形中的 4 位字符并填入下方输入框（不区分大小写，点击图片可刷新验证码）：
              </p>

              {graphicCaptchaModal.error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{graphicCaptchaModal.error}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-semibold text-slate-700">图形验证码</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (graphicCaptchaModal.mode === 'login') {
                        setLoginCaptchaInput(loginCaptchaCode);
                      } else {
                        setRegCaptchaInput(regCaptchaCode);
                      }
                      setGraphicCaptchaModal({ ...graphicCaptchaModal, error: null });
                    }}
                    className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                  >
                    一键填入当前验证码(
                    {graphicCaptchaModal.mode === 'login' ? loginCaptchaCode : regCaptchaCode})
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    autoFocus
                    maxLength={4}
                    value={graphicCaptchaModal.mode === 'login' ? loginCaptchaInput : regCaptchaInput}
                    onChange={(e) => {
                      if (graphicCaptchaModal.mode === 'login') {
                        setLoginCaptchaInput(e.target.value);
                      } else {
                        setRegCaptchaInput(e.target.value);
                      }
                      if (graphicCaptchaModal.error) {
                        setGraphicCaptchaModal({ ...graphicCaptchaModal, error: null });
                      }
                    }}
                    placeholder="请输入4位图形验证码"
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num uppercase focus:outline-none"
                  />
                  <GraphicCaptcha
                    code={graphicCaptchaModal.mode === 'login' ? loginCaptchaCode : regCaptchaCode}
                    onRefresh={() => {
                      if (graphicCaptchaModal.mode === 'login') {
                        setLoginCaptchaCode(generateRandomCode());
                        setLoginCaptchaInput('');
                      } else {
                        setRegCaptchaCode(generateRandomCode());
                        setRegCaptchaInput('');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGraphicCaptchaModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {graphicCaptchaModal.mode === 'login' ? '确认并登录' : '确认并完成注册'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 防刷滑块弹窗 */}
      {sliderModalConfig && sliderModalConfig.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="text-sm font-bold">{sliderModalConfig.title}</span>
              <button
                type="button"
                onClick={() => setSliderModalConfig(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                为防止自动化脚本恶意刷取短信/邮件通道，请先拖动下方滑块完成人机核验，验证通过后将立即下发 6 位验证码。
              </p>
              <SliderCaptcha
                verified={false}
                onSuccess={() => {
                  setTimeout(() => {
                    sliderModalConfig.onVerifiedCallback();
                  }, 250);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 单点会话控制弹窗 */}
      {sessionConflictModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center gap-2">
              <Laptop className="w-5 h-5" />
              <span className="font-bold text-base">单点会话控制提醒（指标2）</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                您的账号已在其他设备（如：Windows-Chrome）登录，是否强制下线原设备？
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono-num">
                <div>当前在线设备：{sessionConflictModal.deviceInfo}</div>
                <div>活跃会话 IP：{sessionConflictModal.ipInfo}</div>
                <div>会话建立时间：2026-10-28 09:42:18</div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddAuditLog({
                      operator: sessionConflictModal.pendingUser.username,
                      ip: sessionConflictModal.pendingUser.currentLoginIp,
                      location: sessionConflictModal.pendingUser.currentLoginLocation,
                      device: 'Windows 11 / Chrome 130.0',
                      action: '单点会话冲突-用户取消登录',
                      result: '失败',
                      detail: '检测到其他设备活跃会话，用户选择保留原设备并取消本次登录。',
                    });
                    setSessionConflictModal(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消本次登录
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = sessionConflictModal.pendingUser;
                    onAddAuditLog({
                      operator: u.username,
                      ip: u.currentLoginIp,
                      location: u.currentLoginLocation,
                      device: 'Windows 11 / Chrome 130.0',
                      action: '单点会话控制-强制下线原设备并登录',
                      result: '成功',
                      detail: `已销毁原设备(${sessionConflictModal.deviceInfo})会话Token，完成新会话建立。`,
                    });
                    setSessionConflictModal(null);
                    onLoginSuccess(u, 'home', { abnormalLocationAlert: simulateAbnormalLocation });
                  }}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  强制下线原设备并登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 协议弹窗（区分《用户服务协议》与《隐私政策》对应内容） */}
      {agreementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {agreementModal === 'service'
                  ? '“XX杯”网数智安全大赛平台《用户服务协议》'
                  : '“XX杯”网数智安全大赛平台《隐私政策》'}
              </span>
              <button
                type="button"
                onClick={() => setAgreementModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {agreementModal === 'service' ? (
              <div className="p-6 text-xs text-slate-600 space-y-3 leading-relaxed max-h-[65vh] overflow-y-auto">
                <p className="font-bold text-slate-900">第一条 服务总则与适用范围</p>
                <p>
                  本协议由注册及登录用户与“XX杯”全国网数智安全大赛组委会共同缔结。用户在使用本平台提供的赛事报名、团队组建、线上靶场演练及证书核验服务前，应仔细阅读并遵守本协议全部条款。
                </p>
                <p className="font-bold text-slate-900">第二条 实名与学籍/教职工合规要求</p>
                <p>
                  参赛用户注册账号后，在参与具体赛道组队及靶场演练前，须按照大赛章程完成真实姓名与教育部学籍在线验证（或指导教师工号核验），严禁冒用他人身份信息参赛。
                </p>
                <p className="font-bold text-slate-900">第三条 账号安全与禁止作弊行为</p>
                <p>
                  用户应妥善保管账号及密码，不得将账号出借他人、跨队共享 Flag 或对大赛平台基础设施实施非授权DDoS攻击。平台依据国家网络安全等级保护三级规范，全程记录登录IP、设备指纹及攻防审计日志。
                </p>
                <p className="font-bold text-slate-900">第四条 赛事成果与知识产权说明</p>
                <p>
                  参赛战队在比赛过程中提交的 WriteUp 解题报告、防御加固补丁与创新算法模型，其署名权归参赛团队所有，大赛组委会享有用于赛事评审、防作弊复核及优秀成果汇编展示的权利。
                </p>
              </div>
            ) : (
              <div className="p-6 text-xs text-slate-600 space-y-3 leading-relaxed max-h-[65vh] overflow-y-auto">
                <p className="font-bold text-slate-900">第一条 个人信息的收集范围与目的</p>
                <p>
                  为完成赛事报名资格审核、组队邀请通知下发及防伪电子证书签发，平台将根据最小必要原则收集您的用户名、手机号码、电子邮箱、真实姓名、所属高等院校及学号/教工号信息。
                </p>
                <p className="font-bold text-slate-900">第二条 信息存储与国密加密保护</p>
                <p>
                  平台严格遵循《中华人民共和国个人信息保护法》与网络安全等级保护 2.0 三级规范，对用户身份证号、手机号、邮箱及口令采用国密 SM3/SM4 算法加密存储，前端界面默认执行隐私脱敏展示。
                </p>
                <p className="font-bold text-slate-900">第三条 信息使用与第三方披露限制</p>
                <p>
                  您的个人信息仅用于“XX杯”网数智安全大赛赛事组织、教育部学籍接口核验及获奖公示。未经您本人明确授权，平台绝不向任何无关第三方机构或个人出售、出租或共享您的数据。
                </p>
                <p className="font-bold text-slate-900">第四条 用户权利与安全审计保障</p>
                <p>
                  您可随时在“个人中心”查阅、更正绑定手机与邮箱信息。系统对所有涉及个人敏感数据的核验与访问均留存不可篡改的安全审计日志，全方位保障您的个人隐私权益。
                </p>
              </div>
            )}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAgreementModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg cursor-pointer"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeMainTab === 'register') {
                    setRegAgreeTerms(true);
                    if (regErrorMsg === '请先同意服务协议') {
                      setRegErrorMsg(null);
                      setTopRedAlertMsg(null);
                    }
                  }
                  setAgreementModal(null);
                }}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                我已阅读并同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 安全审计与操作日志抽屉 */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>安全审计与操作日志（指标20）</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  后端静默记录：操作人、IP、时间、设备、行为、结果（成功/失败/锁定/风控拦截）
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditDrawer(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        log.result === '成功'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.result === '锁定'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      结果：{log.result}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 font-mono-num">
                    <div>操作人：{log.operator}</div>
                    <div>
                      IP：{log.ip} ({log.location})
                    </div>
                    <div>时间：{log.time}</div>
                    <div className="col-span-2">设备：{log.device}</div>
                  </div>
                  <div className="text-slate-600 pt-1 border-t border-slate-200/70">
                    详情：{log.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 独立全屏页面：个人中心（【个人信息】 + 【用户认证】双卡片状态机）
// ============================================================================
export const StandaloneUserCenterPage: React.FC<{
  user: UserProfileData;
  initialTab?: 'profile' | 'certification' | 'registrations' | 'competitions';
  onUpdateUser: (updated: UserProfileData) => void;
  onBackHome: () => void;
  onLogout: () => void;
  registrations: RegistrationSubmission[];
  captainTeams: CaptainTeamRecord[];
  onUpdateCaptainTeams: (next: CaptainTeamRecord[]) => void;
  participatedTeams: ParticipatedTeamRecord[];
  onUpdateParticipatedTeams: (next: ParticipatedTeamRecord[]) => void;
  onContinueEditDraft: (team: CaptainTeamRecord) => void;
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
  enabledSchools?: string[];
  competitions?: CompetitionCatalogItem[];
  platformUsers?: PlatformDirectoryUser[];
  registrationConfigs?: EventRegistrationConfig[];
  onViewCompetitionDetail?: (competitionId: string) => void;
}> = ({
  user,
  initialTab = 'profile',
  onUpdateUser,
  onBackHome,
  onLogout,
  captainTeams,
  onUpdateCaptainTeams,
  participatedTeams,
  onUpdateParticipatedTeams,
  onContinueEditDraft,
  onAddAuditLog,
  enabledSchools,
  competitions = [],
  platformUsers,
  registrationConfigs,
  onViewCompetitionDetail,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'certification' | 'registrations' | 'competitions'
  >(initialTab);
  const [snapshotDrawerItem, setSnapshotDrawerItem] = useState<{
    competitionTitle: string;
    myRole: '队长' | '队员' | '指导教师';
    snapshot: TeamApprovedSnapshot;
  } | null>(null);

  // 只拉取当前用户参与，且整体报名状态为【报名成功】的赛事记录
  const myApprovedCompetitions = React.useMemo(() => {
    const currentName = (user.name || '').trim();
    const list: {
      id: string;
      competitionId: string;
      competitionTitle: string;
      startDate: string;
      endDate: string;
      subTrackName: string;
      statusKey: 'upcoming' | 'ongoing' | 'ended';
      statusLabel: '未开始' | '进行中' | '已结束';
      teamName: string;
      myRole: '队长' | '队员' | '指导教师';
      snapshot: TeamApprovedSnapshot;
    }[] = [];

    // 1. 从 captainTeams 中拉取当前用户参与（作为队长、已同意队员或已同意指导教师）且整体状态为【报名成功】的队伍
    captainTeams.forEach((team) => {
      const stages = resolveTeamAuditStages(team);
      if (stages.regStatusKey !== 'approved') return;

      const isCaptain = isTeamOwnedByUser(team, user);
      const isMember =
        Boolean(currentName) &&
        team.members.some(
          (m) =>
            m.confirmStatus === 'accepted' &&
            (m.name.includes(currentName) || (user.phone && m.phone === user.phone))
        );
      const isAdvisor =
        Boolean(currentName) &&
        team.advisors.some(
          (a) =>
            a.confirmStatus === 'accepted' &&
            (a.name.includes(currentName) || (user.phone && a.phone === user.phone))
        );

      if (!isCaptain && !isMember && !isAdvisor) return;

      const myRole: '队长' | '队员' | '指导教师' = isCaptain
        ? '队长'
        : isAdvisor
        ? '指导教师'
        : '队员';
      const comp = competitions.find((c) => c.id === team.competitionId);
      const statusKey = comp ? computeCompetitionStatus(comp.startDate, comp.endDate) : 'ongoing';
      const statusLabel = getCompetitionStatusLabel(statusKey);
      const snapshot =
        team.approvedSnapshot || buildApprovedSnapshotFromCaptainTeam(team);

      list.push({
        id: `my-comp-cap-${team.id}`,
        competitionId: team.competitionId,
        competitionTitle: comp?.title || team.competitionTitle,
        startDate: comp?.startDate || '2026-06-01',
        endDate: comp?.endDate || '2026-11-25',
        subTrackName: snapshot.subTrackName,
        statusKey,
        statusLabel,
        teamName: snapshot.teamName,
        myRole,
        snapshot,
      });
    });

    // 2. 从 participatedTeams 中拉取状态为 team_approved（报名成功）且属于当前用户的记录
    const isLinDemoAccount =
      user.username === 'linyuanhang' ||
      user.name === '林远航' ||
      user.phone === '13810246921';
    if (isLinDemoAccount) {
      participatedTeams.forEach((pt) => {
        if (pt.status !== 'team_approved') return;
        const comp = competitions.find((c) => c.id === pt.competitionId);
        const statusKey = comp ? computeCompetitionStatus(comp.startDate, comp.endDate) : 'ended';
        const statusLabel = getCompetitionStatusLabel(statusKey);
        const myRole: '队长' | '队员' | '指导教师' =
          pt.myRoleInTeam === '指导教师' ? '指导教师' : '队员';

        const fallbackSnapshot: TeamApprovedSnapshot = pt.approvedSnapshot || {
          teamName: pt.teamName,
          subTrackName: pt.subTrackName,
          university: pt.university,
          captainName: pt.captainName,
          approvedAt: pt.invitedAt,
          members: pt.teammatesSummary.map((raw) => {
            const role: '队长' | '队员' | '指导教师' = raw.includes('队长')
              ? '队长'
              : raw.includes('指导教师')
              ? '指导教师'
              : '队员';
            const name = raw.replace(/（.*?）/g, '').trim();
            return {
              name,
              role,
              university: pt.university,
            };
          }),
        };

        list.push({
          id: `my-comp-part-${pt.id}`,
          competitionId: pt.competitionId,
          competitionTitle: comp?.title || pt.competitionTitle,
          startDate: comp?.startDate || '2025-10-01',
          endDate: comp?.endDate || '2025-12-20',
          subTrackName: fallbackSnapshot.subTrackName,
          statusKey,
          statusLabel,
          teamName: fallbackSnapshot.teamName,
          myRole,
          snapshot: fallbackSnapshot,
        });
      });
    }

    return list;
  }, [captainTeams, participatedTeams, competitions, user]);

  // --------------------------------------------------------------------------
  // 1、【个人信息】修改/绑定弹窗状态（用户名、手机号、邮箱）
  // --------------------------------------------------------------------------
  const [editFieldModal, setEditFieldModal] = useState<{
    type: 'username' | 'phone' | 'email';
    mode: 'bind' | 'modify';
  } | null>(null);
  const [fieldInputValue, setFieldInputValue] = useState('');
  const [fieldSmsCode, setFieldSmsCode] = useState('628190');
  const [fieldCountdown, setFieldCountdown] = useState(0);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (fieldCountdown <= 0) return;
    const t = setInterval(() => setFieldCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [fieldCountdown]);

  const handleOpenEditModal = (
    type: 'username' | 'phone' | 'email',
    mode: 'bind' | 'modify'
  ) => {
    setFieldError(null);
    if (type === 'username') {
      setFieldInputValue(user.username);
    } else if (type === 'phone') {
      setFieldInputValue(mode === 'modify' ? user.phone.replace(/\*/g, '1') : '13810246921');
    } else {
      setFieldInputValue(mode === 'modify' ? user.email : 'linyuanhang@buaa.edu.cn');
    }
    setFieldSmsCode('628190');
    setEditFieldModal({ type, mode });
  };

  const handleSaveFieldModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFieldModal) return;
    const val = fieldInputValue.trim();

    if (editFieldModal.type === 'username') {
      if (!/^[a-zA-Z0-9]{4,20}$/.test(val)) {
        setFieldError('用户名须为 4-20 位英文字母或数字');
        return;
      }
      onUpdateUser({ ...user, username: val });
      onAddAuditLog({
        operator: val,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: '修改个人用户名',
        result: '成功',
        detail: `用户名由 ${user.username} 更新为 ${val}`,
      });
    } else if (editFieldModal.type === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(val)) {
        setFieldError('请输入有效的 11 位手机号码');
        return;
      }
      if (!fieldSmsCode.trim()) {
        setFieldError('请输入6位短信验证码');
        return;
      }
      onUpdateUser({ ...user, phone: val });
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: editFieldModal.mode === 'bind' ? '绑定手机号码' : '修改手机号码',
        result: '成功',
        detail: `已绑定手机号 ${maskPhone(val)}`,
      });
    } else if (editFieldModal.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setFieldError('请输入有效的电子邮箱地址');
        return;
      }
      if (!fieldSmsCode.trim()) {
        setFieldError('请输入6位邮件验证码');
        return;
      }
      onUpdateUser({ ...user, email: val });
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: editFieldModal.mode === 'bind' ? '绑定电子邮箱' : '修改电子邮箱',
        result: '成功',
        detail: `已绑定邮箱 ${val}`,
      });
    }

    setEditFieldModal(null);
  };

  // --------------------------------------------------------------------------
  // 2、【用户认证】模块一：实名认证 状态与弹窗流
  // --------------------------------------------------------------------------
  // 弹窗类型：'unbound-phone' | 'sms-verify' | 'realname-form' | null
  const [realNameModalStep, setRealNameModalStep] = useState<
    'unbound-phone' | 'sms-verify' | 'realname-form' | null
  >(null);

  const [rnSmsCode, setRnSmsCode] = useState('839201');
  const [rnSmsCountdown, setRnSmsCountdown] = useState(0);
  const [rnSmsError, setRnSmsError] = useState<string | null>(null);

  useEffect(() => {
    if (rnSmsCountdown <= 0) return;
    const t = setInterval(() => setRnSmsCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [rnSmsCountdown]);

  const [rnNameInput, setRnNameInput] = useState(user.name || '张三');
  const [rnIdCardInput, setRnIdCardInput] = useState('110108200305162819');
  const [rnPromiseChecked, setRnPromiseChecked] = useState(false);
  const [rnSubmitting, setRnSubmitting] = useState(false);
  const [rnFormError, setRnFormError] = useState<string | null>(null);
  // 用于演示公安接口返回“成功”或“姓名与身份证号不匹配”
  const [rnSimulateMismatch, setRnSimulateMismatch] = useState(false);

  // 点击实名认证【去验证】
  const handleStartRealNameVerify = () => {
    if (user.realNameLockedUntil) {
      return;
    }
    // 检测当前账号是否已绑定手机号
    if (!user.phone || !user.phone.trim()) {
      setRealNameModalStep('unbound-phone');
      return;
    }
    setRnSmsError(null);
    setRnSmsCode('839201');
    setRealNameModalStep('sms-verify');
  };

  // 短信校验下一步 -> 弹出实名信息填写弹窗
  const handleRnSmsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (rnSmsCode.trim().length !== 6) {
      setRnSmsError('请输入6位短信验证码');
      return;
    }
    setRnFormError(null);
    setRealNameModalStep('realname-form');
  };

  // 提交实名信息 -> Loading 1.5秒 -> 调用公安接口返回结果
  const handleRnFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRnFormError(null);

    if (!rnNameInput.trim()) {
      setRnFormError('请输入真实姓名');
      return;
    }
    if (!/^\d{17}[\dXx]$/.test(rnIdCardInput.trim())) {
      setRnFormError('请输入有效的18位居民身份证号码');
      return;
    }
    if (!rnPromiseChecked) {
      setRnFormError('请勾选底部“本人承诺所填信息真实有效”');
      return;
    }

    setRnSubmitting(true);
    setTimeout(() => {
      setRnSubmitting(false);
      // 若模拟不匹配 或 输入姓名包含“错”/“不匹配”
      if (rnSimulateMismatch || rnNameInput.includes('不匹配')) {
        const nextFailCount = (user.realNameFailCount || 0) + 1;
        const isLocked = nextFailCount >= 3;
        const updatedUser: UserProfileData = {
          ...user,
          realNameStatus: 'failed',
          realNameFailCount: nextFailCount,
          realNameLockedUntil: isLocked ? '2026-10-29 10:00:00（锁定24小时）' : null,
        };
        onUpdateUser(updatedUser);
        onAddAuditLog({
          operator: user.username,
          ip: user.currentLoginIp,
          location: user.currentLoginLocation,
          device: 'Windows 11 / Chrome 130.0',
          action: `公安实名认证核验失败(第${nextFailCount}次)`,
          result: isLocked ? '锁定' : '失败',
          detail: isLocked
            ? '连续3次实名验证失败，防止恶意穷举身份证号，已锁定24小时后再试'
            : '公安接口返回：姓名与身份证号不匹配',
        });

        if (isLocked) {
          setRnFormError(
            '姓名与身份证号不匹配！您已连续错误达 3 次，为防止恶意穷举他人身份证号，实名认证功能已锁定 24 小时后再试。'
          );
        } else {
          setRnFormError(
            `姓名与身份证号不匹配，请检查后重试（当前已连续失败 ${nextFailCount}/3 次，连续错3次将锁定24小时）`
          );
        }
        return;
      }

      // 验证成功
      const nowTime = '2026-10-28 10:00:00';
      const updatedUser: UserProfileData = {
        ...user,
        name: rnNameInput.trim(),
        realNameStatus: 'verified',
        realNameVerifiedAt: nowTime,
        realNameFailCount: 0,
        realNameLockedUntil: null,
        isVerified: user.academicStatus === 'verified',
      };
      onUpdateUser(updatedUser);
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: '公安接口实名认证通过',
        result: '成功',
        detail: `真实姓名：${updatedUser.name}，实名核验通过，已解锁【学籍/教师认证】模块`,
      });
      setRealNameModalStep(null);
    }, 1400);
  };

  // --------------------------------------------------------------------------
  // 3、【用户认证】模块二：学籍/教师认证 状态与弹窗流
  // --------------------------------------------------------------------------
  const [selectedIdentityRadio, setSelectedIdentityRadio] = useState<'student' | 'teacher'>(
    user.identityType || 'student'
  );
  const [academicModalOpen, setAcademicModalOpen] = useState<'student' | 'teacher' | null>(null);

  // 学生认证表单状态
  const [stuSchool, setStuSchool] = useState(user.university || '');
  const [stuMajor, setStuMajor] = useState(user.majorOrDept || '');
  const [stuSubmitting, setStuSubmitting] = useState(false);
  const [stuAutoFailed, setStuAutoFailed] = useState(false);
  const [stuSimulateAutoFail, setStuSimulateAutoFail] = useState(false);
  const [stuManualExpanded, setStuManualExpanded] = useState(false);
  const [stuManualFileName, setStuManualFileName] = useState('');
  const [stuFormError, setStuFormError] = useState<string | null>(null);

  // 教师认证表单状态
  const [teaSchool, setTeaSchool] = useState(user.university || '');
  const [teaDept, setTeaDept] = useState(user.majorOrDept || '');
  const [teaStaffId, setTeaStaffId] = useState(user.studentId || '');
  const [teaFileName, setTeaFileName] = useState('');
  const [teaFormError, setTeaFormError] = useState<string | null>(null);
  const [adminNotificationBanner, setAdminNotificationBanner] = useState<string | null>(null);

  // 点击模块二【去验证】或【重新验证】
  const handleOpenAcademicModal = () => {
    if (user.realNameStatus !== 'verified') return;
    setStuFormError(null);
    setTeaFormError(null);
    setStuAutoFailed(false);
    setStuManualExpanded(false);
    if (selectedIdentityRadio === 'student') {
      setAcademicModalOpen('student');
    } else {
      setAcademicModalOpen('teacher');
    }
  };

  // 学生认证提交（自动核验接口）
  const handleStudentAutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStuFormError(null);
    if (!stuSchool) {
      setStuFormError('请先在学校搜索框中输入关键字，并从下拉列表中点选标准学校名称');
      return;
    }
    if (!stuMajor.trim()) {
      setStuFormError('请填写您所在的专业名称');
      return;
    }

    setStuSubmitting(true);
    setTimeout(() => {
      setStuSubmitting(false);
      if (stuSimulateAutoFail) {
        setStuAutoFailed(true);
        setStuFormError(
          '自动核验未通过：教育部学籍接口暂未匹配到您的在籍记录（常见于军校、科研院所或新生数据未同步）。请核对学校信息，或展开下方人工认证通道上传证明。'
        );
        return;
      }

      // 自动核验通过 -> 直接显示“认证成功”
      const updated: UserProfileData = {
        ...user,
        role: 'student',
        roleLabel: '参赛学生',
        identityType: 'student',
        university: stuSchool,
        majorOrDept: stuMajor.trim(),
        academicStatus: 'verified',
        academicVerifiedAt: '2026-10-28',
        academicRejectReason: undefined,
        isVerified: true,
      };
      onUpdateUser(updated);
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: '学生学籍自动核验通过',
        result: '成功',
        detail: `学校：${stuSchool}，专业：${stuMajor.trim()}`,
      });
      setAcademicModalOpen(null);
    }, 1200);
  };

  // 学生人工兜底通道提交（走高校管理员审核 -> 状态变为“审核中”）
  const handleStudentManualSubmit = () => {
    if (!stuSchool || !stuMajor.trim()) {
      setStuFormError('请先选择标准学校名称并填写专业');
      return;
    }
    if (!stuManualFileName) {
      setStuFormError('请上传学信网在线验证报告或学生证照片作为人工审核凭证');
      return;
    }
    const updated: UserProfileData = {
      ...user,
      role: 'student',
      roleLabel: '参赛学生',
      identityType: 'student',
      university: stuSchool,
      majorOrDept: stuMajor.trim(),
      academicStatus: 'pending',
      academicSubmittedAt: '2026-10-28 10:25:00',
      academicRejectReason: undefined,
      isVerified: false,
    };
    onUpdateUser(updated);
    setAdminNotificationBanner(
      `【系统通知】已根据您选择的学校（${stuSchool}），自动向【${stuSchool}高校管理员】发送学生学籍人工审核通知。`
    );
    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: '提交学生学籍人工兜底认证',
      result: '成功',
      detail: `已上传证明材料(${stuManualFileName})并推送至${stuSchool}高校管理员审核`,
    });
    setAcademicModalOpen(null);
  };

  // 教师认证表单提交（直接变为“审核中”，并通知该校高校管理员）
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeaFormError(null);
    if (!teaSchool) {
      setTeaFormError('请从院校库下拉列表中选中标准学校名称');
      return;
    }
    if (!teaDept.trim()) {
      setTeaFormError('请填写所属院系/部门（如：计算机科学与技术学院）');
      return;
    }
    if (!teaStaffId.trim()) {
      setTeaFormError('请填写教工号');
      return;
    }
    if (!teaFileName) {
      setTeaFormError('请上传教师资格证或学校工作证/工牌照片');
      return;
    }

    const updated: UserProfileData = {
      ...user,
      role: 'teacher',
      roleLabel: '指导教师',
      identityType: 'teacher',
      university: teaSchool,
      majorOrDept: teaDept.trim(),
      studentId: teaStaffId.trim(),
      academicStatus: 'pending',
      academicSubmittedAt: '2026-10-28 10:30:00',
      academicRejectReason: undefined,
      isVerified: false,
    };
    onUpdateUser(updated);
    setAdminNotificationBanner(
      `【系统通知】已根据您填写的学校（${teaSchool}），自动向【${teaSchool}高校管理员】发送指导教师资格待审核通知。`
    );
    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: '提交指导教师资格认证申请',
      result: '成功',
      detail: `学校：${teaSchool}，院系：${teaDept.trim()}，教工号：${teaStaffId.trim()}，状态已更新为【审核中】`,
    });
    setAcademicModalOpen(null);
  };

  // 判断学校与专业在【个人信息】中是否显示“未验证”
  const isAcademicVerified = user.academicStatus === 'verified';
  const isRealNameVerified = user.realNameStatus === 'verified';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* 顶部栏 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackHome}
              className="flex items-center gap-2 text-sm font-bold text-[#0284C7] hover:text-[#0369A1] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回大赛官网首页</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-base font-extrabold text-slate-900">
              个人中心 —{' '}
              {activeTab === 'profile'
                ? '个人信息'
                : activeTab === 'certification'
                ? '用户认证'
                : activeTab === 'registrations'
                ? '我的报名'
                : '我的竞赛'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">
              当前账号：<strong>{user.username}</strong>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 未完成实名与学籍/教师认证时：顶部黄色引导横幅 */}
      {(!isRealNameVerified || !isAcademicVerified) && (
        <div className="bg-amber-50 border-b border-amber-300">
          <div className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                欢迎您！为了顺利报名参赛，请尽快完成实名认证与学籍/教师认证。
              </span>
            </div>
            {activeTab !== 'certification' && (
              <button
                type="button"
                onClick={() => setActiveTab('certification')}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors self-start sm:self-auto"
              >
                前往【用户认证】 &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* 系统自动向高校管理员发送待审核通知提示条 */}
      {adminNotificationBanner && (
        <div className="bg-sky-900 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{adminNotificationBanner}</span>
          <button
            type="button"
            onClick={() => setAdminNotificationBanner(null)}
            className="text-sky-200 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 flex-1 w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* 左侧个人中心菜单 */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white text-lg font-extrabold flex items-center justify-center">
                {(user.name || user.username).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 truncate">
                  {isRealNameVerified && user.name ? user.name : user.username}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {isAcademicVerified && user.university ? user.university : '学籍/教师未验证'}
                </div>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
            {[
              { id: 'profile', label: '个人信息', icon: User },
              { id: 'certification', label: '用户认证', icon: BadgeCheck },
              {
                id: 'registrations',
                label: `我的报名 (${
                  captainTeams.filter((t) => isTeamOwnedByUser(t, user)).length
                })`,
                icon: FileText,
              },
              {
                id: 'competitions',
                label: `我的竞赛 (${myApprovedCompetitions.length})`,
                icon: Trophy,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#0284C7] text-white'
                      : 'text-slate-700 hover:bg-sky-50 hover:text-[#0284C7]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 右侧主体内容 */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* =================================================================
              Tab 1：个人信息（严格仅展示要求的 7 个字段，其他字段全部移除）
              1. 用户名（旁边显示修改按钮）
              2. 真实姓名
              3. 身份（参赛学生/指导教师）
              4. 学校（没验证过就显示未验证）
              5. 专业（没验证过就显示未验证）
              6. 手机（没绑定显示绑定按钮；绑定了显示中间四位变星号 + 修改按钮）
              7. 邮箱（没绑定显示绑定按钮；绑定了显示邮箱地址 + 修改按钮）
             ================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <h2 className="text-lg font-bold text-slate-900">个人信息</h2>
                {/* 便捷演示按钮：一键切换手机/邮箱绑定状态以测试未绑定拦截 */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        phone: user.phone ? '' : '13810246921',
                      })
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    {user.phone ? '演示：解绑手机号' : '演示：恢复手机号'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        email: user.email ? '' : 'linyuanhang@buaa.edu.cn',
                      })
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    {user.email ? '演示：解绑邮箱' : '演示：恢复邮箱'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 px-6">
                {/* 1. 用户名（旁边显示修改按钮） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">用户名</span>
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-sm font-bold text-slate-900 font-mono-num">
                      {user.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal('username', 'modify')}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>修改</span>
                    </button>
                  </div>
                </div>

                {/* 2. 真实姓名 */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">真实姓名</span>
                  <div className="flex-1">
                    {isRealNameVerified && user.name ? (
                      <span className="text-sm font-bold text-slate-900">{user.name}</span>
                    ) : (
                      <span className="text-sm text-slate-400">未验证</span>
                    )}
                  </div>
                </div>

                {/* 3. 身份（参赛学生/指导教师） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">身份</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-900">
                      {user.identityType === 'teacher' ? '指导教师' : '参赛学生'}
                    </span>
                  </div>
                </div>

                {/* 4. 学校（没验证过就显示未验证） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">学校</span>
                  <div className="flex-1">
                    {isAcademicVerified && user.university ? (
                      <span className="text-sm font-bold text-slate-900">{user.university}</span>
                    ) : (
                      <span className="text-sm text-slate-400">未验证</span>
                    )}
                  </div>
                </div>

                {/* 5. 专业（没验证过就显示未验证） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">专业</span>
                  <div className="flex-1">
                    {isAcademicVerified && user.majorOrDept ? (
                      <span className="text-sm font-bold text-slate-900">{user.majorOrDept}</span>
                    ) : (
                      <span className="text-sm text-slate-400">未验证</span>
                    )}
                  </div>
                </div>

                {/* 6. 手机（没绑定就显示绑定按钮，绑定了就显示手机号中间四位变星号，旁边显示修改按钮） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">手机</span>
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                    {user.phone && user.phone.trim() ? (
                      <>
                        <span className="text-sm font-bold text-slate-900 font-mono-num">
                          {maskPhone(user.phone)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal('phone', 'modify')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>修改</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal('phone', 'bind')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>绑定</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 7. 邮箱（没绑定就显示绑定按钮，绑定了就显示邮箱地址，旁边显示修改按钮） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">邮箱</span>
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                    {user.email && user.email.trim() ? (
                      <>
                        <span className="text-sm font-bold text-slate-900 font-mono-num">
                          {user.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal('email', 'modify')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>修改</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal('email', 'bind')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>绑定</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              Tab 2：用户认证（从上至下分为两个独立卡片区块：【实名认证】、【学籍/教师认证】）
             ================================================================= */}
          {activeTab === 'certification' && (
            <div className="space-y-6">
              {/* 顶部调试/状态快速预览切换条（方便评审者一键切换测试所有状态分支） */}
              <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>【用户认证】全状态分支演示切换台（可一键切换不同状态体验）</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        realNameStatus: 'unverified',
                        realNameFailCount: 0,
                        realNameLockedUntil: null,
                        academicStatus: 'unverified',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    重置为：全部未认证(置灰模块二)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        phone: '',
                        realNameStatus: 'unverified',
                        academicStatus: 'unverified',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/30 text-amber-100 cursor-pointer"
                  >
                    模拟：未绑手机点实名【去验证】
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        name: '张三',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        academicStatus: 'unverified',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-300/30 text-emerald-100 cursor-pointer"
                  >
                    模拟：实名成功(解锁模块二)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        name: '张三',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '计算机科学与技术学院',
                        academicStatus: 'pending',
                        academicSubmittedAt: '2026-10-28 10:30:00',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/30 text-amber-100 cursor-pointer"
                  >
                    模拟：教师认证【审核中】
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        name: '张三',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        identityType: 'student',
                        university: '北京大学',
                        majorOrDept: '计算机科学与技术学院',
                        academicStatus: 'verified',
                        academicVerifiedAt: '2026-10-28',
                        isVerified: true,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300/30 text-white cursor-pointer"
                  >
                    模拟：学籍【认证成功】
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        name: '张三',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '计算机科学与技术学院',
                        academicStatus: 'rejected',
                        academicRejectReason: '工作证照片模糊，请重新上传',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-red-500/25 hover:bg-red-500/40 border border-red-300/30 text-red-100 cursor-pointer"
                  >
                    模拟：管理员驳回【认证失败】
                  </button>
                </div>
              </div>

              {/* =============================================================
                  区块一：【实名认证】独立卡片
                 ============================================================= */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">实名认证</h3>
                  </div>

                  {/* 状态1：未认证 / 验证失败 时右侧显示【去验证】按钮；状态2：验证成功时按钮消失 */}
                  {user.realNameStatus !== 'verified' && (
                    <button
                      type="button"
                      disabled={Boolean(user.realNameLockedUntil)}
                      onClick={handleStartRealNameVerify}
                      className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      去验证
                    </button>
                  )}
                </div>

                <div className="pt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-24 shrink-0">认证状态：</span>
                    {user.realNameStatus === 'verified' ? (
                      <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>[ 验证成功 ]</span>
                      </span>
                    ) : user.realNameStatus === 'failed' ? (
                      <span className="font-bold text-red-600 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>[ 验证失败 ]</span>
                      </span>
                    ) : (
                      <span className="font-bold text-red-600">[ 未认证 ]</span>
                    )}
                  </div>

                  {/* 连续错3次锁定24小时提示 */}
                  {user.realNameLockedUntil && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                      <span>
                        由于连续 3 次实名认证失败，为防止恶意穷举他人身份证号，已锁定 24 小时后再试（解锁时间：
                        {user.realNameLockedUntil}）。
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateUser({
                            ...user,
                            realNameFailCount: 0,
                            realNameLockedUntil: null,
                          })
                        }
                        className="text-[#0284C7] font-bold underline ml-3 shrink-0 cursor-pointer"
                      >
                        演示解除锁定
                      </button>
                    </div>
                  )}

                  {/* 状态2：验证成功下方明细展示 */}
                  {user.realNameStatus === 'verified' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">真实姓名：</span>
                        <span className="font-bold text-slate-900">{user.name || '张三'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">验证时间：</span>
                        <span className="font-mono-num text-slate-700">
                          {user.realNameVerifiedAt || '2026-10-28 10:00:00'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* =============================================================
                  区块二：【学籍/教师认证】独立卡片
                  前置依赖：未完成实名认证时，卡片呈置灰状态，并提示“请先完成实名认证”；完成实名后解锁
                 ============================================================= */}
              <div
                className={`rounded-xl border transition-all p-6 relative ${
                  user.realNameStatus !== 'verified'
                    ? 'bg-slate-100 border-slate-200 opacity-65 select-none'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        user.realNameStatus !== 'verified'
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-sky-100 text-[#0284C7]'
                      }`}
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">学籍/教师认证</h3>
                    {user.realNameStatus !== 'verified' && (
                      <span className="ml-2 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>请先完成实名认证</span>
                      </span>
                    )}
                  </div>

                  {/* 操作按钮：未认证显示【去验证】；认证失败显示【重新验证】；审核中/认证成功按钮消失 */}
                  {user.realNameStatus === 'verified' &&
                    (user.academicStatus === 'unverified' || user.academicStatus === 'rejected') && (
                      <button
                        type="button"
                        onClick={handleOpenAcademicModal}
                        className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        {user.academicStatus === 'rejected' ? '重新验证' : '去验证'}
                      </button>
                    )}
                </div>

                {/* 卡片内容区 */}
                <div
                  className={`pt-5 space-y-4 text-sm ${
                    user.realNameStatus !== 'verified' ? 'pointer-events-none' : ''
                  }`}
                >
                  {/* 状态1：未认证 */}
                  {user.academicStatus === 'unverified' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">我的身份：</span>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentity"
                              checked={selectedIdentityRadio === 'student'}
                              onChange={() => setSelectedIdentityRadio('student')}
                              className="text-[#0284C7] focus:ring-[#0284C7]"
                            />
                            <span>参赛学生</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentity"
                              checked={selectedIdentityRadio === 'teacher'}
                              onChange={() => setSelectedIdentityRadio('teacher')}
                              className="text-[#0284C7] focus:ring-[#0284C7]"
                            />
                            <span>指导教师</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">认证状态：</span>
                        <span className="font-bold text-slate-500">[ 未认证 ]</span>
                      </div>
                    </>
                  )}

                  {/* 状态2A：审核中（仅教师 / 人工兜底学生） */}
                  {user.academicStatus === 'pending' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">我的身份：</span>
                        <span className="font-bold text-slate-900">
                          {user.identityType === 'teacher' ? '指导教师' : '参赛学生'}（学校：
                          {user.university || '北京大学'}）
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">认证状态：</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>[ 审核中 ]</span>
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 bg-amber-50/70 p-4 rounded-lg border border-amber-200/80">
                        <div className="font-mono-num text-slate-500">
                          提交时间：{user.academicSubmittedAt || '2026-10-28 10:30:00'}
                        </div>
                        <p className="text-amber-900 font-semibold text-sm">
                          您的认证信息已提交至{user.university || '北京大学'}管理员，请耐心等待审核。
                        </p>
                      </div>
                    </>
                  )}

                  {/* 状态2B：认证成功 */}
                  {user.academicStatus === 'verified' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">我的身份：</span>
                        <span className="font-bold text-slate-900">
                          {user.identityType === 'teacher' ? '指导教师' : '参赛学生'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">认证状态：</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>[ 认证成功 ]</span>
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 w-24 shrink-0">学校：</span>
                          <span className="font-bold text-slate-900">
                            {user.university || '北京大学'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 w-24 shrink-0">专业/院系：</span>
                          <span className="font-bold text-slate-900">
                            {user.majorOrDept || '计算机科学与技术学院'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 w-24 shrink-0">认证时间：</span>
                          <span className="font-mono-num text-slate-700">
                            {user.academicVerifiedAt || '2026-10-28'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 状态2C：认证失败（管理员驳回） */}
                  {user.academicStatus === 'rejected' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">我的身份：</span>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentityRe"
                              checked={selectedIdentityRadio === 'student'}
                              onChange={() => setSelectedIdentityRadio('student')}
                              className="text-[#0284C7]"
                            />
                            <span>参赛学生</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentityRe"
                              checked={selectedIdentityRadio === 'teacher'}
                              onChange={() => setSelectedIdentityRadio('teacher')}
                              className="text-[#0284C7]"
                            />
                            <span>指导教师</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">认证状态：</span>
                        <span className="font-bold text-red-600 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>[ 认证失败 ]</span>
                        </span>
                      </div>

                      <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                        <span className="font-bold">驳回原因：</span>
                        <span>{user.academicRejectReason || '工作证照片模糊，请重新上传'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3：我的报名（四页面完整闭环：我发起的[队长视角] / 我参与的[队员与指导教师视角]） */}
          {activeTab === 'registrations' && (
            <MyRegistrationsClosedLoopModule
              currentUser={user}
              captainTeams={captainTeams}
              onUpdateCaptainTeams={onUpdateCaptainTeams}
              participatedTeams={participatedTeams}
              onUpdateParticipatedTeams={onUpdateParticipatedTeams}
              platformUsers={platformUsers}
              competitions={competitions}
              registrationConfigs={registrationConfigs}
              onContinueEditDraft={onContinueEditDraft}
              onJumpToCertification={() => setActiveTab('certification')}
            />
          )}

          {/* Tab 4：我的竞赛（仅展示当前用户参与，且整体报名状态为【报名成功】的赛事记录） */}
          {activeTab === 'competitions' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">我的竞赛</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    仅展示您已参与且整体报名状态为【报名成功】的赛事记录；点击【查看队伍详情】可查看报名成功时的固化快照信息。
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-bold text-[#0284C7] self-start sm:self-auto">
                  共 {myApprovedCompetitions.length} 项已报名成功竞赛
                </span>
              </div>

              {myApprovedCompetitions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  暂无整体报名状态为【报名成功】的赛事记录。请先在【我的报名】中完成队伍组建并等待高校审核与秘书处审核通过。
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                        <th className="py-3.5 px-4 min-w-[220px]">赛事名称</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">起止时间</th>
                        <th className="py-3.5 px-4 min-w-[180px]">所选赛道</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">赛事状态</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">参赛队伍名称</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">我的身份</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs sm:text-sm bg-white">
                      {myApprovedCompetitions.map((item) => (
                        <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                          {/* 1. 赛事名称 */}
                          <td className="py-4 px-4 align-middle">
                            <div className="font-bold text-slate-900 line-clamp-2">
                              {item.competitionTitle}
                            </div>
                          </td>

                          {/* 2. 起止时间 */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap font-mono-num text-xs text-slate-600">
                            <div>{item.startDate}</div>
                            <div className="text-slate-400">至 {item.endDate}</div>
                          </td>

                          {/* 3. 所选赛道 */}
                          <td className="py-4 px-4 align-middle">
                            <span className="text-xs font-semibold text-slate-700">
                              {item.subTrackName}
                            </span>
                          </td>

                          {/* 4. 赛事状态（未开始/进行中/已结束） */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            {item.statusKey === 'ongoing' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{item.statusLabel}</span>
                              </span>
                            )}
                            {item.statusKey === 'upcoming' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{item.statusLabel}</span>
                              </span>
                            )}
                            {item.statusKey === 'ended' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{item.statusLabel}</span>
                              </span>
                            )}
                          </td>

                          {/* 5. 参赛队伍名称 */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap font-extrabold text-slate-900">
                            {item.teamName}
                          </td>

                          {/* 6. 我的身份（队长/队员/指导教师） */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${
                                item.myRole === '队长'
                                  ? 'bg-sky-50 text-[#0284C7] border-sky-200'
                                  : item.myRole === '指导教师'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {item.myRole}
                            </span>
                          </td>

                          {/* 7. 交互操作：【查看赛事详情】、【查看队伍详情】 */}
                          <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onViewCompetitionDetail &&
                                  onViewCompetitionDetail(item.competitionId)
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer transition-colors"
                              >
                                查看赛事详情
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setSnapshotDrawerItem({
                                    competitionTitle: item.competitionTitle,
                                    myRole: item.myRole,
                                    snapshot: item.snapshot,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                              >
                                查看队伍详情
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          抽屉/弹窗：【我的竞赛 -> 查看队伍详情】（只读展示报名成功时的基本信息快照）
         ===================================================================== */}
      {snapshotDrawerItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* 抽屉顶部栏 */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between sticky top-0 z-10">
                <div>
                  <div className="text-[11px] text-sky-100 font-semibold">
                    报名成功固化快照 · 只读详情
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    查看队伍详情（{snapshotDrawerItem.snapshot.teamName}）
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSnapshotDrawerItem(null)}
                  className="text-white/80 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 space-y-5">
                {/* 快照说明提示 */}
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">报名成功快照保护说明：</span>
                    此处只读展示该队伍在<strong>【报名成功】</strong>时刻固化的基本信息（队伍名、赛道、成员列表），不受后续管理员后台特权修改影响。
                  </div>
                </div>

                {/* 基本信息卡片 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">参赛赛事</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {snapshotDrawerItem.competitionTitle}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
                    <div>
                      <span className="text-slate-400 block mb-0.5">队伍名称（快照）</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {snapshotDrawerItem.snapshot.teamName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">我的参赛身份</span>
                      <span className="font-bold text-[#0284C7]">
                        {snapshotDrawerItem.myRole}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5">所选赛道（快照）</span>
                      <span className="font-bold text-slate-800">
                        {snapshotDrawerItem.snapshot.subTrackName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">所属院校</span>
                      <span className="font-semibold text-slate-800">
                        {snapshotDrawerItem.snapshot.university}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">快照生成时间</span>
                      <span className="font-mono-num text-slate-600">
                        {snapshotDrawerItem.snapshot.approvedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 成员列表（只读） */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#0284C7]" />
                      <span>队伍成员列表（共 {snapshotDrawerItem.snapshot.members.length} 人）</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">只读快照</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <th className="py-2.5 px-3.5">姓名</th>
                          <th className="py-2.5 px-3.5">队伍身份</th>
                          <th className="py-2.5 px-3.5">所属院校</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {snapshotDrawerItem.snapshot.members.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3.5 font-bold text-slate-900">
                              {m.name}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  m.role === '队长'
                                    ? 'bg-sky-50 text-[#0284C7] border-sky-200'
                                    : m.role === '指导教师'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {m.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600">{m.university}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end sticky bottom-0">
              <button
                type="button"
                onClick={() => setSnapshotDrawerItem(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                关闭抽屉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 A：【个人信息】修改用户名 / 绑定或修改手机 / 绑定或修改邮箱
         ===================================================================== */}
      {editFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">
                {editFieldModal.type === 'username'
                  ? '修改用户名'
                  : editFieldModal.type === 'phone'
                  ? editFieldModal.mode === 'bind'
                    ? '绑定手机号码'
                    : '修改手机号码'
                  : editFieldModal.mode === 'bind'
                  ? '绑定电子邮箱'
                  : '修改电子邮箱'}
              </span>
              <button
                type="button"
                onClick={() => setEditFieldModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFieldModal} className="p-6 space-y-4">
              {fieldError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {fieldError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {editFieldModal.type === 'username'
                    ? '新用户名（4-20位字母或数字）'
                    : editFieldModal.type === 'phone'
                    ? '手机号码（11位）'
                    : '电子邮箱地址'}
                </label>
                <input
                  type="text"
                  required
                  value={fieldInputValue}
                  onChange={(e) => setFieldInputValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                />
              </div>

              {editFieldModal.type !== 'username' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {editFieldModal.type === 'phone' ? '短信验证码' : '邮件验证码'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={fieldSmsCode}
                      onChange={(e) => setFieldSmsCode(e.target.value)}
                      placeholder="请输入6位验证码"
                      className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={fieldCountdown > 0}
                      onClick={() => {
                        setFieldCountdown(60);
                        setFieldSmsCode('829104');
                      }}
                      className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {fieldCountdown > 0 ? `${fieldCountdown}秒后重发` : '获取验证码'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditFieldModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 B1：实名认证 — 未绑定手机号提示弹窗
         ===================================================================== */}
      {realNameModalStep === 'unbound-phone' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <span className="font-bold text-base">需要绑定手机号</span>
              <button
                type="button"
                onClick={() => setRealNameModalStep(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                您尚未绑定手机号，请先前往【个人信息】完成绑定
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRealNameModalStep(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRealNameModalStep(null);
                    setActiveTab('profile');
                    handleOpenEditModal('phone', 'bind');
                  }}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  去绑定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 B2：实名认证 — 第一步：已绑定手机号原地弹出短信验证码弹窗
         ===================================================================== */}
      {realNameModalStep === 'sms-verify' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">实名认证 — 手机短信核验</span>
              <button
                type="button"
                onClick={() => setRealNameModalStep(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRnSmsNext} className="p-6 space-y-4">
              {rnSmsError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {rnSmsError}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span>已绑定手机号：</span>
                <strong className="font-mono-num text-sm text-slate-900 ml-1">
                  {maskPhone(user.phone)}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  短信验证码（6位）
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={rnSmsCode}
                    onChange={(e) => setRnSmsCode(e.target.value)}
                    placeholder="请输入6位验证码"
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={rnSmsCountdown > 0}
                    onClick={() => {
                      setRnSmsCountdown(60);
                      setRnSmsCode('839201');
                    }}
                    className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {rnSmsCountdown > 0 ? `${rnSmsCountdown}秒后重发` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRealNameModalStep(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  下一步
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 B3：实名认证 — 第二步：实名信息填写弹窗（含公安接口Loading与失败重试）
         ===================================================================== */}
      {realNameModalStep === 'realname-form' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">实名信息填写</span>
              <button
                type="button"
                disabled={rnSubmitting}
                onClick={() => setRealNameModalStep(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rnSubmitting ? (
              <div className="p-10 text-center space-y-3">
                <Loader2 className="w-9 h-9 text-[#0284C7] animate-spin mx-auto" />
                <div className="text-base font-bold text-slate-900">验证中...</div>
                <p className="text-xs text-slate-500">
                  正在调用公安人口库实名核验接口比对姓名与身份证号，请稍候（约1-3秒）...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRnFormSubmit} className="p-6 space-y-4">
                {rnFormError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{rnFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    真实姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={rnNameInput}
                    onChange={(e) => setRnNameInput(e.target.value)}
                    placeholder="请输入您的真实姓名"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    身份证号码 *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={rnIdCardInput}
                    onChange={(e) => setRnIdCardInput(e.target.value)}
                    placeholder="请输入18位二代居民身份证号码"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num uppercase focus:outline-none"
                  />
                </div>

                {/* 演示开关：可勾选模拟“公安接口返回姓名与身份证号不匹配” */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rnSimulateMismatch}
                      onChange={(e) => setRnSimulateMismatch(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600"
                    />
                    <span>演示测试：模拟公安接口返回“姓名与身份证号不匹配”</span>
                  </label>
                </div>

                {/* 合规提示：底部勾选“本人承诺所填信息真实有效” */}
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={rnPromiseChecked}
                    onChange={(e) => setRnPromiseChecked(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                  <span>本人承诺所填信息真实有效</span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRealNameModalStep(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(user.realNameLockedUntil)}
                    className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    提交验证
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 C1：学生认证表单弹窗（防抖必选下拉院校库 + 专业 + 自动核验 + 异常人工兜底折叠项）
         ===================================================================== */}
      {academicModalOpen === 'student' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">参赛学生 — 学籍认证</span>
              <button
                type="button"
                disabled={stuSubmitting}
                onClick={() => setAcademicModalOpen(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {stuSubmitting ? (
              <div className="p-10 text-center space-y-3">
                <Loader2 className="w-9 h-9 text-[#0284C7] animate-spin mx-auto" />
                <div className="text-base font-bold text-slate-900">正在调用学籍自动核验接口...</div>
                <p className="text-xs text-slate-500">
                  正在交叉比对您的实名姓名（{user.name || '张三'}）、身份证号与所选高校学籍库...
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {stuFormError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{stuFormError}</span>
                  </div>
                )}

                <form onSubmit={handleStudentAutoSubmit} className="space-y-4">
                  {/* 学校（防抖模糊搜索院校库，必选下拉项，不可自由输入） */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      学校 *（输入关键字自动防抖搜索院校库，必须选中下拉标准名称）
                    </label>
                    <DebouncedUniversitySelect
                      selectedSchool={stuSchool}
                      onSelectSchool={(s) => setStuSchool(s)}
                      enabledSchools={enabledSchools}
                    />
                  </div>

                  {/* 专业（自由填写） */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      专业 *（自由填写）
                    </label>
                    <input
                      type="text"
                      required
                      value={stuMajor}
                      onChange={(e) => setStuMajor(e.target.value)}
                      placeholder="例如：网络空间安全 / 计算机科学与技术"
                      className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  {/* 演示开关：模拟自动核验失败以展示人工兜底通道 */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stuSimulateAutoFail}
                        onChange={(e) => setStuSimulateAutoFail(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600"
                      />
                      <span>演示测试：模拟“自动核验未通过”（如军校/新生），触发人工兜底通道</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setAcademicModalOpen(null)}
                      className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      提交
                    </button>
                  </div>
                </form>

                {/* 异常兜底机制：隐藏折叠项“自动验证未通过？点击此处上传学生证/学信网报告进行人工认证” */}
                <div className="pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStuManualExpanded((v) => !v)}
                    className={`w-full text-left text-xs font-semibold flex items-center justify-between py-1.5 cursor-pointer ${
                      stuAutoFailed ? 'text-amber-700' : 'text-slate-500 hover:text-[#0284C7]'
                    }`}
                  >
                    <span>自动验证未通过？点击此处上传学生证/学信网报告进行人工认证</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        stuManualExpanded || stuAutoFailed ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {(stuManualExpanded || stuAutoFailed) && (
                    <div className="mt-2.5 p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        人工兜底通道：如果您是军校学生、科研院所联培生或刚入学新生导致自动接口未查到数据，请上传<strong>学生证注册页</strong>或<strong>学信网在线验证报告</strong>，由您所选高校的【高校管理员】进行人工审核。
                      </p>
                      <div className="flex items-center gap-3">
                        <label className="px-3.5 py-2 rounded-lg bg-white border border-amber-300 hover:border-[#0284C7] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#0284C7]" />
                          <span>选择证明附件</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              setStuManualFileName(
                                file ? file.name : '学信网在线验证报告_2026.pdf'
                              );
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setStuManualFileName('教育部学籍在线验证报告_扫描件.pdf')}
                          className="text-xs text-[#0284C7] underline cursor-pointer"
                        >
                          一键填入演示证明文件
                        </button>
                      </div>
                      {stuManualFileName && (
                        <div className="text-xs text-emerald-700 font-medium">
                          已附加文件：{stuManualFileName}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleStudentManualSubmit}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        提交人工审核（转交高校管理员）
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 C2：教师认证表单弹窗（防抖必选学校 + 院系/部门 + 教工号 + 证明材料上传）
         ===================================================================== */}
      {academicModalOpen === 'teacher' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">指导教师 — 教师资格认证</span>
              <button
                type="button"
                onClick={() => setAcademicModalOpen(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="p-6 space-y-4">
              {teaFormError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{teaFormError}</span>
                </div>
              )}

              {/* 学校（模糊搜索院校库，必选下拉项） */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  学校 *（模糊搜索院校库，必选下拉项）
                </label>
                <DebouncedUniversitySelect
                  selectedSchool={teaSchool}
                  onSelectSchool={(s) => setTeaSchool(s)}
                  enabledSchools={enabledSchools}
                />
              </div>

              {/* 院系/部门 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  院系/部门 *
                </label>
                <input
                  type="text"
                  required
                  value={teaDept}
                  onChange={(e) => setTeaDept(e.target.value)}
                  placeholder="如：计算机科学与技术学院"
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                />
              </div>

              {/* 教工号 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  教工号 *（作为高校管理员审核的辅助凭证）
                </label>
                <input
                  type="text"
                  required
                  value={teaStaffId}
                  onChange={(e) => setTeaStaffId(e.target.value)}
                  placeholder="请输入您的学校教工号"
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                />
              </div>

              {/* 证明材料：[ 上传附件 ] */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  证明材料 *（请上传教师资格证或学校工作证/工牌照片，仅用于审核）
                </label>
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <Upload className="w-4 h-4 text-[#0284C7]" />
                      <span>上传附件</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setTeaFileName(file ? file.name : '高校教师工作证_正反面.jpg');
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!teaSchool) setTeaSchool('北京大学');
                        if (!teaDept) setTeaDept('计算机科学与技术学院');
                        if (!teaStaffId) setTeaStaffId('PKU-T2019086');
                        setTeaFileName('高校工作证与教师资格证扫描件.jpg');
                      }}
                      className="text-xs text-[#0284C7] underline cursor-pointer"
                    >
                      一键填入演示教师材料
                    </button>
                  </div>
                  {teaFileName && (
                    <span className="text-xs font-medium text-emerald-700 truncate">
                      已选择：{teaFileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAcademicModalOpen(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
