"use client";

import { Braces, Brackets, CheckCircle2, SquareFunction, Trophy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Challenge } from "@/lib/challenges";

const CATEGORY_ICONS: Record<string, typeof Brackets> = {
  Arrays: Brackets,
  Functions: SquareFunction,
  Objects: Braces,
};

export function AppSidebar({
  challenges,
  activeIndex,
  completed,
  onSelect,
  courseCompleted,
  onViewProgress,
}: {
  challenges: Challenge[];
  activeIndex: number;
  completed: Record<number, boolean>;
  onSelect: (index: number) => void;
  courseCompleted: boolean;
  onViewProgress: () => void;
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
            SE
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-tight">
              Software Engineer
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Coding Assessment
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Challenges</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {challenges.map((challenge, i) => {
                const Icon = CATEGORY_ICONS[challenge.category] ?? Brackets;
                const isCompleted = Boolean(completed[challenge.id]);
                return (
                  <SidebarMenuItem key={challenge.id}>
                    <SidebarMenuButton
                      isActive={i === activeIndex}
                      tooltip={`${challenge.category} — ${challenge.title}`}
                      onClick={() => onSelect(i)}
                    >
                      <Icon />
                      <span>{challenge.title}</span>
                    </SidebarMenuButton>
                    {isCompleted && (
                      <SidebarMenuBadge>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Course Progress" onClick={onViewProgress}>
              <Trophy
                className={
                  courseCompleted ? "text-emerald-500" : "text-sidebar-foreground/60"
                }
              />
              <span>Progress</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
