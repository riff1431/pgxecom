import { AdminStatusToggle } from "@/components/admin/AdminStatusToggle";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resolveImageUrl } from "@/lib/utils";
import type { BlogPost } from "@/types";
import { Pencil, Trash2 } from "lucide-react";

interface BlogsTableProps {
  blogs: BlogPost[];
  togglingId?: string | null;
  deletingId?: string | null;
  onEdit: (blog: BlogPost) => void;
  onToggleStatus: (blog: BlogPost) => void;
  onDelete: (blog: BlogPost) => void;
}

export function BlogsTable({
  blogs,
  togglingId,
  deletingId,
  onEdit,
  onToggleStatus,
  onDelete,
}: BlogsTableProps) {
  return (
    <AdminTable>
      <TableHeader>
        <TableRow>
          <TableHead>Blog</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blogs.map((blog) => (
          <TableRow key={blog.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <img
                  src={resolveImageUrl(blog.coverImage)}
                  alt={blog.title}
                  className="h-12 w-12 rounded-lg object-cover border"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {blog.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">/{blog.slug}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {blog.tags.length > 0
                ? blog.tags.slice(0, 3).join(", ")
                : "No tags"}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString()
                : "Not published"}
            </TableCell>
            <TableCell>
              <AdminStatusToggle
                checked={blog.isPublished}
                onCheckedChange={() => onToggleStatus(blog)}
                disabled={togglingId === blog.id}
                activeLabel="Published"
                inactiveLabel="Draft"
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(blog)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  disabled={deletingId === blog.id}
                  onClick={() => onDelete(blog)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </AdminTable>
  );
}
