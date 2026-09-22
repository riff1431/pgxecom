import { IsBoolean } from 'class-validator';

export class SetBlogStatusDto {
  @IsBoolean()
  isPublished!: boolean;
}
