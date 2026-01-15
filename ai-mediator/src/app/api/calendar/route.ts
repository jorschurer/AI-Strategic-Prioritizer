import { NextRequest, NextResponse } from 'next/server';
import { createEvents, EventAttributes } from 'ics';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { title, description, startTime, durationMinutes, url, attendeeName, attendeeEmail } =
      await request.json();

    const start = new Date(startTime);

    const event: EventAttributes = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      duration: { minutes: durationMinutes || 15 },
      title,
      description: url ? `${description}\n\nLink zum Interview: ${url}` : description,
      url,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      attendees: attendeeName
        ? [{ name: attendeeName, email: attendeeEmail, rsvp: true }]
        : undefined,
    };

    return new Promise<NextResponse>((resolve) => {
      createEvents([event], (error, value) => {
        if (error) {
          resolve(
            NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 })
          );
        } else {
          resolve(
            new NextResponse(value, {
              headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="interview.ics"`,
              },
            })
          );
        }
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate calendar' },
      { status: 500 }
    );
  }
}
