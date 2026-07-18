"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogIn, GraduationCap } from "lucide-react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/demo", label: "Demo" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

const authedNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/study-plan", label: "Study Plan" },
  { href: "/target-planner", label: "Target Planner" },
  { href: "/calculator", label: "Calculator" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useSupabase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong shadow-lg shadow-navy-950/50" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo shadow-lg shadow-electric-blue/25 transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            AU<span className="gradient-text"> Track</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {(user ? authedNavLinks : navLinks).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-electric-blue"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-navy-700" />
          ) : user ? (
            <Link href="/dashboard">
              <Button size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-gray-300 hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-strong overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {(user ? authedNavLinks : navLinks).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-electric-blue/10 text-electric-blue"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-navy-700 pt-3">
                {isLoading ? null : user ? (
                  <Link href="/dashboard">
                    <Button fullWidth size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" fullWidth size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button fullWidth size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
