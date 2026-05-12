import { Injectable } from '@nestjs/common';
import { 
  Task, 
  Report, 
  Store,
  TaskType,
  TaskStatus,
  ReportStatus 
} from './task.types';
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

@Injectable()
export class TaskService {
  // 内存存储（生产环境应使用数据库）
  private tasks: Map<string, Task> = new Map();
  private reports: Map<string, Report> = new Map();
  private stores: Map<string, Store> = new Map();

  constructor() {
    this.initDefaultData();
  }

  /**
   * 初始化默认数据
   */
  private initDefaultData() {
    // 初始化默认任务
    const defaultTasks: Task[] = [
      {
        id: 'task-1',
        name: '每日巡店',
        description: '每日门店巡查，检查门店运营情况',
        type: TaskType.DAILY,
        score: 10,
        requirement: '拍摄门店门头、店内陈列、货架情况',
        images_required: 3,
        status: TaskStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'task-2',
        name: '每周库存盘点',
        description: '每周进行库存盘点',
        type: TaskType.WEEKLY,
        score: 50,
        requirement: '拍摄库存清单、货架库存情况',
        images_required: 5,
        status: TaskStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'task-3',
        name: '月度业绩汇报',
        description: '月度业绩总结汇报',
        type: TaskType.MONTHLY,
        score: 100,
        requirement: '拍摄业绩报表、销售数据',
        images_required: 3,
        status: TaskStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    defaultTasks.forEach(task => this.tasks.set(task.id, task));

    // 初始化默认门店
    const defaultStores: Store[] = [
      {
        id: 'store-1',
        name: '海豚电竞·中关村店',
        address: '北京市海淀区中关村大街1号',
        region: '北京',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'store-2',
        name: '海豚电竞·望京店',
        address: '北京市朝阳区望京街道望京SOHO',
        region: '北京',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'store-3',
        name: '海豚电竞·五道口店',
        address: '北京市海淀区成府路28号',
        region: '北京',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    defaultStores.forEach(store => this.stores.set(store.id, store));
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== 任务管理 ====================

  /**
   * 创建任务
   */
  createTask(dto: CreateTaskDto): Task {
    const task: Task = {
      id: this.generateId(),
      name: dto.name,
      description: dto.description,
      type: dto.type,
      score: dto.score,
      requirement: dto.requirement,
      images_required: dto.images_required || 1,
      status: TaskStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * 查询任务列表
   */
  queryTasks(dto: QueryTaskDto): Task[] {
    let tasks = Array.from(this.tasks.values());
    
    if (dto.type) {
      tasks = tasks.filter(t => t.type === dto.type);
    }
    if (dto.status) {
      tasks = tasks.filter(t => t.status === dto.status);
    }
    
    return tasks.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  /**
   * 获取任务详情
   */
  getTaskById(id: string): Task | null {
    return this.tasks.get(id) || null;
  }

  /**
   * 更新任务
   */
  updateTask(dto: UpdateTaskDto): Task | null {
    const task = this.tasks.get(dto.id);
    if (!task) return null;

    const updated = {
      ...task,
      ...dto,
      updated_at: new Date(),
    };
    this.tasks.set(dto.id, updated);
    return updated;
  }

  /**
   * 删除任务
   */
  deleteTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    
    // 软删除
    task.status = TaskStatus.DELETED;
    task.updated_at = new Date();
    return true;
  }

  // ==================== 上报记录管理 ====================

  /**
   * 提交上报
   */
  submitReport(userId: string, userName: string, dto: SubmitReportDto): Report {
    const task = this.tasks.get(dto.task_id);
    if (!task) {
      throw new Error('任务不存在');
    }

    const report: Report = {
      id: this.generateId(),
      user_id: userId,
      task_id: dto.task_id,
      task_name: task.name,
      task_type: task.type,
      images: dto.images,
      location: dto.location,
      remark: dto.remark,
      status: ReportStatus.PENDING,
      score: task.score,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * 查询上报记录
   */
  queryReports(dto: QueryReportDto): Report[] {
    let reports = Array.from(this.reports.values());
    
    if (dto.user_id) {
      reports = reports.filter(r => r.user_id === dto.user_id);
    }
    if (dto.task_type) {
      reports = reports.filter(r => r.task_type === dto.task_type);
    }
    if (dto.status) {
      reports = reports.filter(r => r.status === dto.status);
    }
    if (dto.start_date) {
      const start = new Date(dto.start_date);
      reports = reports.filter(r => r.created_at >= start);
    }
    if (dto.end_date) {
      const end = new Date(dto.end_date);
      reports = reports.filter(r => r.created_at <= end);
    }
    
    return reports.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  /**
   * 获取上报记录详情
   */
  getReportById(id: string): Report | null {
    return this.reports.get(id) || null;
  }

  /**
   * 审核上报记录
   */
  reviewReport(reviewerId: string, reviewerName: string, dto: ReviewReportDto): Report | null {
    const report = this.reports.get(dto.report_id);
    if (!report) return null;

    report.status = dto.status;
    report.reviewer_id = reviewerId;
    report.reviewer_name = reviewerName;
    report.review_remark = dto.remark;
    report.review_at = new Date();
    report.updated_at = new Date();

    if (dto.score !== undefined) {
      report.score = dto.score;
    }

    return report;
  }

  /**
   * 获取用户的待审核记录数
   */
  getPendingCount(userId: string): number {
    return Array.from(this.reports.values())
      .filter(r => r.user_id === userId && r.status === ReportStatus.PENDING)
      .length;
  }

  // ==================== 门店管理 ====================

  /**
   * 创建门店
   */
  createStore(dto: CreateStoreDto): Store {
    const store: Store = {
      id: this.generateId(),
      name: dto.name,
      address: dto.address,
      region: dto.region,
      manager_id: dto.manager_id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.stores.set(store.id, store);
    return store;
  }

  /**
   * 查询门店列表
   */
  queryStores(dto: QueryStoreDto): Store[] {
    let stores = Array.from(this.stores.values());
    
    if (dto.region) {
      stores = stores.filter(s => s.region === dto.region);
    }
    if (dto.status) {
      stores = stores.filter(s => s.status === dto.status);
    }
    
    return stores.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * 获取门店详情
   */
  getStoreById(id: string): Store | null {
    return this.stores.get(id) || null;
  }

  /**
   * 更新门店
   */
  updateStore(dto: UpdateStoreDto): Store | null {
    const store = this.stores.get(dto.id);
    if (!store) return null;

    const updated = {
      ...store,
      ...dto,
      updated_at: new Date(),
    };
    this.stores.set(dto.id, updated);
    return updated;
  }

  /**
   * 删除门店
   */
  deleteStore(id: string): boolean {
    return this.stores.delete(id);
  }

  /**
   * 绑定店长到门店
   */
  bindManager(storeId: string, managerId: string, managerName: string): Store | null {
    const store = this.stores.get(storeId);
    if (!store) return null;

    store.manager_id = managerId;
    store.manager_name = managerName;
    store.updated_at = new Date();
    return store;
  }
}
