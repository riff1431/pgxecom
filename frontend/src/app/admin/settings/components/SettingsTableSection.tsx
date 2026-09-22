import { Edit, FilterX, Search, Trash2 } from "lucide-react";

import { AdminTable } from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Setting } from "@/types";

interface SettingsTableSectionProps {
  settings: Setting[];
  isLoading: boolean;
  search: string;
  group: string;
  onSearchChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onClearFilters: () => void;
  onEdit: (setting: Setting) => void;
  onDelete: (setting: Setting) => void;
}

export function SettingsTableSection({
  settings,
  isLoading,
  search,
  group,
  onSearchChange,
  onGroupChange,
  onClearFilters,
  onEdit,
  onDelete,
}: SettingsTableSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b flex flex-wrap items-center gap-3 bg-gray-50/50">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 h-11 rounded-xl"
            placeholder="Search by key or value..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <select
          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
          value={group}
          onChange={(event) => onGroupChange(event.target.value)}
        >
          <option value="all">All groups</option>
          <option value="general">General</option>
          <option value="contact">Contact</option>
          <option value="social">Social</option>
        </select>

        {search || group !== "all" ? (
          <Button onClick={onClearFilters}>
            <FilterX className="h-4 w-4 mr-2" /> Clear
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <AdminTable>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.map((setting) => (
              <TableRow key={setting.id}>
                <TableCell className="font-medium">{setting.key}</TableCell>
                <TableCell className="max-w-md truncate">
                  {setting.value}
                </TableCell>
                <TableCell>
                  <Badge className="bg-gray-100 text-gray-700 border-0">
                    {setting.group || "general"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(setting)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => onDelete(setting)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {settings.length ? null : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-14 text-gray-500"
                >
                  No settings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </AdminTable>
      )}
    </div>
  );
}
