import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Layers,
  Clock,
  Tag,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
  ExternalLink,
  Bold,
  Heading1,
  Heading2,
  List,
  Code,
  Quote,
  Minus,
  ChevronRight,
  ChevronDown,
  Building2,
  X,
  Users,
  Video,
  BookOpen,
} from 'lucide-react';
import {
  type CompetitionCatalogItem,
  type CompetitionSubTrack,
  type CompetitionScheduleStage,
  type CompetitionRegistrationMode,
  computeCompetitionStatus,
  getCompetitionStatusLabel,
  type CompetitionCalculatedStatus,
} from '../data/competitionData';
import { TrackCoverIllustration } from './VisualArtwork';
import {
  type EventRegistrationConfig,
  type BackendAdminRoleType,
  computeRegistrationConfigStatus,
  getRegistrationStatusMeta,
  createDefaultRegistrationConfig,
  AdminRegistrationManagement,
} from './AdminRegistrationManagement';
import type { CaptainTeamRecord, PlatformDirectoryUser } from './TeamRegistrationSystem';
import type { AuditLogEntry } from './AuthAndUserCenter';
import {
  AdminInstitutionManagement,
  AdminNewsManagement,
  AdminMomentsManagement,
  type InstitutionRecord,
  type ManagedNewsItem,
  type ManagedMomentItem,
} from './InstitutionAndContentManagement';
import { AdminUserManagement } from './AdminUserManagement';
import { Settings, UserCog } from 'lucide-react';

// ============================================================================
// 通用组件 1：赛事封面渲染器（支持自定义图片 URL / 本地上传 Base64 或内置 SVG 视觉封面）
// ============================================================================
export const CompetitionCoverRender: React.FC<{
  coverTheme: 'network' | 'data' | 'ai';
  customCoverUrl?: string;
  status: CompetitionCalculatedStatus;
  className?: string;
}> = ({ coverTheme, customCoverUrl, status, className = 'w-full h-full' }) => {
  const [imgError, setImgError] = useState(false);

  const mappedTrackStatus: 'registering' | 'upcoming' | 'ended' =
    status === 'ongoing' ? 'registering' : status === 'upcoming' ? 'upcoming' : 'ended';

  if (customCoverUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
        <img
          src={customCoverUrl}
          alt="赛事封面"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={className}>
      <TrackCoverIllustration type={coverTheme} status={mappedTrackStatus} />
    </div>
  );
};

// ============================================================================
// 通用组件 2：轻量级高保真 Markdown 文档渲染器（用于赛事详情页左栏 & 后台编辑器实时预览）
// ============================================================================
export const MarkdownDocumentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderInline = (text: string) => {
    // 处理行内代码 `code` 与加粗 **bold**
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono-num bg-sky-50 text-[#0369A1] border border-sky-200/80 rounded"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{token}</React.Fragment>;
    });
  };

  const blocks = useMemo(() => {
    const lines = (content || '').split('\n');
    const parsed: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // 代码块 ```
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // 跳过结束 ```
        parsed.push(
          <div
            key={`code-${i}`}
            className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#0B192C] text-slate-200 shadow-xs"
          >
            {lang && (
              <div className="px-4 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono-num text-sky-400 uppercase tracking-wider">
                {lang}
              </div>
            )}
            <pre className="p-4 text-xs font-mono-num leading-relaxed overflow-x-auto">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 分割线 ---
      if (/^---+$/.test(trimmed)) {
        parsed.push(<hr key={`hr-${i}`} className="my-6 border-slate-200" />);
        i++;
        continue;
      }

      // 标题 H1 / H2 / H3
      if (trimmed.startsWith('# ')) {
        parsed.push(
          <h1
            key={`h1-${i}`}
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-6 first:mt-0 mb-3 pb-2.5 border-b border-slate-200"
          >
            {renderInline(trimmed.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        parsed.push(
          <h2
            key={`h2-${i}`}
            className="text-lg font-bold text-slate-900 tracking-tight mt-6 first:mt-0 mb-2.5 flex items-center gap-2"
          >
            <span className="w-1.5 h-4 rounded-full bg-[#0284C7] shrink-0" />
            <span>{renderInline(trimmed.slice(3))}</span>
          </h2>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        parsed.push(
          <h3 key={`h3-${i}`} className="text-base font-bold text-slate-800 mt-4 mb-2">
            {renderInline(trimmed.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // 引用块 >
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        parsed.push(
          <blockquote
            key={`quote-${i}`}
            className="my-4 pl-4 pr-4 py-3 border-l-4 border-[#0284C7] bg-sky-50/70 rounded-r-lg text-sm text-slate-700 leading-relaxed"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className="mb-1 last:mb-0">
                {renderInline(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 无序列表 - 或 *
      if (/^[-*]\s+/.test(trimmed)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\s*[-*]\s+/, ''));
          i++;
        }
        parsed.push(
          <ul key={`ul-${i}`} className="my-3 space-y-2 list-disc pl-5 text-sm text-slate-700 leading-relaxed">
            {listItems.map((li, lIdx) => (
              <li key={lIdx}>{renderInline(li)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // 有序列表 1. 2.
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        parsed.push(
          <ol key={`ol-${i}`} className="my-3 space-y-2 list-decimal pl-5 text-sm text-slate-700 leading-relaxed">
            {listItems.map((li, lIdx) => (
              <li key={lIdx}>{renderInline(li)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // 普通段落
      parsed.push(
        <p key={`p-${i}`} className="my-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
      i++;
    }

    return parsed;
  }, [content]);

  return <div className="space-y-1">{blocks}</div>;
};

// ============================================================================
// 状态样式辅助函数
// ============================================================================
function getStatusTextClass(status: CompetitionCalculatedStatus) {
  if (status === 'ongoing') return 'text-emerald-700 font-bold';
  if (status === 'upcoming') return 'text-amber-600 font-bold';
  return 'text-slate-500 font-semibold';
}

function getStatusDotClass(status: CompetitionCalculatedStatus) {
  if (status === 'ongoing') return 'bg-emerald-500 animate-pulse';
  if (status === 'upcoming') return 'bg-amber-500';
  return 'bg-slate-400';
}

// ============================================================================
// 前台视图 1：赛事目录页面（一行一个长条形卡片列表）
// ============================================================================
interface CompetitionDirectoryPageProps {
  competitions: CompetitionCatalogItem[];
  onSelectCompetition: (comp: CompetitionCatalogItem) => void;
}

export const CompetitionDirectoryPage: React.FC<CompetitionDirectoryPageProps> = ({
  competitions,
  onSelectCompetition,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionCalculatedStatus>('all');

  // 前台仅展示公开（isPublic === true）的赛事
  const publicCompetitions = useMemo(
    () => competitions.filter((c) => c.isPublic),
    [competitions]
  );

  const filteredCompetitions = useMemo(() => {
    return publicCompetitions.filter((item) => {
      const calcStatus = computeCompetitionStatus(item.startDate, item.endDate);
      if (statusFilter !== 'all' && calcStatus !== statusFilter) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(kw);
        const matchSummary = item.summary.toLowerCase().includes(kw);
        const matchTag = item.customTags.some((t) => t.toLowerCase().includes(kw));
        return matchTitle || matchSummary || matchTag;
      }
      return true;
    });
  }, [publicCompetitions, statusFilter, searchKeyword]);

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 flex-1 w-full">
      {/* 页面头部与筛选检索栏 */}
      <div className="mb-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-semibold text-[#0284C7] tracking-wide mb-1">
              “XX杯”全国网数智安全大赛 · 官方赛事大厅
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              赛事目录
            </h1>
          </div>
        </div>

        {/* 状态筛选与关键词搜索 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start">
            {(
              [
                { key: 'all', label: '全部赛事' },
                { key: 'ongoing', label: '进行中' },
                { key: 'upcoming', label: '未开始' },
                { key: 'ended', label: '已结束' },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0284C7] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索比赛名称、简介或标签..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 一行一个长条形的卡片列表 */}
      {filteredCompetitions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-base font-bold text-slate-800">暂无符合筛选条件的公开赛事</div>
          <p className="text-xs text-slate-500">
            您可以尝试切换状态筛选，或通过右上角头像菜单「进入后台 &rarr; 赛事管理」将隐藏赛事设为公开或新增赛事。
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCompetitions.map((comp) => {
            const calcStatus = computeCompetitionStatus(comp.startDate, comp.endDate);
            const statusLabel = getCompetitionStatusLabel(calcStatus);

            return (
              <article
                key={comp.id}
                onClick={() => onSelectCompetition(comp)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#0284C7] shadow-2xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col md:flex-row cursor-pointer"
              >
                {/* 左侧：赛事封面 */}
                <div className="md:w-80 lg:w-96 xl:w-[420px] h-52 md:h-auto shrink-0 relative overflow-hidden">
                  <CompetitionCoverRender
                    coverTheme={comp.coverTheme}
                    customCoverUrl={comp.customCoverUrl}
                    status={calcStatus}
                    className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>

                {/* 右侧：比赛名称/标题、简介、起止时间、状态（根据起止时间判断）、自定义标签 */}
                <div className="flex-1 p-6 sm:p-7 xl:p-8 flex flex-col justify-between gap-4">
                  <div>
                    {/* 顶部状态元信息行 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotClass(calcStatus)}`} />
                        <span className={getStatusTextClass(calcStatus)}>状态：{statusLabel}</span>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-slate-500 font-mono-num">
                          起止时间：{comp.startDate} 至 {comp.endDate}
                        </span>
                      </div>
                    </div>

                    {/* 比赛名称/标题 */}
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-[#0284C7] transition-colors leading-snug mb-2.5">
                      {comp.title}
                    </h2>

                    {/* 赛事简介 */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {comp.summary}
                    </p>
                  </div>

                  {/* 底部：自定义标签 + 查看详情引导 */}
                  <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                        <Tag className="w-3.5 h-3.5 text-[#0284C7]" />
                        标签：
                      </span>
                      {comp.customTags.length > 0 ? (
                        comp.customTags.map((tag, idx) => (
                          <React.Fragment key={`${tag}-${idx}`}>
                            <span className="text-[#0369A1] font-medium">{tag}</span>
                            {idx < comp.customTags.length - 1 && (
                              <span className="text-slate-300" aria-hidden="true">
                                /
                              </span>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="text-slate-400">官方认证赛事</span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-[#0284C7] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <span>进入赛事详情</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

// ============================================================================
// 前台视图 2：赛事详情页面
// 顶部：左封面 + 右（标题、简介、起止时间、状态、自定义标签、立即报名按钮）
// 下方分两栏：左栏显示赛事介绍（Markdown自由编辑内容），右栏纵向时间轴显示比赛赛程
// ============================================================================
interface CompetitionDetailPageProps {
  competition: CompetitionCatalogItem;
  registrationConfig?: EventRegistrationConfig;
  onBackToDirectory: () => void;
  onRegisterClick: (comp: CompetitionCatalogItem, selectedSubTrackName?: string) => void;
}

export const CompetitionDetailPage: React.FC<CompetitionDetailPageProps> = ({
  competition,
  registrationConfig,
  onBackToDirectory,
  onRegisterClick,
}) => {
  const calcStatus = computeCompetitionStatus(competition.startDate, competition.endDate);
  const statusLabel = getCompetitionStatusLabel(calcStatus);
  const [selectedSubTrack, setSelectedSubTrack] = useState<string>(
    competition.tracks[0]?.name || ''
  );
  const [regNotOpenPrompt, setRegNotOpenPrompt] = useState<string | null>(null);

  // 是否存在关联且启用中的报名管理配置数据
  const hasAssociatedRegistration = Boolean(
    registrationConfig && !registrationConfig.isDisabled
  );
  const platformRegStatus = registrationConfig
    ? computeRegistrationConfigStatus(registrationConfig)
    : 'not_started';
  const platformRegMeta = getRegistrationStatusMeta(platformRegStatus);

  const handleClickRegisterButton = () => {
    if (!hasAssociatedRegistration || !registrationConfig) return;
    if (platformRegStatus !== 'open') {
      setRegNotOpenPrompt(
        `报名未开启：当前赛事不在报名开放时段内（报名时间：${registrationConfig.regStartTime.replace(
          'T',
          ' '
        )} 至 ${registrationConfig.regEndTime.replace('T', ' ')}${
          registrationConfig.earlyClosed ? '，管理员已关闭报名通道' : ''
        }）。`
      );
      return;
    }
    setRegNotOpenPrompt(null);
    onRegisterClick(competition, selectedSubTrack);
  };

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 flex-1 w-full space-y-8">
      {/* 返回赛事目录面包屑导航 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0284C7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回赛事目录</span>
        </button>

        <div className="text-xs text-slate-400 font-mono-num hidden sm:block">
          赛事目录 &rsaquo; <span className="text-slate-700 font-medium">{competition.title}</span>
        </div>
      </div>

      {/* 详情页顶部卡片：左侧封面 + 右侧（标题、简介、起止时间、状态、自定义标签、立即报名按钮） */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* 左侧：赛事封面 */}
          <div className="lg:col-span-5 min-h-[260px] sm:min-h-[320px] relative overflow-hidden">
            <CompetitionCoverRender
              coverTheme={competition.coverTheme}
              customCoverUrl={competition.customCoverUrl}
              status={calcStatus}
              className="w-full h-full"
            />
          </div>

          {/* 右侧：赛事核心信息 + 立即报名按钮 */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {/* 状态与起止时间 */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(calcStatus)}`} />
                  <span className={getStatusTextClass(calcStatus)}>当前状态：{statusLabel}</span>
                </span>
                <span className="text-slate-300" aria-hidden="true">
                  |
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-mono-num">
                  <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>
                    起止时间：{competition.startDate} 至 {competition.endDate}
                  </span>
                </span>
              </div>

              {/* 比赛名称/标题 */}
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight leading-snug">
                {competition.title}
              </h1>

              {/* 简介 */}
              <p className="text-sm text-slate-600 leading-relaxed">{competition.summary}</p>

              {/* 主办方与自定义标签 */}
              <div className="pt-2 space-y-2 text-xs text-slate-600">
                {competition.organizer && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                    <span>主办单位：{competition.organizer}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Tag className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>自定义标签：</span>
                  </span>
                  {competition.customTags.length > 0 ? (
                    competition.customTags.map((tag, idx) => (
                      <React.Fragment key={`${tag}-${idx}`}>
                        <span className="font-semibold text-[#0369A1]">{tag}</span>
                        {idx < competition.customTags.length - 1 && (
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-slate-400">官方认证赛事</span>
                  )}
                </div>
              </div>
            </div>

            {/* 底部：由后台【报名管理】是否有关联该赛事的报名数据控制显示 */}
            <div className="pt-5 border-t border-slate-100">
              {!hasAssociatedRegistration ? (
                /* 无关联赛事的报名数据 -> 前台报名按钮不显示 */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3">
                  <div className="text-xs text-slate-500">
                    本赛事暂未关联开启在线报名通道，可浏览下方赛事介绍与赛程安排。
                  </div>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold shrink-0">
                    <span className={`w-2 h-2 rounded-full ${getStatusDotClass(calcStatus)}`} />
                    <span>{statusLabel}</span>
                  </span>
                </div>
              ) : (
                /* 有关联的报名数据 -> 显示【立即报名】按钮；若报名未开启，点击提示“报名未开启” */
                <div className="space-y-3">
                  {regNotOpenPrompt && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{regNotOpenPrompt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRegNotOpenPrompt(null)}
                        className="text-amber-600 hover:text-amber-900 cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {competition.tracks.length > 0 ? (
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                          选择报名赛道（共 {competition.tracks.length} 个赛道）：
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {competition.tracks.map((trk) => {
                            const active = selectedSubTrack === trk.name;
                            return (
                              <button
                                key={trk.id}
                                type="button"
                                onClick={() => setSelectedSubTrack(trk.name)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-left ${
                                  active
                                    ? 'bg-sky-50 border-[#0284C7] text-[#0284C7] font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                {trk.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">综合赛道统一报名通道</div>
                    )}

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={handleClickRegisterButton}
                        className={`w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          platformRegStatus === 'open'
                            ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
                            : 'bg-slate-700 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>立即报名</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 平台报名时间窗口与规则摘要条 */}
                  {registrationConfig && (
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${platformRegMeta.dotClass}`} />
                          <span className="font-semibold text-slate-700">
                            报名通道状态：{platformRegMeta.label}
                            {registrationConfig.earlyClosed ? '（管理员已提前关闭）' : ''}
                          </span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-mono-num">
                          报名起止：{registrationConfig.regStartTime.replace('T', ' ')} 至{' '}
                          {registrationConfig.regEndTime.replace('T', ' ')}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        队伍限制：{registrationConfig.minTeamSize}-{registrationConfig.maxTeamSize}人 · 仅限同校组队
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 下方分两栏：左栏（大部分宽度）显示赛事介绍（Markdown），右栏（较窄）以纵向时间轴显示比赛赛程 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        {/* 左栏（占 8 列）：赛事介绍（后台 Markdown 自由编辑内容） */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 xl:p-10 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">赛事介绍</h2>
            </div>
            <span className="text-xs text-slate-400">支持后台 Markdown 自由排版配置</span>
          </div>

          {/* 渲染 Markdown 正文 */}
          <MarkdownDocumentRenderer content={competition.markdownContent} />

          {/* 附：本赛事下设赛道一览 */}
          {competition.tracks.length > 0 && (
            <div className="pt-6 border-t border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0284C7]" />
                <span>本赛事下设赛道（{competition.tracks.length} 个）</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {competition.tracks.map((trk, idx) => (
                  <div
                    key={trk.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-mono-num text-[#0284C7] font-semibold mb-0.5">
                        赛道 0{idx + 1}
                      </div>
                      <div className="text-sm font-bold text-slate-900">{trk.name}</div>
                      {trk.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{trk.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右栏（占 4 列，较窄）：比赛赛程（纵向时间轴） */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sticky top-24">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">比赛赛程</h2>
            </div>
            <span className="text-xs font-mono-num text-slate-400">
              共 {competition.schedule.length} 个阶段
            </span>
          </div>

          {competition.schedule.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">暂未配置赛程阶段</div>
          ) : (
            <div className="relative pl-6 border-l-2 border-sky-200 space-y-7 my-2">
              {competition.schedule.map((item, idx) => {
                const isFirst = idx === 0;
                return (
                  <div key={item.id || idx} className="relative group">
                    {/* 时间轴圆点 */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isFirst && calcStatus !== 'ended'
                          ? 'bg-[#0284C7] border-sky-200 ring-4 ring-sky-100'
                          : 'bg-white border-[#0284C7]'
                      }`}
                    />

                    <div className="text-xs font-mono-num font-semibold text-[#0284C7] mb-1">
                      {item.dateRange}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      0{idx + 1}. {item.stage}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};

// ============================================================================
// 独立后台管理页面（左侧导航栏 + “赛事管理”菜单：增删改查、多选公开/隐藏、状态筛选、名称搜索、Markdown编辑器）
// ============================================================================
interface AdminDashboardPageProps {
  competitions: CompetitionCatalogItem[];
  onUpdateCompetitions: (nextList: CompetitionCatalogItem[]) => void;
  registrationConfigs: EventRegistrationConfig[];
  onUpdateRegistrationConfigs: (next: EventRegistrationConfig[]) => void;
  captainTeams: CaptainTeamRecord[];
  onUpdateCaptainTeams: (next: CaptainTeamRecord[]) => void;
  institutions: InstitutionRecord[];
  onUpdateInstitutions: React.Dispatch<React.SetStateAction<InstitutionRecord[]>>;
  managedNews: ManagedNewsItem[];
  onUpdateManagedNews: React.Dispatch<React.SetStateAction<ManagedNewsItem[]>>;
  managedMoments: ManagedMomentItem[];
  onUpdateManagedMoments: React.Dispatch<React.SetStateAction<ManagedMomentItem[]>>;
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
  onSendSystemNotification: (title: string, desc: string) => void;
  onBackToFrontend: () => void;
  onPreviewCompetitionInFrontend: (comp: CompetitionCatalogItem) => void;
  adminName: string;
  adminUsername?: string;
  auditLogs?: AuditLogEntry[];
  platformUsers?: PlatformDirectoryUser[];
  onUpdatePlatformUsers?: React.Dispatch<React.SetStateAction<PlatformDirectoryUser[]>>;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  competitions,
  onUpdateCompetitions,
  registrationConfigs,
  onUpdateRegistrationConfigs,
  captainTeams,
  onUpdateCaptainTeams,
  institutions,
  onUpdateInstitutions,
  managedNews,
  onUpdateManagedNews,
  managedMoments,
  onUpdateManagedMoments,
  onAddAuditLog,
  onSendSystemNotification,
  onBackToFrontend,
  onPreviewCompetitionInFrontend,
  adminName,
  adminUsername = 'admin',
  auditLogs = [],
  platformUsers = [],
  onUpdatePlatformUsers,
}) => {
  // 后台当前角色视角：根据当前登录账号角色自动匹配初始视角（组委会超级管理员 / 高校管理员 / 秘书处管理员）
  const initialAdminAccount = platformUsers.find(
    (u) => !u.isDeleted && (u.username || '').toLowerCase() === adminUsername.toLowerCase()
  );
  const initialDetectedRole: BackendAdminRoleType =
    initialAdminAccount?.extendedRoles?.includes('高校管理员') ||
    initialAdminAccount?.tags?.includes('高校管理员')
      ? 'school_admin'
      : initialAdminAccount?.extendedRoles?.includes('秘书处') ||
        initialAdminAccount?.tags?.includes('秘书处管理员')
      ? 'secretariat_admin'
      : 'super_admin';

  const [activeMenu, setActiveMenu] = useState<
    | 'competitions'
    | 'registrations'
    | 'institutions'
    | 'users'
    | 'content-news'
    | 'content-moments'
  >(initialDetectedRole === 'school_admin' ? 'registrations' : 'competitions');
  const [contentMenuExpanded, setContentMenuExpanded] = useState<boolean>(true);
  const [systemMenuExpanded, setSystemMenuExpanded] = useState<boolean>(true);
  const [subView, setSubView] = useState<'list' | 'form'>('list');
  const [viewingCompetitionDetail, setViewingCompetitionDetail] =
    useState<CompetitionCatalogItem | null>(null);

  const [adminRole, setAdminRole] = useState<BackendAdminRoleType>(initialDetectedRole);
  const [selectedSchoolInstId, setSelectedSchoolInstId] = useState<string>(
    initialAdminAccount?.managedInstitutionId || 'inst-3'
  );

  const currentSchoolInstitution = useMemo(() => {
    return (
      institutions.find((i) => i.id === selectedSchoolInstId) ||
      institutions.find((i) => i.id === 'inst-3') ||
      institutions[0]
    );
  }, [institutions, selectedSchoolInstId]);

  const currentSchoolAdmins = useMemo(() => {
    if (!currentSchoolInstitution) return [];
    return platformUsers.filter(
      (u) =>
        !u.isDeleted &&
        (u.extendedRoles?.includes('高校管理员') || u.tags?.includes('高校管理员')) &&
        u.managedInstitutionId === currentSchoolInstitution.id
    );
  }, [platformUsers, currentSchoolInstitution]);

  const effectiveAdminDisplayName = useMemo(() => {
    if (adminRole === 'super_admin') return `${adminName}（组委会超级管理员）`;
    if (adminRole === 'secretariat_admin') {
      const secName =
        initialAdminAccount?.extendedRoles?.includes('秘书处') ||
        initialAdminAccount?.tags?.includes('秘书处管理员')
          ? initialAdminAccount.realName || initialAdminAccount.name.replace(/（.*?）/g, '')
          : '王秘书';
      return `${secName}（秘书处管理员）`;
    }
    const firstSchoolAdmin = currentSchoolAdmins[0]?.realName || currentSchoolAdmins[0]?.name.replace(/（.*?）/g, '');
    return `${firstSchoolAdmin || '高校联络人'}（${
      currentSchoolInstitution?.name || '北京航空航天大学'
    } · 高校管理员）`;
  }, [adminRole, adminName, initialAdminAccount, currentSchoolAdmins, currentSchoolInstitution]);

  // --- 列表筛选、搜索与多选状态 ---
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionCalculatedStatus>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // --- 新增 / 编辑表单状态 ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCoverTheme, setFormCoverTheme] = useState<'network' | 'data' | 'ai'>('network');
  const [formCustomCoverUrl, setFormCustomCoverUrl] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-10-20');
  const [formEndDate, setFormEndDate] = useState('2026-12-20');
  const [formOrganizer, setFormOrganizer] = useState('“XX杯”全国网数智安全大赛组委会');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formRegMode, setFormRegMode] = useState<CompetitionRegistrationMode>('platform');
  const [formThirdPartyUrl, setFormThirdPartyUrl] = useState('');
  const [formCustomTags, setFormCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [formSchedule, setFormSchedule] = useState<CompetitionScheduleStage[]>([]);
  const [formTracks, setFormTracks] = useState<CompetitionSubTrack[]>([]);
  const [formMarkdown, setFormMarkdown] = useState('');
  const [mdEditorMode, setMdEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => {
      setAdminToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // 过滤后的后台赛事列表
  const filteredList = useMemo(() => {
    return competitions.filter((item) => {
      const calcStatus = computeCompetitionStatus(item.startDate, item.endDate);
      if (statusFilter !== 'all' && calcStatus !== statusFilter) return false;
      if (searchName.trim()) {
        return item.title.toLowerCase().includes(searchName.trim().toLowerCase());
      }
      return true;
    });
  }, [competitions, statusFilter, searchName]);

  // 全选 / 取消全选当前筛选结果
  const isAllFilteredSelected =
    filteredList.length > 0 && filteredList.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredList.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filteredList.map((i) => i.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 批量设置公开 / 隐藏
  const handleBatchSetVisibility = (isPublic: boolean) => {
    if (selectedIds.length === 0) return;
    const selectedSet = new Set(selectedIds);
    const updated = competitions.map((c) =>
      selectedSet.has(c.id) ? { ...c, isPublic } : c
    );
    onUpdateCompetitions(updated);
    showToast(
      `已将选中的 ${selectedIds.length} 项赛事批量设置为「${
        isPublic ? '公开（前台可见）' : '隐藏（前台不可见）'
      }」`
    );
    setSelectedIds([]);
  };

  // 单行快捷切换公开 / 隐藏
  const handleSingleToggleVisibility = (comp: CompetitionCatalogItem) => {
    const nextPublic = !comp.isPublic;
    const updated = competitions.map((c) =>
      c.id === comp.id ? { ...c, isPublic: nextPublic } : c
    );
    onUpdateCompetitions(updated);
    showToast(
      `《${comp.title}》已切换为「${nextPublic ? '公开（前台可见）' : '隐藏（前台不可见）'}」`
    );
  };

  // 删除赛事（增加报名战队关联保护与报名配置级联清理）
  const handleConfirmDelete = (id: string) => {
    const target = competitions.find((c) => c.id === id);
    const hasActiveTeams = captainTeams.some((t) => t.competitionId === id);
    if (hasActiveTeams) {
      setDeleteConfirmId(null);
      showToast(
        `拦截提示：《${target?.title || id}》下已有参赛战队报名记录，为保护历史报名与审计数据无法直接删除！建议将其切换为「隐藏（前台不可见）」。`
      );
      return;
    }
    const updated = competitions.filter((c) => c.id !== id);
    onUpdateCompetitions(updated);
    onUpdateRegistrationConfigs(registrationConfigs.filter((rc) => rc.eventId !== id));
    setSelectedIds((prev) => prev.filter((selId) => selId !== id));
    setDeleteConfirmId(null);
    if (target) {
      showToast(`已删除赛事《${target.title}》并清理关联报名配置`);
    }
  };

  // 打开“新增赛事”表单
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCoverTheme('network');
    setFormCustomCoverUrl('');
    setFormSummary('');
    setFormStartDate('2026-10-28');
    setFormEndDate('2026-12-30');
    setFormOrganizer('“XX杯”全国网数智安全大赛组委会');
    setFormIsPublic(true);
    setFormRegMode('platform');
    setFormThirdPartyUrl('');
    setFormCustomTags(['国家级赛事', 'CTF夺旗赛']);
    setNewTagInput('');
    setFormSchedule([
      {
        id: `st-${Date.now()}-1`,
        stage: '战队报名与资格审核',
        dateRange: '2026-10-28 ~ 2026-11-20',
        description: '在线组建高校战队并完成实名与学籍核验。',
      },
      {
        id: `st-${Date.now()}-2`,
        stage: '线上选拔初赛',
        dateRange: '2026-11-28 ~ 2026-11-29',
        description: '48小时云端靶场夺旗比拼。',
      },
      {
        id: `st-${Date.now()}-3`,
        stage: '全国线下总决赛',
        dateRange: '2026-12-26 ~ 2026-12-27',
        description: 'AWD Plus实网攻防对抗与现场答辩颁奖。',
      },
    ]);
    setFormTracks([
      {
        id: `trk-${Date.now()}-1`,
        name: '网络安全综合攻防赛道',
        description: '涵盖Web安全、逆向工程、二进制Pwn与密码学',
      },
    ]);
    setFormMarkdown(`# 赛事背景与介绍

请在此输入赛事详细介绍内容，支持标准 **Markdown** 语法排版。

---

## 参赛要求与组队规则

1. **参赛对象**：全国高等院校全日制在校学生。
2. **组队人数**：每支队伍 1-4 人，可配指导教师 1 名。

> 提示：您可以在上方工具栏快速插入标题、加粗、代码块或列表，右侧将实时预览前台渲染效果。`);
    setFormError(null);
    setSubView('form');
  };

  // 打开“编辑赛事”表单
  const handleOpenEditForm = (comp: CompetitionCatalogItem) => {
    setEditingId(comp.id);
    setFormTitle(comp.title);
    setFormCoverTheme(comp.coverTheme);
    setFormCustomCoverUrl(comp.customCoverUrl || '');
    setFormSummary(comp.summary);
    setFormStartDate(comp.startDate);
    setFormEndDate(comp.endDate);
    setFormOrganizer(comp.organizer || '“XX杯”全国网数智安全大赛组委会');
    setFormIsPublic(comp.isPublic);
    setFormRegMode(comp.registrationMode || 'platform');
    setFormThirdPartyUrl(comp.thirdPartyUrl || '');
    setFormCustomTags([...comp.customTags]);
    setNewTagInput('');
    setFormSchedule(comp.schedule.map((s) => ({ ...s })));
    setFormTracks(comp.tracks.map((t) => ({ ...t })));
    setFormMarkdown(comp.markdownContent);
    setFormError(null);
    setSubView('form');
  };

  // 处理本地封面图片上传（转为 DataURL 实时预览并保存）
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormCustomCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Markdown 快捷插入辅助函数
  const insertMarkdownSnippet = (snippet: string) => {
    setFormMarkdown((prev) => `${prev}\n${snippet}`);
  };

  // 保存新增 / 编辑的赛事（不再包含报名模式选择，报名统一在【报名管理】中新增关联赛事实现）
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('请填写赛事名称');
      return;
    }
    if (!formSummary.trim()) {
      setFormError('请填写赛事简介');
      return;
    }
    if (!formStartDate || !formEndDate) {
      setFormError('请完整选择赛事起止时间');
      return;
    }
    if (formStartDate > formEndDate) {
      setFormError('结束日期不能早于开始日期');
      return;
    }

    const cleanedSchedule = formSchedule.filter((s) => s.stage.trim() !== '');
    const cleanedTracks = formTracks.filter((t) => t.name.trim() !== '');

    if (editingId) {
      const updated = competitions.map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: formTitle.trim(),
              coverTheme: formCoverTheme,
              customCoverUrl: formCustomCoverUrl.trim() || undefined,
              summary: formSummary.trim(),
              startDate: formStartDate,
              endDate: formEndDate,
              organizer: formOrganizer.trim() || '“XX杯”全国网数智安全大赛组委会',
              isPublic: formIsPublic,
              customTags: formCustomTags,
              schedule: cleanedSchedule,
              tracks: cleanedTracks,
              markdownContent: formMarkdown,
            }
          : item
      );
      onUpdateCompetitions(updated);
      showToast(`已保存对《${formTitle.trim()}》的修改！`);
    } else {
      const now = new Date();
      const createdAtStr = `2026-10-28 ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const newId = `comp-${Date.now()}`;
      const newComp: CompetitionCatalogItem = {
        id: newId,
        title: formTitle.trim(),
        coverTheme: formCoverTheme,
        customCoverUrl: formCustomCoverUrl.trim() || undefined,
        summary: formSummary.trim(),
        startDate: formStartDate,
        endDate: formEndDate,
        organizer: formOrganizer.trim() || '“XX杯”全国网数智安全大赛组委会',
        isPublic: formIsPublic,
        registrationMode: 'platform',
        customTags: formCustomTags,
        schedule: cleanedSchedule,
        tracks: cleanedTracks,
        markdownContent: formMarkdown,
        createdAt: createdAtStr,
      };
      onUpdateCompetitions([newComp, ...competitions]);
      showToast(`已成功新增赛事《${newComp.title}》！如需开启报名，请前往【报名管理】新增关联报名。`);
    }

    setSubView('list');
  };

  const previewCalcStatus = computeCompetitionStatus(formStartDate, formEndDate);
  const previewStatusLabel = getCompetitionStatusLabel(previewCalcStatus);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col lg:flex-row">
      {/* 左侧导航栏（Sidebar） */}
      <aside className="w-full lg:w-64 xl:w-72 bg-[#072A47] text-white shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* 后台品牌 Header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white">“XX杯”运营管理后台</div>
              <div className="text-[11px] text-sky-300/80">赛事与内容配置中心</div>
            </div>
          </div>

          {/* 导航菜单列表（高校管理员权限隔离：左侧菜单仅显示【报名管理】菜单） */}
          <div className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-300/60">
              {adminRole === 'school_admin'
                ? '高校管理员专属工作台'
                : '核心业务管理'}
            </div>

            {adminRole !== 'school_admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveMenu('competitions');
                  setSubView('list');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeMenu === 'competitions'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-sky-100/80 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>赛事管理</span>
                </span>
                <span className="text-xs font-mono-num bg-white/20 px-2 py-0.5 rounded-md">
                  {competitions.length}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveMenu('registrations');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                activeMenu === 'registrations' || adminRole === 'school_admin'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-sky-100/80 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>报名管理</span>
              </span>
              <span className="text-xs font-mono-num bg-white/20 px-2 py-0.5 rounded-md">
                {registrationConfigs.length}
              </span>
            </button>

            {adminRole !== 'school_admin' && (
              <>
                {/* 内容管理（含二级子菜单：赛事新闻、赛事动态） */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setContentMenuExpanded((v) => !v)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeMenu === 'content-news' || activeMenu === 'content-moments'
                        ? 'bg-white/15 text-white'
                        : 'text-sky-100/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4" />
                      <span>内容管理</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        contentMenuExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {contentMenuExpanded && (
                    <div className="mt-1.5 ml-4 pl-3 border-l border-white/15 space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveMenu('content-news')}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          activeMenu === 'content-news'
                            ? 'bg-[#0284C7] text-white shadow-xs'
                            : 'text-sky-100/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          <span>赛事新闻</span>
                        </span>
                        <span className="text-[11px] font-mono-num bg-white/20 px-1.5 py-0.5 rounded">
                          {managedNews.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveMenu('content-moments')}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          activeMenu === 'content-moments'
                            ? 'bg-[#0284C7] text-white shadow-xs'
                            : 'text-sky-100/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5" />
                          <span>赛事动态</span>
                        </span>
                        <span className="text-[11px] font-mono-num bg-white/20 px-1.5 py-0.5 rounded">
                          {managedMoments.length}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 系统管理（内容管理下方同级菜单，含二级子菜单：院校管理、用户管理） */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSystemMenuExpanded((v) => !v)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeMenu === 'institutions' || activeMenu === 'users'
                        ? 'bg-white/15 text-white'
                        : 'text-sky-100/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4" />
                      <span>系统管理</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        systemMenuExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {systemMenuExpanded && (
                    <div className="mt-1.5 ml-4 pl-3 border-l border-white/15 space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveMenu('institutions')}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          activeMenu === 'institutions'
                            ? 'bg-[#0284C7] text-white shadow-xs'
                            : 'text-sky-100/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>院校管理</span>
                        </span>
                        <span className="text-[11px] font-mono-num bg-white/20 px-1.5 py-0.5 rounded">
                          {institutions.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveMenu('users')}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          activeMenu === 'users'
                            ? 'bg-[#0284C7] text-white shadow-xs'
                            : 'text-sky-100/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <UserCog className="w-3.5 h-3.5" />
                          <span>用户管理</span>
                        </span>
                        <span className="text-[11px] font-mono-num bg-white/20 px-1.5 py-0.5 rounded">
                          {platformUsers.filter((u) => !u.isDeleted).length}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 底部管理员信息与返回前台按钮 */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#051E34]">
          <div className="px-2 space-y-1 text-xs">
            <div className="text-sky-200/70">当前登录身份：</div>
            <div className="font-bold text-white leading-snug">
              {effectiveAdminDisplayName}
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToFrontend}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/15 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回前台官网</span>
          </button>
        </div>
      </aside>

      {/* 右侧主工作区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部状态栏（含后台管理员身份/权限视角切换器） */}
        <header className="min-h-16 py-2.5 bg-white border-b border-slate-200 px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">后台管理</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            {adminRole === 'school_admin' || activeMenu === 'registrations' ? (
              <span className="font-bold text-slate-900">
                报名管理（规则配置与队伍数据管理）
              </span>
            ) : activeMenu === 'competitions' ? (
              <>
                <button
                  type="button"
                  onClick={() => setSubView('list')}
                  className={`font-bold cursor-pointer ${
                    subView === 'list' ? 'text-slate-900' : 'text-[#0284C7] hover:underline'
                  }`}
                >
                  赛事管理
                </button>
                {subView === 'form' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-900">
                      {editingId ? '编辑赛事' : '新增赛事'}
                    </span>
                  </>
                )}
              </>
            ) : activeMenu === 'institutions' ? (
              <span className="font-bold text-slate-900">
                系统管理 &rsaquo; 院校管理（教育部标准高校库与学籍认证控制）
              </span>
            ) : activeMenu === 'users' ? (
              <span className="font-bold text-slate-900">
                系统管理 &rsaquo; 用户管理（角色互斥与叠加 · 账号过期与导入导出）
              </span>
            ) : activeMenu === 'content-news' ? (
              <span className="font-bold text-slate-900">内容管理 &rsaquo; 赛事新闻</span>
            ) : (
              <span className="font-bold text-slate-900">内容管理 &rsaquo; 赛事动态</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 角色权限视角切换器（便于验证：组委会超级管理员 / 高校管理员 / 秘书处管理员） */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 pl-2 pr-1">
                当前角色视角：
              </span>
              <button
                type="button"
                onClick={() => setAdminRole('super_admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  adminRole === 'super_admin'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                组委会超级管理员
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminRole('school_admin');
                  setActiveMenu('registrations');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  adminRole === 'school_admin'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                高校管理员
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminRole('secretariat_admin');
                  setActiveMenu('registrations');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  adminRole === 'secretariat_admin'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                秘书处管理员
              </button>
            </div>

            {adminRole === 'school_admin' && (
              <select
                value={selectedSchoolInstId}
                onChange={(e) => setSelectedSchoolInstId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-bold text-[#0369A1] focus:outline-none cursor-pointer"
                title="选择当前登录高校管理员绑定的院校ID"
              >
                {institutions.slice(0, 8).map((inst) => {
                  const cnt = platformUsers.filter(
                    (u) =>
                      u.tags?.includes('高校管理员') &&
                      u.managedInstitutionId === inst.id
                  ).length;
                  return (
                    <option key={inst.id} value={inst.id}>
                      绑定院校：{inst.name} (ID:{inst.id} · 管理员{cnt}人)
                    </option>
                  );
                })}
              </select>
            )}

            <button
              type="button"
              onClick={onBackToFrontend}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>返回前台查看实时效果</span>
            </button>
          </div>
        </header>

        {/* 全局操作反馈提示 */}
        {adminToast && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{adminToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setAdminToast(null)}
              className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 主内容切换：报名管理 / 院校管理 / 内容管理(赛事新闻/赛事动态) / 赛事管理 */}
        <main className="p-6 xl:p-8 2xl:p-10 flex-1 overflow-y-auto">
          {adminRole === 'school_admin' || activeMenu === 'registrations' ? (
            <AdminRegistrationManagement
              competitions={competitions}
              registrationConfigs={registrationConfigs}
              onUpdateRegistrationConfigs={onUpdateRegistrationConfigs}
              captainTeams={captainTeams}
              onUpdateCaptainTeams={onUpdateCaptainTeams}
              platformUsers={platformUsers}
              adminName={effectiveAdminDisplayName}
              adminRole={adminRole}
              adminInstitutionId={currentSchoolInstitution?.id || 'inst-3'}
              adminInstitutionName={
                currentSchoolInstitution?.name || '北京航空航天大学'
              }
              onAddAuditLog={onAddAuditLog}
              onSendSystemNotification={onSendSystemNotification}
              onToast={showToast}
            />
          ) : activeMenu === 'institutions' ? (
            <AdminInstitutionManagement
              institutions={institutions}
              onChangeInstitutions={onUpdateInstitutions}
              platformUsers={platformUsers}
              onUpdatePlatformUsers={onUpdatePlatformUsers}
              captainTeams={captainTeams}
              onUpdateCaptainTeams={onUpdateCaptainTeams}
            />
          ) : activeMenu === 'users' && onUpdatePlatformUsers ? (
            <AdminUserManagement
              users={platformUsers}
              onUpdateUsers={onUpdatePlatformUsers}
              institutions={institutions}
              onUpdateInstitutions={onUpdateInstitutions}
              captainTeams={captainTeams}
              currentLoginUsername={adminUsername}
              currentAdminDisplayName={effectiveAdminDisplayName}
              auditLogs={auditLogs}
              onAddAuditLog={onAddAuditLog}
            />
          ) : activeMenu === 'content-news' ? (
            <AdminNewsManagement
              newsList={managedNews}
              onChangeNewsList={onUpdateManagedNews}
            />
          ) : activeMenu === 'content-moments' ? (
            <AdminMomentsManagement
              momentsList={managedMoments}
              onChangeMomentsList={onUpdateManagedMoments}
            />
          ) : subView === 'list' ? (
            <div className="space-y-5">
              {/* 顶部操作与搜索筛选栏 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* 左侧：按状态筛选 + 按赛事名称搜索 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    {/* 状态筛选 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                        状态筛选：
                      </span>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(e.target.value as 'all' | CompetitionCalculatedStatus)
                        }
                        className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                      >
                        <option value="all">全部状态 ({competitions.length})</option>
                        <option value="ongoing">进行中</option>
                        <option value="upcoming">未开始</option>
                        <option value="ended">已结束</option>
                      </select>
                    </div>

                    {/* 赛事名称搜索 */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="输入赛事名称搜索..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 右侧：新增赛事主按钮 */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenCreateForm}
                      className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>新增赛事</span>
                    </button>
                  </div>
                </div>

                {/* 多选批量操作条（设置公开/隐藏） */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">
                      已勾选 <strong className="text-[#0284C7] font-mono-num">{selectedIds.length}</strong> 项赛事
                    </span>
                    <button
                      type="button"
                      disabled={selectedIds.length === 0}
                      onClick={() => handleBatchSetVisibility(true)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>批量设为公开</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedIds.length === 0}
                      onClick={() => handleBatchSetVisibility(false)}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>批量设为隐藏</span>
                    </button>
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        取消选择
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    说明：设为“隐藏”后，该赛事在前台「赛事目录」中立即不可见
                  </span>
                </div>
              </div>

              {/* 赛事管理数据表格 */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 pl-5 pr-2 w-10">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="text-slate-500 hover:text-[#0284C7] cursor-pointer flex items-center"
                            title="全选/取消全选"
                          >
                            {isAllFilteredSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-3.5 px-4 min-w-[260px]">赛事名称</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">起止时间</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">状态</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">赛道数量</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">公开 / 隐藏</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">创建时间</th>
                        <th className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            未找到匹配的赛事记录
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((comp) => {
                          const isChecked = selectedIds.includes(comp.id);
                          const calcStatus = computeCompetitionStatus(comp.startDate, comp.endDate);
                          const statusLabel = getCompetitionStatusLabel(calcStatus);

                          return (
                            <tr
                              key={comp.id}
                              className={`hover:bg-sky-50/40 transition-colors ${
                                isChecked ? 'bg-sky-50/60' : ''
                              }`}
                            >
                              {/* 多选 Checkbox */}
                              <td className="py-4 pl-5 pr-2 align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelectRow(comp.id)}
                                  className="text-slate-400 hover:text-[#0284C7] cursor-pointer flex items-center"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>

                              {/* 赛事名称 */}
                              <td className="py-4 px-4 align-middle">
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                    <CompetitionCoverRender
                                      coverTheme={comp.coverTheme}
                                      customCoverUrl={comp.customCoverUrl}
                                      status={calcStatus}
                                      className="w-full h-full"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => onPreviewCompetitionInFrontend(comp)}
                                      className="font-bold text-slate-900 hover:text-[#0284C7] text-left line-clamp-1 cursor-pointer"
                                      title="点击在前台预览该赛事详情页"
                                    >
                                      {comp.title}
                                    </button>
                                    <div className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                                      {comp.summary}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 起止时间 */}
                              <td className="py-4 px-4 align-middle font-mono-num text-slate-700 whitespace-nowrap">
                                <div>{comp.startDate}</div>
                                <div className="text-slate-400 text-[11px]">至 {comp.endDate}</div>
                              </td>

                              {/* 状态（根据起止时间自动判断） */}
                              <td className="py-4 px-4 align-middle whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full ${getStatusDotClass(
                                      calcStatus
                                    )}`}
                                  />
                                  <span className={getStatusTextClass(calcStatus)}>
                                    {statusLabel}
                                  </span>
                                </div>
                              </td>

                              {/* 赛道数量 */}
                              <td className="py-4 px-4 align-middle whitespace-nowrap">
                                <span
                                  className="font-mono-num font-bold text-slate-800"
                                  title={comp.tracks.map((t) => t.name).join(' / ')}
                                >
                                  {comp.tracks.length} 个赛道
                                </span>
                              </td>

                              {/* 公开 / 隐藏 */}
                              <td className="py-4 px-4 align-middle whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleSingleToggleVisibility(comp)}
                                  className={`inline-flex items-center gap-1.5 font-semibold cursor-pointer ${
                                    comp.isPublic ? 'text-emerald-700' : 'text-slate-400'
                                  }`}
                                  title="点击切换公开/隐藏状态"
                                >
                                  {comp.isPublic ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>公开</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                      <span>隐藏</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              {/* 创建时间 */}
                              <td className="py-4 px-4 align-middle font-mono-num text-slate-500 whitespace-nowrap">
                                {comp.createdAt}
                              </td>

                              {/* 操作：详情、编辑、删除 */}
                              <td className="py-4 pr-5 pl-4 align-middle text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setViewingCompetitionDetail(comp)}
                                    className="text-slate-600 hover:text-[#0284C7] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>详情</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditForm(comp)}
                                    className="text-[#0284C7] hover:text-[#0369A1] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>编辑</span>
                                  </button>

                                  {deleteConfirmId === comp.id ? (
                                    <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-1 rounded">
                                      <span className="text-[11px] text-red-700">确认删除?</span>
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmDelete(comp.id)}
                                        className="text-red-600 font-bold hover:underline cursor-pointer"
                                      >
                                        是
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="text-slate-500 hover:underline cursor-pointer"
                                      >
                                        否
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(comp.id)}
                                      className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>删除</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ===============================================================
               新增 / 编辑赛事表单页
               包含：赛事名称、赛事封面、赛事简介、起止时间、赛程、赛道（自定义添加）、赛事介绍（Markdown文档编辑器）
               =============================================================== */
            <form onSubmit={handleSaveForm} className="max-w-6xl 2xl:max-w-[1440px] mx-auto space-y-6 pb-12">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 xl:p-10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {editingId ? '编辑赛事信息' : '新增赛事'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      保存后将实时同步至前台「赛事目录」与「赛事详情页」
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubView('list')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    返回列表
                  </button>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. 赛事名称 & 公开状态 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-9">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      赛事名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="例如：2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      前台展示状态
                    </label>
                    <select
                      value={formIsPublic ? 'public' : 'hidden'}
                      onChange={(e) => setFormIsPublic(e.target.value === 'public')}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:border-[#0284C7] focus:outline-none cursor-pointer"
                    >
                      <option value="public">公开（前台可见）</option>
                      <option value="hidden">隐藏（前台不可见）</option>
                    </select>
                  </div>
                </div>

                {/* 2. 起止时间 & 自动状态判断预览 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      开始日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      结束日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs text-slate-500 mb-1">系统根据起止时间自动判定状态：</div>
                    <div className="inline-flex items-center gap-2 text-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(
                          previewCalcStatus
                        )}`}
                      />
                      <span className={getStatusTextClass(previewCalcStatus)}>
                        {previewStatusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. 赛事封面配置 */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    赛事封面 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-5 h-44 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                      <CompetitionCoverRender
                        coverTheme={formCoverTheme}
                        customCoverUrl={formCustomCoverUrl}
                        status={previewCalcStatus}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="md:col-span-7 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-1.5">
                          方式一：选择官方内置高保真赛事视觉主题封面
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { key: 'network', label: '网络安全攻防主题' },
                              { key: 'data', label: '数据安全与隐私计算主题' },
                              { key: 'ai', label: '大模型与AI安全主题' },
                            ] as const
                          ).map((theme) => (
                            <button
                              key={theme.key}
                              type="button"
                              onClick={() => {
                                setFormCoverTheme(theme.key);
                                setFormCustomCoverUrl('');
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                formCoverTheme === theme.key && !formCustomCoverUrl
                                  ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="text-xs font-semibold text-slate-600">
                          方式二：上传本地图片或填写自定义封面图 URL
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={formCustomCoverUrl}
                            onChange={(e) => setFormCustomCoverUrl(e.target.value)}
                            placeholder="输入图片 URL 或点击右侧上传本地封面图..."
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                          />
                          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>上传封面</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. 赛事简介 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    赛事简介 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="简要介绍本项赛事的核心方向、赛制特色与参赛价值（将在赛事目录长条卡片及详情页顶部展示）..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                {/* 5. 自定义标签配置 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    自定义标签（在赛事目录卡片及详情页顶部展示）
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {formCustomTags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-[#0369A1]"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormCustomTags((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTagInput.trim()) {
                            setFormCustomTags((prev) => [...prev, newTagInput.trim()]);
                            setNewTagInput('');
                          }
                        }
                      }}
                      placeholder="输入标签名称后点击添加（如：CTF夺旗赛）"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTagInput.trim()) {
                          setFormCustomTags((prev) => [...prev, newTagInput.trim()]);
                          setNewTagInput('');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      + 添加标签
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. 赛道（自定义添加） */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0284C7]" />
                      <span>赛道配置（自定义添加，当前共 {formTracks.length} 个赛道）</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      添加的赛道将自动计入列表“赛道数量”，并供选手在详情页报名时选择
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormTracks((prev) => [
                        ...prev,
                        { id: `trk-${Date.now()}-${prev.length}`, name: '', description: '' },
                      ])
                    }
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加赛道</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formTracks.map((trk, idx) => (
                    <div
                      key={trk.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      <span className="text-xs font-mono-num font-bold text-[#0284C7] shrink-0">
                        赛道 0{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={trk.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormTracks((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder="赛道名称（如：Web应用与云原生攻防赛道）"
                        className="w-full sm:w-64 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none font-semibold"
                      />
                      <input
                        type="text"
                        value={trk.description || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormTracks((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, description: val } : item
                            )
                          );
                        }}
                        placeholder="赛道考核内容简述（选填）"
                        className="flex-1 w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormTracks((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer shrink-0"
                        title="删除该赛道"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. 赛程配置（对应详情页右栏纵向时间轴） */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0284C7]" />
                      <span>比赛赛程配置（对应详情页右栏纵向时间轴）</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      按先后顺序配置各赛程阶段名称、起止时间段及阶段说明
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormSchedule((prev) => [
                        ...prev,
                        {
                          id: `st-${Date.now()}-${prev.length}`,
                          stage: '',
                          dateRange: '',
                          description: '',
                        },
                      ])
                    }
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加赛程阶段</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formSchedule.map((st, idx) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                          <span className="text-xs font-mono-num font-bold text-[#0284C7] shrink-0">
                            阶段 0{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={st.stage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormSchedule((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, stage: val } : item))
                              );
                            }}
                            placeholder="阶段名称（如：全国线上初赛）"
                            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold focus:border-[#0284C7] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={st.dateRange}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormSchedule((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, dateRange: val } : item
                                )
                              );
                            }}
                            placeholder="时间范围（如：2026-11-22 ~ 2026-11-23）"
                            className="flex-1 px-3 py-1.5 text-xs font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormSchedule((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-red-500 hover:text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>删除</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={st.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormSchedule((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, description: val } : item
                            )
                          );
                        }}
                        placeholder="阶段详细说明（如：48小时连续在线解题比拼，前60支高校战队晋级总决赛）"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. 赛事介绍（Markdown 文档编辑器） */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0284C7]" />
                      <span>赛事介绍（Markdown 文档编辑器）</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      支持 Markdown 语法自由编辑，保存后渲染于前台赛事详情页左栏
                    </p>
                  </div>

                  {/* 编辑器视图模式切换 */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                    {(
                      [
                        { key: 'split', label: '分栏实时预览' },
                        { key: 'edit', label: '纯编辑模式' },
                        { key: 'preview', label: '纯预览模式' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMdEditorMode(m.key)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          mdEditorMode === m.key
                            ? 'bg-white text-[#0284C7] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Markdown 快捷语法工具栏 */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('# 一级标题')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                    <span>H1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('## 二级章节标题')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                    <span>H2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('**加粗重点文本**')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Bold className="w-3.5 h-3.5" />
                    <span>加粗</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('- 列表条目一\n- 列表条目二')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>无序列表</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('> 重要赛事纪律或合规提示引用块')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>引用</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertMarkdownSnippet('```bash\n# 终端命令或代码示例\ndocker pull xxcup/arena:latest\n```')
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>代码块</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('---')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>分割线</span>
                  </button>
                </div>

                {/* 编辑区与实时预览区 */}
                <div
                  className={`grid gap-4 ${
                    mdEditorMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {(mdEditorMode === 'split' || mdEditorMode === 'edit') && (
                    <div className="flex flex-col">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        Markdown 源码编辑区：
                      </div>
                      <textarea
                        rows={16}
                        value={formMarkdown}
                        onChange={(e) => setFormMarkdown(e.target.value)}
                        placeholder="请输入 Markdown 格式的赛事介绍..."
                        className="w-full p-4 font-mono-num text-xs leading-relaxed bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                  )}

                  {(mdEditorMode === 'split' || mdEditorMode === 'preview') && (
                    <div className="flex flex-col">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        前台详情页实时渲染预览：
                      </div>
                      <div className="flex-1 p-5 rounded-xl border border-slate-200 bg-slate-50/50 max-h-[420px] overflow-y-auto">
                        <MarkdownDocumentRenderer content={formMarkdown} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 底部提交保存按钮栏 */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubView('list')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  取消返回
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {editingId ? '保存修改并同步前台' : '确认创建赛事'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* 后台【赛事详情】只读弹窗（含报名模式及联动状态展示） */}
      {viewingCompetitionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#072A47] to-[#0284C7] text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-sky-200">赛事管理 · 详情视图</div>
                <h3 className="text-base font-extrabold">{viewingCompetitionDetail.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingCompetitionDetail(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-400">赛事 ID</div>
                  <div className="font-mono-num font-bold text-slate-800 mt-0.5">
                    {viewingCompetitionDetail.id}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">关联报名状态</div>
                  <div className="font-bold text-[#0284C7] mt-0.5">
                    {registrationConfigs.some(
                      (rc) => rc.eventId === viewingCompetitionDetail.id && !rc.isDisabled
                    )
                      ? '已在【报名管理】关联报名'
                      : '未关联报名'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">起止日期</div>
                  <div className="font-mono-num font-bold text-slate-800 mt-0.5">
                    {viewingCompetitionDetail.startDate} 至 {viewingCompetitionDetail.endDate}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">前台公开状态</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {viewingCompetitionDetail.isPublic ? '公开（前台可见）' : '隐藏（前台不可见）'}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1">赛事简介</div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {viewingCompetitionDetail.summary}
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1.5">
                  下设赛道（{viewingCompetitionDetail.tracks.length} 个）
                </div>
                <div className="space-y-1.5">
                  {viewingCompetitionDetail.tracks.map((t, i) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800">
                        0{i + 1}. {t.name}
                      </span>
                      <span className="text-slate-500">{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewingCompetitionDetail(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  关闭
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingCompetitionDetail;
                    setViewingCompetitionDetail(null);
                    handleOpenEditForm(target);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold cursor-pointer"
                >
                  编辑该赛事
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
