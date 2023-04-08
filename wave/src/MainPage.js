import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

function MainPage(props) {
  const [isMobile, setIsMobile] = useState(false);
  const threshold = 0.07;
  const locations = useMemo(() => [
    { name: 'test', latitude: 26.775044, longitude: -80.032890 },
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
  ], []);

  const handleLocationClick = useCallback((locationName) => {
    props.setCurrentLocation(locationName);
  }, [props]);

  useEffect(() => {
    const isMobileDevice = /Mobi/.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, [props, locations, handleLocationClick, props.inRange]);

  useEffect(() => {
    const degToRad = (deg) => {
      return deg * Math.PI / 180;
    };

    const distance = (lat1, lon1, lat2, lon2) => {
      return 6371 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
    };

    const successCallback = (position) => {
      console.log(position);
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const newInRange = {};

      for (let location of locations) {
        const dist = distance(degToRad(lat), degToRad(lng), degToRad(location.latitude), degToRad(location.longitude));
        console.log(dist);
        if (dist < threshold) {
          newInRange[location.name] = true;
        } else {
          newInRange[location.name] = false;
        }
      }
      props.setInRange(newInRange);
    };

    const errorCallback = (error) => {
      console.log(error);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

  }, [locations, props.setInRange, threshold]);

  return (
    <div>
      {!isMobile ?
        <div id="content">
          <div id="welcome">Welcome to wave</div>
          <div id="locations">Current locations</div>
          <ul>
            {locations.map((location) => (
              <li key={location.name}>
                <Link to={`/location/${location.name}?inRange=${encodeURIComponent(JSON.stringify(props.inRange))}`} onClick={() => handleLocationClick(location.name)}>
                  {location.name}
                </Link>
              </li>
            ))}
          </ul>
        </div> :
        <div id="not-mobile">Sorry, wave is currently only supported on mobile devices</div>
      }
    </div>
  );
}

export default MainPage;
