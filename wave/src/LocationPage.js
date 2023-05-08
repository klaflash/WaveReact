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
          'service',
          'music',
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
      colors={['rgb(41, 202, 242)', 'rgb(41, 152, 242)', 'rgb(41, 88, 242)', '#383838', '#4AEE95', '#ee4a4a']}
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
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="#3D5AF1"/>
              <path d="M11.5 24L12.375 17.7H8L15.875 6H17.625L16.75 13.2H22L13.25 24H11.5Z" fill="white"/>
            </svg>
            {Object.keys(averages).length !== 0 && (
              <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageE'] : ''}</div>
            )}
          </div>

          <div className='display-rating'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="#2998F2"/>
              <path d="M12 19.5V8.66667L22 7V17.8333" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 22C10.8807 22 12 20.8807 12 19.5C12 18.1193 10.8807 17 9.5 17C8.11929 17 7 18.1193 7 19.5C7 20.8807 8.11929 22 9.5 22Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19.5 20.3333C20.8807 20.3333 22 19.214 22 17.8333C22 16.4525 20.8807 15.3333 19.5 15.3333C18.1193 15.3333 17 16.4525 17 17.8333C17 19.214 18.1193 20.3333 19.5 20.3333Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
              {Object.keys(averages).length !== 0 && (
                <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageM'] : ''}</div>
              )}
          </div>
    

          <div className='display-rating'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="#29CAF2"/>
              <path d="M7 23V21.8H8.64211V18.98C8.15088 18.8467 7.75439 18.59 7.45263 18.21C7.15088 17.83 7 17.3867 7 16.88V10.2H11.5474V16.88C11.5474 17.3467 11.3965 17.78 11.0947 18.18C10.793 18.58 10.3965 18.8467 9.90526 18.98V21.8H11.5474V23H7ZM8.26316 14.62H10.2842V11.4H8.26316V14.62ZM15.4211 23C15.0842 23 14.7895 22.88 14.5368 22.64C14.2842 22.4 14.1579 22.12 14.1579 21.8V13.64C14.1579 13.3733 14.2351 13.16 14.3895 13C14.5439 12.84 14.7614 12.7 15.0421 12.58L15.8421 12.24C16.1789 12.0933 16.4246 11.9133 16.5789 11.7C16.7333 11.4867 16.8105 11.2267 16.8105 10.92V7.7C16.8105 7.48667 16.8772 7.31667 17.0105 7.19C17.1439 7.06333 17.3228 7 17.5474 7H19.5263C19.7509 7 19.9298 7.06333 20.0632 7.19C20.1965 7.31667 20.2632 7.48667 20.2632 7.7V10.92C20.2632 11.2267 20.3579 11.4867 20.5474 11.7C20.7368 11.9133 21 12.0933 21.3368 12.24L22.1368 12.58C22.4035 12.6867 22.614 12.8233 22.7684 12.99C22.9228 13.1567 23 13.3733 23 13.64V21.8C23 22.12 22.8737 22.4 22.6211 22.64C22.3684 22.88 22.0737 23 21.7368 23H15.4211ZM18.0737 9.08H19V8.2H18.0737V9.08ZM15.4211 15.3H21.7368V13.64L20.8526 13.32C20.2912 13.12 19.8421 12.7933 19.5053 12.34C19.1684 11.8867 19 11.3867 19 10.84V10.28H18.0737V10.84C18.0737 11.3867 17.9158 11.8667 17.6 12.28C17.2842 12.6933 16.8596 13.0133 16.3263 13.24L15.4211 13.64V15.3ZM15.4211 21.8H21.7368V19.74H15.4211V21.8Z" fill="white"/>
            </svg>
            {Object.keys(averages).length !== 0 && (
              <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageS'] : ''}</div>
            )}
          </div>

          <div className='display-rating'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="#005985"/>
              <path d="M6 20V18.675C6 18.0322 6.25938 17.509 6.77813 17.1054C7.29688 16.7018 7.97735 16.5 8.81955 16.5C8.97161 16.5 9.11783 16.5042 9.25821 16.5125C9.39857 16.5208 9.5375 16.5388 9.675 16.5663C9.575 16.8554 9.5 17.1485 9.45 17.4454C9.4 17.7424 9.375 18.0522 9.375 18.375V20H6ZM10.5 20V18.375C10.5 17.8417 10.6094 17.3542 10.8281 16.9125C11.0469 16.4708 11.3563 16.0833 11.7563 15.75C12.1563 15.4167 12.6344 15.1667 13.1906 15C13.7469 14.8333 14.35 14.75 15 14.75C15.6625 14.75 16.2719 14.8333 16.8281 15C17.3844 15.1667 17.8625 15.4167 18.2625 15.75C18.6625 16.0833 18.9688 16.4708 19.1813 16.9125C19.3938 17.3542 19.5 17.8417 19.5 18.375V20H10.5ZM20.625 20V18.375C20.625 18.044 20.6031 17.7321 20.5594 17.4392C20.5156 17.1464 20.4438 16.8561 20.3438 16.5682C20.4813 16.5394 20.6198 16.5208 20.7595 16.5125C20.8991 16.5042 21.0418 16.5 21.1875 16.5C22.0313 16.5 22.7109 16.6981 23.2266 17.0942C23.7422 17.4903 24 18.0173 24 18.675V20H20.625ZM8.80438 15.75C8.44729 15.75 8.14063 15.5786 7.88438 15.2359C7.62813 14.8932 7.5 14.4813 7.5 14C7.5 13.5167 7.62851 13.1042 7.88554 12.7625C8.14258 12.4208 8.45156 12.25 8.8125 12.25C9.175 12.25 9.48438 12.4208 9.74063 12.7625C9.99688 13.1042 10.125 13.5203 10.125 14.0108C10.125 14.4869 9.99688 14.8958 9.74063 15.2375C9.48438 15.5792 9.17229 15.75 8.80438 15.75ZM21.1794 15.75C20.8223 15.75 20.5156 15.5786 20.2594 15.2359C20.0031 14.8932 19.875 14.4813 19.875 14C19.875 13.5167 20.0035 13.1042 20.2605 12.7625C20.5176 12.4208 20.8266 12.25 21.1875 12.25C21.55 12.25 21.8594 12.4208 22.1156 12.7625C22.3719 13.1042 22.5 13.5203 22.5 14.0108C22.5 14.4869 22.3719 14.8958 22.1156 15.2375C21.8594 15.5792 21.5473 15.75 21.1794 15.75ZM15 14C14.375 14 13.8438 13.7083 13.4063 13.125C12.9688 12.5417 12.75 11.8333 12.75 11C12.75 10.15 12.9688 9.4375 13.4063 8.8625C13.8438 8.2875 14.375 8 15 8C15.6375 8 16.1719 8.2875 16.6031 8.8625C17.0344 9.4375 17.25 10.15 17.25 11C17.25 11.8333 17.0344 12.5417 16.6031 13.125C16.1719 13.7083 15.6375 14 15 14Z" fill="white"/>
            </svg>
            {Object.keys(averages).length !== 0 && (
              <div id='people-stack'>
                <div className='idkyet'>{averages && averages[currentLocation] ? averages[currentLocation]['averageL'] : ''}</div>
                <div id='people-text'>People</div>
              </div>
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
            <label className='sliderLabel' htmlFor="energy-rating">Energy</label>
            <input id="energy-rating" type="range" min="0" max="10" value={energyRating} onChange={handleEnergyRatingChange} />
            <span id="rangeValue">{energyRating}</span>
          </div>
          
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
