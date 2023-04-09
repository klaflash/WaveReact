import React, { useState, useEffect } from 'react';

import { createClient } from '@supabase/supabase-js'

//const supabaseUrl = process.env.REACT_APP_PROJECT_URL
//const supabaseKey = process.env.REACT_APP_API_KEY

const supabaseUrl = "https://cgynrutxxwafteiunwho.supabase.co" 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneW5ydXR4eHdhZnRlaXVud2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMDg5MTgsImV4cCI6MTk5NjU4NDkxOH0.kIwLWQB-Z9QFVn7SZgJM5fAfEmWN7dKNkJKYj62kFjw"

const supabase = createClient(supabaseUrl, supabaseKey)

//localStorage.setItem('newRatingId', JSON.stringify([{}]))
let loading = false;

const insertOrUpdateRating = async (m_rating, l_rating, e_rating, score, location) => {

  if (loading) {
    return
  }
  
  let newRatingIdObj = JSON.parse(localStorage.getItem('newRatingId'))

  let newRatingId

  if (Object.keys(newRatingIdObj).length == 0 || newRatingIdObj[`${location}`] == null) {
    newRatingIdObj[`${location}`] = -1;
    newRatingId = -1;
  } else {
    newRatingId = newRatingIdObj[`${location}`]
  }

  localStorage.setItem('newRatingId', JSON.stringify(newRatingIdObj))

  

  console.log('existing newRatingObj', newRatingIdObj)
  console.log('existing new rating', newRatingId)
  if (newRatingId < 0) {
    loading = true;
    // Insert a new rating
    const { data: newRating, error: insertError } = await supabase
    .from('Ratings')
    .insert({ m_rating, l_rating, e_rating, score, location })
    .single()
    .select();

    if (insertError) {
        console.log('Error inserting into Ratings table:', insertError.message);
        return;
    }

    console.log('Inserted new rating:', newRating.id);
    //newRatingId = newRating.id;
    newRatingIdObj[`${location}`] = newRating.id;
    //let obj = [{ location : `${newRating.id}`}]
    localStorage.setItem('newRatingId', JSON.stringify(newRatingIdObj))
    loading = false;
   
  } else {
    // Update an existing rating
    const { data: updatedRating, error } = await supabase
      .from('Ratings')
      .update({ m_rating, l_rating, e_rating, score, location })
      .eq('id', newRatingId)
      .single();

    if (error) {
      console.log('Error updating Ratings table:', error.message);
      return;
    }

    console.log('Updated rating:', updatedRating);
  }
};

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
    insertOrUpdateRating(event.target.value, lineRating, energyRating, score(musicRating, lineRating, energyRating), props.currentLocation)
  }

  function handleLineRatingChange(event) {
    setLineRating(event.target.value);
    insertOrUpdateRating(musicRating, event.target.value, energyRating, score(musicRating, lineRating, energyRating), props.currentLocation)
  }

  function handleEnergyRatingChange(event) {
    setEnergyRating(event.target.value);
    insertOrUpdateRating(musicRating, lineRating, event.target.value, score(musicRating, lineRating, energyRating), props.currentLocation)
  }

  function score(a, b, c) {
    return Math.round(((parseInt(a) + parseInt(b) + parseInt(c)) / 3) * 10) / 10
  }

  return (
    <div id="main-location-container">
      <h1>{props.currentLocation}</h1>
      <div id="place"></div>
      {!isLocationInRange && (
        <div id="range-message">Sorry you must be closer to rate this location.</div>
      )}
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
