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
        <TableRow className="hover:bg-transparent bg-[#080e18] border-slate-800/80">
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Blog</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Tags</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Published</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-right font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blogs.map((blog) => (
          <TableRow
            key={blog.id}
            className="group hover:bg-slate-800/40 border-slate-800/60 transition-colors"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <img
                  src={resolveImageUrl(blog.coverImage)}
                  alt={blog.title}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-800 bg-slate-900"
                />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">
                    {blog.title}
                  </p>
                  <p className="text-xs font-mono text-slate-400 truncate">/{blog.slug}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm font-mono text-slate-300">
              {blog.tags.length > 0
                ? blog.tags.slice(0, 3).join(", ")
                : "No tags"}
            </TableCell>
            <TableCell className="text-sm font-mono text-slate-400">
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
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(blog)}
                  className="border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 h-8 w-8 rounded-lg"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 h-8 w-8 rounded-lg"
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
