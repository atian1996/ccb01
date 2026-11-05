import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  RotateCcw,
  Plus,
  Ban,
  CheckCircle2,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  Edit3,
  KeyRound,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  ShieldAlert,
  User,
  Building2,
  Clock,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Crop,
  FileText,
  Sparkles,
  Check,
  History,
} from 'lucide-react';
import {
  resolveTeamAuditStages,
  isUserAccountExpired,
  getEffectiveUserStatus,
  type PlatformDirectoryUser,
  type UserBaseRole,
  type UserExtendedRole,
  type UserAccountStatus,
  type UserIdCardType,
  type CaptainTeamRecord,
} from './TeamRegistrationSystem';
import type { InstitutionRecord } from './InstitutionAndContentManagement';
import type { AuditLogEntry } from './AuthAndUserCenter';

// ============================================================================
// 脱敏与校验工具函数
// ============================================================================

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '-';
  const cleaned = phone.trim();
  if (/^\d{11}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`;
  }
  return cleaned;
}

export function maskIdCardNumber(idNumber?: string): string {
  if (!idNumber) return '-';
  const cleaned = idNumber.trim();
  if (cleaned.length >= 15) {
    return `${cleaned.slice(0, 3)}***********${cleaned.slice(-4)}`;
  }
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 2)}****${cleaned.slice(-2)}`;
  }
  return cleaned;
}

// 18位二代居民身份证格式与校验码规则验证（兼容标准18位身份证）
export function validateChineseIdCard18(idCard: string): { valid: boolean; message?: string } {
  const cleaned = idCard.trim().toUpperCase();
  if (!/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/.test(cleaned)) {
    return {
      valid: false,
      message: '身份证号格式不正确（须为18位有效二代身份证号，含合法省市码与出生日期）',
    };
  }
  return { valid: true };
}

export function validatePassportNumber(passport: string): { valid: boolean; message?: string } {
  const cleaned = passport.trim().toUpperCase();
  if (!/^[A-Z0-9]{5,17}$/.test(cleaned)) {
    return {
      valid: false,
      message: '护照号码格式不正确（须为5-17位字母或数字组合）',
    };
  }
  return { valid: true };
}

const BASE_ROLE_OPTIONS: UserBaseRole[] = ['普通用户', '学生', '教师'];
const EXTENDED_ROLE_OPTIONS: UserExtendedRole[] = ['专家', '高校管理员', '秘书处'];

interface ImportErrorItem {
  rowNumber: number;
  username: string;
  realName: string;
  phone: string;
  errorReason: string;
}

interface ImportSummaryResult {
  successAddedCount: number;
  skippedExistingCount: number;
  skippedDetails: { rowNumber: number; username: string; phone: string; reason: string }[];
  errors: ImportErrorItem[];
  abortedDueToError: boolean;
}

interface AdminUserManagementProps {
  users: PlatformDirectoryUser[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<PlatformDirectoryUser[]>>;
  institutions: InstitutionRecord[];
  onUpdateInstitutions: React.Dispatch<React.SetStateAction<InstitutionRecord[]>>;
  captainTeams: CaptainTeamRecord[];
  currentLoginUsername: string;
  currentAdminDisplayName: string;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onUpdateUsers,
  institutions,
  onUpdateInstitutions,
  captainTeams,
  currentLoginUsername,
  currentAdminDisplayName,
  auditLogs,
  onAddAuditLog,
}) => {
  // --- 自动过期同步：当 当前时间 > 用户过期时间，账号状态自动转为“停用” ---
  useEffect(() => {
    const hasNewlyExpired = users.some(
      (u) => !u.isDeleted && u.status !== '停用' && isUserAccountExpired(u.expireTime)
    );
    if (hasNewlyExpired) {
      onUpdateUsers((prev) =>
        prev.map((u) => {
          if (!u.isDeleted && u.status !== '停用' && isUserAccountExpired(u.expireTime)) {
            return { ...u, status: '停用' };
          }
          return u;
        })
      );
    }
  }, [users, onUpdateUsers]);

  // --- 1. 顶部筛选区状态（输入框草稿态 + 点击【查询】应用态） ---
  const [keywordInput, setKeywordInput] = useState('');
  const [roleFilterInput, setRoleFilterInput] = useState<
    '全部' | UserBaseRole | UserExtendedRole
  >('全部');
  const [statusFilterInput, setStatusFilterInput] = useState<'全部' | UserAccountStatus>('全部');

  const [appliedFilter, setAppliedFilter] = useState<{
    keyword: string;
    role: '全部' | UserBaseRole | UserExtendedRole;
    status: '全部' | UserAccountStatus;
  }>({
    keyword: '',
    role: '全部',
    status: '全部',
  });

  // --- 列表多选与底部分页状态 ---
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- 提示横幅与错误拦截弹窗 ---
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // --- 弹窗/抽屉控制状态 ---
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const [resetPwdTargetUser, setResetPwdTargetUser] = useState<PlatformDirectoryUser | null>(null);
  const [newResetPasswordValue, setNewResetPasswordValue] = useState('Sec2026@Reset');
  const [detailTargetUser, setDetailTargetUser] = useState<PlatformDirectoryUser | null>(null);
  const [detailShowRawSensitive, setDetailShowRawSensitive] = useState(false);
  const [showExportAuditDrawer, setShowExportAuditDrawer] = useState(false);

  // --- 新增/编辑用户抽屉表单状态 ---
  const [userFormDrawerOpen, setUserFormDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformDirectoryUser | null>(null);

  const [formAvatar, setFormAvatar] = useState<string>('');
  const [avatarCropModalSource, setAvatarCropModalSource] = useState<string | null>(null);
  const [avatarCropZoom, setAvatarCropZoom] = useState<number>(1);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formRealName, setFormRealName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIdType, setFormIdType] = useState<UserIdCardType>('身份证');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formHasBoundPhone, setFormHasBoundPhone] = useState<boolean>(true);
  const [formHasBoundEmail, setFormHasBoundEmail] = useState<boolean>(true);
  const [formIsRealNameVerified, setFormIsRealNameVerified] = useState<boolean>(true);
  // 编辑状态下证件号默认脱敏显示，点击后可修改
  const [isEditingIdNumberUnlocked, setIsEditingIdNumberUnlocked] = useState(true);

  const [formBaseRole, setFormBaseRole] = useState<UserBaseRole>('普通用户');
  const [formExtendedRoles, setFormExtendedRoles] = useState<UserExtendedRole[]>([]);
  const [formInstitutionId, setFormInstitutionId] = useState<string>('');
  const [institutionSearchKeyword, setInstitutionSearchKeyword] = useState('');
  const [institutionDropdownOpen, setInstitutionDropdownOpen] = useState(false);

  const [formExpirePreset, setFormExpirePreset] = useState<'permanent' | 'one_year' | 'custom'>(
    'permanent'
  );
  const [formExpireTime, setFormExpireTime] = useState<string>('');
  const [formStatus, setFormStatus] = useState<UserAccountStatus>('正常');
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  // --- 批量导入弹窗状态 ---
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportSummaryResult | null>(null);

  // --- 软删除过滤后的可见用户列表（底层 is_deleted = 1 不在后台列表展示） ---
  const activeUsers = useMemo(() => {
    return users.filter((u) => !u.isDeleted);
  }, [users]);

  // 获取用户规范化角色信息
  const getUserNormalizedRoles = (user: PlatformDirectoryUser) => {
    const baseRole: UserBaseRole =
      user.baseRole || (user.identityType === 'teacher' ? '教师' : '学生');
    const extSet = new Set<UserExtendedRole>(user.extendedRoles || []);
    if (user.tags?.includes('高校管理员')) extSet.add('高校管理员');
    if (user.tags?.includes('秘书处') || user.tags?.includes('秘书处管理员')) {
      extSet.add('秘书处');
    }
    if (user.tags?.includes('专家')) extSet.add('专家');
    return {
      baseRole,
      extendedRoles: Array.from(extSet),
    };
  };

  // --- 多条件组合过滤 ---
  const filteredUsers = useMemo(() => {
    return activeUsers.filter((user) => {
      const { baseRole, extendedRoles } = getUserNormalizedRoles(user);
      const effectiveStatus = getEffectiveUserStatus(user);

      // 1. 关键字模糊匹配（用户名/真实姓名/手机号/邮箱/证件号）
      if (appliedFilter.keyword.trim()) {
        const kw = appliedFilter.keyword.trim().toLowerCase();
        const matchUsername = (user.username || '').toLowerCase().includes(kw);
        const matchRealName = (user.realName || user.name || '').toLowerCase().includes(kw);
        const matchPhone = (user.phone || '').toLowerCase().includes(kw);
        const matchEmail = (user.email || '').toLowerCase().includes(kw);
        const matchIdNumber = (user.idNumber || '').toLowerCase().includes(kw);
        if (
          !matchUsername &&
          !matchRealName &&
          !matchPhone &&
          !matchEmail &&
          !matchIdNumber
        ) {
          return false;
        }
      }

      // 2. 角色筛选（全部 / 普通用户 / 学生 / 教师 / 专家 / 高校管理员 / 秘书处）
      if (appliedFilter.role !== '全部') {
        if (
          appliedFilter.role === '普通用户' ||
          appliedFilter.role === '学生' ||
          appliedFilter.role === '教师'
        ) {
          if (baseRole !== appliedFilter.role) return false;
        } else {
          if (!extendedRoles.includes(appliedFilter.role as UserExtendedRole)) return false;
        }
      }

      // 3. 状态筛选（全部 / 正常 / 停用）
      if (appliedFilter.status !== '全部') {
        if (effectiveStatus !== appliedFilter.status) return false;
      }

      return true;
    });
  }, [activeUsers, appliedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // 查询与重置
  const handleQuerySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedFilter({
      keyword: keywordInput,
      role: roleFilterInput,
      status: statusFilterInput,
    });
    setCurrentPage(1);
    setSelectedUserIds([]);
  };

  const handleResetFilter = () => {
    setKeywordInput('');
    setRoleFilterInput('全部');
    setStatusFilterInput('全部');
    setAppliedFilter({
      keyword: '',
      role: '全部',
      status: '全部',
    });
    setCurrentPage(1);
    setSelectedUserIds([]);
  };

  // 全选 / 单选
  const isCurrentPageAllSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUserIds.includes(u.id));

  const handleToggleSelectAllPage = () => {
    if (isCurrentPageAllSelected) {
      const pageIdSet = new Set(paginatedUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !pageIdSet.has(id)));
    } else {
      const merged = new Set([...selectedUserIds, ...paginatedUsers.map((u) => u.id)]);
      setSelectedUserIds(Array.from(merged));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 校验某用户是否为当前登录管理员本人（防自删/自禁用保护）
  const isSelfAccount = (user: PlatformDirectoryUser): boolean => {
    const loginClean = currentLoginUsername.trim().toLowerCase();
    return Boolean(
      user.id === 'u-super-admin' ||
        (user.username || '').toLowerCase() === loginClean ||
        (user.realName && currentAdminDisplayName.includes(user.realName))
    );
  };

  // 校验某院校是否仍有未完成的高校审核任务（高校审核状态为“待审核”的已提交队伍）
  const getPendingUniversityReviewCount = (institutionId?: string, institutionName?: string): number => {
    if (!institutionId && !institutionName) return 0;
    const instObj = institutions.find(
      (i) => i.id === institutionId || i.name === institutionName
    );
    const targetSchoolName = instObj?.name || institutionName || '';
    if (!targetSchoolName) return 0;

    return captainTeams.filter((team) => {
      if (team.status === 'draft' || team.status === 'inviting') return false;
      if (team.university !== targetSchoolName) return false;
      const stages = resolveTeamAuditStages(team);
      return stages.schoolStatus === 'pending';
    }).length;
  };

  // ============================================================================
  // 2. 列表操作栏：批量禁用、批量恢复、批量删除
  // ============================================================================

  const handleBatchDisable = () => {
    if (selectedUserIds.length === 0) {
      showFeedback('请先在列表中勾选需要禁用的用户', 'warning');
      return;
    }
    const selectedUsers = activeUsers.filter((u) => selectedUserIds.includes(u.id));
    if (selectedUsers.some((u) => isSelfAccount(u))) {
      showFeedback('不能删除或禁用当前登录账号！', 'error');
      return;
    }

    onUpdateUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: '停用' } : u))
    );
    onAddAuditLog({
      operator: currentAdminDisplayName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: '后台管理系统',
      action: '用户管理-批量禁用账号',
      result: '成功',
      detail: `批量将 ${selectedUsers.length} 个用户状态变更为“停用”（${selectedUsers
        .map((u) => u.username || u.name)
        .join('、')}）`,
    });
    showFeedback(`已将选中的 ${selectedUsers.length} 个用户状态变更为「停用」`, 'success');
    setSelectedUserIds([]);
  };

  const handleBatchRestore = () => {
    if (selectedUserIds.length === 0) {
      showFeedback('请先在列表中勾选需要恢复的用户', 'warning');
      return;
    }
    const selectedUsers = activeUsers.filter((u) => selectedUserIds.includes(u.id));
    onUpdateUsers((prev) =>
      prev.map((u) => {
        if (!selectedUserIds.includes(u.id)) return u;
        // 若此前因过期而自动停用，恢复时将过期时间重置为永久有效或保持正常
        const expired = isUserAccountExpired(u.expireTime);
        return {
          ...u,
          status: '正常',
          expireTime: expired ? null : u.expireTime,
        };
      })
    );
    onAddAuditLog({
      operator: currentAdminDisplayName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: '后台管理系统',
      action: '用户管理-批量恢复账号',
      result: '成功',
      detail: `批量恢复 ${selectedUsers.length} 个用户状态为“正常”（${selectedUsers
        .map((u) => u.username || u.name)
        .join('、')}）`,
    });
    showFeedback(`已将选中的 ${selectedUsers.length} 个用户状态恢复为「正常」`, 'success');
    setSelectedUserIds([]);
  };

  const handleBatchDeleteClick = () => {
    if (selectedUserIds.length === 0) {
      showFeedback('请先在列表中勾选需要删除的用户', 'warning');
      return;
    }
    const selectedUsers = activeUsers.filter((u) => selectedUserIds.includes(u.id));
    if (selectedUsers.some((u) => isSelfAccount(u))) {
      showFeedback('不能删除或禁用当前登录账号！', 'error');
      return;
    }
    setBatchDeleteConfirmOpen(true);
  };

  const confirmBatchSoftDelete = () => {
    const selectedUsers = activeUsers.filter((u) => selectedUserIds.includes(u.id));
    if (selectedUsers.some((u) => isSelfAccount(u))) {
      setBatchDeleteConfirmOpen(false);
      showFeedback('不能删除或禁用当前登录账号！', 'error');
      return;
    }

    onUpdateUsers((prev) =>
      prev.map((u) =>
        selectedUserIds.includes(u.id)
          ? {
              ...u,
              isDeleted: true, // 底层软删除 is_deleted = 1，保留队长/队员外键关联
              status: '停用',
            }
          : u
      )
    );
    onAddAuditLog({
      operator: currentAdminDisplayName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: '后台管理系统',
      action: '用户管理-批量删除账号(软删除)',
      result: '成功',
      detail: `软删除 ${selectedUsers.length} 个用户（is_deleted=1，保留历史报名队伍外键关联）：${selectedUsers
        .map((u) => u.username || u.name)
        .join('、')}`,
    });
    setBatchDeleteConfirmOpen(false);
    showFeedback(
      `已成功删除选中的 ${selectedUsers.length} 个用户（底层已执行 is_deleted=1 软删除，历史报名关联不受影响）`,
      'success'
    );
    setSelectedUserIds([]);
  };

  // ============================================================================
  // 3. 新增 / 编辑用户表单逻辑
  // ============================================================================

  const computeOneYearLaterString = (): string => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  const handleOpenAddUserDrawer = () => {
    setEditingUser(null);
    setFormAvatar('');
    setFormUsername('');
    setFormPassword('');
    setShowFormPassword(false);
    setFormHasBoundPhone(true);
    setFormPhone('');
    setFormHasBoundEmail(true);
    setFormEmail('');
    setFormIsRealNameVerified(true);
    setFormRealName('');
    setFormIdType('身份证');
    setFormIdNumber('');
    setIsEditingIdNumberUnlocked(true);
    setFormBaseRole('普通用户');
    setFormExtendedRoles([]);
    setFormInstitutionId('');
    setInstitutionSearchKeyword('');
    setInstitutionDropdownOpen(false);
    setFormExpirePreset('permanent');
    setFormExpireTime('');
    setFormStatus('正常');
    setFormErrorMsg(null);
    setUserFormDrawerOpen(true);
  };

  const handleOpenEditUserDrawer = (user: PlatformDirectoryUser) => {
    const { baseRole, extendedRoles } = getUserNormalizedRoles(user);
    const effectiveStatus = getEffectiveUserStatus(user);
    const hasPhone = Boolean(user.phone && user.phone.trim());
    const hasEmail = Boolean(user.email && user.email.trim());
    const hasRealName = Boolean(
      user.isRealNameVerified &&
        user.realName &&
        user.realName.trim() &&
        user.realName.trim() !== '-'
    );

    setEditingUser(user);
    setFormAvatar(user.avatar || '');
    setFormUsername(user.username || '');
    setFormPassword('');
    setShowFormPassword(false);
    setFormHasBoundPhone(hasPhone);
    setFormPhone(hasPhone ? user.phone || '' : '');
    setFormHasBoundEmail(hasEmail);
    setFormEmail(hasEmail ? user.email || '' : '');
    setFormIsRealNameVerified(hasRealName);
    setFormRealName(
      hasRealName ? user.realName || user.name.replace(/（.*?）/g, '').trim() : ''
    );
    setFormIdType('身份证');
    setFormIdNumber(hasRealName ? user.idNumber || '' : '');
    // 编辑状态下证件号默认脱敏显示，点击可修改
    setIsEditingIdNumberUnlocked(!hasRealName);

    setFormBaseRole(baseRole);
    setFormExtendedRoles(extendedRoles);

    const matchedInst =
      institutions.find((i) => i.id === user.managedInstitutionId) ||
      institutions.find((i) => i.name === user.university);
    setFormInstitutionId(
      extendedRoles.includes('高校管理员') ? matchedInst?.id || user.managedInstitutionId || '' : ''
    );
    setInstitutionSearchKeyword('');
    setInstitutionDropdownOpen(false);

    if (user.expireTime && user.expireTime.trim()) {
      setFormExpirePreset('custom');
      setFormExpireTime(user.expireTime.trim());
    } else {
      setFormExpirePreset('permanent');
      setFormExpireTime('');
    }
    setFormStatus(effectiveStatus);
    setFormErrorMsg(null);
    setUserFormDrawerOpen(true);
  };

  // 切换扩展身份复选框（含取消勾选“高校管理员”时的待办任务拦截与所属院校清理）
  const handleToggleExtendedRoleInForm = (role: UserExtendedRole) => {
    setFormErrorMsg(null);
    const currentlyChecked = formExtendedRoles.includes(role);

    if (currentlyChecked) {
      // 若在编辑用户时取消勾选“高校管理员”，需先校验该用户所属院校是否还有未完成的高校审核任务
      if (role === '高校管理员' && editingUser) {
        const hadSchoolAdminOriginally =
          editingUser.extendedRoles?.includes('高校管理员') ||
          editingUser.tags?.includes('高校管理员');
        if (hadSchoolAdminOriginally) {
          const pendingCount = getPendingUniversityReviewCount(
            editingUser.managedInstitutionId || formInstitutionId,
            editingUser.university
          );
          if (pendingCount > 0) {
            setFormErrorMsg('该用户尚有未完成的高校审核任务，请先移交');
            showFeedback('该用户尚有未完成的高校审核任务，请先移交', 'error');
            return;
          }
        }
      }

      const nextRoles = formExtendedRoles.filter((r) => r !== role);
      setFormExtendedRoles(nextRoles);
      if (role === '高校管理员') {
        // 若无未完成高校审核任务，自动清空其绑定的【所属院校】字段
        setFormInstitutionId('');
      }
    } else {
      setFormExtendedRoles([...formExtendedRoles, role]);
    }
  };

  // 上传头像文件并打开裁剪预览
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarCropModalSource(reader.result);
        setAvatarCropZoom(1);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmAvatarCrop = () => {
    if (avatarCropModalSource) {
      setFormAvatar(avatarCropModalSource);
      setAvatarCropModalSource(null);
    }
  };

  // 保存新增或编辑的用户
  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg(null);

    const trimmedUsername = formUsername.trim();
    const trimmedRealName = formIsRealNameVerified ? formRealName.trim() : '';
    const trimmedPhone = formHasBoundPhone ? formPhone.trim() : '';
    const trimmedEmail = formHasBoundEmail ? formEmail.trim() : '';
    const trimmedIdNumber = formIsRealNameVerified ? formIdNumber.trim().toUpperCase() : '';

    // 1. 必填与格式校验
    if (!trimmedUsername) {
      setFormErrorMsg('请输入用户名');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(trimmedUsername)) {
      setFormErrorMsg('用户名格式有误（需为 3-24 位字母、数字或下划线）');
      return;
    }
    if (!editingUser && !formPassword.trim()) {
      setFormErrorMsg('新增用户时密码为必填项');
      return;
    }
    if (formPassword.trim() && (formPassword.trim().length < 6 || formPassword.trim().length > 24)) {
      setFormErrorMsg('密码长度需在 6-24 位之间');
      return;
    }
    if (formHasBoundPhone) {
      if (!/^1[3-9]\d{9}$/.test(trimmedPhone)) {
        setFormErrorMsg('手机号格式不正确（请输入有效的11位中国大陆手机号）');
        return;
      }
    }
    if (formHasBoundEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setFormErrorMsg('邮箱格式不正确');
        return;
      }
    }
    if (formIsRealNameVerified) {
      if (!trimmedRealName) {
        setFormErrorMsg('请输入真实姓名');
        return;
      }
      if (!trimmedIdNumber) {
        setFormErrorMsg('请输入身份证号');
        return;
      }
      const idCheck = validateChineseIdCard18(trimmedIdNumber);
      if (!idCheck.valid) {
        setFormErrorMsg(idCheck.message || '身份证号格式不正确');
        return;
      }
    }

    // 2. 全局唯一性校验（用户名、已绑定的手机号、已绑定的邮箱、已认证的身份证号在系统中必须全局唯一）
    const otherUsers = activeUsers.filter((u) => (editingUser ? u.id !== editingUser.id : true));

    if (
      otherUsers.some(
        (u) => (u.username || '').toLowerCase() === trimmedUsername.toLowerCase()
      )
    ) {
      setFormErrorMsg(`用户名「${trimmedUsername}」在系统中已存在，请保持全局唯一`);
      return;
    }
    if (
      formHasBoundPhone &&
      trimmedPhone &&
      otherUsers.some((u) => (u.phone || '').trim() === trimmedPhone)
    ) {
      setFormErrorMsg(`手机号「${trimmedPhone}」已被其他账号绑定，请保持全局唯一`);
      return;
    }
    if (
      formHasBoundEmail &&
      trimmedEmail &&
      otherUsers.some(
        (u) => (u.email || '').trim().toLowerCase() === trimmedEmail.toLowerCase()
      )
    ) {
      setFormErrorMsg(`邮箱「${trimmedEmail}」已被其他账号绑定，请保持全局唯一`);
      return;
    }
    if (
      formIsRealNameVerified &&
      trimmedIdNumber &&
      otherUsers.some(
        (u) => (u.idNumber || '').trim().toUpperCase() === trimmedIdNumber
      )
    ) {
      setFormErrorMsg(`身份证号「${maskIdCardNumber(trimmedIdNumber)}」在系统中已存在，严禁重复注册`);
      return;
    }

    // 3. 防自禁用保护
    if (editingUser && isSelfAccount(editingUser) && formStatus === '停用') {
      setFormErrorMsg('不能删除或禁用当前登录账号！');
      return;
    }

    // 4. 计算过期时间与过期自动转停用
    let finalExpireTime: string | null = null;
    if (formExpirePreset === 'one_year') {
      finalExpireTime = formExpireTime.trim() || computeOneYearLaterString();
    } else if (formExpirePreset === 'custom') {
      if (!formExpireTime.trim()) {
        setFormErrorMsg('请选择或输入具体的指定过期日期时间（精确到秒）');
        return;
      }
      finalExpireTime = formExpireTime.trim();
    }

    const isAlreadyExpired = isUserAccountExpired(finalExpireTime);
    const finalStatus: UserAccountStatus = isAlreadyExpired ? '停用' : formStatus;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const displayLabelName = formIsRealNameVerified ? trimmedRealName : trimmedUsername;

    if (editingUser) {
      onUpdateUsers((prev) =>
        prev.map((u) => {
          if (u.id !== editingUser.id) return u;
          return {
            ...u,
            avatar: formAvatar || undefined,
            password: formPassword.trim() ? formPassword.trim() : u.password,
            realName: formIsRealNameVerified ? trimmedRealName : '',
            name: formIsRealNameVerified ? trimmedRealName : trimmedUsername,
            phone: formHasBoundPhone ? trimmedPhone : '',
            email: formHasBoundEmail ? trimmedEmail : '',
            idType: '身份证',
            idNumber: formIsRealNameVerified ? trimmedIdNumber : '',
            isRealNameVerified: formIsRealNameVerified,
            expireTime: finalExpireTime,
            status: finalStatus,
          };
        })
      );

      onAddAuditLog({
        operator: currentAdminDisplayName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: '后台管理系统',
        action: '用户管理-编辑用户',
        result: '成功',
        detail: `编辑用户「${trimmedUsername} (${displayLabelName})」，手机绑定：${
          formHasBoundPhone ? '是' : '否'
        }，邮箱绑定：${formHasBoundEmail ? '是' : '否'}，实名认证：${
          formIsRealNameVerified ? '是' : '否'
        }，状态：${finalStatus}`,
      });

      showFeedback(
        `已保存用户「${trimmedUsername}（${displayLabelName}）」的配置修改${
          isAlreadyExpired ? '（检测到过期时间早于当前时间，状态已自动转为停用）' : ''
        }`,
        'success'
      );
    } else {
      const newUser: PlatformDirectoryUser = {
        id: `u-custom-${Date.now()}`,
        username: trimmedUsername,
        password: formPassword.trim(),
        avatar: formAvatar || undefined,
        name: displayLabelName,
        realName: formIsRealNameVerified ? trimmedRealName : '',
        phone: formHasBoundPhone ? trimmedPhone : '',
        email: formHasBoundEmail ? trimmedEmail : '',
        idType: '身份证',
        idNumber: formIsRealNameVerified ? trimmedIdNumber : '',
        baseRole: '普通用户',
        extendedRoles: [],
        assignedViaInstitutionModule: false,
        expireTime: finalExpireTime,
        status: finalStatus,
        isDeleted: false,
        createdAt: nowStr,
        university: '未绑定院校',
        identityType: 'student',
        isRealNameVerified: formIsRealNameVerified,
        isAcademicOrTeacherVerified: false,
        tagHint: '普通用户',
        tags: [],
      };

      onUpdateUsers((prev) => [newUser, ...prev]);

      onAddAuditLog({
        operator: currentAdminDisplayName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: '后台管理系统',
        action: '用户管理-新增用户',
        result: '成功',
        detail: `新增用户「${trimmedUsername} (${displayLabelName})」，角色：普通用户，手机绑定：${
          formHasBoundPhone ? '是' : '否'
        }，邮箱绑定：${formHasBoundEmail ? '是' : '否'}，实名认证：${
          formIsRealNameVerified ? '是' : '否'
        }`,
      });

      showFeedback(`已成功新增用户「${trimmedUsername}（${displayLabelName}）」`, 'success');
    }

    setUserFormDrawerOpen(false);
  };

  // ============================================================================
  // 4. 重置密码
  // ============================================================================

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdTargetUser) return;
    const pwd = newResetPasswordValue.trim();
    if (pwd.length < 6 || pwd.length > 24) {
      showFeedback('重置密码长度需在 6-24 位之间', 'error');
      return;
    }

    onUpdateUsers((prev) =>
      prev.map((u) => (u.id === resetPwdTargetUser.id ? { ...u, password: pwd } : u))
    );
    onAddAuditLog({
      operator: currentAdminDisplayName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: '后台管理系统',
      action: '用户管理-重置用户密码',
      result: '成功',
      detail: `管理员重置了用户「${resetPwdTargetUser.username || resetPwdTargetUser.name}」的登录密码`,
    });
    showFeedback(
      `已成功将用户「${resetPwdTargetUser.username || resetPwdTargetUser.name}」的密码重置为：${pwd}`,
      'success'
    );
    setResetPwdTargetUser(null);
  };

  // ============================================================================
  // 5. 批量导入、下载模板与脱敏导出逻辑
  // ============================================================================

  const TEMPLATE_HEADERS = [
    '*用户名',
    '*密码',
    '*真实姓名',
    '*手机号',
    '邮箱',
    '*证件类型',
    '*证件号',
    '*基础身份',
    '扩展身份',
    '所属院校',
    '过期时间',
  ];

  // 1) 下载标准模板 `用户导入模板.xlsx`（含第2个Sheet“填写说明”）
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const sampleRows = [
      TEMPLATE_HEADERS,
      [
        'zhangwei2026',
        'Sec2026Pass',
        '张伟',
        '13910886601',
        'zhangwei@buaa.edu.cn',
        '身份证',
        '110108200405162318',
        '学生',
        '',
        '北京航空航天大学',
        '永久有效',
      ],
      [
        'liujiaoshou',
        'Prof2026Pass',
        '刘建华',
        '13810887702',
        'liujianhua@pku.edu.cn',
        '身份证',
        '110108198103224115',
        '教师',
        '专家,高校管理员',
        '北京大学',
        '2027-12-31 23:59:59',
      ],
    ];

    const wsData = XLSX.utils.aoa_to_sheet(sampleRows);
    wsData['!cols'] = [
      { wch: 16 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 24 },
      { wch: 12 },
      { wch: 22 },
      { wch: 12 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsData, '用户导入数据');

    // 第二个 Sheet 页：填写说明（说明角色枚举值、联动要求、证件号规范等）
    const instructionRows = [
      ['字段名称', '是否必填', '允许的枚举值 / 格式规范说明'],
      ['*用户名', '必填', '3-24位字母、数字或下划线，全平台唯一；若用户名或手机号在系统中已存在将自动跳过'],
      ['*密码', '必填', '6-24位字符，建议包含字母与数字'],
      ['*真实姓名', '必填', '用户真实姓名（2-20个字符）'],
      ['*手机号', '必填', '11位中国大陆标准手机号（13-19开头），全平台唯一'],
      ['邮箱', '选填/推荐', '标准电子邮箱格式（如 user@example.edu.cn），全平台唯一'],
      ['*证件类型', '必填', '枚举值仅限：【身份证】、【护照】'],
      ['*证件号', '必填', '身份证须为18位有效二代身份证号码；护照须为5-17位字母或数字，全平台唯一'],
      ['*基础身份', '必填（三选一）', '枚举值仅限：【普通用户】、【学生】、【教师】（三选一互斥）'],
      [
        '扩展身份',
        '选填（可多选叠加）',
        '枚举值仅限：【专家】、【高校管理员】、【秘书处】；多个扩展身份请用英文逗号“,”或顿号“、”分隔',
      ],
      [
        '所属院校',
        '条件必填',
        '当【扩展身份】包含“高校管理员”时必填，且院校全称必须存在于系统【院校管理】标准库中（如：北京大学、清华大学、北京航空航天大学等）',
      ],
      [
        '过期时间',
        '选填',
        '填写“永久有效”或留空表示永不过期；指定日期请按 YYYY-MM-DD HH:mm:ss 格式填写（精确到秒）',
      ],
    ];
    const wsDesc = XLSX.utils.aoa_to_sheet(instructionRows);
    wsDesc['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 76 }];
    XLSX.utils.book_append_sheet(wb, wsDesc, '填写说明');

    XLSX.writeFile(wb, '用户导入模板.xlsx');
    showFeedback('已下载《用户导入模板.xlsx》（含“用户导入数据”与“填写说明”双工作表）', 'success');
  };

  // 2) 批量导入前置校验与执行引擎
  const validateAndProcessImportRows = (rawRows: Record<string, unknown>[], sourceName: string) => {
    setImportFileName(sourceName);

    if (!rawRows || rawRows.length === 0) {
      setImportResult({
        successAddedCount: 0,
        skippedExistingCount: 0,
        skippedDetails: [],
        errors: [
          {
            rowNumber: 1,
            username: '-',
            realName: '-',
            phone: '-',
            errorReason: 'Excel文件中未检测到有效数据行，请使用标准《用户导入模板.xlsx》填写',
          },
        ],
        abortedDueToError: true,
      });
      return;
    }

    // 校验表头是否匹配
    const firstRowKeys = Object.keys(rawRows[0]);
    const requiredHeaderKeys = [
      '*用户名',
      '*密码',
      '*真实姓名',
      '*手机号',
      '*证件类型',
      '*证件号',
      '*基础身份',
    ];
    const missingHeaders = requiredHeaderKeys.filter((rk) => !firstRowKeys.includes(rk));
    if (missingHeaders.length > 0) {
      setImportResult({
        successAddedCount: 0,
        skippedExistingCount: 0,
        skippedDetails: [],
        errors: [
          {
            rowNumber: 1,
            username: '-',
            realName: '-',
            phone: '-',
            errorReason: `模板表头不匹配，缺少必填列：${missingHeaders.join('、')}`,
          },
        ],
        abortedDueToError: true,
      });
      return;
    }

    const errors: ImportErrorItem[] = [];
    const skippedDetails: { rowNumber: number; username: string; phone: string; reason: string }[] =
      [];
    const validNewUsers: PlatformDirectoryUser[] = [];

    // 用于检测 Excel 内部重复数据
    const seenUsernamesInExcel = new Set<string>();
    const seenPhonesInExcel = new Set<string>();
    const seenEmailsInExcel = new Set<string>();
    const seenIdNumbersInExcel = new Set<string>();

    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    rawRows.forEach((row, index) => {
      const excelRowNumber = index + 2; // 第1行为表头，数据从第2行开始
      const username = String(row['*用户名'] ?? '').trim();
      const password = String(row['*密码'] ?? '').trim();
      const realName = String(row['*真实姓名'] ?? '').trim();
      const phone = String(row['*手机号'] ?? '').trim();
      const email = String(row['邮箱'] ?? '').trim();
      const idTypeRaw = String(row['*证件类型'] ?? '').trim();
      const idNumber = String(row['*证件号'] ?? '').trim().toUpperCase();
      const baseRoleRaw = String(row['*基础身份'] ?? '').trim();
      const extRoleRaw = String(row['扩展身份'] ?? '').trim();
      const schoolNameRaw = String(row['所属院校'] ?? '').trim();
      const expireTimeRaw = String(row['过期时间'] ?? '').trim();

      const rowErrorReasons: string[] = [];

      // ① 必填项非空校验
      if (!username) rowErrorReasons.push('用户名不能为空');
      if (!password) rowErrorReasons.push('密码不能为空');
      if (!realName) rowErrorReasons.push('真实姓名不能为空');
      if (!phone) rowErrorReasons.push('手机号不能为空');
      if (!idTypeRaw) rowErrorReasons.push('证件类型不能为空');
      if (!idNumber) rowErrorReasons.push('证件号不能为空');
      if (!baseRoleRaw) rowErrorReasons.push('基础身份不能为空');

      // ② 格式校验
      if (username && !/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
        rowErrorReasons.push('用户名格式错误（需为3-24位字母、数字或下划线）');
      }
      if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
        rowErrorReasons.push('手机号格式错误');
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrorReasons.push('邮箱格式错误');
      }
      if (idTypeRaw && idTypeRaw !== '身份证' && idTypeRaw !== '护照') {
        rowErrorReasons.push(`证件类型枚举值错误（“${idTypeRaw}”不在 [身份证, 护照] 范围内）`);
      } else if (idTypeRaw === '身份证' && idNumber) {
        const idValidation = validateChineseIdCard18(idNumber);
        if (!idValidation.valid) {
          rowErrorReasons.push('身份证号格式错误（非18位有效二代身份证号）');
        }
      } else if (idTypeRaw === '护照' && idNumber) {
        const passValidation = validatePassportNumber(idNumber);
        if (!passValidation.valid) {
          rowErrorReasons.push('护照号码格式错误');
        }
      }

      // ③ 角色枚举值校验
      if (
        baseRoleRaw &&
        !BASE_ROLE_OPTIONS.includes(baseRoleRaw as UserBaseRole)
      ) {
        rowErrorReasons.push(
          `基础身份枚举错误（“${baseRoleRaw}”不在 [普通用户, 学生, 教师] 范围内）`
        );
      }

      const parsedExtRoles: UserExtendedRole[] = [];
      if (extRoleRaw) {
        const parts = extRoleRaw
          .split(/[,，、;；\s]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const p of parts) {
          if (!EXTENDED_ROLE_OPTIONS.includes(p as UserExtendedRole)) {
            rowErrorReasons.push(
              `扩展身份枚举错误（“${p}”不在 [专家, 高校管理员, 秘书处] 范围内）`
            );
          } else if (!parsedExtRoles.includes(p as UserExtendedRole)) {
            parsedExtRoles.push(p as UserExtendedRole);
          }
        }
      }

      // ④ 高校管理员所属院校存在性校验
      let matchedInstitution: InstitutionRecord | undefined;
      if (parsedExtRoles.includes('高校管理员')) {
        if (!schoolNameRaw) {
          rowErrorReasons.push('勾选“高校管理员”时，所属院校不能为空');
        } else {
          matchedInstitution = institutions.find((i) => i.name === schoolNameRaw);
          if (!matchedInstitution) {
            rowErrorReasons.push(
              `所属院校“${schoolNameRaw}”在系统院校管理标准库中不存在`
            );
          }
        }
      } else if (schoolNameRaw) {
        matchedInstitution = institutions.find((i) => i.name === schoolNameRaw);
      }

      // ⑤ Excel 内部重复数据校验
      if (username) {
        const uLower = username.toLowerCase();
        if (seenUsernamesInExcel.has(uLower)) {
          rowErrorReasons.push(`Excel内部用户名“${username}”重复`);
        }
        seenUsernamesInExcel.add(uLower);
      }
      if (phone) {
        if (seenPhonesInExcel.has(phone)) {
          rowErrorReasons.push(`Excel内部手机号“${phone}”重复`);
        }
        seenPhonesInExcel.add(phone);
      }
      if (email) {
        const eLower = email.toLowerCase();
        if (seenEmailsInExcel.has(eLower)) {
          rowErrorReasons.push(`Excel内部邮箱“${email}”重复`);
        }
        seenEmailsInExcel.add(eLower);
      }
      if (idNumber) {
        if (seenIdNumbersInExcel.has(idNumber)) {
          rowErrorReasons.push(`Excel内部证件号“${idNumber}”重复`);
        }
        seenIdNumbersInExcel.add(idNumber);
      }

      if (rowErrorReasons.length > 0) {
        errors.push({
          rowNumber: excelRowNumber,
          username: username || '-',
          realName: realName || '-',
          phone: phone || '-',
          errorReason: `第${excelRowNumber}行：${rowErrorReasons.join('；')}`,
        });
        return;
      }

      // ⑥ 检查是否与系统中已存在用户重复（用户名或手机号已存在 -> 跳过已存在用户并提示“该用户已存在，已跳过”）
      const existingByUsernameOrPhone = activeUsers.find(
        (u) =>
          (u.username || '').toLowerCase() === username.toLowerCase() ||
          u.phone.trim() === phone
      );
      if (existingByUsernameOrPhone) {
        skippedDetails.push({
          rowNumber: excelRowNumber,
          username,
          phone,
          reason: '该用户已存在，已跳过',
        });
        return;
      }

      // 检查邮箱或证件号是否已被系统中其他用户占用
      if (
        email &&
        activeUsers.some((u) => u.email.trim().toLowerCase() === email.toLowerCase())
      ) {
        errors.push({
          rowNumber: excelRowNumber,
          username,
          realName,
          phone,
          errorReason: `第${excelRowNumber}行：邮箱“${email}”已被系统中其他用户占用`,
        });
        return;
      }
      if (
        activeUsers.some((u) => (u.idNumber || '').trim().toUpperCase() === idNumber)
      ) {
        errors.push({
          rowNumber: excelRowNumber,
          username,
          realName,
          phone,
          errorReason: `第${excelRowNumber}行：证件号“${maskIdCardNumber(idNumber)}”已被系统中其他用户占用`,
        });
        return;
      }

      const finalExpire: string | null =
        !expireTimeRaw || expireTimeRaw === '永久有效' ? null : expireTimeRaw;
      const expired = isUserAccountExpired(finalExpire);
      const syncedTags: string[] = [...parsedExtRoles];
      if (parsedExtRoles.includes('秘书处') && !syncedTags.includes('秘书处管理员')) {
        syncedTags.push('秘书处管理员');
      }

      validNewUsers.push({
        id: `u-imp-${Date.now()}-${index}`,
        username,
        password,
        name: realName,
        realName,
        phone,
        email: email || `${username}@student.edu.cn`,
        idType: idTypeRaw as UserIdCardType,
        idNumber,
        baseRole: baseRoleRaw as UserBaseRole,
        extendedRoles: parsedExtRoles,
        assignedViaInstitutionModule: false,
        expireTime: finalExpire,
        status: expired ? '停用' : '正常',
        isDeleted: false,
        createdAt: nowStr,
        university: matchedInstitution?.name || schoolNameRaw || '未绑定院校',
        identityType: baseRoleRaw === '教师' ? 'teacher' : 'student',
        isRealNameVerified: true,
        isAcademicOrTeacherVerified: baseRoleRaw !== '普通用户',
        tagHint: `批量导入 · ${baseRoleRaw}`,
        tags: syncedTags,
        managedInstitutionId: parsedExtRoles.includes('高校管理员')
          ? matchedInstitution?.id
          : undefined,
      });
    });

    // 若存在格式或枚举错误：本次全量不导入，弹窗展示错误列表，并提供【下载错误报告Excel】按钮
    if (errors.length > 0) {
      setImportResult({
        successAddedCount: 0,
        skippedExistingCount: skippedDetails.length,
        skippedDetails,
        errors,
        abortedDueToError: true,
      });
      return;
    }

    // 无错误时执行入库（跳过已存在用户）
    if (validNewUsers.length > 0) {
      onUpdateUsers((prev) => [...validNewUsers, ...prev]);
      onAddAuditLog({
        operator: currentAdminDisplayName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: '后台管理系统',
        action: '用户管理-Excel批量导入用户',
        result: '成功',
        detail: `成功导入新增 ${validNewUsers.length} 名用户，跳过已存在用户 ${skippedDetails.length} 名`,
      });
    }

    setImportResult({
      successAddedCount: validNewUsers.length,
      skippedExistingCount: skippedDetails.length,
      skippedDetails,
      errors: [],
      abortedDueToError: false,
    });
  };

  // 处理真实本地 Excel 文件上传解析
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
        });
        validateAndProcessImportRows(jsonRows, file.name);
      } catch {
        setImportResult({
          successAddedCount: 0,
          skippedExistingCount: 0,
          skippedDetails: [],
          errors: [
            {
              rowNumber: 1,
              username: '-',
              realName: '-',
              phone: '-',
              errorReason: '文件解析失败，请上传标准 .xlsx 或 .xls 格式的 Excel 文件',
            },
          ],
          abortedDueToError: true,
        });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // 下载错误报告 Excel
  const handleDownloadErrorReportExcel = () => {
    if (!importResult || importResult.errors.length === 0) return;
    const wb = XLSX.utils.book_new();
    const rows = [
      ['Excel行号', '用户名', '真实姓名', '手机号', '错误原因明细'],
      ...importResult.errors.map((err) => [
        `第${err.rowNumber}行`,
        err.username,
        err.realName,
        err.phone,
        err.errorReason,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 64 }];
    XLSX.utils.book_append_sheet(wb, ws, '导入错误报告');
    XLSX.writeFile(wb, `用户导入错误报告_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showFeedback('已下载《用户导入错误报告.xlsx》，请修正后重新导入', 'success');
  };

  // 3) 数据导出（严禁包含密码；手机号、身份证号自动脱敏；记录导出审计日志）
  const handleExportUsers = () => {
    const targetExportList =
      selectedUserIds.length > 0
        ? filteredUsers.filter((u) => selectedUserIds.includes(u.id))
        : filteredUsers;

    if (targetExportList.length === 0) {
      showFeedback('当前无可导出的用户数据', 'warning');
      return;
    }

    const exportHeader = [
      '用户名',
      '真实姓名',
      '手机号(已脱敏)',
      '邮箱',
      '证件类型',
      '证件号(已脱敏)',
      '基础身份',
      '扩展身份',
      '所属院校',
      '账号状态',
      '过期时间',
      '创建时间',
    ];

    const exportRows = targetExportList.map((u) => {
      const { baseRole, extendedRoles } = getUserNormalizedRoles(u);
      const effectiveStatus = getEffectiveUserStatus(u);
      const instObj = institutions.find((i) => i.id === u.managedInstitutionId);
      return [
        u.username || '-',
        u.realName || '-',
        maskPhoneNumber(u.phone), // 手机号自动脱敏 如 138****1234
        u.email || '-',
        u.idType || '身份证',
        maskIdCardNumber(u.idNumber), // 身份证号自动脱敏 如 110***********1234
        baseRole,
        extendedRoles.join('、') || '-',
        instObj?.name || u.university || '-',
        effectiveStatus,
        u.expireTime || '永久有效',
        u.createdAt || '2026-09-01 09:00:00',
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([exportHeader, ...exportRows]);
    ws['!cols'] = [
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 24 },
      { wch: 10 },
      { wch: 22 },
      { wch: 12 },
      { wch: 22 },
      { wch: 22 },
      { wch: 10 },
      { wch: 22 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, '用户脱敏导出数据');

    const now = new Date();
    const timeStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    XLSX.writeFile(wb, `平台用户数据导出_${timeStamp}.xlsx`);

    // 自动记录一条导出审计日志（记录导出人、导出时间、导出条数）
    onAddAuditLog({
      operator: currentAdminDisplayName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: '后台管理系统',
      action: '用户管理-导出用户数据(脱敏)',
      result: '成功',
      detail: `导出人：${currentAdminDisplayName}，导出条数：${targetExportList.length} 条（已自动剔除密码字段，并对手机号、证件号执行掩码脱敏处理）`,
    });

    showFeedback(
      `已成功导出 ${targetExportList.length} 条用户数据（密码已剔除，手机号与证件号已自动脱敏，并已记录导出审计日志）`,
      'success'
    );
  };

  // 表单内所属院校下拉搜索过滤
  const filteredInstitutionOptions = useMemo(() => {
    const kw = institutionSearchKeyword.trim().toLowerCase();
    if (!kw) return institutions;
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(kw) ||
        inst.code.toLowerCase().includes(kw) ||
        inst.province.toLowerCase().includes(kw) ||
        inst.city.toLowerCase().includes(kw)
    );
  }, [institutions, institutionSearchKeyword]);

  const selectedFormInstitution = useMemo(
    () => institutions.find((i) => i.id === formInstitutionId),
    [institutions, formInstitutionId]
  );

  // 判断当前编辑用户的高校管理员是否由【院校管理】模块分配（若是则【所属院校】只读回显）
  const isInstitutionReadOnlyEcho = Boolean(
    editingUser &&
      editingUser.assignedViaInstitutionModule &&
      formExtendedRoles.includes('高校管理员') &&
      formInstitutionId
  );

  return (
    <div className="space-y-5">
      {/* 顶部全局反馈提示条 */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between shadow-2xs ${
            toastMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          顶部筛选与操作区（与赛事管理、报名管理无标题排版保持一致）
          ===================================================================== */}
      <form
        onSubmit={handleQuerySubmit}
        className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          {/* 关键字搜索 */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              关键字搜索
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="请输入用户名/真实姓名/手机号/邮箱/证件号"
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
              />
            </div>
          </div>

          {/* 角色筛选 */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              角色筛选
            </label>
            <select
              value={roleFilterInput}
              onChange={(e) =>
                setRoleFilterInput(
                  e.target.value as '全部' | UserBaseRole | UserExtendedRole
                )
              }
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#0284C7] focus:outline-none cursor-pointer"
            >
              <option value="全部">全部</option>
              <option value="普通用户">普通用户（基础身份）</option>
              <option value="学生">学生（基础身份）</option>
              <option value="教师">教师（基础身份）</option>
              <option value="专家">专家（扩展身份）</option>
              <option value="高校管理员">高校管理员（扩展身份）</option>
              <option value="秘书处">秘书处（扩展身份）</option>
            </select>
          </div>

          {/* 状态筛选 */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              状态筛选
            </label>
            <select
              value={statusFilterInput}
              onChange={(e) =>
                setStatusFilterInput(e.target.value as '全部' | UserAccountStatus)
              }
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#0284C7] focus:outline-none cursor-pointer"
            >
              <option value="全部">全部</option>
              <option value="正常">正常</option>
              <option value="停用">停用</option>
            </select>
          </div>

          {/* 操作按钮：【查询】（高亮主按钮）、【重置】 */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* 底部操作栏：批量管理与新增/导入导出 */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* 左侧：新增与批量状态管理 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAddUserDrawer}
              className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ 新增用户</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            <button
              type="button"
              disabled={selectedUserIds.length === 0}
              onClick={handleBatchDisable}
              className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>批量禁用</span>
            </button>

            <button
              type="button"
              disabled={selectedUserIds.length === 0}
              onClick={handleBatchRestore}
              className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>批量恢复</span>
            </button>

            <button
              type="button"
              disabled={selectedUserIds.length === 0}
              onClick={handleBatchDeleteClick}
              className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
            </button>

            {selectedUserIds.length > 0 && (
              <span className="text-xs text-slate-500 pl-1">
                已选 <strong className="text-[#0284C7] font-mono-num">{selectedUserIds.length}</strong> 项
              </span>
            )}
          </div>

          {/* 右侧：导入、下载模板、导出、审计日志 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setImportResult(null);
                setImportFileName('');
                setImportModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>导入</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>下载模板</span>
            </button>

            <button
              type="button"
              onClick={handleExportUsers}
              className="px-3.5 py-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-[#0369A1] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportAuditDrawer(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="查看导出与操作审计日志"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>操作/导出审计</span>
            </button>
          </div>
        </div>
      </form>

      {/* =====================================================================
          分区 3：数据列表区
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-2 w-10">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllPage}
                    className="text-slate-400 hover:text-[#0284C7] flex items-center cursor-pointer"
                    title="全选/取消全选本页"
                  >
                    {isCurrentPageAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">头像</th>
                <th className="py-3.5 px-4 whitespace-nowrap">用户名</th>
                <th className="py-3.5 px-4 whitespace-nowrap">真实姓名</th>
                <th className="py-3.5 px-4 min-w-[240px]">角色（基础身份 / 扩展身份）</th>
                <th className="py-3.5 px-4 whitespace-nowrap">状态</th>
                <th className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    未检索到符合条件的用户数据
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  const { baseRole, extendedRoles } = getUserNormalizedRoles(user);
                  const effectiveStatus = getEffectiveUserStatus(user);
                  const expired = isUserAccountExpired(user.expireTime);
                  const boundInst = institutions.find(
                    (i) => i.id === user.managedInstitutionId
                  );
                  const displayRealName =
                    user.realName && user.realName.trim() ? user.realName.trim() : '-';
                  const isSelf = isSelfAccount(user);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-sky-50/40 transition-colors ${
                        isChecked ? 'bg-sky-50/60' : ''
                      }`}
                    >
                      {/* 多选框 */}
                      <td className="py-3.5 pl-5 pr-2 align-middle">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectUser(user.id)}
                          className="text-slate-400 hover:text-[#0284C7] flex items-center cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* 头像：圆形缩略图，未上传显示默认头像 */}
                      <td className="py-3.5 px-3 align-middle">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username || user.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200 text-[#0284C7] flex items-center justify-center font-bold text-xs shadow-2xs">
                            {displayRealName !== '-' ? (
                              displayRealName.slice(0, 1)
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* 用户名：主账号标识 */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-num font-bold text-slate-900 text-xs sm:text-[13px]">
                            {user.username || user.id}
                          </span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-[#0369A1] border border-sky-200">
                              当前登录
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-num mt-0.5">
                          {user.phone ? maskPhoneNumber(user.phone) : '未绑定手机'} ·{' '}
                          {user.email || '未绑定邮箱'}
                        </div>
                      </td>

                      {/* 真实姓名：未认证显示“-” */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            displayRealName === '-' ? 'text-slate-400 font-mono-num' : 'text-slate-800'
                          }`}
                        >
                          {displayRealName}
                        </span>
                      </td>

                      {/* 角色：基础角色（普通/学生/教师）用蓝色 Tag；特权扩展角色（专家/高校管理员/秘书处）用橙色 Tag */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* 基础身份 - 蓝色标签 */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {baseRole}
                          </span>

                          {/* 扩展身份 - 橙色标签 */}
                          {extendedRoles.map((extRole) => (
                            <span
                              key={extRole}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200"
                            >
                              <span>{extRole}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 状态：正常（绿点+文字）/ 停用（红点+文字） */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                effectiveStatus === '正常' ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            <span
                              className={
                                effectiveStatus === '正常' ? 'text-emerald-700' : 'text-red-600'
                              }
                            >
                              {effectiveStatus}
                            </span>
                          </span>
                          {expired && (
                            <span className="text-[10px] font-semibold text-red-500">
                              账号已过期自动停用
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 操作：【编辑】、【重置密码】、【详情】 */}
                      <td className="py-3.5 pr-5 pl-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUserDrawer(user)}
                            className="text-[#0284C7] hover:text-[#0369A1] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>编辑</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResetPwdTargetUser(user);
                              setNewResetPasswordValue('Sec2026@Reset');
                            }}
                            className="text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>重置密码</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDetailTargetUser(user);
                              setDetailShowRawSensitive(false);
                            }}
                            className="text-slate-600 hover:text-[#0284C7] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>详情</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================================
            分区 4：底部分页区
            ===================================================================== */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              共 <strong className="text-slate-900 font-mono-num">{filteredUsers.length}</strong> 条记录
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>每页显示</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 font-mono-num text-xs focus:outline-none cursor-pointer"
              >
                <option value={10}>10 条</option>
                <option value={20}>20 条</option>
                <option value={50}>50 条</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>上一页</span>
            </button>

            <span className="px-3 py-1.5 font-mono-num font-bold text-slate-700">
              第 {currentPage} / {totalPages} 页
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <span>下一页</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          弹窗 1：【批量删除】二次确认弹窗
          ===================================================================== */}
      {batchDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">批量删除二次确认</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  确认删除选中的{' '}
                  <strong className="text-red-600 font-mono-num">{selectedUserIds.length}</strong>{' '}
                  个用户？删除后将无法登录且不可恢复！
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  注：为避免破坏外键关联（如该用户是某参赛队伍队长），底层自动采用软删除（is_deleted = 1），仅后台列表不再展示。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBatchDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmBatchSoftDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 2：【重置密码】弹窗
          ===================================================================== */}
      {resetPwdTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmResetPassword}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">重置用户登录密码</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPwdTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-1">
              <div>
                目标用户名：<strong className="font-mono-num text-slate-900">{resetPwdTargetUser.username}</strong>
              </div>
              <div>
                真实姓名：<strong className="text-slate-900">{resetPwdTargetUser.realName || '-'}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                新登录密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newResetPasswordValue}
                onChange={(e) => setNewResetPasswordValue(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono-num border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                默认初始重置口令为 Sec2026@Reset，您也可自定义修改后确认重置。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetPwdTargetUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                确认重置密码
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          抽屉 3：新增 / 编辑用户表单设计（右侧抽屉）
          ===================================================================== */}
      {userFormDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden">
            {/* 抽屉顶部 Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {editingUser ? `编辑用户 — ${editingUser.username}` : '新增用户'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  配置用户基础信息、唯一性核验凭证、互斥/叠加身份角色及账号过期时间
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserFormDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 抽屉表单主体 */}
            <form
              id="admin-user-form"
              onSubmit={handleSaveUserForm}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {formErrorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formErrorMsg}</span>
                </div>
              )}

              {/* 1. 基础信息 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 rounded-full bg-[#0284C7]" />
                  <h4 className="text-sm font-extrabold text-slate-900">1. 基础信息</h4>
                </div>

                {/* 头像上传与裁剪预览（非必填） */}
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  {formAvatar ? (
                    <img
                      src={formAvatar}
                      alt="用户头像预览"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#0284C7] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-sky-100 border border-sky-200 text-[#0284C7] flex items-center justify-center font-bold text-base shrink-0">
                      {formRealName.trim() ? formRealName.trim().slice(0, 1) : <User className="w-6 h-6" />}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-800">用户头像（非必填）</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-xs font-semibold text-slate-700 hover:text-[#0284C7] cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                        <Crop className="w-3.5 h-3.5" />
                        <span>上传图片并裁剪预览</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                      </label>
                      {formAvatar && (
                        <button
                          type="button"
                          onClick={() => setFormAvatar('')}
                          className="px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                        >
                          恢复默认头像
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 用户名 & 密码 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      用户名 <span className="text-red-500">*</span>
                      {editingUser && (
                        <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                          （编辑状态下不可修改）
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(editingUser)}
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="3-24位字母、数字或下划线"
                      className={`w-full px-3.5 py-2 text-xs font-mono-num rounded-xl border focus:outline-none ${
                        editingUser
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border-slate-300 focus:border-[#0284C7] text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      密码{' '}
                      {!editingUser ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-[11px] font-normal text-slate-400">（选填）</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required={!editingUser}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={editingUser ? '留空则不修改密码' : '请输入登录密码（6-24位）'}
                        className="w-full pl-3.5 pr-9 py-2 text-xs font-mono-num rounded-xl border border-slate-300 focus:border-[#0284C7] focus:outline-none text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showFormPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 用户角色（只读） */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>用户角色</span>
                    <span className="text-[11px] font-normal text-slate-400">（只读）</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {editingUser ? formBaseRole : '普通用户'}
                    </span>
                    {editingUser &&
                      formExtendedRoles.map((extRole) => (
                        <span
                          key={extRole}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200"
                        >
                          {extRole}
                        </span>
                      ))}
                  </div>
                </div>

                {/* 是否已绑定手机号 + 手机号 */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-700">
                      是否已绑定手机号 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-5 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="hasBoundPhone"
                          checked={formHasBoundPhone === true}
                          onChange={() => setFormHasBoundPhone(true)}
                          className="accent-[#0284C7]"
                        />
                        <span>是</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="hasBoundPhone"
                          checked={formHasBoundPhone === false}
                          onChange={() => {
                            setFormHasBoundPhone(false);
                            setFormPhone('');
                          }}
                          className="accent-[#0284C7]"
                        />
                        <span>否</span>
                      </label>
                    </div>
                  </div>

                  {formHasBoundPhone ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        手机号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="请输入11位手机号（全局唯一）"
                        className="w-full px-3.5 py-2 text-xs font-mono-num rounded-xl border border-slate-300 bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      未绑定手机号，用户登录后需自行前往前台【个人中心 &rarr; 个人信息】完成手机号绑定。
                    </div>
                  )}
                </div>

                {/* 是否已绑定邮箱 + 邮箱 */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-700">
                      是否已绑定邮箱 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-5 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="hasBoundEmail"
                          checked={formHasBoundEmail === true}
                          onChange={() => setFormHasBoundEmail(true)}
                          className="accent-[#0284C7]"
                        />
                        <span>是</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="hasBoundEmail"
                          checked={formHasBoundEmail === false}
                          onChange={() => {
                            setFormHasBoundEmail(false);
                            setFormEmail('');
                          }}
                          className="accent-[#0284C7]"
                        />
                        <span>否</span>
                      </label>
                    </div>
                  </div>

                  {formHasBoundEmail ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        邮箱 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="请输入电子邮箱（如 name@university.edu.cn，全局唯一）"
                        className="w-full px-3.5 py-2 text-xs font-mono-num rounded-xl border border-slate-300 bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      未绑定邮箱，用户登录后需自行前往前台【个人中心 &rarr; 个人信息】完成邮箱绑定。
                    </div>
                  )}
                </div>

                {/* 是否已实名认证 + 真实姓名 & 身份证号（同一排） */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-700">
                      是否已实名认证 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-5 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isRealNameVerified"
                          checked={formIsRealNameVerified === true}
                          onChange={() => {
                            setFormIsRealNameVerified(true);
                            if (!formIdNumber) setIsEditingIdNumberUnlocked(true);
                          }}
                          className="accent-[#0284C7]"
                        />
                        <span>是</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isRealNameVerified"
                          checked={formIsRealNameVerified === false}
                          onChange={() => {
                            setFormIsRealNameVerified(false);
                            setFormRealName('');
                            setFormIdNumber('');
                          }}
                          className="accent-[#0284C7]"
                        />
                        <span>否</span>
                      </label>
                    </div>
                  </div>

                  {formIsRealNameVerified ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          真实姓名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formRealName}
                          onChange={(e) => setFormRealName(e.target.value)}
                          placeholder="请输入真实姓名"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          身份证号 <span className="text-red-500">*</span>
                        </label>
                        {editingUser && !isEditingIdNumberUnlocked && formIdNumber ? (
                          <div
                            onClick={() => setIsEditingIdNumberUnlocked(true)}
                            title="点击解锁修改身份证号"
                            className="w-full px-3.5 py-2 text-xs font-mono-num rounded-xl border border-slate-300 bg-white hover:bg-sky-50/50 hover:border-[#0284C7] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span className="text-slate-700 font-semibold">
                              {maskIdCardNumber(formIdNumber)}
                            </span>
                            <span className="text-[11px] text-[#0284C7] font-bold flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              点击修改
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              required
                              maxLength={18}
                              value={formIdNumber}
                              onChange={(e) => setFormIdNumber(e.target.value)}
                              placeholder="请输入18位二代居民身份证号"
                              className="w-full px-3.5 py-2 text-xs font-mono-num rounded-xl border border-slate-300 bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
                            />
                            {editingUser && formIdNumber && (
                              <button
                                type="button"
                                onClick={() => setIsEditingIdNumberUnlocked(false)}
                                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 shrink-0 cursor-pointer"
                              >
                                脱敏隐藏
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      未完成实名认证，用户登录后需自行前往前台【个人中心 &rarr; 用户认证】完成实名认证。
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 账号状态与过期时间 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 rounded-full bg-[#0284C7]" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    2. 账号状态与过期机制
                  </h4>
                </div>

                {/* 用户过期时间：快捷项（永久有效 / 一年后 / 指定日期，精确到秒） */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">
                    用户过期时间
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormExpirePreset('permanent');
                        setFormExpireTime('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        formExpirePreset === 'permanent'
                          ? 'bg-[#0284C7] text-white border-[#0284C7]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      永久有效（默认）
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormExpirePreset('one_year');
                        setFormExpireTime(computeOneYearLaterString());
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        formExpirePreset === 'one_year'
                          ? 'bg-[#0284C7] text-white border-[#0284C7]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      一年后
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormExpirePreset('custom');
                        if (!formExpireTime) {
                          setFormExpireTime('2026-12-31 23:59:59');
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        formExpirePreset === 'custom'
                          ? 'bg-[#0284C7] text-white border-[#0284C7]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      指定日期（精确到秒）
                    </button>
                  </div>

                  {formExpirePreset !== 'permanent' && (
                    <div className="pt-1 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          type="datetime-local"
                          step="1"
                          value={formExpireTime.replace(' ', 'T')}
                          onChange={(e) => {
                            const val = e.target.value.replace('T', ' ');
                            setFormExpireTime(val.length === 16 ? `${val}:00` : val);
                          }}
                          className="px-3.5 py-2 text-xs font-mono-num rounded-xl border border-slate-300 focus:border-[#0284C7] focus:outline-none text-slate-900"
                        />
                        <input
                          type="text"
                          value={formExpireTime}
                          onChange={(e) => setFormExpireTime(e.target.value)}
                          placeholder="YYYY-MM-DD HH:mm:ss"
                          className="flex-1 px-3.5 py-2 text-xs font-mono-num rounded-xl border border-slate-300 focus:border-[#0284C7] focus:outline-none text-slate-900"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        规则：当 当前时间 &gt; 用户过期时间，该账号状态将自动转为“停用”，前台拦截登录并提示“账号已过期，请联系管理员”。
                      </p>
                    </div>
                  )}
                </div>

                {/* 状态：单选框 Radio（正常 / 停用，默认正常） */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    账号状态
                  </label>
                  <div className="flex items-center gap-4">
                    {(['正常', '停用'] as const).map((st) => (
                      <label
                        key={st}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                          formStatus === st
                            ? st === '正常'
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                              : 'bg-red-50 border-red-400 text-red-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="userStatus"
                          checked={formStatus === st}
                          onChange={() => setFormStatus(st)}
                          className="accent-[#0284C7]"
                        />
                        <span
                          className={`w-2 h-2 rounded-full ${
                            st === '正常' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            {/* 抽屉底部操作栏 */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setUserFormDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                form="admin-user-form"
                className="px-6 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {editingUser ? '保存修改' : '确认新增用户'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 头像裁剪预览子弹窗 */}
      {avatarCropModalSource && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <h4 className="text-sm font-extrabold text-slate-900">头像裁剪与缩放预览</h4>
            <div className="w-36 h-36 rounded-full mx-auto overflow-hidden border-4 border-[#0284C7] shadow-md bg-slate-100 flex items-center justify-center">
              <img
                src={avatarCropModalSource}
                alt="裁剪预览"
                style={{ transform: `scale(${avatarCropZoom})` }}
                className="w-full h-full object-cover transition-transform"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">
                缩放比例：{Math.round(avatarCropZoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={2}
                step={0.05}
                value={avatarCropZoom}
                onChange={(e) => setAvatarCropZoom(Number(e.target.value))}
                className="w-full accent-[#0284C7]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAvatarCropModalSource(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmAvatarCrop}
                className="px-4 py-1.5 rounded-lg bg-[#0284C7] text-white text-xs font-bold cursor-pointer"
              >
                应用裁剪头像
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          抽屉 4：用户【详情】抽屉（查看用户完整注册信息与实名/学籍认证记录）
          ===================================================================== */}
      {detailTargetUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {detailTargetUser.avatar ? (
                  <img
                    src={detailTargetUser.avatar}
                    alt={detailTargetUser.username}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-sm">
                    {(detailTargetUser.realName || detailTargetUser.name).slice(0, 1)}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    用户详情档案 — {detailTargetUser.username || detailTargetUser.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    完整注册信息、角色权限绑定与实名/学籍认证核验记录
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailTargetUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {(() => {
                const { baseRole, extendedRoles } = getUserNormalizedRoles(detailTargetUser);
                const effectiveStatus = getEffectiveUserStatus(detailTargetUser);
                const boundInst = institutions.find(
                  (i) => i.id === detailTargetUser.managedInstitutionId
                );

                return (
                  <>
                    <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      <div className="space-y-0.5">
                        <div className="text-slate-500">敏感字段显示模式</div>
                        <div className="font-semibold text-slate-800">
                          {detailShowRawSensitive
                            ? '已解锁显示完整手机号与证件号'
                            : '默认脱敏保护中'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailShowRawSensitive((v) => !v)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-[#0284C7] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {detailShowRawSensitive ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>恢复脱敏</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>查看完整明文</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 基本账号信息 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                        一、注册与身份凭证信息
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">用户名</div>
                          <div className="font-mono-num font-bold text-slate-900">
                            {detailTargetUser.username || '-'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">真实姓名</div>
                          <div className="font-bold text-slate-900">
                            {detailTargetUser.realName && detailTargetUser.realName.trim()
                              ? detailTargetUser.realName
                              : '-'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">手机号码</div>
                          <div className="font-mono-num font-bold text-slate-900">
                            {detailShowRawSensitive
                              ? detailTargetUser.phone
                              : maskPhoneNumber(detailTargetUser.phone)}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">电子邮箱</div>
                          <div className="font-mono-num font-bold text-slate-900 break-all">
                            {detailTargetUser.email || '-'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">证件类型</div>
                          <div className="font-bold text-slate-900">
                            {detailTargetUser.idType || '身份证'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">证件号码</div>
                          <div className="font-mono-num font-bold text-slate-900">
                            {detailShowRawSensitive
                              ? detailTargetUser.idNumber || '-'
                              : maskIdCardNumber(detailTargetUser.idNumber)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 角色与状态信息 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                        二、角色权限与账号有效期
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1.5">基础身份</div>
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {baseRole}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1.5">扩展身份</div>
                          {extendedRoles.length === 0 ? (
                            <span className="text-slate-400">未分配扩展身份</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {extendedRoles.map((r) => (
                                <span
                                  key={r}
                                  className="px-2 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">所属/管理院校</div>
                          <div className="font-bold text-slate-900">
                            {boundInst
                              ? `${boundInst.name}（${boundInst.code}）`
                              : detailTargetUser.university || '-'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 mb-1">当前状态 / 过期时间</div>
                          <div className="font-bold text-slate-900">
                            <span
                              className={
                                effectiveStatus === '正常'
                                  ? 'text-emerald-700'
                                  : 'text-red-600'
                              }
                            >
                              {effectiveStatus}
                            </span>{' '}
                            ·{' '}
                            <span className="font-mono-num text-slate-500">
                              {detailTargetUser.expireTime || '永久有效'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 实名与学籍/教师认证记录 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                        三、实名与学籍/教工认证核验记录
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">实名认证状态：</span>
                          <span
                            className={`font-bold ${
                              detailTargetUser.isRealNameVerified
                                ? 'text-emerald-700'
                                : 'text-amber-600'
                            }`}
                          >
                            {detailTargetUser.isRealNameVerified ? '已通过实名核验' : '未完成实名认证'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">学生/教师认证状态：</span>
                          <span
                            className={`font-bold ${
                              detailTargetUser.isAcademicOrTeacherVerified
                                ? 'text-emerald-700'
                                : 'text-amber-600'
                            }`}
                          >
                            {detailTargetUser.isAcademicOrTeacherVerified
                              ? '已通过高校资格核验'
                              : '未完成高校学籍/教师认证'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">账号创建时间：</span>
                          <span className="font-mono-num text-slate-700">
                            {detailTargetUser.createdAt || '2026-09-01 09:00:00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = detailTargetUser;
                  setDetailTargetUser(null);
                  handleOpenEditUserDrawer(target);
                }}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold cursor-pointer"
              >
                去编辑该用户
              </button>
              <button
                type="button"
                onClick={() => setDetailTargetUser(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 5：Excel 批量导入弹窗（支持拖拽上传 .xlsx + 一键校验演示数据包 + 错误报告下载）
          ===================================================================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Excel 批量导入用户
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  前置校验表头、必填项、手机号/身份证格式、角色枚举值、内部重名及高校管理员所属院校存在性
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 拖拽上传区 */}
            <div className="border-2 border-dashed border-sky-300 bg-sky-50/40 rounded-2xl p-6 text-center space-y-3">
              <Upload className="w-9 h-9 text-[#0284C7] mx-auto" />
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                点击或拖拽上传填好的《用户导入模板.xlsx》
              </div>
              <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
                表头须包含：*用户名、*密码、*真实姓名、*手机号、邮箱、*证件类型、*证件号、*基础身份、扩展身份、所属院校、过期时间
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <label className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>选择本地 Excel 文件上传</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#0284C7] text-slate-700 text-xs font-bold cursor-pointer"
                >
                  下载标准Excel模板
                </button>
              </div>
            </div>

            {/* 快捷校验演示区（方便直接测试：①正常新增+已存在跳过；②含格式/枚举/院校不存在错误的全量拦截与错误报告下载） */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>快速验证导入校验规则（可上传本地 Excel，也可直接点击下方测试包验证）：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    validateAndProcessImportRows(
                      [
                        {
                          '*用户名': 'linyuanhang', // 已存在用户 -> 自动跳过
                          '*密码': 'Sec2026Pass',
                          '*真实姓名': '林远航',
                          '*手机号': '13810246921',
                          邮箱: 'linyuanhang@buaa.edu.cn',
                          '*证件类型': '身份证',
                          '*证件号': '110108200403156812',
                          '*基础身份': '学生',
                          扩展身份: '',
                          所属院校: '北京航空航天大学',
                          过期时间: '永久有效',
                        },
                        {
                          '*用户名': `xidian_stu_${Math.floor(100 + Math.random() * 899)}`,
                          '*密码': 'Xdu2026Pass',
                          '*真实姓名': '许嘉树',
                          '*手机号': `1371099${Math.floor(1000 + Math.random() * 8999)}`,
                          邮箱: `xujiashu_${Math.floor(10 + Math.random() * 89)}@xidian.edu.cn`,
                          '*证件类型': '身份证',
                          '*证件号': `61011320040812${Math.floor(1000 + Math.random() * 8999)}`,
                          '*基础身份': '学生',
                          扩展身份: '',
                          所属院校: '西安电子科技大学',
                          过期时间: '永久有效',
                        },
                        {
                          '*用户名': `hust_admin_${Math.floor(100 + Math.random() * 899)}`,
                          '*密码': 'Hust2026Pass',
                          '*真实姓名': '郑国栋',
                          '*手机号': `1361088${Math.floor(1000 + Math.random() * 8999)}`,
                          邮箱: `zhenggd_${Math.floor(10 + Math.random() * 89)}@hust.edu.cn`,
                          '*证件类型': '身份证',
                          '*证件号': `42011119820519${Math.floor(1000 + Math.random() * 8999)}`,
                          '*基础身份': '教师',
                          扩展身份: '专家,高校管理员',
                          所属院校: '华中科技大学',
                          过期时间: '2027-12-31 23:59:59',
                        },
                      ],
                      '2026春季高校用户名单(含已存在跳过).xlsx'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer"
                >
                  测试场景A：导入2名新用户 + 1名已存在用户自动跳过
                </button>

                <button
                  type="button"
                  onClick={() =>
                    validateAndProcessImportRows(
                      [
                        {
                          '*用户名': 'valid_user_01',
                          '*密码': 'Sec2026Pass',
                          '*真实姓名': '韩梅梅',
                          '*手机号': '13510002233',
                          邮箱: 'hanmeimei@pku.edu.cn',
                          '*证件类型': '身份证',
                          '*证件号': '110108200409102218',
                          '*基础身份': '学生',
                          扩展身份: '',
                          所属院校: '北京大学',
                          过期时间: '永久有效',
                        },
                        {
                          '*用户名': 'err_user_02',
                          '*密码': 'Sec2026Pass',
                          '*真实姓名': '王小虎',
                          '*手机号': '1234567', // 第3行：手机号格式错误
                          邮箱: 'wangxiaohu@buaa.edu.cn',
                          '*证件类型': '身份证',
                          '*证件号': '11010820040101', // 身份证非18位
                          '*基础身份': '校外访客', // 基础身份枚举错误
                          扩展身份: '高校管理员',
                          所属院校: '不存在的测试大学', // 所属院校在系统中不存在
                          过期时间: '永久有效',
                        },
                      ],
                      '异常数据校验拦截测试表.xlsx'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer"
                >
                  测试场景B：触发格式/枚举/院校不存在错误拦截并生成错误报告
                </button>
              </div>
            </div>

            {/* 导入结果反馈 */}
            {importResult && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700">
                  检测文件：<span className="font-mono-num text-[#0284C7]">{importFileName}</span>
                </div>

                {importResult.abortedDueToError ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-extrabold text-red-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          检测到 {importResult.errors.length} 处校验错误，本次全量不予导入！请修正后重试：
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadErrorReportExcel}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>下载错误报告Excel</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-lg border border-red-200 divide-y divide-red-100 max-h-44 overflow-y-auto text-xs">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx} className="p-2.5 text-red-700 font-medium">
                          {err.errorReason}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                    <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        批量导入完成：成功新增{' '}
                        <strong className="font-mono-num">{importResult.successAddedCount}</strong>{' '}
                        人，跳过已存在用户{' '}
                        <strong className="font-mono-num">
                          {importResult.skippedExistingCount}
                        </strong>{' '}
                        人
                      </span>
                    </div>
                    {importResult.skippedDetails.length > 0 && (
                      <div className="bg-white rounded-lg border border-emerald-200 p-2.5 space-y-1 text-[11px] text-slate-600">
                        {importResult.skippedDetails.map((sk, idx) => (
                          <div key={idx}>
                            • 第{sk.rowNumber}行（用户名：{sk.username} / 手机号：{sk.phone}）：
                            <strong className="text-amber-700 ml-1">{sk.reason}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          抽屉 6：导出与用户管理操作审计日志抽屉
          ===================================================================== */}
      {showExportAuditDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  用户管理与数据导出审计日志
                </h3>
                <p className="text-xs text-slate-500">
                  自动记录所有用户导出（导出人、导出时间、导出条数）及权限变更记录
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportAuditDrawer(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="font-mono-num text-[11px] text-slate-400">{log.time}</span>
                  </div>
                  <div className="text-slate-600 leading-relaxed">{log.detail}</div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>操作人：{log.operator}</span>
                    <span>IP：{log.ip}</span>
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
