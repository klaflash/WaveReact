import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link} from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';

function App() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [inRange, setInRange] = useState({});

  const [locations, setLocations] = useState([
    { name: 'Nova', latitude: 40.415171, longitude: -86.893275, addy: '200 S Fourth St'},
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227, addy: '111 S Salisbury St'},
    { name: 'Rise', latitude: 40.422677, longitude: -86.906967, addy: '134 W State St'},
    { name: 'Test', latitude: 42.111683, longitude: -71.872295, addy: '123 Random St'},
    { name: 'Test2', latitude: 42.299103, longitude: -71.785020, addy: '123 Whatever Ave'},
    { name: 'Seattle', latitude: 47.607480, longitude: -122.336241, addy: '123 Whatever Ave'}
  ]);

  //console.log("APP.JS RUNS")

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage setCurrentLocation={setCurrentLocation} setLocations={setLocations} setInRange={setInRange} inRange={inRange}/>} />
        <Route path="/location/:locationName" element={<LocationPage currentLocation={currentLocation} inRange={inRange} />} />
      </Routes>
    </Router>
  );
}

export default App;
