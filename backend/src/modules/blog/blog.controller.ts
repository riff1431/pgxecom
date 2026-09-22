import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { BlogListResponse, SerializedBlogPost } from './blog.service';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { SetBlogStatusDto } from './dto/set-blog-status.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findPublished(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<BlogListResponse> {
    return this.blogService.findPublished({ page, limit, search });
  }

  @Get('details/:slug')
  findDetailsBySlug(@Param('slug') slug: string): Promise<SerializedBlogPost> {
    return this.blogService.findDetailsBySlug(slug);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<SerializedBlogPost> {
    return this.blogService.findBySlug(slug);
  }
}

@Controller('admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminBlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<BlogListResponse> {
    return this.blogService.adminFindAll({ page, limit, search });
  }

  @Post()
  create(@Body() data: CreateBlogDto): Promise<SerializedBlogPost> {
    return this.blogService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateBlogDto): Promise<SerializedBlogPost> {
    return this.blogService.update(id, data);
  }

  @Put(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() data: SetBlogStatusDto,
  ): Promise<SerializedBlogPost> {
    return this.blogService.setStatus(id, data.isPublished);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.blogService.delete(id);
  }
}
