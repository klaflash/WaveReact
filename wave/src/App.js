import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link} from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';


function App() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [inRange, setInRange] = useState({ test: false, Hub: false });

  const [locations, setLocations] = useState([
    { name: 'Nova', latitude: 40.415171, longitude: -86.893275, addy: '200 S Fourth St'},
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227, addy: '111 S Salisbury St'},
    { name: 'Rise', latitude: 40.422677, longitude: -86.906967, addy: '134 W State St'}
  ]);

  if (!localStorage.getItem('codeHasRun')) {
    // Run the code here
    //localStorage.setItem('newRatingId', '-1')
    localStorage.setItem('newRatingId', JSON.stringify({}))
    //localStorage.setItem('newRatingId', null)
    // Set the flag in localStorage to indicate that the code has been run
    localStorage.setItem('codeHasRun', true);
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
