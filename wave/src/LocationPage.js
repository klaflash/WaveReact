import React from 'react';

function LocationPage(props) {
  const inRange = props.inRange;
  const isLocationInRange = inRange[props.currentLocation]

return (
  <div>
    <h1>{props.currentLocation}</h1>
    <div id="place"></div>
    <div id="range-message"></div>
    {isLocationInRange && (
      <div id="rating">
        Rating
        <label htmlFor="music-rating">Music</label>
        <input id="music-rating" type="range" />
        <label htmlFor="line-rating">Line</label>
        <input id="line-rating" type="range" />
        <label htmlFor="energy-rating">Energy</label>
        <input id="energy-rating" type="range" />
      </div>
    )}
  </div>
  );
}

export default LocationPage;
