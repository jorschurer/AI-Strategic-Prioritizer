import { v4 as uuidv4 } from 'uuid';

export function generateToken(): string {
  return uuidv4().replace(/-/g, '');
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateTimeSlots(start: string, end: string, durationMinutes: number = 15): Date[] {
  const slots: Date[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  let current = new Date(startDate);
  while (current < endDate) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + durationMinutes * 60000);
  }

  return slots;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    collecting: 'bg-blue-100 text-blue-800',
    memo_ready: 'bg-yellow-100 text-yellow-800',
    commitments: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    invited: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    interviewed: 'bg-yellow-100 text-yellow-800',
    committed: 'bg-green-100 text-green-800',
    agree: 'bg-green-100 text-green-800',
    block: 'bg-red-100 text-red-800',
    need_change: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Entwurf',
    collecting: 'Interviews laufen',
    memo_ready: 'Memo bereit',
    commitments: 'Commitments sammeln',
    completed: 'Abgeschlossen',
    invited: 'Eingeladen',
    scheduled: 'Termin gewählt',
    interviewed: 'Interview erledigt',
    committed: 'Commitment abgegeben',
    agree: 'Zustimmung',
    block: 'Blockiert',
    need_change: 'Änderung nötig',
  };
  return labels[status] || status;
}
