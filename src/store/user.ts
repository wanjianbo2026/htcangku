import { create } from 'zustand';

// 用户角色枚举
export enum UserRole {
  SUPERADMIN = 'superadmin',
  REGIONAL_MANAGER = 'regional_manager',
  SUPERVISOR = 'supervisor',
  MANAGER = 'manager',
}

// 用户状态枚举
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  storeId?: string;
  storeName?: string;
  region?: string;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

// 权限判断函数
const isAdmin = (role: UserRole): boolean => {
  return [UserRole.SUPERADMIN, UserRole.REGIONAL_MANAGER, UserRole.SUPERVISOR].includes(role);
};

const isSuperAdmin = (role: UserRole): boolean => {
  return role === UserRole.SUPERADMIN;
};

const isRegionalManager = (role: UserRole): boolean => {
  return role === UserRole.REGIONAL_MANAGER;
};

const isSupervisor = (role: UserRole): boolean => {
  return role === UserRole.SUPERVISOR;
};

// 判断是否可以管理目标用户
const canManageUser = (operatorRole: UserRole, targetRole: UserRole): boolean => {
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
  
  return false;
};

// 应用状态管理
interface AppState {
  userInfo: UserInfo | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isRegionalManager: boolean;
  isSupervisor: boolean;
  
  setUserInfo: (user: UserInfo | null) => void;
  logout: () => void;
  initFromStorage: () => void;
  canManageUser: (targetRole: UserRole) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  userInfo: null,
  isAdmin: false,
  isSuperAdmin: false,
  isRegionalManager: false,
  isSupervisor: false,
  
  setUserInfo: (user) => {
    set({
      userInfo: user,
      isAdmin: user ? isAdmin(user.role) : false,
      isSuperAdmin: user ? isSuperAdmin(user.role) : false,
      isRegionalManager: user ? isRegionalManager(user.role) : false,
      isSupervisor: user ? isSupervisor(user.role) : false,
    });
    
    // 保存到本地存储
    if (user) {
      try {
        localStorage.setItem('userInfo', JSON.stringify(user));
      } catch (e) {
        console.error('保存用户信息失败:', e);
      }
    } else {
      try {
        localStorage.removeItem('userInfo');
      } catch (e) {
        console.error('删除用户信息失败:', e);
      }
    }
  },
  
  logout: () => {
    set({
      userInfo: null,
      isAdmin: false,
      isSuperAdmin: false,
      isRegionalManager: false,
      isSupervisor: false,
    });
    
    try {
      localStorage.removeItem('userInfo');
    } catch (e) {
      console.error('删除用户信息失败:', e);
    }
  },
  
  initFromStorage: () => {
    try {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        const user = JSON.parse(stored) as UserInfo;
        set({
          userInfo: user,
          isAdmin: isAdmin(user.role),
          isSuperAdmin: isSuperAdmin(user.role),
          isRegionalManager: isRegionalManager(user.role),
          isSupervisor: isSupervisor(user.role),
        });
      }
    } catch (e) {
      console.error('初始化用户信息失败:', e);
    }
  },
  
  canManageUser: (targetRole: UserRole): boolean => {
    const { userInfo } = get();
    if (!userInfo) return false;
    return canManageUser(userInfo.role, targetRole);
  },
}));

// 导出别名，方便使用
export const useUserStore = useAppStore;
