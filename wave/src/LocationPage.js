import React, { useState, useEffect } from 'react';

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



const MyResponsiveBar = ({ data /* see data tab */ }) => (
  <ResponsiveBar
      data={data}
      keys={[
          'music',
          'line',
          'energy'
      ]}
      indexBy="time"
      margin={{ top: 50, right: 100, bottom: 50, left: 40 }}
      maxValue={30}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={{ scheme: 'paired' }}
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
  const inRange = props.inRange;
  const [isLocationInRange, setIsLocationInRange] = useState(inRange[props.currentLocation] || false);
  const [musicRating, setMusicRating] = useState(parseInt(localStorage.getItem(`${props.currentLocation}_music_rating`)) || 5);
  const [lineRating, setLineRating] = useState(parseInt(localStorage.getItem(`${props.currentLocation}_line_rating`)) || 5);
  const [energyRating, setEnergyRating] = useState(parseInt(localStorage.getItem(`${props.currentLocation}_energy_rating`)) || 5);

  const [graphData, setGraphData] = useState([]);

  const updateGraphData = async (location) => {
    const { data, error } = await supabase
      .from("Ratings")
      .select()
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error(error);
      return;
    }
  
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const filteredData = data.filter((row) => row.location === location && new Date(row.created_at) >= twoHoursAgo);
  
    const newData = [];
    for (let i = 0; i < 24; i++) {
      const timeStart = new Date(twoHoursAgo.getTime() + i * 5 * 60 * 1000);
      const timeEnd = new Date(twoHoursAgo.getTime() + (i + 1) * 5 * 60 * 1000);
      const dataInRange = filteredData.filter((row) => new Date(row.created_at) >= timeStart && new Date(row.created_at) < timeEnd);
  
      let musicSum = 0;
      let lineSum = 0;
      let energySum = 0;
      for (let j = 0; j < dataInRange.length; j++) {
        musicSum += dataInRange[j].m_rating;
        lineSum += dataInRange[j].l_rating;
        energySum += dataInRange[j].e_rating;
      }
  
      const dataPoint = {
        id: i.toString(),
        music: dataInRange.length > 0 ? Math.round(musicSum / dataInRange.length) : null,
        line: dataInRange.length > 0 ? Math.round(lineSum / dataInRange.length) : null,
        energy: dataInRange.length > 0 ? Math.round(energySum / dataInRange.length) : null,
        time: timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      newData.push(dataPoint);
    }
  
    setGraphData(newData);
  };

  React.useEffect(() => {
    setIsLocationInRange(inRange[props.currentLocation] || false);
  }, [inRange, props.currentLocation]);

  useEffect(() => {
    updateGraphData(props.currentLocation)
  }, []);

  useEffect(() => {
    localStorage.setItem(`${props.currentLocation}_music_rating`, musicRating);
    localStorage.setItem(`${props.currentLocation}_line_rating`, lineRating);
    localStorage.setItem(`${props.currentLocation}_energy_rating`, energyRating);
  }, [musicRating, lineRating, energyRating, props.currentLocation]);

  function handleMusicRatingChange(event) {
    setMusicRating(event.target.value);
    insertOrUpdateRating(event.target.value, lineRating, energyRating, score(event.target.value, lineRating, energyRating), props.currentLocation)
    updateGraphData(props.currentLocation)
  }

  function handleLineRatingChange(event) {
    setLineRating(event.target.value);
    insertOrUpdateRating(musicRating, event.target.value, energyRating, score(musicRating, event.target.value, energyRating), props.currentLocation)
    updateGraphData(props.currentLocation)
  }

  function handleEnergyRatingChange(event) {
    setEnergyRating(event.target.value);
    insertOrUpdateRating(musicRating, lineRating, event.target.value, score(musicRating, lineRating, event.target.value), props.currentLocation)
    updateGraphData(props.currentLocation)
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
          <div id='graph-parent'>
            {console.log(graphData)}
          <MyResponsiveBar data={graphData} />
          </div>
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
