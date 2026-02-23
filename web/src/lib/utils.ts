import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: unknown[]) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
  return debounced as T;
}
