import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link} from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';


function App() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [inRange, setInRange] = useState({ test: false, Hub: false });
  
  const locations = [
    { name: 'test', latitude: 26.775044, longitude: -80.032890 },
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
  ];

  if (!localStorage.getItem('codeHasRun')) {
    // Run the code here
    localStorage.setItem('newRatingId', '-1')
    // Set the flag in localStorage to indicate that the code has been run
    localStorage.setItem('codeHasRun', true);
  }

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
