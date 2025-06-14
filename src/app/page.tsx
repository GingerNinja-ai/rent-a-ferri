'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Popover } from '@headlessui/react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { getBookings, addBooking, isTimeSlotAvailable } from '@/utils/staticBookings';

interface BookingForm {
  date: string;
  time: string;
  name: string;
  bribe: string;
}

interface Booking {
  date: string;
  time: string;
  name: string;
  bribe: string;
}

export default function Home() {
  const [formData, setFormData] = useState<BookingForm>({
    date: '',
    time: '',
    name: '',
    bribe: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // Get tomorrow's date in DD.MM.YYYY format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow;

  // Get date 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  // Fetch existing bookings
  useEffect(() => {
    setBookings(getBookings());
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: format(date, 'dd.MM.yyyy')
    });
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Check if a time slot is booked
  const isTimeSlotBooked = (date: string, time: string) => {
    return bookings.some(booking => booking.date === date && booking.time === time);
  };

  // Get available time slots for a selected date
  const getAvailableTimeSlots = (date: string) => {
    return timeSlots.filter(time => !isTimeSlotBooked(date, time));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.date || !formData.time || !formData.name || !formData.bribe) {
        throw new Error('Please fill in all fields');
      }

      // Validate bribe amount
      const bribeAmount = parseFloat(formData.bribe);
      if (isNaN(bribeAmount) || bribeAmount < 0) {
        throw new Error('Please enter a valid bribe amount');
      }

      // Check if time slot is available
      if (!isTimeSlotAvailable(formData.date, formData.time)) {
        throw new Error('This time slot is already booked');
      }

      // Add the booking
      addBooking(formData);
      setBookings([...bookings, formData]);
      setSuccess(true);
      setFormData({ date: '', time: '', name: '', bribe: '' });
      setSelectedDate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/20 to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Rent-A-Ferri
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Book your next adventure in the final frontier
          </p>
        </motion.div>
      </div>

      {/* Booking Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-800"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Schedule Your Mission</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Select Date
                </label>
                <Popover className="relative">
                  <Popover.Button className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between">
                    <span>{formData.date || 'Select a date'}</span>
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </Popover.Button>

                  <Popover.Panel className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronLeftIcon className="h-5 w-5 text-gray-400" />
                      </button>
                      <h3 className="text-white font-medium">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-center text-sm text-gray-400 py-2">
                          {day}
                        </div>
                      ))}
                      {days.map((day) => {
                        const isDisabled = day < minDate || day > maxDate;
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        
                        return (
                          <button
                            key={day.toString()}
                            type="button"
                            onClick={() => !isDisabled && handleDateSelect(day)}
                            disabled={isDisabled}
                            className={`
                              p-2 rounded-lg text-center text-sm
                              ${isDisabled ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-blue-600/20'}
                              ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-300'}
                              ${!isCurrentMonth ? 'opacity-50' : ''}
                              ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                            `}
                          >
                            {format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </Popover.Panel>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Select Time (GMT+1)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {formData.date ? (
                    getAvailableTimeSlots(formData.date).map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, time })}
                        className={`p-3 rounded-lg text-center transition-all ${
                          formData.time === time
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-gray-400">
                      Please select a date first
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name and Bribe */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Bribe Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.bribe}
                    onChange={(e) => setFormData({ ...formData, bribe: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Remember: The higher the bribe the better the ride!
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
                Booking successful! Your mission has been scheduled.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Beaming up...' : 'Book Now'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
