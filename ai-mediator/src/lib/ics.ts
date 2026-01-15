import { createEvents, EventAttributes } from 'ics';

export interface CalendarEventParams {
  title: string;
  description: string;
  startTime: Date;
  durationMinutes: number;
  url?: string;
  organizer?: { name: string; email: string };
  attendee?: { name: string; email: string };
}

export async function generateICS(params: CalendarEventParams): Promise<string> {
  const { title, description, startTime, durationMinutes, url, organizer, attendee } = params;

  const start: [number, number, number, number, number] = [
    startTime.getFullYear(),
    startTime.getMonth() + 1,
    startTime.getDate(),
    startTime.getHours(),
    startTime.getMinutes(),
  ];

  const event: EventAttributes = {
    start,
    duration: { minutes: durationMinutes },
    title,
    description: url ? `${description}\n\nLink: ${url}` : description,
    url,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: organizer ? { name: organizer.name, email: organizer.email } : undefined,
    attendees: attendee ? [{ name: attendee.name, email: attendee.email, rsvp: true }] : undefined,
  };

  return new Promise((resolve, reject) => {
    createEvents([event], (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
