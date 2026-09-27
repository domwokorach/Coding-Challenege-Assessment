"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <Link
          href="/"
          aria-label="Software Engineer Programme home"
          className="min-w-0 truncate rounded-full text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          Software Engineer Programme
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 md:flex"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Login
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/contact" />}>
            Contact Us
          </Button>
        </div>

        {/* Mobile / tablet: hamburger opens a Sheet drawer with the full nav */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="right"
            aria-describedby={undefined}
            className="flex w-4/5 flex-col gap-1 pt-6"
            style={{
              paddingTop: "max(1.5rem, env(safe-area-inset-top))",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              paddingRight: "max(1.5rem, env(safe-area-inset-right))",
            }}
          >
            <SheetHeader className="px-0 text-left">
              <SheetTitle className="text-sm font-semibold">
                Software Engineer Programme
              </SheetTitle>
            </SheetHeader>

            <nav aria-label="Primary" className="mt-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={cn(
                        "min-h-11 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                        pathname === link.href
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
              <SheetClose
                nativeButton={false}
                render={
                  <Button variant="outline" nativeButton={false} render={<Link href="/login" />} />
                }
              >
                Login
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={<Button nativeButton={false} render={<Link href="/contact" />} />}
              >
                Contact Us
              </SheetClose>
            </div>
          </SheetContent>

          <Button
            variant="outline"
            size="icon"
            aria-label="Open navigation menu"
            className="min-h-11 min-w-11 md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </Sheet>
      </div>
    </header>
  );
}
