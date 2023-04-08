import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';

function App() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [inRange, setInRange] = useState({ test: false, Hub: false });
  // const [currentLocation, setCurrentLocation] = useState(getCurrentLocationFromUrl());
  // const [inRange, setInRange] = useState(getInRangeFromUrl());

  // function getCurrentLocationFromUrl() {
  //   const match = window.location.pathname.match(/^\/location\/([^/]+)/);
  //   return match ? match[1] : '';
  // }

  // function getInRangeFromUrl() {
  //   const match = window.location.search.match(/inRange=([^&]+)/);
  //   console.log('match:', match);
  //   return match ? JSON.parse(decodeURIComponent(match[1])) : {};
  // }

  // function getInRangeFromUrl() {
  //   const match = window.location.search.match(/inRange=([^&]+)/);
  //   return match ? JSON.parse(decodeURIComponent(match[1])) : {};
  // }

  //console.log('currentLocation:', currentLocation);
  const locations = [
    { name: 'test', latitude: 26.775044, longitude: -80.032890 },
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
  ];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage setCurrentLocation={setCurrentLocation} locations={locations} setInRange={setInRange}/>} />
        <Route path="/location/:locationName" element={<LocationPage currentLocation={currentLocation} inRange={inRange} />} />
      </Routes>
    </Router>
  );
}

export default App;
