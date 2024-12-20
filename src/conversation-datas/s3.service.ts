import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileInfoDto } from './dto/file-info.dto';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GlobalHttpException } from 'src/utils/global-http-exception';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  logger: Logger = new Logger('FileUploadService');

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
      if (file == undefined) return fileName;
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: fileName,
        Body: file,
        // ContentType: contentType || `charset=utf-8`,
        ContentEncoding: 'utf-8',
      });

      await this.s3Client.send(command);

      return command.input.Key;
    } catch (error) {
      this.logger.debug(error.stack);
      throw new GlobalHttpException(
        'S3Upload Error',
        'S3_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: Presigned URL 받아오기
  async getPresignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
