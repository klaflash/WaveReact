import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';

function App() {
  const [currentLocation, setCurrentLocation] = useState('');

  const locations = [
    { name: 'test', latitude: 26.775044, longitude: -80.032890 },
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
  ];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage setCurrentLocation={setCurrentLocation} locations={locations} />} />
        <Route path="/location" element={<LocationPage currentLocation={currentLocation} />} />
      </Routes>
    </Router>
  );
}

export default App;
