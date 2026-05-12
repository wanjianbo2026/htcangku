import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, AdjustScoreDto, QueryUsersDto, AuditUserDto, LoginDto } from './user.dto';
import { UserRole, UserStatus } from './user.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 用户登录
  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      const user = await this.userService.login(body.username, body.password);
      if (user) {
        // 不返回密码
        const { password, ...userInfo } = user;
        return {
          code: 200,
          msg: '登录成功',
          data: userInfo,
        };
      } else {
        return {
          code: 401,
          msg: '账号或密码错误',
          data: null,
        };
      }
    } catch (error) {
      return {
        code: 403,
        msg: error.message,
        data: null,
      };
    }
  }

  // 创建用户（注册）
  @Post('create')
  async createUser(@Body() body: CreateUserDto) {
    try {
      const user = await this.userService.createUser(body);
      const { password, ...userInfo } = user;
      return {
        code: 200,
        msg: '注册成功，请等待管理员审核',
        data: userInfo,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: null,
      };
    }
  }

  // 获取用户列表
  @Get('list')
  async getUserList(
    @Query('operatorRole') operatorRole: UserRole,
    @Query('operatorId') operatorId: string,
    @Query() query: QueryUsersDto,
  ) {
    try {
      const users = await this.userService.getUserList(operatorRole, operatorId, query);
      // 不返回密码
      const safeUsers = users.map(({ password, ...user }) => user);
      return {
        code: 200,
        msg: '获取成功',
        data: safeUsers,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: [],
      };
    }
  }

  // 获取用户详情
  @Get('detail')
  async getUserDetail(@Query('userId') userId: string) {
    try {
      const user = await this.userService.getUserById(userId);
      if (user) {
        const { password, ...userInfo } = user;
        return {
          code: 200,
          msg: '获取成功',
          data: userInfo,
        };
      } else {
        return {
          code: 404,
          msg: '用户不存在',
          data: null,
        };
      }
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: null,
      };
    }
  }

  // 更新用户
  @Post('update')
  async updateUser(
    @Body() body: { userId: string; operatorRole: UserRole; data: UpdateUserDto },
  ) {
    try {
      const user = await this.userService.updateUser(
        body.userId,
        body.data,
        body.operatorRole,
      );
      const { password, ...userInfo } = user;
      return {
        code: 200,
        msg: '更新成功',
        data: userInfo,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: null,
      };
    }
  }

  // 审核用户
  @Post('audit')
  async auditUser(@Body() body: AuditUserDto) {
    try {
      const user = await this.userService.auditUser(body);
      const { password, ...userInfo } = user;
      return {
        code: 200,
        msg: '审核成功',
        data: userInfo,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: null,
      };
    }
  }

  // 删除用户
  @Post('delete')
  async deleteUser(
    @Body() body: { userId: string; operatorRole: UserRole },
  ) {
    try {
      await this.userService.deleteUser(body.userId, body.operatorRole);
      return {
        code: 200,
        msg: '删除成功',
        data: null,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: null,
      };
    }
  }

  // 调整积分
  @Post('adjust-score')
  async adjustScore(@Body() body: AdjustScoreDto) {
    try {
      const user = await this.userService.adjustScore(body);
      const { password, ...userInfo } = user;
      return {
        code: 200,
        msg: '积分调整成功',
        data: userInfo,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: null,
      };
    }
  }

  // 获取积分日志
  @Get('score-logs')
  async getScoreLogs(@Query('userId') userId?: string) {
    try {
      const logs = await this.userService.getScoreLogs(userId);
      return {
        code: 200,
        msg: '获取成功',
        data: logs,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: [],
      };
    }
  }

  // 根据用户名查询
  @Get('by-username')
  async getUserByUsername(@Query('username') username: string) {
    try {
      const user = await this.userService.getUserByUsername(username);
      if (user) {
        const { password, ...userInfo } = user;
        return {
          code: 200,
          msg: '获取成功',
          data: [userInfo],
        };
      } else {
        return {
          code: 200,
          msg: '获取成功',
          data: [],
        };
      }
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: [],
      };
    }
  }

  // 获取店长排行榜
  @Get('leaderboard')
  async getLeaderboard() {
    try {
      const managers = await this.userService.getManagersSortedByScore();
      const safeManagers = managers.map(({ password, ...user }) => user);
      return {
        code: 200,
        msg: '获取成功',
        data: safeManagers,
      };
    } catch (error) {
      return {
        code: 400,
        msg: error.message,
        data: [],
      };
    }
  }
}
