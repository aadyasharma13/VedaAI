"use client";

import Image from "next/image";
import { PanelLeft, Settings, Sparkles, ChevronsRight } from "lucide-react";
import { HomeIcon, ClassroomIcon, AssignmentsIcon, ExamsIcon, LibraryIcon } from "./icons/NavIcons";
import { Logo } from "./icons/Logo";

const NAV_ITEMS = [
  { label: "Home", icon: HomeIcon, active: false },
  { label: "My Classroom", icon: ClassroomIcon, active: false },
  { label: "Assignments", icon: AssignmentsIcon, active: false },
  { label: "Exams", icon: ExamsIcon, active: true },
  { label: "My Library", icon: LibraryIcon, active: false },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  if (collapsed) {
    return (
      <aside className="w-[88px] shrink-0 bg-white rounded-3xl shadow-sm flex flex-col items-center p-4 h-full">
        <Logo size={36} />

        <button
          type="button"
          className="mt-6 w-12 h-12 rounded-full bg-veda-black flex items-center justify-center ring-2 ring-veda-orange/70 hover:ring-veda-orange transition-shadow shrink-0"
          aria-label="AI Teacher's Toolkit"
        >
          <Sparkles size={18} className="text-white" fill="white" />
        </button>

        <nav className="mt-6 flex flex-col gap-1 items-center">
          {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              title={label}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                active ? "bg-veda-gray-100 text-veda-black" : "text-veda-gray-500 hover:bg-veda-gray-50"
              }`}
            >
              <Icon size={19} />
            </a>
          ))}
        </nav>

        <div className="flex-1" />

        <a
          href="#"
          aria-label="Settings"
          title="Settings"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-veda-gray-500 hover:bg-veda-gray-50"
        >
          <Settings size={19} />
        </a>

        <div className="mt-3 w-11 h-11 rounded-2xl bg-veda-gray-100 flex items-center justify-center p-1.5" title="Delhi Public School">
          <div className="relative w-full h-full">
            <Image src="/illustrations/school-crest-only.png" alt="Delhi Public School" fill sizes="44px" className="object-contain" />
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand sidebar"
          className="mt-4 w-8 h-8 flex items-center justify-center text-veda-gray-400 hover:text-veda-black"
        >
          <ChevronsRight size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] shrink-0 bg-white rounded-3xl shadow-sm flex flex-col p-6 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-heading font-bold text-xl text-veda-black">VedaAI</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse sidebar"
          className="w-8 h-8 rounded-lg border border-veda-gray-200 flex items-center justify-center text-veda-gray-500 hover:bg-veda-gray-50"
        >
          <PanelLeft size={16} />
        </button>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-full bg-veda-black text-white font-heading font-semibold text-sm py-3 flex items-center justify-center gap-2 ring-2 ring-veda-orange/70 hover:ring-veda-orange transition-shadow"
      >
        <Sparkles size={16} className="text-white" fill="white" />
        AI Teacher&apos;s Toolkit
      </button>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] transition-colors ${
              active ? "bg-veda-gray-100 text-veda-black font-semibold" : "text-veda-gray-500 hover:bg-veda-gray-50"
            }`}
          >
            <Icon size={19} />
            {label}
          </a>
        ))}
      </nav>

      <div className="flex-1" />

      <a
        href="#"
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] text-veda-gray-500 hover:bg-veda-gray-50"
      >
        <Settings size={19} />
        Settings
      </a>

      <div className="mt-3 relative w-full aspect-[256/84]">
        <Image src="/illustrations/school-badge.png" alt="Delhi Public School, Bokaro Steel City" fill sizes="280px" className="object-contain" />
      </div>
    </aside>
  );
}
