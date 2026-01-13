"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Phone, Search, Calculator, LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Chatbot", href: "/chatbot", icon: MessageSquare },
  { name: "Voice AI", href: "/voice", icon: Phone },
  { name: "Halal Search", href: "/search", icon: Search },
  { name: "Simulator", href: "/simulator", icon: Calculator },
  { name: "Business", href: "/business", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border shadow-2xl transition-all hover:shadow-primary/10">
      <ul className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "stroke-[2.5px]")} />
                <span className="hidden sm:inline-block">{item.name}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1.2 right-1/2 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
