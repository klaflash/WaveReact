import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './MainPage';
import LocationPage from './LocationPage';

function App() {
  const [currentLocation, setCurrentLocation] = useState('');

  const updateLocation = (locationName) => {
    setCurrentLocation(locationName);
  }

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <MainPage updateLocation={updateLocation} />
        </Route>
        <Route path="/location">
          <LocationPage currentLocation={currentLocation} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;


// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
