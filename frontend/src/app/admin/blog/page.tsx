"use client";

import { AdminDeleteDialog } from "@/components/admin/AdminDeleteDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AppPagination } from "@/components/shared/AppPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteAdminBlogPost,
  useGetAdminBlogPosts,
  useToggleAdminBlogStatus,
} from "@/lib/api/blog";
import type { BlogPost } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { FilterX, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { BlogDialog } from "./components/BlogDialog";
import { BlogsTable } from "./components/BlogsTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(""),
    },
    {
      shallow: false,
      history: "push",
    },
  );

  const [debouncedSearch] = useDebounceValue(params.search, 600);

  const previousFilterRef = useRef({
    search: debouncedSearch,
  });

  const { data: blogsData, isLoading } = useGetAdminBlogPosts({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch,
  });

  const toggleStatusMutation = useToggleAdminBlogStatus();
  const deleteMutation = useDeleteAdminBlogPost();

  useEffect(() => {
    const filtersChanged = previousFilterRef.current.search !== debouncedSearch;

    if (filtersChanged && params.page !== 1) {
      setParams({ page: 1 });
    }

    previousFilterRef.current = {
      search: debouncedSearch,
    };
  }, [debouncedSearch, params.page, setParams]);

  const handleCreate = () => {
    setSelectedBlog(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (blog: BlogPost) => {
    try {
      setTogglingId(blog.id);
      await toggleStatusMutation.mutateAsync({
        id: blog.id,
        isPublished: !blog.isPublished,
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success(`Blog ${blog.isPublished ? "set inactive" : "set active"}`);
    } catch {
      toast.error("Failed to update blog status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (blog: BlogPost) => {
    setBlogToDelete(blog);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      setDeletingId(blogToDelete.id);
      await deleteMutation.mutateAsync(blogToDelete.id);
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog deleted");
      setBlogToDelete(null);
    } catch {
      toast.error("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      search: "",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Blogs"
        description="Manage blog posts and publication status."
        actionLabel="Write Blog"
        onAction={handleCreate}
      />

      <div className="bg-card rounded-xl shadow-xs border border-border mt-4 overflow-hidden text-card-foreground">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center bg-muted/20">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blog title, excerpt, or tag..."
              className="pl-10 h-11 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
              value={params.search}
              onChange={(event) => setParams({ search: event.target.value })}
            />
          </div>

          {params.search && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-border bg-background text-foreground hover:bg-muted font-mono text-xs"
            >
              <FilterX className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-14 bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <BlogsTable
              blogs={blogsData?.data || []}
              togglingId={togglingId}
              deletingId={deletingId}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />

            {blogsData?.data?.length === 0 && (
              <AdminEmptyState
                title="No blogs found"
                description="Try adjusting search or write a new post."
              />
            )}
          </>
        )}

        {blogsData?.meta && blogsData.meta.totalPage > 1 && (
          <div className="p-4 border-t border-border bg-muted/20">
            <AppPagination
              currentPage={params.page}
              totalPages={blogsData.meta.totalPage}
              onPageChange={(page) => setParams({ page })}
            />
          </div>
        )}
      </div>

      <BlogDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        blog={selectedBlog}
      />

      <AdminDeleteDialog
        open={!!blogToDelete}
        title="Delete Blog?"
        description={`This action cannot be undone. Blog${blogToDelete ? ` \"${blogToDelete.title}\"` : ""} will be permanently removed.`}
        confirmLabel="Delete"
        isDeleting={!!blogToDelete && deletingId === blogToDelete.id}
        onOpenChange={(open) => !open && setBlogToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
