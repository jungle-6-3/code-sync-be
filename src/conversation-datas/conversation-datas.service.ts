import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInfoDto } from './dto/file-info.dto';

@Injectable()
export class ConversationDatasService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }
  async uploadClient(file: Express.Multer.File) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `tests/${Date.now()}_${file.filename}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      return {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        key: command.input.Key,
        url: `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${command.input.Key}`,
      };
    } catch (error) {
      throw new Error('파일 업로드 실패');
    }
  }

  async uploadFile(fileDto: FileInfoDto) {
    const { fileName, file, extension, uuid } = fileDto;
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${uuid}/${fileName}`,
        Body: file,
        ContentType: extension,
      });

      await this.s3Client.send(command);

      return {
        key: command.input.Key,
        url: `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${command.input.Key}`,
      };
    } catch (error) {
      throw new Error('파일 업로드 실패');
    }
  }
}
