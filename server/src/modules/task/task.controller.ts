import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { 
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
  SubmitReportDto,
  ReviewReportDto,
  QueryReportDto,
  CreateStoreDto,
  UpdateStoreDto,
  QueryStoreDto
} from './task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // ==================== 任务管理 ====================

  /**
   * 创建任务
   * POST /api/task/create
   */
  @Post('create')
  async createTask(@Body() dto: CreateTaskDto) {
    try {
      console.log('[TaskController] createTask:', dto);
      const task = this.taskService.createTask(dto);
      return {
        code: 200,
        msg: '任务创建成功',
        data: task,
      };
    } catch (error) {
      console.error('[TaskController] createTask error:', error);
      return {
        code: 500,
        msg: error.message || '任务创建失败',
        data: null,
      };
    }
  }

  /**
   * 查询任务列表
   * GET /api/task/list
   */
  @Get('list')
  async queryTasks(@Query() query: QueryTaskDto) {
    try {
      console.log('[TaskController] queryTasks:', query);
      const tasks = this.taskService.queryTasks(query);
      return {
        code: 200,
        msg: '查询成功',
        data: tasks,
      };
    } catch (error) {
      console.error('[TaskController] queryTasks error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: [],
      };
    }
  }

  /**
   * 获取任务详情
   * GET /api/task/detail
   */
  @Get('detail')
  async getTaskDetail(@Query('id') id: string) {
    try {
      console.log('[TaskController] getTaskDetail:', id);
      const task = this.taskService.getTaskById(id);
      if (!task) {
        return {
          code: 404,
          msg: '任务不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '查询成功',
        data: task,
      };
    } catch (error) {
      console.error('[TaskController] getTaskDetail error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: null,
      };
    }
  }

  /**
   * 更新任务
   * POST /api/task/update
   */
  @Post('update')
  async updateTask(@Body() dto: UpdateTaskDto) {
    try {
      console.log('[TaskController] updateTask:', dto);
      const task = this.taskService.updateTask(dto);
      if (!task) {
        return {
          code: 404,
          msg: '任务不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '任务更新成功',
        data: task,
      };
    } catch (error) {
      console.error('[TaskController] updateTask error:', error);
      return {
        code: 500,
        msg: error.message || '任务更新失败',
        data: null,
      };
    }
  }

  /**
   * 删除任务
   * POST /api/task/delete
   */
  @Post('delete')
  async deleteTask(@Body('id') id: string) {
    try {
      console.log('[TaskController] deleteTask:', id);
      const success = this.taskService.deleteTask(id);
      if (!success) {
        return {
          code: 404,
          msg: '任务不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '任务删除成功',
        data: null,
      };
    } catch (error) {
      console.error('[TaskController] deleteTask error:', error);
      return {
        code: 500,
        msg: error.message || '任务删除失败',
        data: null,
      };
    }
  }

  // ==================== 上报记录管理 ====================

  /**
   * 提交上报
   * POST /api/task/report/submit
   */
  @Post('report/submit')
  async submitReport(
    @Body('user_id') userId: string,
    @Body('user_name') userName: string,
    @Body() dto: SubmitReportDto,
  ) {
    try {
      console.log('[TaskController] submitReport:', { userId, userName, ...dto });
      const report = this.taskService.submitReport(userId, userName, dto);
      return {
        code: 200,
        msg: '上报提交成功',
        data: report,
      };
    } catch (error) {
      console.error('[TaskController] submitReport error:', error);
      return {
        code: 500,
        msg: error.message || '上报提交失败',
        data: null,
      };
    }
  }

  /**
   * 查询上报记录
   * GET /api/task/report/list
   */
  @Get('report/list')
  async queryReports(@Query() query: QueryReportDto) {
    try {
      console.log('[TaskController] queryReports:', query);
      const reports = this.taskService.queryReports(query);
      return {
        code: 200,
        msg: '查询成功',
        data: reports,
      };
    } catch (error) {
      console.error('[TaskController] queryReports error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: [],
      };
    }
  }

  /**
   * 获取上报记录详情
   * GET /api/task/report/detail
   */
  @Get('report/detail')
  async getReportDetail(@Query('id') id: string) {
    try {
      console.log('[TaskController] getReportDetail:', id);
      const report = this.taskService.getReportById(id);
      if (!report) {
        return {
          code: 404,
          msg: '记录不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '查询成功',
        data: report,
      };
    } catch (error) {
      console.error('[TaskController] getReportDetail error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: null,
      };
    }
  }

  /**
   * 审核上报记录
   * POST /api/task/report/review
   */
  @Post('report/review')
  async reviewReport(
    @Body('reviewer_id') reviewerId: string,
    @Body('reviewer_name') reviewerName: string,
    @Body() dto: ReviewReportDto,
  ) {
    try {
      console.log('[TaskController] reviewReport:', { reviewerId, reviewerName, ...dto });
      const report = this.taskService.reviewReport(reviewerId, reviewerName, dto);
      if (!report) {
        return {
          code: 404,
          msg: '记录不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '审核成功',
        data: report,
      };
    } catch (error) {
      console.error('[TaskController] reviewReport error:', error);
      return {
        code: 500,
        msg: error.message || '审核失败',
        data: null,
      };
    }
  }

  /**
   * 获取待审核记录数
   * GET /api/task/report/pending-count
   */
  @Get('report/pending-count')
  async getPendingCount(@Query('user_id') userId: string) {
    try {
      console.log('[TaskController] getPendingCount:', userId);
      const count = this.taskService.getPendingCount(userId);
      return {
        code: 200,
        msg: '查询成功',
        data: count,
      };
    } catch (error) {
      console.error('[TaskController] getPendingCount error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: 0,
      };
    }
  }

  // ==================== 门店管理 ====================

  /**
   * 创建门店
   * POST /api/task/store/create
   */
  @Post('store/create')
  async createStore(@Body() dto: CreateStoreDto) {
    try {
      console.log('[TaskController] createStore:', dto);
      const store = this.taskService.createStore(dto);
      return {
        code: 200,
        msg: '门店创建成功',
        data: store,
      };
    } catch (error) {
      console.error('[TaskController] createStore error:', error);
      return {
        code: 500,
        msg: error.message || '门店创建失败',
        data: null,
      };
    }
  }

  /**
   * 查询门店列表
   * GET /api/task/store/list
   */
  @Get('store/list')
  async queryStores(@Query() query: QueryStoreDto) {
    try {
      console.log('[TaskController] queryStores:', query);
      const stores = this.taskService.queryStores(query);
      return {
        code: 200,
        msg: '查询成功',
        data: stores,
      };
    } catch (error) {
      console.error('[TaskController] queryStores error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: [],
      };
    }
  }

  /**
   * 获取门店详情
   * GET /api/task/store/detail
   */
  @Get('store/detail')
  async getStoreDetail(@Query('id') id: string) {
    try {
      console.log('[TaskController] getStoreDetail:', id);
      const store = this.taskService.getStoreById(id);
      if (!store) {
        return {
          code: 404,
          msg: '门店不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '查询成功',
        data: store,
      };
    } catch (error) {
      console.error('[TaskController] getStoreDetail error:', error);
      return {
        code: 500,
        msg: error.message || '查询失败',
        data: null,
      };
    }
  }

  /**
   * 更新门店
   * POST /api/task/store/update
   */
  @Post('store/update')
  async updateStore(@Body() dto: UpdateStoreDto) {
    try {
      console.log('[TaskController] updateStore:', dto);
      const store = this.taskService.updateStore(dto);
      if (!store) {
        return {
          code: 404,
          msg: '门店不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '门店更新成功',
        data: store,
      };
    } catch (error) {
      console.error('[TaskController] updateStore error:', error);
      return {
        code: 500,
        msg: error.message || '门店更新失败',
        data: null,
      };
    }
  }

  /**
   * 删除门店
   * POST /api/task/store/delete
   */
  @Post('store/delete')
  async deleteStore(@Body('id') id: string) {
    try {
      console.log('[TaskController] deleteStore:', id);
      const success = this.taskService.deleteStore(id);
      if (!success) {
        return {
          code: 404,
          msg: '门店不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '门店删除成功',
        data: null,
      };
    } catch (error) {
      console.error('[TaskController] deleteStore error:', error);
      return {
        code: 500,
        msg: error.message || '门店删除失败',
        data: null,
      };
    }
  }

  /**
   * 绑定店长到门店
   * POST /api/task/store/bind-manager
   */
  @Post('store/bind-manager')
  async bindManager(
    @Body('store_id') storeId: string,
    @Body('manager_id') managerId: string,
    @Body('manager_name') managerName: string,
  ) {
    try {
      console.log('[TaskController] bindManager:', { storeId, managerId, managerName });
      const store = this.taskService.bindManager(storeId, managerId, managerName);
      if (!store) {
        return {
          code: 404,
          msg: '门店不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: '绑定成功',
        data: store,
      };
    } catch (error) {
      console.error('[TaskController] bindManager error:', error);
      return {
        code: 500,
        msg: error.message || '绑定失败',
        data: null,
      };
    }
  }
}
