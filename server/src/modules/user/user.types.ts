// 用户角色枚举
export enum UserRole {
  SUPERADMIN = 'superadmin',         // 超级管理员 (boss)
  REGIONAL_MANAGER = 'regional_manager', // 区域经理
  SUPERVISOR = 'supervisor',         // 督导专员
  MANAGER = 'manager',               // 店长
}

// 用户状态枚举
export enum UserStatus {
  PENDING = 'pending',   // 待审核
  ACTIVE = 'active',     // 已启用
  DISABLED = 'disabled', // 已禁用
}

// 用户接口
export interface User {
  id: string;
  username: string;
  password: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  storeId?: string;      // 店长所属门店
  storeName?: string;
  region?: string;       // 区域经理/督导负责的区域
  totalScore: number;    // 总积分
  createdAt: Date;
  updatedAt: Date;
}

// 权限定义
export const PERMISSIONS = {
  // 用户管理权限
  MANAGE_ALL_USERS: 'manage_all_users',           // 管理所有用户（boss）
  MANAGE_REGIONAL_USERS: 'manage_regional_users', // 管理区域内用户（区域经理）
  VIEW_ALL_RECORDS: 'view_all_records',           // 查看所有记录（督导）
  REJECT_RECORDS: 'reject_records',               // 驳回记录（督导）
  ADJUST_SCORE: 'adjust_score',                   // 调整积分（督导）
  MANAGE_STORES: 'manage_stores',                 // 管理门店
  MANAGE_TASKS: 'manage_tasks',                   // 管理任务
};

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPERADMIN]: [
    PERMISSIONS.MANAGE_ALL_USERS,
    PERMISSIONS.MANAGE_STORES,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.VIEW_ALL_RECORDS,
    PERMISSIONS.REJECT_RECORDS,
    PERMISSIONS.ADJUST_SCORE,
  ],
  [UserRole.REGIONAL_MANAGER]: [
    PERMISSIONS.MANAGE_REGIONAL_USERS,
    PERMISSIONS.VIEW_ALL_RECORDS,
    PERMISSIONS.REJECT_RECORDS,
    PERMISSIONS.ADJUST_SCORE,
  ],
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.VIEW_ALL_RECORDS,
    PERMISSIONS.REJECT_RECORDS,
    PERMISSIONS.ADJUST_SCORE,
  ],
  [UserRole.MANAGER]: [],
};

// 判断用户是否有某个权限
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

// 判断用户A是否可以管理用户B
export function canManageUser(operatorRole: UserRole, targetRole: UserRole): boolean {
  // boss 可以管理所有人
  if (operatorRole === UserRole.SUPERADMIN) {
    return true;
  }
  
  // 区域经理可以管理督导专员和店长
  if (operatorRole === UserRole.REGIONAL_MANAGER) {
    return targetRole === UserRole.SUPERVISOR || targetRole === UserRole.MANAGER;
  }
  
  // 督导专员可以管理店长
  if (operatorRole === UserRole.SUPERVISOR) {
    return targetRole === UserRole.MANAGER;
  }
  
  // 店长不能管理任何人
  return false;
}

// 判断用户是否是管理员
export function isAdmin(role: UserRole): boolean {
  return [UserRole.SUPERADMIN, UserRole.REGIONAL_MANAGER, UserRole.SUPERVISOR].includes(role);
}
