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

const insertOrUpdateRating = async (m_rating, s_rating, e_rating, l_rating, score, location) => {

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
    .insert({ m_rating, s_rating, e_rating, l_rating, score, location })
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
        .update({ m_rating, s_rating, e_rating, l_rating, score, location })
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
      const u_s_rating = s_rating;
      const u_e_rating = e_rating;
      const u_l_rating = l_rating;
      const u_score = score;
      const current = new Date();
      const updated_at = current.toISOString();

      const { data: updatedRating, error } = await supabase
        .from('Ratings')
        .update({ updated_at, u_m_rating, u_s_rating, u_e_rating, u_l_rating, u_score, location })
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
          'service',
          'energy',
          'score',
          'increase',
          'decrease'
      ]}
      indexBy="time"
      margin={{ top: 10, right: 0, bottom: 0, left: 40 }}
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
      axisBottom={null}
      axisLeft={null}
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
      legends={[]}
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
  const [serviceRating, setServiceRating] = useState(parseInt(localStorage.getItem(`${currentLocation}_service_rating`)) || 5);
  const [energyRating, setEnergyRating] = useState(parseInt(localStorage.getItem(`${currentLocation}_energy_rating`)) || 5);
  const [lineRating, setLineRating] = useState(parseInt(localStorage.getItem(`${currentLocation}_line_rating`)) || 50);

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
          s_rating: rating.s_rating,
          e_rating: rating.e_rating,
          l_rating: rating.l_rating,
          score: rating.score,
          updated_score: rating.u_score,
          location: rating.location
        };
        
        const updatedRating = {
          created_at: rating.updated_at,
          m_rating: rating.u_m_rating !== null ? rating.u_m_rating : rating.m_rating,
          s_rating: rating.u_s_rating !== null ? rating.u_s_rating : rating.s_rating,
          e_rating: rating.u_e_rating !== null ? rating.u_e_rating : rating.e_rating,
          l_rating: rating.u_l_rating !== null ? rating.u_l_rating : rating.l_rating,
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
      let serviceSum = 0;
      let energySum = 0;
      //let lineSum = 0;
      for (let j = 0; j < dataInRange.length; j++) {
        musicSum += dataInRange[j].m_rating;
        serviceSum += dataInRange[j].s_rating;
        energySum += dataInRange[j].e_rating;
        //lineSum += dataInRange[j].l_rating;
      }

      //console.log("Is checked value in updategraphdata")
      //console.log(isChecked)

      if (!isChecked) {
        //Category view
    
        const dataPoint = {
          id: i.toString(),
          music: dataInRange.length > 0 ? Math.round(musicSum / dataInRange.length) : null,
          service: dataInRange.length > 0 ? Math.round(serviceSum / dataInRange.length) : null,
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
        console.log(serviceSum)
        console.log(energySum)
        console.log(dataInRange.length)

        let increase = null;
        let decrease = null;
        let score = dataInRange.length > 0 ? Math.round((musicSum + serviceSum + energySum) / dataInRange.length) : null;
        
        console.log(updated_score)
        console.log(orginal_score)
        if (updated_score !== null) {
          if (updated_score > orginal_score) {
            increase = (((musicSum + serviceSum + energySum) - orginal_score + updated_score) / dataInRange.length) - score
          } else if (updated_score < orginal_score) {
            decrease = score - (((musicSum + serviceSum + energySum) - orginal_score + updated_score) / dataInRange.length)
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
    localStorage.setItem(`${currentLocation}_service_rating`, serviceRating);
    localStorage.setItem(`${currentLocation}_energy_rating`, energyRating);
    localStorage.setItem(`${currentLocation}_line_rating`, lineRating);
  }, [musicRating, serviceRating, energyRating, lineRating, currentLocation]);

  function handleMusicRatingChange(event) {
    setMusicRating(event.target.value);
    insertOrUpdateRating(event.target.value, serviceRating, energyRating, lineRating, score(event.target.value, serviceRating, energyRating), currentLocation)
    updateGraphData(currentLocation)
  }

  function handleServiceRatingChange(event) {
    setServiceRating(event.target.value);
    insertOrUpdateRating(musicRating, event.target.value, energyRating, lineRating, score(musicRating, event.target.value, energyRating), currentLocation)
    updateGraphData(currentLocation)
  }

  function handleEnergyRatingChange(event) {
    setEnergyRating(event.target.value);
    insertOrUpdateRating(musicRating, serviceRating, event.target.value, lineRating, score(musicRating, serviceRating, event.target.value), currentLocation)
    updateGraphData(currentLocation)
  }

  function handleLineRatingChange(event) {
    setLineRating(event.target.value);
    insertOrUpdateRating(musicRating, serviceRating, energyRating, event.target.value, score(musicRating, serviceRating, energyRating), currentLocation)
  }
  

  function score(a, b, c) {
    return Math.round(((parseInt(a) + parseInt(b) + parseInt(c)) / 3) * 10) / 10
  }

  const [averages, setAverages] = useState({});

  useEffect(() => {
    const getAverages = async () => {
      const firstAverages = await updateAverages();
      const secondAverages = await updateAverages();
      setAverages(secondAverages);
    };
    getAverages();
  
    const intervalId = setInterval(async () => {
      const newAverages = await updateAverages();
      setAverages(newAverages);
    }, 10000);
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  async function updateAverages() {
    const { data: ratings, error } = await supabase
      .from('Ratings')
      .select('*');
  
    if (error) {
      console.error(error);
      return;
    }

    const updatedRatings = ratings.map(rating => {
      if (rating.updated_at !== null) {
        return {
          created_at: rating.updated_at,
          m_rating: rating.u_m_rating || rating.m_rating,
          s_rating: rating.u_s_rating || rating.s_rating,
          e_rating: rating.u_e_rating || rating.e_rating,
          l_rating: rating.u_l_rating || rating.l_rating,
          score: rating.u_score || rating.score,
          location: rating.location
        };
      } else {
        return {
          created_at: rating.created_at,
          m_rating: rating.m_rating,
          s_rating: rating.s_rating,
          e_rating: rating.e_rating,
          l_rating: rating.l_rating,
          score: rating.score,
          location: rating.location
        };
      }
    });

    console.log(updatedRatings);

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // Get the timestamp 2 hours ago
    const filteredRatings = updatedRatings.filter((rating) => {
      const createdAtTimestamp = new Date(rating.created_at).getTime(); // Get the timestamp of the rating's creation time
      return createdAtTimestamp > twoHoursAgo.getTime(); // Check if the timestamp is after 2 hours ago
    });

    console.log("FILTERED RATINGSS")
    console.log(filteredRatings)
  
    const averages = {};
  
    for (const rating of filteredRatings) {
      //set averages
      if (!averages[rating.location]) {
        averages[rating.location] = {
          totalScore: 0,
          count: 0,
          averageScore: 0,
          totalM: 0,
          averageM: 0,
          totalE: 0,
          averageE: 0,
          totalL: 0,
          averageL: 0,
          totalS: 0,
          averageS: 0
        };
      }
  
      averages[rating.location].totalScore += rating.score
      averages[rating.location].totalM += rating.m_rating
      averages[rating.location].totalE += rating.e_rating
      averages[rating.location].totalS += rating.s_rating
      averages[rating.location].totalL += rating.l_rating
      averages[rating.location].count++;

      averages[rating.location].averageScore = Math.round(
        averages[rating.location].totalScore / averages[rating.location].count * 10) / 10;

      averages[rating.location].averageM = Math.round(
        averages[rating.location].totalM / averages[rating.location].count * 10) / 10;

      averages[rating.location].averageE = Math.round(
        averages[rating.location].totalE / averages[rating.location].count * 10) / 10;
      
      averages[rating.location].averageL = Math.round(
        averages[rating.location].totalL / averages[rating.location].count / 5) * 5;

      averages[rating.location].averageS = Math.round(
        averages[rating.location].totalS / averages[rating.location].count * 10)/ 10;

    }


    const results = averages

    console.log("---------RESULTS------------")
    console.log(results)
  
    return results;
  }

  return (
    <div id="main-location-container">
      <div id='location-card-1'>
        <div id='location-header'>
          <div id='location-header-left'>
            <div id='location-name'>{currentLocation}</div>
            <div id='location-subtext'>Past 2 hours</div>
          </div>
          {Object.keys(averages).length !== 0 && (
            <div id='location-header-right'>{averages && averages[currentLocation] ? averages[currentLocation]['averageScore'] : ''}</div>
          )}
        </div>
        <div id='graph-container'>
          <div id='graph-parent'>
                {console.log(graphData)}
              <MyResponsiveBar data={graphData} />
              <div id='graph-y-index'>
                <div>10</div>
                <div>5</div>
                <div>0</div>
              </div>
          </div>
          <div id='graph-x-index'>
            <div>2</div>
            <div>1</div>
            <div>Now</div>
          </div>
          <div className="switch-button">
            <input className="switch-button-checkbox" type="checkbox" checked={isChecked} onChange={handleCheckboxChange} ></input>
            <label className="switch-button-label" htmlFor=""><span className="switch-button-label-span">Category</span></label>
          </div>
        </div>

        <div id='ratings-div'>
          <div className='display-rating'>
            <div>Music</div>
            {Object.keys(averages).length !== 0 && (
              <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageM'] : ''}</div>
            )}
          </div>
          
          <div className='display-rating'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="#3D5AF1"/>
              <path d="M11.5 24L12.375 17.7H8L15.875 6H17.625L16.75 13.2H22L13.25 24H11.5Z" fill="white"/>
            </svg>
            {Object.keys(averages).length !== 0 && (
              <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageE'] : ''}</div>
            )}
          </div>

          <div className='display-rating'>
            <div>Service</div>
            {Object.keys(averages).length !== 0 && (
              <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageS'] : ''}</div>
            )}
          </div>

          <div className='display-rating'>
            <div>Line</div>
            {Object.keys(averages).length !== 0 && (
              <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageL'] : ''}</div>
            )}
          </div>
          
        </div>
      </div>
      
      
      {isLocationInRange === "false" && (
        <div id="range-message">Sorry you must be closer to rate this location.</div>
      )}
      {isLocationInRange === "true" && (
        <div id="rating">
          <div className='slider'>
            <label className='sliderLabel' htmlFor="music-rating">Music</label>
            <input id="music-rating" type="range" min="0" max="10" value={musicRating} onChange={handleMusicRatingChange} />
            <span id="rangeValue">{musicRating}</span>
          </div>

          <div className='slider'>
            <label className='sliderLabel' htmlFor="service-rating">Service</label>
            <input id="service-rating" type="range" min="0" max="10" value={serviceRating} onChange={handleServiceRatingChange} />
            <span id="rangeValue">{serviceRating}</span>
          </div>

          <div className='slider'>
            <label className='sliderLabel' htmlFor="energy-rating">Energy</label>
            <input id="energy-rating" type="range" min="0" max="10" value={energyRating} onChange={handleEnergyRatingChange} />
            <span id="rangeValue">{energyRating}</span>
          </div>

          <div className='slider'>
            <label className='sliderLabel' htmlFor="line-rating">Line</label>
            <input id="line-rating" type="range" min="0" max="100" step={10} value={lineRating} onChange={handleLineRatingChange} />
            <span id="rangeValue">{Number(lineRating) === 100 ? "100+" : lineRating}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPage;
