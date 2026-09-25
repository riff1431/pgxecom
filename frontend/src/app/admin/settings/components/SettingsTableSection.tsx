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
    <div className="bg-card rounded-xl shadow-xs border border-border overflow-hidden text-card-foreground">
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3 bg-muted/20">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
            placeholder="Search by key or value..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <select
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary outline-none"
          value={group}
          onChange={(event) => onGroupChange(event.target.value)}
        >
          <option value="all">All groups</option>
          <option value="general">General</option>
          <option value="contact">Contact</option>
          <option value="social">Social</option>
        </select>

        {search || group !== "all" ? (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-border bg-background text-foreground hover:bg-muted font-mono text-xs"
          >
            <FilterX className="h-4 w-4 mr-2" /> Clear
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-muted" />
          ))}
        </div>
      ) : (
        <AdminTable>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40 border-b border-border">
              <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Key</TableHead>
              <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Value</TableHead>
              <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Group</TableHead>
              <TableHead className="text-right font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.map((setting) => (
              <TableRow
                key={setting.id}
                className="group hover:bg-muted/40 border-b border-border transition-colors"
              >
                <TableCell className="font-bold font-mono text-foreground text-xs">{setting.key}</TableCell>
                <TableCell className="max-w-md truncate font-mono text-xs text-foreground/80">
                  {setting.value}
                </TableCell>
                <TableCell>
                  <Badge className="bg-background border border-border text-foreground font-mono text-[11px] uppercase">
                    {setting.group || "general"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(setting)}
                      className="border-border bg-background hover:bg-muted text-foreground h-8 w-8 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 h-8 w-8 rounded-lg"
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
                  className="text-center py-14 text-slate-400 font-mono text-xs"
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
