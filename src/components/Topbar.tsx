import { ArrowLeft, ClipboardList, CircleHelp, Bell, Sparkles, ChevronDown } from "lucide-react";

export function Topbar({ breadcrumb = "Exams" }: { breadcrumb?: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3 text-veda-gray-500">
        <button type="button" aria-label="Back" className="hover:text-veda-black transition-colors">
          <ArrowLeft size={20} />
        </button>
        <ClipboardList size={18} />
        <span className="text-[15px]">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" aria-label="Help" className="w-9 h-9 rounded-full border border-veda-gray-200 flex items-center justify-center text-veda-gray-500 hover:bg-veda-gray-50">
          <CircleHelp size={18} />
        </button>
        <button type="button" aria-label="Notifications" className="relative text-veda-gray-500 hover:text-veda-black">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-veda-orange" />
        </button>
        <button type="button" aria-label="AI" className="w-9 h-9 rounded-full border border-veda-gray-200 flex items-center justify-center text-veda-black hover:bg-veda-gray-50">
          <Sparkles size={16} />
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-veda-black overflow-hidden flex items-center justify-center">
            <span className="text-white text-xs font-heading font-semibold">MR</span>
          </div>
          <span className="text-[15px] font-medium text-veda-black">Madhur Rastogi</span>
          <ChevronDown size={16} className="text-veda-gray-500" />
        </div>
      </div>
    </header>
  );
}
