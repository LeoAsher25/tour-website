"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog } from "@base-ui/react/dialog";
import { LogOut, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { siteConfig } from "@/config/site";
import type { AdminUser } from "@/types/domain";

type AdminDrawerProps = {
  admin: AdminUser;
  onSignOut: () => Promise<void>;
};

export function AdminDrawer({ admin, onSignOut }: AdminDrawerProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const reduce = useReducedMotion();

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          render={
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-foreground/15">
              <Menu className="h-[18px] w-[18px]" />
            </button>
          }
        />
        <AnimatePresence>
          {open && (
            <Dialog.Portal>
              <Dialog.Backdrop
                className="fixed inset-0 z-[60] bg-dark-bg/40 backdrop-blur-sm"
                render={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.22 }}
                  />
                }
              />
              <Dialog.Popup
                className="fixed inset-y-0 left-0 z-[70] flex w-[88vw] max-w-[320px] flex-col border-r border-border bg-card shadow-2xl"
                aria-labelledby={titleId}
                render={
                  <motion.div
                    initial={reduce ? false : { x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={reduce ? undefined : { x: "-100%" }}
                    transition={{
                      duration: reduce ? 0 : 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}>
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-serif text-base text-primary-foreground">
                          {siteConfig.brand.shortName.charAt(0)}
                        </div>
                        <div className="leading-tight">
                          <p
                            id={titleId}
                            className="font-serif text-base font-medium text-foreground">
                            {siteConfig.brand.shortName}
                          </p>
                          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            Admin console
                          </p>
                        </div>
                      </Link>
                      <Dialog.Close
                        render={
                          <button
                            type="button"
                            aria-label="Close navigation"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:border-foreground/15">
                            <X className="h-[18px] w-[18px] text-foreground" />
                          </button>
                        }
                      />
                    </div>

                    <div className="flex flex-1 flex-col overflow-hidden">
                      <div
                        className="flex-1 overflow-y-auto"
                        onClick={() => setOpen(false)}>
                        <SidebarNav />
                      </div>

                      <div className="border-t border-border p-4">
                        <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint font-serif text-sm font-medium text-accent-hover">
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {admin.name ?? admin.email}
                            </p>
                            <p className="text-xs capitalize text-muted-foreground">
                              {admin.role.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <form action={onSignOut}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </Button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                }
              />
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  );
}
