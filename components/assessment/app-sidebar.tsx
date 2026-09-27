"use client";

import Link from "next/link";
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
import type { Challenge } from "@/lib/assessment/challenges";

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
        <Link
          href="/"
          aria-label="Software Engineer Programme home"
          className="block truncate px-1 text-sm font-semibold leading-tight group-data-[collapsible=icon]:hidden"
        >
          Software Engineer Programme
        </Link>
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
                      aria-current={i === activeIndex ? "page" : undefined}
                      tooltip={`Task ${i + 1} — ${challenge.category}: ${challenge.title}${isCompleted ? " (completed)" : ""}`}
                      onClick={() => onSelect(i)}
                    >
                      <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-current/30 font-mono text-[10px] leading-none"
                      >
                        {i + 1}
                      </span>
                      <Icon aria-hidden />
                      <span>{challenge.title}</span>
                    </SidebarMenuButton>
                    {isCompleted && (
                      <SidebarMenuBadge>
                        <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden />
                        <span className="sr-only">Completed</span>
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
