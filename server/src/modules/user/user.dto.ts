import { UserRole, UserStatus } from './user.types';

// 创建用户DTO
export class CreateUserDto {
  username: string;
  password: string;
  nickname: string;
  role: UserRole;
  phone?: string;
  storeId?: string;
  storeName?: string;
  region?: string;
}

// 更新用户DTO
export class UpdateUserDto {
  nickname?: string;
  phone?: string;
  storeId?: string;
  storeName?: string;
  region?: string;
  status?: UserStatus;
  totalScore?: number;
}

// 用户登录DTO
export class LoginDto {
  username: string;
  password: string;
}

// 调整积分DTO
export class AdjustScoreDto {
  userId: string;
  delta: number;  // 积分变化值（正数为增加，负数为减少）
  reason: string; // 调整原因
  operatorId: string;
  operatorName: string;
  operatorRole: string;
}

// 用户查询DTO
export class QueryUsersDto {
  role?: UserRole;
  status?: UserStatus;
  storeId?: string;
  region?: string;
}

// 审核用户DTO
export class AuditUserDto {
  userId: string;
  status: UserStatus;
  operatorRole: string;
}
