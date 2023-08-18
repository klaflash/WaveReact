// EventsPage.js
import React, { useState, useEffect } from 'react';

const EventsPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const currentDate = new Date();
  const daysToShow = 10;

  useEffect(() => {
    setSelectedDate(currentDate); // Set the default selected date to the current date
  }, []);

  const handleDateSelection = (date) => {
    setSelectedDate(date);
  };

  const renderCalendar = () => {
    const calendar = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);

      const dayOfMonth = date.getDate();
      const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

      const isSelectedDate = selectedDate && selectedDate.toDateString() === date.toDateString();

      const isCurrentDate = date.toDateString() === currentDate.toDateString();

      const buttonStyles = {
        backgroundColor: isSelectedDate ? '#F0F0F0' : 'transparent'
      };

      const dayOfWeekStyles = {
        color: isSelectedDate ? '#151515' : '#858585', // Change font color to blue for selected date's day of the week
      };

      const dayOfMonthStyles = {
        color: isSelectedDate ? '#090909' : '#CBCBCB', // Change font color to blue for selected date's day of the week
      };

      calendar.push(
        <button className='day' key={i} onClick={() => handleDateSelection(date)} style={buttonStyles}>
          <div className='day-of-month' style={dayOfMonthStyles}>{dayOfMonth}</div>
          <div className='week-day' style={dayOfWeekStyles}>{dayOfWeek}</div>
        </button>
      );
    }
    return calendar;
  };

  return (
    <div>
      <div className='events-title'>Events</div>
      <div className="calendar">{renderCalendar()}</div>
      {selectedDate && (
        <div className='date'>
          Selected Date: {selectedDate.toDateString()} - {selectedDate.getTime()}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
