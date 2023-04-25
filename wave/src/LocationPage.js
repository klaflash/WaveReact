import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from "react-router-dom";

import { createClient } from '@supabase/supabase-js'
import { ResponsiveBar } from '@nivo/bar'

//const supabaseUrl = process.env.REACT_APP_PROJECT_URL
//const supabaseKey = process.env.REACT_APP_API_KEY

const supabaseUrl = "https://cgynrutxxwafteiunwho.supabase.co" 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneW5ydXR4eHdhZnRlaXVud2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMDg5MTgsImV4cCI6MTk5NjU4NDkxOH0.kIwLWQB-Z9QFVn7SZgJM5fAfEmWN7dKNkJKYj62kFjw"

const supabase = createClient(supabaseUrl, supabaseKey)

//localStorage.setItem('newRatingId', JSON.stringify([{}]))
let loading = false;
//let graphData = [];

const insertOrUpdateRating = async (m_rating, l_rating, e_rating, score, location) => {

  if (loading) {
    return
  }
  
  let newRatingIdObj = JSON.parse(localStorage.getItem('newRatingId'))

  let newRatingId

  if (Object.keys(newRatingIdObj).length === 0 || newRatingIdObj[`${location}`] == null) {
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
    const rating = await supabase
      .from('Ratings')
      .select('created_at')
      .eq('id', newRatingId)
      .single() // Example filter

    //console.log (rating)

    const data = rating.data

    const now = new Date(); // Get current timestamp
    const threshold = now.getTime() - 60000; // Calculate threshold timestamp (60 seconds ago)
    const createdAtTimestamp = Date.parse(data.created_at)

    //console.log(threshold)
    //console.log(createdAtTimestamp)

    if (createdAtTimestamp >= threshold) {
      //created within last minute, update inital values
      console.log("One minute update period")
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
    } else {
      //created more than a minute ago. Add update values and timestamp.
      console.log("created more than a minute ago")
      const u_m_rating = m_rating;
      const u_l_rating = l_rating;
      const u_e_rating = e_rating;
      const u_score = score;
      const current = new Date();
      const updated_at = current.toISOString();

      const { data: updatedRating, error } = await supabase
        .from('Ratings')
        .update({ updated_at, u_m_rating, u_l_rating, u_e_rating, u_score, location })
        .eq('id', newRatingId)
        .single();

      if (error) {
        console.log('Error updating Ratings table:', error.message);
        return;
      }

      console.log('Updated rating:', updatedRating);

    }

  }
};


const MyResponsiveBar = ({ data /* see data tab */ }) => (
  <ResponsiveBar
      data={data}
      keys={[
          'music',
          'line',
          'energy',
          'score',
          'increase',
          'decrease'
      ]}
      indexBy="time"
      margin={{ top: 50, right: 100, bottom: 50, left: 40 }}
      maxValue={30}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={['rgb(41, 202, 242)', 'rgb(41, 152, 242)', 'rgb(41, 88, 242)', '#222222', '#4aee89', '#ee4a4a']}
      defs={[
          {
              id: 'dots',
              type: 'patternDots',
              background: 'inherit',
              color: '#38bcb2',
              size: 4,
              padding: 1,
              stagger: true
          },
          {
              id: 'lines',
              type: 'patternLines',
              background: 'inherit',
              color: '#eed312',
              rotation: -45,
              lineWidth: 6,
              spacing: 10
          }
      ]}
      fill={[
          {
              match: {
                  id: 'fries'
              },
              id: 'dots'
          },
          {
              match: {
                  id: 'sandwich'
              },
              id: 'lines'
          }
      ]}
      borderColor={{
          from: 'color',
          modifiers: [
              [
                  'darker',
                  1.6
              ]
          ]
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'time',
          legendPosition: 'middle',
          legendOffset: 32
      }}
      axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
      }}
      enableGridY={false}
      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
          from: 'color',
          modifiers: [
              [
                  'darker',
                  1.6
              ]
          ]
      }}
      legends={[
          {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                  {
                      on: 'hover',
                      style: {
                          itemOpacity: 1
                      }
                  }
              ]
          }
      ]}
      isInteractive={false}
      role="application"
      ariaLabel="Nivo bar chart demo"
      barAriaLabel={function (e){return e.id+": "+e.formattedValue+" in country: "+e.indexValue}}
  />
)

function LocationPage(props) {

  const locationz = useLocation();
  const searchParams = new URLSearchParams(locationz.search);
  const inRange = searchParams.get("inRange");
  const { locationName } = useParams();
  const currentLocation = locationName

  //const inRange = props.inRange;
  console.log("IN RANGE")
  console.log(inRange)
  //const [isLocationInRange, setIsLocationInRange] = useState(inRange[props.currentLocation] || false);
  const [isLocationInRange, setIsLocationInRange] = useState(inRange);
  const [musicRating, setMusicRating] = useState(parseInt(localStorage.getItem(`${currentLocation}_music_rating`)) || 5);
  const [lineRating, setLineRating] = useState(parseInt(localStorage.getItem(`${currentLocation}_line_rating`)) || 5);
  const [energyRating, setEnergyRating] = useState(parseInt(localStorage.getItem(`${currentLocation}_energy_rating`)) || 5);

  console.log("Location in range")
  console.log(isLocationInRange)

  const [graphData, setGraphData] = useState([]);
  const [isChecked, setIsChecked] = useState(() => {
    // Initialize the state with the value from local storage, or false if there is no value
    const storedValue = localStorage.getItem('isChecked');
    return storedValue !== null ? JSON.parse(storedValue) : false;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(locationz.search);
    const inRange = searchParams.get("inRange");
    setIsLocationInRange(inRange)
  }, []);

  useEffect(() => {
    // Store the value of isChecked in local storage when it changes
    localStorage.setItem('isChecked', JSON.stringify(isChecked));
    updateGraphData(currentLocation)
  }, [isChecked]);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  }

  console.log(isChecked)

  const updateGraphData = async (location) => {
    const { data, error } = await supabase
      .from("Ratings")
      .select()
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error(error);
      return;
    }

    const updatedData = [];

    for (let i = 0; i < data.length; i++) {
      const rating = data[i];

      
      
      if (rating.updated_at !== null) {
        const originalRating = {
          created_at: rating.created_at,
          m_rating: rating.m_rating,
          l_rating: rating.l_rating,
          e_rating: rating.e_rating,
          score: rating.score,
          updated_score: rating.u_score,
          location: rating.location
        };
        
        const updatedRating = {
          created_at: rating.updated_at,
          m_rating: rating.u_m_rating !== null ? rating.u_m_rating : rating.m_rating,
          l_rating: rating.u_l_rating !== null ? rating.u_l_rating : rating.l_rating,
          e_rating: rating.u_e_rating !== null ? rating.u_e_rating : rating.e_rating,
          score: rating.u_score !== null ? rating.u_score : rating.score,
          location: rating.location
        };

        updatedData.push(originalRating);
        updatedData.push(updatedRating);
      } else {
        updatedData.push(rating);
      }
    }

    console.log("updated data")
    console.log(updatedData)
  
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const filteredData = updatedData.filter((row) => row.location === location && new Date(row.created_at) >= twoHoursAgo);

    console.log("filtered")
    console.log(filteredData)
  
    const newData = [];
    for (let i = 0; i < 24; i++) {
      const timeStart = new Date(twoHoursAgo.getTime() + i * 5 * 60 * 1000);
      const timeEnd = new Date(twoHoursAgo.getTime() + (i + 1) * 5 * 60 * 1000);
      const dataInRange = filteredData.filter((row) => new Date(row.created_at) >= timeStart && new Date(row.created_at) < timeEnd);
      
      //console.log("Data in range")
      //console.log(dataInRange)

      let musicSum = 0;
      let lineSum = 0;
      let energySum = 0;
      for (let j = 0; j < dataInRange.length; j++) {
        musicSum += dataInRange[j].m_rating;
        lineSum += dataInRange[j].l_rating;
        energySum += dataInRange[j].e_rating;
      }

      //console.log("Is checked value in updategraphdata")
      //console.log(isChecked)

      if (!isChecked) {
        //Category view
    
        const dataPoint = {
          id: i.toString(),
          music: dataInRange.length > 0 ? Math.round(musicSum / dataInRange.length) : null,
          line: dataInRange.length > 0 ? Math.round(lineSum / dataInRange.length) : null,
          energy: dataInRange.length > 0 ? Math.round(energySum / dataInRange.length) : null,
          time: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
        newData.push(dataPoint);
      } else {
        //Update view

        console.log(dataInRange)

        let updated_score = null;
        let orginal_score = null;
        for (let j = 0; j < dataInRange.length; j++) {
          if (dataInRange[j].updated_score) {
            updated_score += dataInRange[j].updated_score * 3;
            orginal_score = dataInRange[j].score
          }
        }

        if (orginal_score) {
          orginal_score *= 3
        }

        console.log("VALS")
        console.log(musicSum)
        console.log(lineSum)
        console.log(energySum)
        console.log(dataInRange.length)

        let increase = null;
        let decrease = null;
        let score = dataInRange.length > 0 ? Math.round((musicSum + lineSum + energySum) / dataInRange.length) : null;
        
        console.log(updated_score)
        console.log(orginal_score)
        if (updated_score !== null) {
          if (updated_score > orginal_score) {
            increase = (((musicSum + lineSum + energySum) - orginal_score + updated_score) / dataInRange.length) - score
          } else if (updated_score < orginal_score) {
            decrease = score - (((musicSum + lineSum + energySum) - orginal_score + updated_score) / dataInRange.length)
            score -= decrease;
          }
        }

        console.log(increase)
        console.log(decrease)
      

        const dataPoint = {
          id: i.toString(),
          score: score,
          increase: increase,
          decrease: decrease,
          time: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        };

        newData.push(dataPoint);
      }
      
    }
  
    setGraphData(newData);
  };


  useEffect(() => {
    updateGraphData(currentLocation)
  }, []);

  useEffect(() => {
    localStorage.setItem(`${currentLocation}_music_rating`, musicRating);
    localStorage.setItem(`${currentLocation}_line_rating`, lineRating);
    localStorage.setItem(`${currentLocation}_energy_rating`, energyRating);
  }, [musicRating, lineRating, energyRating, currentLocation]);

  function handleMusicRatingChange(event) {
    setMusicRating(event.target.value);
    insertOrUpdateRating(event.target.value, lineRating, energyRating, score(event.target.value, lineRating, energyRating), currentLocation)
    updateGraphData(currentLocation)
  }

  function handleLineRatingChange(event) {
    setLineRating(event.target.value);
    insertOrUpdateRating(musicRating, event.target.value, energyRating, score(musicRating, event.target.value, energyRating), currentLocation)
    updateGraphData(currentLocation)
  }

  function handleEnergyRatingChange(event) {
    setEnergyRating(event.target.value);
    insertOrUpdateRating(musicRating, lineRating, event.target.value, score(musicRating, lineRating, event.target.value), currentLocation)
    updateGraphData(currentLocation)
  }

  function score(a, b, c) {
    return Math.round(((parseInt(a) + parseInt(b) + parseInt(c)) / 3) * 10) / 10
  }

  return (
    <div id="main-location-container">
      <h1>{props.currentLocation}</h1>
      <div id="place"></div>
      <div id='graph-parent'>
            {console.log(graphData, isLocationInRange)}
          <MyResponsiveBar data={graphData} />
      </div>
      <div className="switch-button">
        <input className="switch-button-checkbox" type="checkbox" checked={isChecked} onChange={handleCheckboxChange} ></input>
        <label className="switch-button-label" htmlFor=""><span className="switch-button-label-span">Category</span></label>
      </div>
      {console.log("WHY", isLocationInRange)}
      {isLocationInRange === "false" && (
        <div id="range-message">Sorry you must be closer to rate this location.</div>
      )}
      {isLocationInRange === "true" && (
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
