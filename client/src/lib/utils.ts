import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import confetti from 'canvas-confetti';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), 'MMM d, yyyy · h:mm a');
  } catch {
    return String(dateString);
  }
}

export function formatTimeAgo(dateString?: string | Date): string {
  if (!dateString) return '—';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return String(dateString);
  }
}

export function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#16a34a', '#3b82f6', '#f59e0b', '#10b981'],
  });
}
