import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus, hasPermission, canManageUser, PERMISSIONS } from './user.types';
import { CreateUserDto, UpdateUserDto, AdjustScoreDto, QueryUsersDto, AuditUserDto } from './user.dto';

@Injectable()
export class UserService {
  // 内存存储（模拟数据库）
  private users: Map<string, User> = new Map();
  private scoreLogs: any[] = [];

  constructor() {
    // 初始化默认用户
    this.initDefaultUsers();
  }

  private initDefaultUsers() {
    const defaultUsers: User[] = [
      {
        id: 'superadmin-001',
        username: 'boss',
        password: this.hashPassword('woshibobo'),
        nickname: '超级管理员',
        role: UserRole.SUPERADMIN,
        status: UserStatus.ACTIVE,
        totalScore: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'regional-001',
        username: 'regional',
        password: this.hashPassword('dolphin2024'),
        nickname: '李明辉',
        role: UserRole.REGIONAL_MANAGER,
        status: UserStatus.ACTIVE,
        region: '华东区',
        totalScore: 0,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: 'supervisor-001',
        username: 'supervisor',
        password: this.hashPassword('dolphin2024'),
        nickname: '陈晓燕',
        role: UserRole.SUPERVISOR,
        status: UserStatus.ACTIVE,
        region: '华东区',
        totalScore: 0,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: 'manager-001',
        username: 'zhanglei',
        password: this.hashPassword('dolphin2024'),
        nickname: '张磊',
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        storeId: 'store-001',
        storeName: '海豚电竞大学城店',
        phone: '13800138000',
        totalScore: 850,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
    ];

    defaultUsers.forEach(user => this.users.set(user.id, user));
  }

  private hashPassword(password: string): string {
    // 简单的哈希函数（生产环境应使用bcrypt）
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // 用户登录
  async login(username: string, password: string): Promise<User | null> {
    const hashedPassword = this.hashPassword(password);
    for (const user of this.users.values()) {
      if (user.username === username && user.password === hashedPassword) {
        if (user.status === UserStatus.PENDING) {
          throw new Error('账号待审核，请等待管理员审核');
        }
        if (user.status === UserStatus.DISABLED) {
          throw new Error('账号已被禁用');
        }
        return user;
      }
    }
    return null;
  }

  // 创建用户
  async createUser(dto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    for (const user of this.users.values()) {
      if (user.username === dto.username) {
        throw new Error('用户名已存在');
      }
    }

    const id = `user-${Date.now()}`;
    const user: User = {
      id,
      username: dto.username,
      password: this.hashPassword(dto.password),
      nickname: dto.nickname,
      role: dto.role,
      status: UserStatus.PENDING, // 默认待审核
      phone: dto.phone,
      storeId: dto.storeId,
      storeName: dto.storeName,
      region: dto.region,
      totalScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);
    return user;
  }

  // 获取当前操作人信息
  private async getOperatorById(operatorId: string): Promise<User | null> {
    return this.users.get(operatorId) || null;
  }

  // 获取用户列表（带权限过滤）
  async getUserList(operatorRole: UserRole, operatorId: string, query?: QueryUsersDto): Promise<User[]> {
    let users = Array.from(this.users.values());
    const operator = await this.getOperatorById(operatorId);

    // 如果不是boss，需要过滤用户
    if (operatorRole !== UserRole.SUPERADMIN) {
      if (operatorRole === UserRole.REGIONAL_MANAGER) {
        // 区域经理只能看到本区域的督导专员和店长
        users = users.filter(u => 
          (u.role === UserRole.SUPERVISOR || u.role === UserRole.MANAGER) && 
          (!operator?.region || u.region === operator.region)
        );
      } else if (operatorRole === UserRole.SUPERVISOR) {
        // 督导专员只能看到本区域的店长
        users = users.filter(u => 
          u.role === UserRole.MANAGER && 
          (!operator?.region || u.region === operator.region)
        );
      } else {
        // 店长看不到其他用户
        users = [];
      }
    }

    // 应用查询过滤
    if (query?.role) {
      users = users.filter(u => u.role === query.role);
    }
    if (query?.status) {
      users = users.filter(u => u.status === query.status);
    }
    if (query?.storeId) {
      users = users.filter(u => u.storeId === query.storeId);
    }
    if (query?.region) {
      users = users.filter(u => u.region === query.region);
    }

    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 获取用户详情
  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  // 更新用户
  async updateUser(id: string, dto: UpdateUserDto, operatorRole: UserRole): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查权限
    if (!canManageUser(operatorRole, user.role)) {
      throw new Error('无权限操作此用户');
    }

    const updatedUser: User = {
      ...user,
      ...dto,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // 审核用户
  async auditUser(dto: AuditUserDto): Promise<User> {
    const user = this.users.get(dto.userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查权限
    if (!canManageUser(dto.operatorRole as UserRole, user.role)) {
      throw new Error('无权限审核此用户');
    }

    const updatedUser: User = {
      ...user,
      status: dto.status,
      updatedAt: new Date(),
    };

    this.users.set(dto.userId, updatedUser);
    return updatedUser;
  }

  // 删除用户
  async deleteUser(id: string, operatorRole: UserRole): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查权限
    if (!canManageUser(operatorRole, user.role)) {
      throw new Error('无权限删除此用户');
    }

    this.users.delete(id);
  }

  // 调整积分
  async adjustScore(dto: AdjustScoreDto): Promise<User> {
    const user = this.users.get(dto.userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查权限（只有督导及以上可以调整积分）
    if (!hasPermission(dto.operatorRole as UserRole, PERMISSIONS.ADJUST_SCORE)) {
      throw new Error('无权限调整积分');
    }

    const oldScore = user.totalScore;
    const newScore = Math.max(0, oldScore + dto.delta);

    const updatedUser: User = {
      ...user,
      totalScore: newScore,
      updatedAt: new Date(),
    };

    this.users.set(dto.userId, updatedUser);

    // 记录积分日志
    this.scoreLogs.push({
      id: `log-${Date.now()}`,
      userId: dto.userId,
      delta: dto.delta,
      reason: dto.reason,
      beforeScore: oldScore,
      afterScore: newScore,
      operatorId: dto.operatorId,
      operatorName: dto.operatorName,
      operatorRole: dto.operatorRole,
      createdAt: new Date(),
    });

    return updatedUser;
  }

  // 获取积分日志
  async getScoreLogs(userId?: string): Promise<any[]> {
    let logs = this.scoreLogs;
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 根据用户名获取用户
  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  // 获取所有店长（按积分排序）
  async getManagersSortedByScore(): Promise<User[]> {
    const managers = Array.from(this.users.values())
      .filter(u => u.role === UserRole.MANAGER && u.status === UserStatus.ACTIVE);
    
    return managers.sort((a, b) => b.totalScore - a.totalScore);
  }
}
