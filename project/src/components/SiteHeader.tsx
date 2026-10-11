import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSETS } from "@/lib/assets";

const navLinks = [
  { href: "/", label: "الصفحة الرئيسية" },
  { href: "/identity", label: "هويتنا" },
  { href: "/management", label: "فريق إدارة مدرسة دلة" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container max-w-7xl flex items-center justify-between h-20 mx-auto px-4">
        {/* الشعار */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src={ASSETS.dallahLogo}
            alt="شركة دلة لتعليم قيادة السيارات"
            className="h-12 w-auto object-contain"
            loading="eager"
          />
          <div className="hidden sm:flex flex-col leading-tight border-r border-gray-200 pr-3">
            <span className="font-extrabold text-base text-gray-900">شركة دلة</span>
            <span className="text-[10px] text-gray-500 tracking-wider">DALLAH DRIVING COMPANY</span>
          </div>
        </Link>

        {/* روابط سطح المكتب */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-semibold transition-colors",
                  isActive
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* زر القائمة للموبايل */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="القائمة"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* قائمة الموبايل */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="container max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-md text-sm font-semibold transition-colors",
                    isActive
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
