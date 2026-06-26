import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(text: string): string {
  return text.replace(/[|│\/\\]/g, " ").replace(/\s+/g, " ").trim();
}
