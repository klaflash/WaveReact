import { useState, useEffect } from 'react';

const locations = [
  { name: 'test', latitude: 26.775044, longitude: -80.032890 },
  { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
];

const threshold = 0.05;

function Main() {
  const [inRange, setInRange] = useState({ test: false, hub: false });
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const onMainPage = !location.href.includes('location.html');

    if (onMainPage) {
      for (let location of locations) {
        const node = document.createElement('button');
        node.textContent = `${location.name}`;
        node.setAttribute('id', `${location.name}`);
        node.setAttribute('class', 'location');
        document.getElementById('locations').appendChild(node);
      }

      for (let location of locations) {
        document.getElementById(`${location.name}`).addEventListener('click', () => {
          setCurrentLocation(location.name);
          window.location.href = './location.html?location=' + encodeURIComponent(location.name);
        });
      }

      const successCallback = (position) => {
        console.log(position);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        for (let location of locations) {
          const dist = distance(degToRad(lat), degToRad(lng), degToRad(location.latitude), degToRad(location.longitude));
          console.log(dist);
          if (dist < threshold) {
            setInRange(prevState => ({ ...prevState, [location.name]: true }));
          } else {
            setInRange(prevState => ({ ...prevState, [location.name]: false }));
          }
        }
      };

      const errorCallback = (error) => {
        console.log(error);
      };

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
      };

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }
  }, []);

  const degToRad = (deg) => {
    return deg * Math.PI / 180
  }

  const distance = (lat1, lon1, lat2, lon2) => {
    return 6371 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1))
  }

  return (
    <div id="locations">
      {Object.keys(inRange).map((locationName) => (
        <div key={locationName}>
          <span>{locationName}: </span>
          {inRange[locationName] ? (
            <span>Full Access</span>
          ) : (
            <span>Restricted Access</span>
          )}
        </div>
      ))}
    </div>
  );
}

function LocationPage() {
  //const params = new URLSearchParams(window.location.search);
  //const locationName = params.get('location');
  return (
    <div>
      <h1>{props.currentLocation}</h1>
      <div id="place"></div>
      <div id="range-message"></div>
      <div id="rating">Rating
        <label htmlFor="music-rating">Music</label>
        <input id="music-rating" type="range" />
        <label htmlFor="line-rating">Line</label>
        <input id="line-rating" type="range" />
        <label htmlFor="energy-rating">Energy</label>
        <input id="energy-rating" type="range" />
      </div>
    </div>
  );
  //return <div>{locationName}</div>;
}

export {currentLocation}

export default function App() {
  return (
    <div>
      {location.href.includes('location.html') ? <LocationPage /> : <Main />}
    </div>
  );
}
