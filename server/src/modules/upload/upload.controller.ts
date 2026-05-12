import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 单个文件上传
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('未上传文件', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.uploadService.uploadFile(file);
      return {
        code: 200,
        msg: '上传成功',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        '上传失败: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 多个文件上传
   */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new HttpException('未上传文件', HttpStatus.BAD_REQUEST);
    }

    try {
      const results = await this.uploadService.uploadFiles(files);
      return {
        code: 200,
        msg: '上传成功',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        '上传失败: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取文件
   */
  @Get('files/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const file = await this.uploadService.getFile(filename);
      if (!file) {
        throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
      }

      res.setHeader('Content-Type', file.mimetype);
      res.send(file.data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '获取文件失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
