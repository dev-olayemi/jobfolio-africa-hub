export function formatSalary(salary: any): string {
  if (!salary) return "";
  if (typeof salary === "string") return salary;
  if (typeof salary === "object") {
    const { min, max, currency } = salary as any;
    const c = currency ? `${currency} ` : "";
    if (min != null && max != null) {
      try {
        const minNum = typeof min === "number" ? min : parseInt(min as any);
        const maxNum = typeof max === "number" ? max : parseInt(max as any);
        if (!isNaN(minNum) && !isNaN(maxNum)) {
          return `${c}${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
        }
      } catch (e) {
        // fallback
      }
    }
    if (min != null) return `${c}${min}`;
    if (max != null) return `${c}${max}`;
    return "";
  }
  return String(salary);
}

export default { formatSalary };
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
