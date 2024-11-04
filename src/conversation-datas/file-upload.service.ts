import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { FileInfoDto } from './dto/file-info.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUpload {
  private s3Client: S3Client;
  constructor(private configService: ConfigService) {
    // TODO : Moudle에 provider로 선언해서 사용
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }
  async uploadFile(fileDto: FileInfoDto): Promise<string> {
    const { fileName, file, contentType } = fileDto;
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: fileName,
        Body: file,
        ContentType: `${contentType}; charset=utf-8`,
        ContentEncoding: 'utf-8',
      });

      await this.s3Client.send(command);

      return command.input.Key;
    } catch (error) {
      throw new Error('파일 업로드 실패');
    }
  }
}
