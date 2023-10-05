import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link} from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';
import EventsPage from './EventsPage';
import locations from './locationsData';
import PopupMessage from './PopupMessage';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [inRange, setInRange] = useState({});

  if (!localStorage.getItem('codeHasRun')) {
    // Run the code here
    //localStorage.setItem('newRatingId', '-1')
    localStorage.setItem('newRatingId', JSON.stringify({}))
    //localStorage.setItem('newRatingId', null)
    // Set the flag in localStorage to indicate that the code has been run
    localStorage.setItem('codeHasRun', true);

    const currentTimestamp = Date.now(); // Get the current timestamp in milliseconds
    localStorage.setItem('timestamp', currentTimestamp.toString()); // Store the timestamp in local storage as a string
  } else {
    const storedTimestamp = localStorage.getItem('timestamp');

    if (storedTimestamp) {
      const timestamp = parseInt(storedTimestamp, 10); // Convert the stored string to a number
      const currentTime = Date.now(); // Get the current timestamp in milliseconds

      //const fiveMinutesInMs = 5 * 60 * 1000; // Convert 5 minutes to milliseconds
      const eightHoursInMs = 8 * 60 * 60 * 1000; // Convert 8 hours to milliseconds

      if (currentTime - timestamp > eightHoursInMs) {
        // The stored timestamp is more than 5 minutes ago
        // Perform your desired action here
        //console.log('The stored timestamp is more than 5 minutes ago.');
        localStorage.clear();
        localStorage.setItem('newRatingId', JSON.stringify({}))
        localStorage.setItem('codeHasRun', true);
        const currentTimestamp = Date.now(); // Get the current timestamp in milliseconds
        localStorage.setItem('timestamp', currentTimestamp.toString()); // Store the timestamp in local storage as a string
      } else {
        // The stored timestamp is within the last 5 minutes
        //console.log('The stored timestamp is within the last 5 minutes.');
      }
    } else {
      // The timestamp is not set in local storage
      //console.log('The timestamp is not set in local storage.');
    }

  }

  const isPwa = window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: minimal-ui)').matches || (window.navigator.standalone) || document.referrer.includes('android-app://');
 


  return (
    <Router>
      {!isPwa && <PopupMessage isPwa={isPwa} />}

      <Routes>
        <Route path="/" element={<MainPage setCurrentLocation={setCurrentLocation} setInRange={setInRange} inRange={inRange} locations={locations}/>} />
        <Route path="/location/:locationName" element={<LocationPage currentLocation={currentLocation} inRange={inRange} locations={locations}/>} />
        <Route path="/events" element={<EventsPage setCurrentLocation={setCurrentLocation} inRange={inRange} locations={locations}/>} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
