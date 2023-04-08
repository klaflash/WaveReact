// import React, { useState, useEffect, useMemo} from 'react';

// function MainPage(props) {
//   const [isMobile, setIsMobile] = useState(false);
//   const setCurrentLocation = props.setCurrentLocation;

//   useEffect(() => {
//     const isMobileDevice = /Mobi/.test(navigator.userAgent);
//     setIsMobile(isMobileDevice);
//   }, []);

//   const locations = useMemo(() => [
//     { name: 'test', latitude: 26.775044, longitude: -80.032890 },
//     { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
//   ], []);

//   useEffect(() => {
//     const degToRad = (deg) => {
//       return deg * Math.PI / 180;
//     };

//     const distance = (lat1, lon1, lat2, lon2) => {
//       return 6371 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
//     };

//     const successCallback = (position) => {
//       console.log(position);
//       const lat = position.coords.latitude;
//       const lng = position.coords.longitude;
//       const newInRange = {};

//       for (let location of locations) {
//         const dist = distance(degToRad(lat), degToRad(lng), degToRad(location.latitude), degToRad(location.longitude));
//         console.log(dist);
//         if (dist < threshold) {
//           newInRange[location.name] = true;
//         } else {
//           newInRange[location.name] = false;
//         }
//       }

//       setInRange(newInRange);
//     };

//     const errorCallback = (error) => {
//       console.log(error);
//     };

//     const options = {
//       enableHighAccuracy: true,
//       timeout: 10000,
//     };

//     navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

//   }, [locations]);

//   const [inRange, setInRange] = useState({ test: false, Hub: false });
//   const threshold = 0.05;

//   useEffect(() => {
//     for (let location of locations) {
//       const node = document.createElement('button');
//       node.textContent = `${location.name}`;
//       node.setAttribute('id', `${location.name}`);
//       node.setAttribute('class', 'location');
//       document.getElementById('locations').appendChild(node);
//     }

//     for (let location of locations) {
//       document.getElementById(`${location.name}`).addEventListener('click', () => {
//         props.setCurrentLocation(location.name);
//         window.location.href = `./location.html?location=${encodeURIComponent(location.name)}`;
//       });
//     }
//   }, [props, locations, setCurrentLocation]);

//   return (
//     <div>
//       {!isMobile ?
//         <div id="content">
//           <div id="welcome">Welcome to wave</div>
//           <div id="locations">Current locations</div>
//         </div> :
//         <div id="not-mobile">Sorry, wave is currently only supported on mobile devices</div>
//       }
//     </div>
//   );
// }

// export default MainPage;
import React, { useState, useEffect, useMemo, useCallback } from 'react';

function MainPage(props) {
  const [isMobile, setIsMobile] = useState(false);
  const setCurrentLocation = props.setCurrentLocation;
  const [inRange, setInRange] = useState({ test: false, Hub: false });
  const threshold = 0.05;
  const locations = useMemo(() => [
    { name: 'test', latitude: 26.775044, longitude: -80.032890 },
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227 }
  ], []);

  useEffect(() => {
    const isMobileDevice = /Mobi/.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    for (let location of locations) {
      const node = document.getElementById(`${location.name}`);
      if (!node) {
        const newNode = document.createElement('button');
        newNode.textContent = `${location.name}`;
        newNode.setAttribute('id', `${location.name}`);
        newNode.setAttribute('class', 'location');
        document.getElementById('locations').appendChild(newNode);
        newNode.addEventListener('click', () => {
          props.setCurrentLocation(location.name);
          window.location.href = `./location.html?location=${encodeURIComponent(location.name)}`;
        });
      }
    }
  }, [props, locations]);

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

      setInRange(newInRange);
    };

    const errorCallback = (error) => {
      console.log(error);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

  }, [locations]);

  const handleLocationClick = useCallback((locationName) => {
    props.setCurrentLocation(locationName);
    window.location.href = '/location';
  }, [props]);

  return (
    <div>
      {!isMobile ?
        <div id="content">
          <div id="welcome">Welcome to wave</div>
          <div id="locations">Current locations</div>
          <div id="list">
            {locations.map((location, index) => (
              <button key={index} onClick={() => handleLocationClick(location.name)}>
                {location.name}
              </button>
            ))}
          </div>
        </div> :
        <div id="not-mobile">Sorry, wave is currently only supported on mobile devices</div>
      }
    </div>
  );
}

export default MainPage;
