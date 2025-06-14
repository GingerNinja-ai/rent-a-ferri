import { NextResponse } from 'next/server';
import { addBooking, getBookings, isTimeSlotAvailable } from '@/utils/bookings';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, time, name, bribe } = body;

    // Validate required fields
    if (!date || !time || !name || !bribe) {
      return NextResponse.json(
        { error: 'Missing required fields', received: { date, time, name, bribe } },
        { status: 400 }
      );
    }

    // Validate bribe amount
    const bribeAmount = parseFloat(bribe);
    if (isNaN(bribeAmount) || bribeAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid bribe amount' },
        { status: 400 }
      );
    }

    // Check if time slot is available
    const isAvailable = await isTimeSlotAvailable(date, time);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    // Add the booking
    await addBooking({ date, time, name, bribe });
    return NextResponse.json({ message: 'Booking successful' });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 