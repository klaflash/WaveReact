import React, { useState, useEffect } from 'react';

function LocationPage(props) {
  const inRange = props.inRange;
  const [isLocationInRange, setIsLocationInRange] = useState(inRange[props.currentLocation] || false);
  const [musicRating, setMusicRating] = useState(parseInt(localStorage.getItem(`${props.currentLocation}_music_rating`)) || 5);
  const [lineRating, setLineRating] = useState(parseInt(localStorage.getItem(`${props.currentLocation}_line_rating`)) || 5);
  const [energyRating, setEnergyRating] = useState(parseInt(localStorage.getItem(`${props.currentLocation}_energy_rating`)) || 5);

  React.useEffect(() => {
    setIsLocationInRange(inRange[props.currentLocation] || false);
  }, [inRange, props.currentLocation]);

  useEffect(() => {
    localStorage.setItem(`${props.currentLocation}_music_rating`, musicRating);
    localStorage.setItem(`${props.currentLocation}_line_rating`, lineRating);
    localStorage.setItem(`${props.currentLocation}_energy_rating`, energyRating);
  }, [musicRating, lineRating, energyRating, props.currentLocation]);

  function handleMusicRatingChange(event) {
    setMusicRating(event.target.value);
  }

  function handleLineRatingChange(event) {
    setLineRating(event.target.value);
  }

  function handleEnergyRatingChange(event) {
    setEnergyRating(event.target.value);
  }

  return (
    <div>
      <h1>{props.currentLocation}</h1>
      <div id="place"></div>
      <div id="range-message"></div>
      {isLocationInRange && (
        <div id="rating">
          Rating
          <div className='slider'>
            <label className='sliderLabel' htmlFor="music-rating">Music</label>
            <input id="music-rating" type="range" min="0" max="10" value={musicRating} onChange={handleMusicRatingChange} />
            <span id="rangeValue">{musicRating}</span>
          </div>

          <div className='slider'>
            <label className='sliderLabel' htmlFor="line-rating">Line</label>
            <input id="line-rating" type="range" min="0" max="10" value={lineRating} onChange={handleLineRatingChange} />
            <span id="rangeValue">{lineRating}</span>
          </div>

          <div className='slider'>
            <label className='sliderLabel' htmlFor="energy-rating">Energy</label>
            <input id="energy-rating" type="range" min="0" max="10" value={energyRating} onChange={handleEnergyRatingChange} />
            <span id="rangeValue">{energyRating}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPage;
