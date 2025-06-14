import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

interface Booking {
  date: string;
  time: string;
  name: string;
  bribe: string;
}

// Initialize the Google Sheets client
const initGoogleSheets = async () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    throw new Error('Missing required Google Sheets configuration. Please check your .env.local file.');
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error);
    throw new Error('Failed to connect to Google Sheets. Please check your credentials.');
  }
};

// Initialize sheet with headers if needed
const ensureSheetHeaders = async (sheet: any) => {
  await sheet.loadHeaderRow();
  if (!sheet.headerValues || sheet.headerValues.length === 0) {
    await sheet.setHeaderRow(['date', 'time', 'name', 'bribe']);
  }
};

// Get all bookings
export const getBookings = async (): Promise<Booking[]> => {
  try {
    const doc = await initGoogleSheets();
    const sheet = doc.sheetsByIndex[0];
    await ensureSheetHeaders(sheet);
    
    const rows = await sheet.getRows();
    return rows.map(row => ({
      date: row.get('date'),
      time: row.get('time'),
      name: row.get('name'),
      bribe: row.get('bribe'),
    }));
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    throw new Error('Failed to fetch bookings from Google Sheets');
  }
};

// Add a new booking
export const addBooking = async (booking: Booking) => {
  try {
    const doc = await initGoogleSheets();
    const sheet = doc.sheetsByIndex[0];
    await ensureSheetHeaders(sheet);
    
    await sheet.addRow({
      date: booking.date,
      time: booking.time,
      name: booking.name,
      bribe: booking.bribe,
    } as Record<string, string>);
  } catch (error) {
    console.error('Failed to add booking:', error);
    throw new Error('Failed to save booking to Google Sheets');
  }
};

// Check if a time slot is available
export const isTimeSlotAvailable = async (date: string, time: string) => {
  try {
    const bookings = await getBookings();
    return !bookings.some(booking => booking.date === date && booking.time === time);
  } catch (error) {
    console.error('Failed to check time slot availability:', error);
    throw new Error('Failed to check if time slot is available');
  }
}; 