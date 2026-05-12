import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  // 模拟文件存储（实际项目应使用对象存储服务如OSS、S3等）
  private storage: Map<string, { data: Buffer; mimetype: string; filename: string }> = new Map();

  /**
   * 上传文件
   */
  async uploadFile(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    // 生成唯一文件名
    const fileId = crypto.randomUUID();
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${fileId}.${ext}`;

    // 保存到内存存储（模拟）
    this.storage.set(filename, {
      data: file.buffer,
      mimetype: file.mimetype,
      filename: file.originalname,
    });

    // 返回访问URL
    const url = `/api/upload/files/${filename}`;

    return {
      url,
      filename: file.originalname,
    };
  }

  /**
   * 获取文件
   */
  async getFile(filename: string): Promise<{ data: Buffer; mimetype: string } | null> {
    return this.storage.get(filename) || null;
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: Express.Multer.File[]): Promise<Array<{ url: string; filename: string }>> {
    const results: Array<{ url: string; filename: string }> = [];
    for (const file of files) {
      results.push(await this.uploadFile(file));
    }
    return results;
  }
}
