/**
 * 任务类型枚举
 */
export enum TaskType {
  DAILY = 'daily',     // 每日任务
  WEEKLY = 'weekly',   // 每周任务
  MONTHLY = 'monthly', // 每月任务
  SPECIAL = 'special', // 特殊任务
}

/**
 * 任务状态
 */
export enum TaskStatus {
  ACTIVE = 'active',   // 活跃中
  PAUSED = 'paused',   // 已暂停
  DELETED = 'deleted', // 已删除
}

/**
 * 任务模型
 */
export interface Task {
  id: string;
  name: string;           // 任务名称
  description: string;    // 任务描述
  type: TaskType;         // 任务类型
  score: number;          // 完成积分
  requirement: string;    // 任务要求
  images_required: number; // 需要上传的图片数量
  status: TaskStatus;     // 任务状态
  created_at: Date;
  updated_at: Date;
}

/**
 * 上报记录状态
 */
export enum ReportStatus {
  PENDING = 'pending',   // 待审核
  APPROVED = 'approved', // 已通过
  REJECTED = 'rejected', // 已驳回
}

/**
 * 上报记录模型
 */
export interface Report {
  id: string;
  user_id: string;       // 上报用户ID
  task_id: string;       // 任务ID
  task_name: string;     // 任务名称（冗余，方便查询）
  task_type: TaskType;   // 任务类型（冗余）
  images: string[];      // 图片URL列表
  location?: string;     // 上报位置
  remark?: string;       // 备注
  status: ReportStatus;  // 审核状态
  score: number;         // 获得积分
  reviewer_id?: string;  // 审核人ID
  reviewer_name?: string; // 审核人姓名
  review_remark?: string; // 审核备注
  review_at?: Date;      // 审核时间
  created_at: Date;
  updated_at: Date;
}

/**
 * 门店模型
 */
export interface Store {
  id: string;
  name: string;          // 门店名称
  address: string;       // 门店地址
  region: string;        // 所属区域
  manager_id?: string;   // 店长ID
  manager_name?: string; // 店长姓名
  status: 'active' | 'inactive'; // 门店状态
  created_at: Date;
  updated_at: Date;
}
