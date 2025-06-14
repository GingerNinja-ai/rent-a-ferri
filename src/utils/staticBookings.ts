interface Booking {
  date: string;
  time: string;
  name: string;
  bribe: string;
}

const STORAGE_KEY = 'rent-a-ferri-bookings';

export const getBookings = (): Booking[] => {
  if (typeof window === 'undefined') return [];
  const bookings = localStorage.getItem(STORAGE_KEY);
  return bookings ? JSON.parse(bookings) : [];
};

export const addBooking = (booking: Booking): void => {
  if (typeof window === 'undefined') return;
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const isTimeSlotAvailable = (date: string, time: string): boolean => {
  const bookings = getBookings();
  return !bookings.some(booking => booking.date === date && booking.time === time);
}; 