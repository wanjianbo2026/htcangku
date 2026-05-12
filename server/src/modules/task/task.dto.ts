import { TaskType, TaskStatus, ReportStatus } from './task.types';

/**
 * 创建任务DTO
 */
export class CreateTaskDto {
  name: string;
  description: string;
  type: TaskType;
  score: number;
  requirement: string;
  images_required?: number;
}

/**
 * 更新任务DTO
 */
export class UpdateTaskDto {
  id: string;
  name?: string;
  description?: string;
  type?: TaskType;
  score?: number;
  requirement?: string;
  images_required?: number;
  status?: TaskStatus;
}

/**
 * 查询任务DTO
 */
export class QueryTaskDto {
  type?: TaskType;
  status?: TaskStatus;
}

/**
 * 上报任务DTO
 */
export class SubmitReportDto {
  task_id: string;
  images: string[];
  location?: string;
  remark?: string;
}

/**
 * 审核上报记录DTO
 */
export class ReviewReportDto {
  report_id: string;
  status: ReportStatus.APPROVED | ReportStatus.REJECTED;
  score?: number;  // 可调整积分
  remark?: string; // 审核备注
}

/**
 * 查询上报记录DTO
 */
export class QueryReportDto {
  user_id?: string;     // 查询指定用户的记录
  task_type?: TaskType; // 任务类型筛选
  status?: ReportStatus; // 状态筛选
  start_date?: string;  // 开始日期
  end_date?: string;    // 结束日期
}

/**
 * 创建门店DTO
 */
export class CreateStoreDto {
  name: string;
  address: string;
  region: string;
  manager_id?: string;
}

/**
 * 更新门店DTO
 */
export class UpdateStoreDto {
  id: string;
  name?: string;
  address?: string;
  region?: string;
  manager_id?: string;
  status?: 'active' | 'inactive';
}

/**
 * 查询门店DTO
 */
export class QueryStoreDto {
  region?: string;
  status?: 'active' | 'inactive';
}
