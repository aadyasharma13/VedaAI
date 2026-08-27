"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children, breadcrumb }: { children: React.ReactNode; breadcrumb?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex gap-4 p-4 bg-[#f2f2f2] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1 min-w-0 flex flex-col bg-[#f7f7f7] rounded-3xl overflow-hidden">
        <Topbar breadcrumb={breadcrumb} />
        <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
