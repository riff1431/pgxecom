import { Module } from '@nestjs/common';
import { UploadController, UploadAvatarController } from './upload.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [UploadController, UploadAvatarController],
})
export class UploadModule {}
