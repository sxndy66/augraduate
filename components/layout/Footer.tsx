import Link from "next/link";
import { Github, Mail, GraduationCap, Shield, FileText, MessageSquare } from "lucide-react";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms of Service", icon: FileText },
  { href: "/contact", label: "Contact", icon: MessageSquare },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-navy-700 bg-navy-950/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                AU<span className="gradient-text"> Track</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-400">
              Smart CGPA tracking and academic insights for Anna University students.
            </p>
            <p className="mt-4 text-sm font-medium text-gray-300">
              Created by{" "}
              <span className="text-electric-blue">Santhosh V</span>
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-electric-blue"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Connect
            </h3>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com/santhosh023166"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-600 bg-navy-800/50 text-gray-400 transition-all hover:border-electric-blue/40 hover:text-electric-blue"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:santhosh023166@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-600 bg-navy-800/50 text-gray-400 transition-all hover:border-electric-blue/40 hover:text-electric-blue"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl border border-navy-700 bg-navy-800/30 p-4">
          <p className="text-xs leading-relaxed text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> AU Track is an
            independent project and is not affiliated with, endorsed by, or
            officially connected to Anna University. All academic data is
            self-reported by users. Always verify your official results through
            your university&apos;s official channels.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-navy-700 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AU Track. Created by Santhosh V. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
