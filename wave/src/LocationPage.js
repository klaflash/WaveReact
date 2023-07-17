import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from "react-router-dom";

import { createClient } from '@supabase/supabase-js'
import { ResponsiveBar } from '@nivo/bar'
import { useNavigate } from 'react-router-dom';

import logo from './waveLogo.png';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

//const supabaseUrl = process.env.REACT_APP_PROJECT_URL
//const supabaseKey = process.env.REACT_APP_API_KEY

const supabaseUrl = "https://cgynrutxxwafteiunwho.supabase.co" 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneW5ydXR4eHdhZnRlaXVud2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMDg5MTgsImV4cCI6MTk5NjU4NDkxOH0.kIwLWQB-Z9QFVn7SZgJM5fAfEmWN7dKNkJKYj62kFjw"

const supabase = createClient(supabaseUrl, supabaseKey)

let loading = false;

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

  const locations = useMemo(() => props.locations, []);
  console.log(locations)

  const [newRatingIdObj, setNewRatingIdObj] = useState(JSON.parse(localStorage.getItem('newRatingId')) || {})
  const [userColors, setUserColors] = useState(JSON.parse(localStorage.getItem('userColors')) || {})

  const insertOrUpdateRating = async (m_rating, s_rating, e_rating, l_rating, score, location) => {

    if (loading) {
      return
    }
    
  
    let newRatingId
  
    if (Object.keys(newRatingIdObj).length === 0 || newRatingIdObj[`${location}`] == null) {
      //newRatingIdObj[`${location}`] = -1;
      setNewRatingIdObj(prevState => ({
        ...prevState,
        [location]: -1
      }));
      
      newRatingId = -1;
    } else {
      newRatingId = newRatingIdObj[`${location}`]
    }
  
    const colors = ["#00C4FF", "#30A2FF", "#4FF0FF", "#0079FF", "#00DFA2", "#22A699", "#9575DE", "#7149C6"];
    const userColorObj = userColors || {}
  
    if (!userColors[location]) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      userColorObj[location] = colors[randomIndex];
    }
    
  
    localStorage.setItem('newRatingId', JSON.stringify(newRatingIdObj))
    localStorage.setItem('userColors', JSON.stringify(userColorObj))
  
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
      //newRatingIdObj[`${location}`] = newRating.id;
      setNewRatingIdObj(prevState => ({
        ...prevState,
        [location]: newRating.id
      }));      
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

  const [commentText, setCommentText] = useState('');
  const maxCharacters = 100;
  const [postedComments, setPostedComments] = useState([]);

  const storedTimestamp = localStorage.getItem('timestamp');

  if (storedTimestamp) {
    const timestamp = parseInt(storedTimestamp, 10); // Convert the stored string to a number
    const currentTime = Date.now(); // Get the current timestamp in milliseconds

    //const fiveMinutesInMs = 5 * 60 * 1000; // Convert 5 minutes to milliseconds
    const eightHoursInMs = 8 * 60 * 60 * 1000; // Convert 8 hours to milliseconds

    if (currentTime - timestamp > eightHoursInMs) {
      // The stored timestamp is more than 5 minutes ago
      // Perform your desired action here
      //console.log('The stored timestamp is more than 5 minutes ago.');
      localStorage.clear();
      localStorage.setItem('newRatingId', JSON.stringify({}))
      localStorage.setItem('codeHasRun', true);
      const currentTimestamp = Date.now(); // Get the current timestamp in milliseconds
      localStorage.setItem('timestamp', currentTimestamp.toString()); // Store the timestamp in local storage as a string
    } else {
      // The stored timestamp is within the last 5 minutes
      //console.log('The stored timestamp is within the last 5 minutes.');
    }
  } else {
    // The timestamp is not set in local storage
    //console.log('The timestamp is not set in local storage.');
  }

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
  }, []);

  // useEffect(() => {

  //   const Ratings = supabase.channel('custom-all-channel')
  //   .on(
  //     'postgres_changes',
  //     { event: '*', schema: 'public', table: 'Ratings' },
  //     async (payload) => {
  //       console.log('NEW RATING IN THE HOUSE')
  //       console.log('Change received!', payload)
  //       const newAverages = await updateAverages();
  //       setAverages(newAverages);
  //     }
  //   )
  //   .subscribe()

  //   console.log('SHould be subscribed')


  //   // Cleanup subscription on component unmount
  //   return () => {
  //     Ratings.unsubscribe();
  //     console.log('Goodbye')
  //   };

  //   // const intervalId = setInterval(async () => {
  //   //   const newAverages = await updateAverages();
  //   //   setAverages(newAverages);
  //   // }, 10000);
  
  //   // return () => {
  //   //   clearInterval(intervalId);
  //   // };
  // }, []);

  

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

  useEffect(() => {
    fetchComments();
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Comments'
        },
        (payload) => {
          console.log(payload)

          const eventType = payload.eventType;

          if (eventType === 'INSERT') {
            const newComment = payload.new;
            if (newComment.location === currentLocation) {
              const updatedComments = [...postedComments, newComment];
              sortCommentsByChoice(updatedComments)
              //setPostedComments((prevComments) => [...prevComments, newComment]);

              if (!(newComment.user_number === newRatingIdObj[currentLocation])) {
                setIsBorderNone(false);
                setBorder(false)
              }
              handleNoti(newComment);
            }
          } else if (eventType === 'DELETE') {
            console.log("--------Delete registered________")
            const deletedCommentId = payload.old.id;
            if (payload.old.location === currentLocation) {
              setPostedComments((prevComments) => prevComments.filter(comment => comment.id !== deletedCommentId));
            }
          } else if (eventType === 'UPDATE') {
            const updatedComment = payload.new;
            const commentId = payload.old.id;
            if (updatedComment.location === currentLocation) {
              const updatedComments = (prevComments) => {
                const updatedComments = prevComments.filter(comment => comment.id !== commentId);
                return [...updatedComments, updatedComment];
              };
              
              const sortedComments = updatedComments(postedComments);

              setTimeout(() => {
                sortCommentsByChoice(sortedComments)
              }, 500);
              
              
              //sortCommentsByChoice()
            }
          }


        } 
      )
      .subscribe()


    // Cleanup subscription on component unmount
    return () => {
      channel.unsubscribe();
    };
  }, [postedComments]);


  const fetchComments = async () => {
    try {
      // Fetch comments from the "comments" table
      const { data, error } = await supabase.from('Comments').select('*');
      if (error) {
        throw error;
      }
      console.log("________LOgged")
      console.log(data)
      const thisLocationData = data.filter(item => item.location === currentLocation)
      sortCommentsByChoice(thisLocationData)
      //setPostedComments(thisLocationData);

      thisLocationData.forEach(item => {
        let itemTimestamp = item.created_at; // Assuming item.created_at is the timestamp value of each item
        const withoutDecimal = itemTimestamp.split(".")[0];
        const result = withoutDecimal + "+00:00";
        itemTimestamp = result;
      
        if (itemTimestamp > viewedCommentsTime) {
          // The item's timestamp is newer than the viewedCommentsTime timestamp
          // Perform your desired actions here
          console.log(itemTimestamp)
          console.log(viewedCommentsTime)
          setIsBorderNone(false);
          setBorder(false)
        }
      });
      

      //setPostedComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  async function handleCommentSubmit() {
    // Perform any necessary actions with the comment data
    const commentsByUser = JSON.parse(localStorage.getItem('commentsByUser')) || {};
    const location = currentLocation
    const user_number = newRatingIdObj[currentLocation]


    //give a 1 minute time out
    if (commentsByUser[location] && commentsByUser[location].length > 3 && commentsByUser[location].length < 6) {

      const lastCommentTime = JSON.parse(localStorage.getItem('lastCommentTime'));

      // Check if the location exists in lastCommentTime and its value is more than a minute ago
      if (lastCommentTime && lastCommentTime.hasOwnProperty(location)) {
        const lastTimestamp = lastCommentTime[location];
        const currentTimestamp = Date.now();
        const timeDifference = currentTimestamp - lastTimestamp;
        
        if (timeDifference <= (60 * 1000)) {
          console.log('Location value is within a minute');
          const secondsRemaining = Math.ceil((60 * 1000 - timeDifference) / 1000);
          const temp = {
            user_number: user_number,
            comment: `Please dont spam. You can comment again in ${secondsRemaining} seconds.`
          };
          handleNoti(temp)
          return;
        } else {
          console.log('Location value is more than a minute ago');
        }
      } else {
        console.log('Location value is either not found or more than a minute ago');
      }
    } else if (commentsByUser[location] && commentsByUser[location].length > 5 && commentsByUser[location].length < 8) {
      //give a 5 minute time out
      const lastCommentTime = JSON.parse(localStorage.getItem('lastCommentTime'));

      // Check if the location exists in lastCommentTime and its value is more than 5 minutes ago
      if (lastCommentTime && lastCommentTime.hasOwnProperty(location)) {
        const lastTimestamp = lastCommentTime[location];
        const currentTimestamp = Date.now();
        const timeDifference = currentTimestamp - lastTimestamp;
        
        if (timeDifference <= (60 * 5 * 1000)) {
          console.log('Location value is within 5 minutes');
          const secondsRemaining = Math.ceil((60 * 5 * 1000 - timeDifference) / 1000);
          const minutesRemaining = Math.floor(secondsRemaining / 60);
          const seconds = secondsRemaining % 60;
          const temp = {
            user_number: user_number,
            comment: `Please dont spam. You can comment again in ${minutesRemaining} minutes ${seconds} seconds.`
          };
          handleNoti(temp)
          return;
        } else {
          console.log('Location value is more than a minute ago');
        }
      } else {
        console.log('Location value is either not found or more than a minute ago');
      }

    } else if (commentsByUser[location] && commentsByUser[location].length > 7) {
      //give a 30 minute time out
      const lastCommentTime = JSON.parse(localStorage.getItem('lastCommentTime'));

      // Check if the location exists in lastCommentTime and its value is more than 30 minutes ago
      if (lastCommentTime && lastCommentTime.hasOwnProperty(location)) {
        const lastTimestamp = lastCommentTime[location];
        const currentTimestamp = Date.now();
        const timeDifference = currentTimestamp - lastTimestamp;
        
        if (timeDifference <= (60 * 30 * 1000)) {
          console.log('Location value is within 30 minutes');
          const secondsRemaining = Math.ceil((60 * 30 * 1000 - timeDifference) / 1000);
          const minutesRemaining = Math.floor(secondsRemaining / 60);
          const seconds = secondsRemaining % 60;
          const temp = {
            user_number: user_number,
            comment: `Please dont spam. You can comment again in ${minutesRemaining} minutes ${seconds} seconds.`
          };
          handleNoti(temp)
          return;
        } else {
          console.log('Location value is more than a minute ago');
        }
      } else {
        console.log('Location value is either not found or more than a minute ago');
      }
    }

    if (commentText.length === 0) {
      return
    }
    const bannedWords = {'nigga': 'brotha', 'nigger': 'brother'};
    let comment = commentText;
    let modifiedComment = comment.toLowerCase();

    for (const word in bannedWords) {
      if (modifiedComment.includes(word)) {
        const regex = new RegExp(`${word}`, 'gi');
        modifiedComment = modifiedComment.replace(regex, bannedWords[word]);
        comment = modifiedComment;
      }
    }

    console.log('Comment submitted:', comment);
    const likes = 0
    const dislikes = 0
    const user_color = JSON.parse(localStorage.getItem('userColors'))[currentLocation] || null

    const { data: newRating, error: insertError } = await supabase
    .from('Comments')
    .insert({ comment, likes, dislikes, location, user_number, user_color})
    .single()
    .select();

    if (insertError) {
        console.log('Error inserting into Comments table:', insertError.message);
        return;
    }

    let lastCommentTime = JSON.parse(localStorage.getItem('lastCommentTime')) || {};

    lastCommentTime[location] = Date.now();

    localStorage.setItem('lastCommentTime', JSON.stringify(lastCommentTime));

    handleNoti(newRating);


    if (!commentsByUser.hasOwnProperty(location)) {
      // If the key doesn't exist, create a new array with newRating.id as the value
      commentsByUser[location] = [newRating.id];
    } else {
      // If the key already exists, append newRating.id to the existing array
      commentsByUser[location].push(newRating.id);
    }

    // Store the updated commentsByUser object in localStorage
    localStorage.setItem('commentsByUser', JSON.stringify(commentsByUser));

    // Reset the comment state after submission
    setCommentText('');

    const currentDate = new Date();
    const currentTimeString = currentDate.toISOString().split('.')[0] + "+00:00";

    setViewedCommentsTime(currentTimeString)
    setStorageViewedComments(currentTimeString)
  }

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      // Call your function here
      handleCommentSubmit();
    }
  };

  const [liked, setLiked] = useState(JSON.parse(localStorage.getItem('likesByUser')) || []);
  const [disliked, setDisliked] = useState(JSON.parse(localStorage.getItem('dislikesByUser')) || []);
  const [isAnimating, setIsAnimating] = useState(false);
  const [topComment, setTopComment] = useState([]);


  useEffect(() => {
    localStorage.setItem('likesByUser', JSON.stringify(liked));
    console.log(liked);
  }, [liked]);

  useEffect(() => {
    localStorage.setItem('dislikesByUser', JSON.stringify(disliked));
    console.log(disliked);
  }, [disliked]);

  useEffect(() => {
    const sortedComments = [...postedComments].sort((a, b) => {
      const ratioA = a.likes - a.dislikes; // Avoid division by zero
      const ratioB = b.likes - b.dislikes;
      return ratioB - ratioA; // Sort in descending order
    });
    setTopComment(sortedComments);
    
  }, [postedComments]);
  

  const handleLike = async (commentId, currentLikes) => {

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);

    let updatedLikes;
    let updatedDislikes = postedComments.find(comment => comment.id === commentId).dislikes

    console.log("LIKED")
    console.log(liked)

    if (liked.includes(commentId)) {
      const temp = liked.filter((id) => id !== commentId);
      console.log(temp)
      setLiked(temp)
      updatedLikes = currentLikes - 1;
    } else {
      const temp = [...liked, commentId];
      console.log(temp)
      setLiked(temp)
      updatedLikes = currentLikes + 1;

      if (disliked.includes(commentId)) {
        const temp = disliked.filter((id) => id !== commentId);
        setDisliked(temp)
        updatedDislikes -= 1;
      }
    }
  
    const { data, error } = await supabase
      .from('Comments')
      .update({ likes: updatedLikes, dislikes: updatedDislikes })
      .eq('id', commentId);
  
    if (error) {
      console.error('Error updating likes count:', error);
    } else {
      console.log('Likes count updated successfully:', data);
      //fetchComments();
      // Perform any additional logic after the likes count is updated
      const updatedComments = postedComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, likes: updatedLikes, dislikes: updatedDislikes };
        }
        return comment;
      });

      setTimeout(() => {
        sortCommentsByChoice(updatedComments)
      }, 500);
      //setPostedComments(updatedComments);
    }
  };

  const handleDislike = async (commentId, currentDislikes) => {

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);

    let updatedDislikes;
    let updatedLikes = postedComments.find(comment => comment.id === commentId).likes

    console.log("DISLIKED")
    console.log(disliked)

    if (disliked.includes(commentId)) {
      const temp = disliked.filter((id) => id !== commentId);
      console.log(temp)
      setDisliked(temp)
      updatedDislikes = currentDislikes - 1;
    } else {
      const temp = [...disliked, commentId];
      console.log(temp)
      setDisliked(temp)
      updatedDislikes = currentDislikes + 1;

      if (liked.includes(commentId)) {
        const temp = liked.filter((id) => id !== commentId);
        setLiked(temp)
        updatedLikes -= 1;
      }
    }
  
    const { data, error } = await supabase
      .from('Comments')
      .update({ dislikes: updatedDislikes, likes: updatedLikes})
      .eq('id', commentId);
  
    if (error) {
      console.error('Error updating dislikes count:', error);
    } else {
      console.log('Dislikes count updated successfully:', data);
      //fetchComments();
      // Perform any additional logic after the likes count is updated
      const updatedComments = postedComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, dislikes: updatedDislikes, likes: updatedLikes };
        }
        return comment;
      });
      setTimeout(() => {
        sortCommentsByChoice(updatedComments)
      }, 500);
      
      //setPostedComments(updatedComments);
    }
  };

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isBorderNone, setIsBorderNone] = useState(localStorage.getItem('border_off') ? JSON.parse(localStorage.getItem('border_off'))[currentLocation] : false);
  const [viewedCommentsTime, setViewedCommentsTime] = useState(localStorage.getItem('viewed_comments_time') ? JSON.parse(localStorage.getItem('viewed_comments_time'))[currentLocation] : null);

  const setBorder = (value) => {
    const existingData = localStorage.getItem('border_off');
    let updatedData = {};
  
    if (existingData) {
      // If data already exists, parse it and update with the new key-value pair
      updatedData = JSON.parse(existingData);
    }
  
    // Update the updatedData object with the new key-value pair
    updatedData[currentLocation] = value;
  
    // Store the updated data back to local storage
    localStorage.setItem('border_off', JSON.stringify(updatedData));
  };

  const setStorageViewedComments = (value) => {
    const existingData = localStorage.getItem('viewed_comments_time');
    let updatedData = {};
  
    if (existingData) {
      // If data already exists, parse it and update with the new key-value pair
      updatedData = JSON.parse(existingData);
    }
  
    // Update the updatedData object with the new key-value pair
    updatedData[currentLocation] = value;
  
    // Store the updated data back to local storage
    localStorage.setItem('viewed_comments_time', JSON.stringify(updatedData));
  };

  const openPopup = () => {
    setIsPopupOpen(true);

    setIsBorderNone(true);
    setBorder(true)

    const currentDate = new Date();
    const currentTimeString = currentDate.toISOString().split('.')[0] + "+00:00";

    setViewedCommentsTime(currentTimeString)
    setStorageViewedComments(currentTimeString)
  };

  const closePopup = () => {
    setIsBorderNone(true);

    setBorder(true)
    setIsPopupOpen(false);

    const currentDate = new Date();
    const currentTimeString = currentDate.toISOString().split('.')[0] + "+00:00";

    setViewedCommentsTime(currentTimeString)
    setStorageViewedComments(currentTimeString)

  };

  const [showNoti, setShowNoti] = useState(false);
  const [notiContent, setNotiContent] = useState();
  const [muted, setMuted] = useState(localStorage.getItem('muted') === 'true');
  

  const handleNoti = (comment) => {
    if (!muted) {
      setShowNoti(true);
      setNotiContent(comment)

      setTimeout(() => {
        setShowNoti(false);
      }, 5000);
    } 
  };

  const [selectedSort, setSelectedSort] = useState(parseInt(localStorage.getItem('selected_sort')) || 1);

  const handleSortChange = (e) => {
    const newSelectedSort = parseInt(e.target.value);
    setSelectedSort(newSelectedSort);
    localStorage.setItem('selected_sort', newSelectedSort);
  };

  useEffect(() => {

    sortCommentsByChoice(postedComments);
    
  }, [selectedSort]);

  const sortCommentsByChoice = (comments) => {
    if (selectedSort === 1) {
      //Sort by recent
      const sortedComments = [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPostedComments(sortedComments);
      
    } else if (selectedSort === 2) {
      //Sort by oldest
      const sortedComments = [...comments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setPostedComments(sortedComments);

    } else if (selectedSort === 3) {
      //Sort by top
      const sortedComments = [...comments].sort((a, b) => {
        const ratioA = a.likes - a.dislikes; // Avoid division by zero
        const ratioB = b.likes - b.dislikes;
        return ratioB - ratioA; // Sort in descending order
      });
      setPostedComments(sortedComments);

    } else if (selectedSort === 4) {
      //Sort by likes
      const sortedComments = [...comments].sort((a, b) => b.likes - a.likes);
      setPostedComments(sortedComments);

    } else if (selectedSort === 5) {
      //Sort by dislikes
      const sortedComments = [...comments].sort((a, b) => b.dislikes - a.dislikes);
      setPostedComments(sortedComments);

    }
  }  

  const navigate = useNavigate();

  const goHome = () => {
    navigate('/', { replace: true });
    window.location.reload(); // Refresh the page
  };

  function getTimeSince(timestamp) {
    const createdAt = new Date(timestamp);
    const seconds = Math.floor((Date.now() - createdAt) / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    } else if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      return `${days}d`;
    } else {
      const weeks = Math.floor(seconds / 604800);
      return `${weeks}w`;
    }
  }

  const [imageUrls, setImageUrls] = useState([]);
  const [imageEventNames, setImageEventNames] = useState([]);

  useEffect(() => {
    const locationObject = locations.find(location => location.name === currentLocation);
    if (locationObject && locationObject.event) {
      const fetchedImageUrls = [];
      const matchingEventNames = [];

      const fetchImages = async () => {
        for (let i = 0; i < locationObject.eventName.length; i++) {
          const filename = locationObject.eventName[i];
          const endTimestamp = locationObject['end'][i];
      
          if (endTimestamp && new Date(endTimestamp) < new Date()) {
            continue; // Skip retrieving image if the 'end' timestamp has already passed
          }
      
          const { data, error } = await supabase.storage
            .from('public')
            .download(`stories/${currentLocation}/${filename}`);
      
          if (error) {
            console.error('Error fetching image:', error);
          } else {
            const url = URL.createObjectURL(data);
            fetchedImageUrls.push(url);
            matchingEventNames.push(filename)
          }
        }
      
        setImageUrls(fetchedImageUrls);
        setImageEventNames(matchingEventNames)
      };
      

      fetchImages();
    } else {
      setImageUrls([]);
    }
  }, []);

  const storySettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    draggable: false,
    swipe: false,
    arrows: false,
  };

  const slider = React.useRef(null);

  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [containerPosition, setContainerPosition] = useState(0);
  const [containerOpacity, setContainerOpacity] = useState(1);
  const touchStartY = React.useRef(0);

  const toggleStoryVisibility = () => {
    setIsStoryVisible(!isStoryVisible);
    incrementStoryViews(currentLocation)
  };

  const handleNextButtonClick = () => {
    const currentSlide = slider?.current?.slickCurrentSlide;
    const totalSlides = imageUrls.length;

    if (currentSlide === totalSlides - 1) {
      closeStoryContainer();
    } else {
      slider?.current?.slickNext();
    }
  };

  const closeStoryContainer = () => {
    setContainerOpacity(0);
    setTimeout(() => {
      setIsStoryVisible(false);
      setContainerOpacity(1);
      setContainerPosition(0);
    }, 500); // Adjust the duration as needed
  };

  const handleTouchStart = (event) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event) => {
    const touchY = event.touches[0].clientY;
    const touchDistance = touchY - touchStartY.current;
    setContainerPosition(touchDistance);
  };

  const handleTouchEnd = (event) => {
    const touchEndY = event.changedTouches[0].clientY;
    const touchDistance = touchEndY - touchStartY.current;
    const minDistanceToClose = 100; // Adjust as needed

    if (touchDistance > minDistanceToClose) {
      closeStoryContainer();
    } else {
      setContainerPosition(0);
    }
  };

  const containerStyle = {
    transform: `translateY(${containerPosition}px)`,
    opacity: containerOpacity,
    transition: 'transform 0.3s, opacity 0.3s',
  };

  const incrementStoryViews = async (name) => {
    // Retrieve rows that match the given name
    const { data, error } = await supabase
      .from('Events')
      .select('id, story_views, end')
      .eq('name', name);
  
    if (error) {
      console.error('Error retrieving rows:', error);
      return;
    }
  
    // Increment the story_views value by one for each row that has not ended
    for (const row of data) {
      if (row.end && new Date(row.end) < new Date()) {
        continue; // Skip incrementing for rows with an 'end' timestamp that has already passed
      }
  
      const updatedViews = row.story_views ? row.story_views + 1 : 1;
      const { error: updateError } = await supabase
        .from('Events')
        .update({ story_views: updatedViews })
        .eq('id', row.id);
  
      if (updateError) {
        console.error('Error updating row:', updateError);
      }
    }
  
    console.log('Story views updated successfully.');
  };



  useEffect(() => {
    fetchGoingCountData();

    const Events = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', tables: ['Ratings', 'Events'] },
      async (payload) => {
        console.log('Change received!', payload)

        if (payload.table === 'Events') {
          fetchGoingCountData()

        } else if (payload.table === 'Ratings') {
          const newAverages = await updateAverages();
          setAverages(newAverages);
        }
        
      }
    )
    .subscribe()

    return () => {
      Events.unsubscribe();
    };
  }, []);
  

  const [goingOn, setGoingOn] = useState(() => {
    const storedGoingToEvent = localStorage.getItem('goingToEvent');
    if (storedGoingToEvent) {
      return JSON.parse(storedGoingToEvent);
    } else {
      const initialGoingOn = {};
      locations.forEach((location) => {
        initialGoingOn[location.name] = {};
        if (location.event && Array.isArray(location.eventName)) {
          location.eventName.forEach((eventName) => {
            initialGoingOn[location.name][eventName] = false;
          });
        }
      });
      return initialGoingOn;
    }    
  });
  
  useEffect(() => {
    localStorage.setItem('goingToEvent', JSON.stringify(goingOn));
    console.log(goingOn)
  }, [goingOn]);

  
  const [goingCount, setGoingCount] = useState({})
  
  const fetchGoingCountData = async () => {
    const { data, error } = await supabase.from('Events').select('name, event_name, going');
  
    if (error) {
      console.error('Error fetching data:', error.message);
      return;
    }
  
    const updatedGoingCount = {};
    console.log(data)
    data.forEach((row) => {
      if (!updatedGoingCount.hasOwnProperty(row.name)) {
        updatedGoingCount[row.name] = {};
      }
      updatedGoingCount[row.name][row.event_name] = row.going;
    });


    console.log("hYh")
    console.log(updatedGoingCount)
  
    setGoingCount(updatedGoingCount);
  };
  

  const handleGoingClick = async (location, event, current) => {

    console.log(goingOn)

    setGoingOn(prevState => {
      const updatedGoingOn = { ...prevState }; // Create a copy of the previous state
    
      // Toggle the value of a specific location key
      updatedGoingOn[location] = {
        ...prevState[location],
        [event]: !prevState[location][event]
      };
    
      return updatedGoingOn;
    });
    

    console.log(goingOn)
    

    let updatedGoing;

    if (goingOn[location][event] === false) {
      //increment
      updatedGoing = current + 1
    } else if (goingOn[location][event] === true) {
      //decrement
      updatedGoing = current - 1
    }

    setGoingCount(prevGoingCount => ({
      ...prevGoingCount,
      [location]: {
        ...prevGoingCount[location],
        [event]: updatedGoing
      }
    }));
    

    // Update the database here
    const { data, error } = await supabase
    .from('Events')
    .update({ going: updatedGoing })
    .eq('name', location)
    .eq('event_name', event);
  
    if (error) {
      console.error('Error updating going count:', error);
    } else {
      console.log('Going count updated successfully:', data);
    }

  };

  
  
  return (
    <div id="main-location-container">

      {showNoti && (
        <div className='noti-container'>
          <img className='wave-logo' src={logo} alt="Logo" />
          <div className='noti-inner-container'>
            <div className='noti-line-one'>
              <div className='noti-user'>User {notiContent.user_number}</div>
              <div className='noti-timestamp'>Now</div>
            </div>
            <div>{notiContent.comment}</div>
          </div>
        </div>
      )}

      <div id='location-card-1'>
        <div id='location-header'>
          <div id='location-header-left'>
            <div id='location-name'>{currentLocation}</div>
            <div id='location-subtext'>Past 2h - {averages && averages[currentLocation] ? averages[currentLocation]['count'] : '0'} ratings</div>
          </div>

          <div className='story-small' onClick={toggleStoryVisibility}>
            {imageUrls.length > 0 && (
              <img className="story-preview" src={imageUrls[0]} alt="Supabase Image 0" />
            )}
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
            <div>2h</div>
            <div>1h</div>
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
              <path d="M12 19.5V8.66667L22 7V17.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.5 22C10.8807 22 12 20.8807 12 19.5C12 18.1193 10.8807 17 9.5 17C8.11929 17 7 18.1193 7 19.5C7 20.8807 8.11929 22 9.5 22Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.5 20.3333C20.8807 20.3333 22 19.214 22 17.8333C22 16.4525 20.8807 15.3333 19.5 15.3333C18.1193 15.3333 17 16.4525 17 17.8333C17 19.214 18.1193 20.3333 19.5 20.3333Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <div id='people-text'>In line</div>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      
      {isLocationInRange === "false"&& (
        <div id='range-message'>
          <div id='range-message-container'>
            <span>Sorry you must be closer to rate or comment on this location. If you belive you are in range,</span>  
            <button id='go-home' onClick={goHome}>refresh the homepage</button>
            <span>, select allow, and make sure</span>
            <a id='precise-location' href="https://www.google.com/search?client=safari&rls=en&q=how+to+turn+on+precise+location&ie=UTF-8&oe=UTF-8" target="_blank" rel="noopener noreferrer">precise location</a>
            <span>is turned on in settings.</span>
          </div>
        </div>
        
      )}
      {isLocationInRange === "undefined" && (
        <div id="range-message">You must allow wave to use your location in order to rate or comment.</div>
      )}
      {isLocationInRange === "true" && (
        <div>

          <div className='music-type-container'>
            <div className='music-type'>Pop</div>
            <div className='music-type'>Techno/House</div>
            <div className='music-type'>Latin</div>
            <div className='music-type'>Hip-hop/Rap</div>
            <div className='music-type'>EDM</div>
            <div className='music-type'>Rock</div>
            <div className='music-type last-item'>Country</div>
          </div>


          <div id="rating">
            <div className='slider-container'>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <circle cx="15" cy="15" r="15" fill="#3D5AF1"/>
                  <path d="M11.5 24L12.375 17.7H8L15.875 6H17.625L16.75 13.2H22L13.25 24H11.5Z" fill="white"/>
                </svg>
              <div className='slider'>
                <label className='sliderLabel' htmlFor="energy-rating">Energy</label>
                <input id="energy-rating" type="range" min="0" max="10" value={energyRating} onChange={handleEnergyRatingChange} />
                <span id="rangeValue">{energyRating}</span>
              </div>
            </div>

            <div className='slider-container'>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="15" fill="#2998F2"/>
                <path d="M12 19.5V8.66667L22 7V17.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 22C10.8807 22 12 20.8807 12 19.5C12 18.1193 10.8807 17 9.5 17C8.11929 17 7 18.1193 7 19.5C7 20.8807 8.11929 22 9.5 22Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.5 20.3333C20.8807 20.3333 22 19.214 22 17.8333C22 16.4525 20.8807 15.3333 19.5 15.3333C18.1193 15.3333 17 16.4525 17 17.8333C17 19.214 18.1193 20.3333 19.5 20.3333Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className='slider'>
                <label className='sliderLabel' htmlFor="music-rating">Music</label>
                <input id="music-rating" type="range" min="0" max="10" value={musicRating} onChange={handleMusicRatingChange} />
                <span id="rangeValue">{musicRating}</span>
              </div>
            </div>
            
            <div className='slider-container'>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="15" fill="#29CAF2"/>
                <path d="M7 23V21.8H8.64211V18.98C8.15088 18.8467 7.75439 18.59 7.45263 18.21C7.15088 17.83 7 17.3867 7 16.88V10.2H11.5474V16.88C11.5474 17.3467 11.3965 17.78 11.0947 18.18C10.793 18.58 10.3965 18.8467 9.90526 18.98V21.8H11.5474V23H7ZM8.26316 14.62H10.2842V11.4H8.26316V14.62ZM15.4211 23C15.0842 23 14.7895 22.88 14.5368 22.64C14.2842 22.4 14.1579 22.12 14.1579 21.8V13.64C14.1579 13.3733 14.2351 13.16 14.3895 13C14.5439 12.84 14.7614 12.7 15.0421 12.58L15.8421 12.24C16.1789 12.0933 16.4246 11.9133 16.5789 11.7C16.7333 11.4867 16.8105 11.2267 16.8105 10.92V7.7C16.8105 7.48667 16.8772 7.31667 17.0105 7.19C17.1439 7.06333 17.3228 7 17.5474 7H19.5263C19.7509 7 19.9298 7.06333 20.0632 7.19C20.1965 7.31667 20.2632 7.48667 20.2632 7.7V10.92C20.2632 11.2267 20.3579 11.4867 20.5474 11.7C20.7368 11.9133 21 12.0933 21.3368 12.24L22.1368 12.58C22.4035 12.6867 22.614 12.8233 22.7684 12.99C22.9228 13.1567 23 13.3733 23 13.64V21.8C23 22.12 22.8737 22.4 22.6211 22.64C22.3684 22.88 22.0737 23 21.7368 23H15.4211ZM18.0737 9.08H19V8.2H18.0737V9.08ZM15.4211 15.3H21.7368V13.64L20.8526 13.32C20.2912 13.12 19.8421 12.7933 19.5053 12.34C19.1684 11.8867 19 11.3867 19 10.84V10.28H18.0737V10.84C18.0737 11.3867 17.9158 11.8667 17.6 12.28C17.2842 12.6933 16.8596 13.0133 16.3263 13.24L15.4211 13.64V15.3ZM15.4211 21.8H21.7368V19.74H15.4211V21.8Z" fill="white"/>
              </svg>
              <div className='slider'>
                <label className='sliderLabel' htmlFor="service-rating">Service</label>
                <input id="service-rating" type="range" min="0" max="10" value={serviceRating} onChange={handleServiceRatingChange} />
                <span id="rangeValue">{serviceRating}</span>
              </div>
            </div>

            <div className='slider-container'>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="15" fill="#005985"/>
                <path d="M6 20V18.675C6 18.0322 6.25938 17.509 6.77813 17.1054C7.29688 16.7018 7.97735 16.5 8.81955 16.5C8.97161 16.5 9.11783 16.5042 9.25821 16.5125C9.39857 16.5208 9.5375 16.5388 9.675 16.5663C9.575 16.8554 9.5 17.1485 9.45 17.4454C9.4 17.7424 9.375 18.0522 9.375 18.375V20H6ZM10.5 20V18.375C10.5 17.8417 10.6094 17.3542 10.8281 16.9125C11.0469 16.4708 11.3563 16.0833 11.7563 15.75C12.1563 15.4167 12.6344 15.1667 13.1906 15C13.7469 14.8333 14.35 14.75 15 14.75C15.6625 14.75 16.2719 14.8333 16.8281 15C17.3844 15.1667 17.8625 15.4167 18.2625 15.75C18.6625 16.0833 18.9688 16.4708 19.1813 16.9125C19.3938 17.3542 19.5 17.8417 19.5 18.375V20H10.5ZM20.625 20V18.375C20.625 18.044 20.6031 17.7321 20.5594 17.4392C20.5156 17.1464 20.4438 16.8561 20.3438 16.5682C20.4813 16.5394 20.6198 16.5208 20.7595 16.5125C20.8991 16.5042 21.0418 16.5 21.1875 16.5C22.0313 16.5 22.7109 16.6981 23.2266 17.0942C23.7422 17.4903 24 18.0173 24 18.675V20H20.625ZM8.80438 15.75C8.44729 15.75 8.14063 15.5786 7.88438 15.2359C7.62813 14.8932 7.5 14.4813 7.5 14C7.5 13.5167 7.62851 13.1042 7.88554 12.7625C8.14258 12.4208 8.45156 12.25 8.8125 12.25C9.175 12.25 9.48438 12.4208 9.74063 12.7625C9.99688 13.1042 10.125 13.5203 10.125 14.0108C10.125 14.4869 9.99688 14.8958 9.74063 15.2375C9.48438 15.5792 9.17229 15.75 8.80438 15.75ZM21.1794 15.75C20.8223 15.75 20.5156 15.5786 20.2594 15.2359C20.0031 14.8932 19.875 14.4813 19.875 14C19.875 13.5167 20.0035 13.1042 20.2605 12.7625C20.5176 12.4208 20.8266 12.25 21.1875 12.25C21.55 12.25 21.8594 12.4208 22.1156 12.7625C22.3719 13.1042 22.5 13.5203 22.5 14.0108C22.5 14.4869 22.3719 14.8958 22.1156 15.2375C21.8594 15.5792 21.5473 15.75 21.1794 15.75ZM15 14C14.375 14 13.8438 13.7083 13.4063 13.125C12.9688 12.5417 12.75 11.8333 12.75 11C12.75 10.15 12.9688 9.4375 13.4063 8.8625C13.8438 8.2875 14.375 8 15 8C15.6375 8 16.1719 8.2875 16.6031 8.8625C17.0344 9.4375 17.25 10.15 17.25 11C17.25 11.8333 17.0344 12.5417 16.6031 13.125C16.1719 13.7083 15.6375 14 15 14Z" fill="white"/>
              </svg>
              <div className='slider'>
                <label className='sliderLabel' htmlFor="line-rating">Line</label>
                <input id="line-rating" type="range" min="0" max="100" step={10} value={lineRating} onChange={handleLineRatingChange} />
                <span id="rangeValue">{Number(lineRating) === 100 ? "100+" : lineRating}</span>
              </div>
            </div>
            
          </div>
        </div>
      )}

      <div>
        <div id='comments'>
          
          {topComment && topComment.slice(0, 1).map((comment) => (
            <div
              key={comment.id}
              className={`preview-comments ${isBorderNone ? 'preview-comments-border-none' : 'preview-comments-border'}`}
            >
              <div className='preview-comments' onClick={openPopup}>
                <div className='comment-line-pinned'>
                  <div className='comment-line-one'>
                    <div className='user-bubble' style={{ backgroundColor: comment.user_color }}>User {comment.user_number}</div>
                    <div className='comment-timestamp'>{getTimeSince(comment.created_at)}</div>
                  </div>

                  <div className='comment-line-two'>
                    <div className='comment-text'>{comment.comment}</div>
                    
                    <button
                      onClick={() => handleLike(comment.id, comment.likes)}
                      className={liked.includes(comment.id) ? 'liked-button' : 'unliked-button'}
                    >
                      <div className="svg-container">
                        <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.9649 3.12832C8.29171 -2.5454 0.857422 0.545461 0.857422 6.72603C0.857422 11.3672 11.0494 18.6272 11.9649 19.5712C12.8866 18.6272 22.5717 11.3672 22.5717 6.72603C22.5717 0.592318 15.6449 -2.5454 11.9649 3.12832Z" fill="#3a3a3a" />
                        </svg>
                      </div>
                    </button>
                    <span>{comment.likes}</span>

                    <button
                      onClick={() => handleDislike(comment.id, comment.dislikes)}
                      className={disliked.includes(comment.id)  ? 'disliked-button' : 'undisliked-button'}
                    >
                      <div className="svg-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 26 20" fill="none">
                          <path d="M9.00003 17.9999V13.9999H3.34003C3.05012 14.0032 2.76297 13.9434 2.49846 13.8247C2.23395 13.706 1.99842 13.5311 1.80817 13.3124C1.61793 13.0936 1.47753 12.8361 1.39669 12.5576C1.31586 12.2792 1.29652 11.9865 1.34003 11.6999L2.72003 2.69988C2.79235 2.22298 3.0346 1.78828 3.40212 1.47588C3.76965 1.16348 4.2377 0.994431 4.72003 0.999884H16V11.9999L12 20.9999C11.2044 20.9999 10.4413 20.6838 9.87871 20.1212C9.3161 19.5586 9.00003 18.7955 9.00003 17.9999Z" fill="#3A3A3A" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 1.00036V12.0004H22.67C23.236 12.0104 23.7859 11.8122 24.2154 11.4435C24.6449 11.0749 24.9241 10.5613 25 10.0004V3.00036C24.9241 2.43942 24.6449 1.92586 24.2154 1.55718C23.7859 1.1885 23.236 0.990352 22.67 1.00036H20Z" fill="#3A3A3A" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    <span>{comment.dislikes}</span>
                  </div> 
                </div>
              </div>
            </div>
          ))}

        {topComment && !topComment[0] && (
          <div className='preview-comments-border-none'>
            <div className='preview-comments' onClick={openPopup}>
              <div id='no-comments'>Be the first to comment</div>
            </div>
          </div>
          
        )}

        {isPopupOpen && (
          <div className='popup'>
            <div className='popup-content'>
      
              <div className='comment-container'>

              <div id='comment-header'>
                <div className='wave-wall'>Wave Stream</div>

                <div>
                  <select id="sort-select" onChange={handleSortChange} value={selectedSort} style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="%23CBCBCB" stroke-linecap="round" stroke-linejoin="round"/></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "auto 25%",
                  }} >
                    <option value="1">Recent</option>
                    <option value="2">Oldest</option>
                    <option value="3">Top</option>
                    <option value="4">Likes</option>
                    <option value="5">Dislikes</option>
                  </select>
                </div>

                <button className='close-button' onClick={closePopup}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="23" height="23" viewBox="0 0 23 23" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M18 6l-12 12"/>
                    <path d="M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              

              <div className='pinned-comments-section'>
              
              {topComment && topComment.slice(0, 3).map((comment) => (
                  <div key={comment.id} className='pinned-comment'>
                    <div className='comment-line-pinned'>
                        <div className='comment-line-one'>
                          <div className='user-bubble' style={{ backgroundColor: comment.user_color }}>User {comment.user_number}</div>
                          <div className='comment-timestamp'>{getTimeSince(comment.created_at)}</div>
                        </div>

                        <div className='comment-line-two'>
                          <div className='comment-text'>{comment.comment}</div>
                          
                          <button
                            onClick={() => handleLike(comment.id, comment.likes)}
                            className={liked.includes(comment.id) ? 'liked-button' : 'unliked-button'}
                          >
                            <div className="svg-container">
                              <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.9649 3.12832C8.29171 -2.5454 0.857422 0.545461 0.857422 6.72603C0.857422 11.3672 11.0494 18.6272 11.9649 19.5712C12.8866 18.6272 22.5717 11.3672 22.5717 6.72603C22.5717 0.592318 15.6449 -2.5454 11.9649 3.12832Z" fill="#3a3a3a" />
                              </svg>
                            </div>
                          </button>
                          <span>{comment.likes}</span>

                          <button
                            onClick={() => handleDislike(comment.id, comment.dislikes)}
                            className={disliked.includes(comment.id)  ? 'disliked-button' : 'undisliked-button'}
                          >
                            <div className="svg-container">
                              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 26 20" fill="none">
                                <path d="M9.00003 17.9999V13.9999H3.34003C3.05012 14.0032 2.76297 13.9434 2.49846 13.8247C2.23395 13.706 1.99842 13.5311 1.80817 13.3124C1.61793 13.0936 1.47753 12.8361 1.39669 12.5576C1.31586 12.2792 1.29652 11.9865 1.34003 11.6999L2.72003 2.69988C2.79235 2.22298 3.0346 1.78828 3.40212 1.47588C3.76965 1.16348 4.2377 0.994431 4.72003 0.999884H16V11.9999L12 20.9999C11.2044 20.9999 10.4413 20.6838 9.87871 20.1212C9.3161 19.5586 9.00003 18.7955 9.00003 17.9999Z" fill="#3A3A3A" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20 1.00036V12.0004H22.67C23.236 12.0104 23.7859 11.8122 24.2154 11.4435C24.6449 11.0749 24.9241 10.5613 25 10.0004V3.00036C24.9241 2.43942 24.6449 1.92586 24.2154 1.55718C23.7859 1.1885 23.236 0.990352 22.67 1.00036H20Z" fill="#3A3A3A" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </button>

                          <span>{comment.dislikes}</span>
                        </div>
                        
                      </div>
                  </div>
              ))}
              </div>

              <div className='main-comments'>
              {postedComments.map((comment) => (

                  <div key={comment.id}>
                    {topComment[0] && comment.id !== topComment[0].id && comment.id !== topComment[1].id && comment.id !== topComment[2].id && (
                      <div className='comment-line'>
                        <div className='comment-line-one'>
                        <div className='user-bubble' style={{ backgroundColor: comment.user_color }}>User {comment.user_number}</div>
                        <div className='comment-timestamp'>{getTimeSince(comment.created_at)}</div>
                        </div>

                        <div className='comment-line-two'>
                          <div className='comment-text'>{comment.comment}</div>
                          
                          <button
                            onClick={() => handleLike(comment.id, comment.likes)}
                            className={liked.includes(comment.id) ? 'liked-button' : 'unliked-button'}
                          >
                            <div className="svg-container">
                              <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.9649 3.12832C8.29171 -2.5454 0.857422 0.545461 0.857422 6.72603C0.857422 11.3672 11.0494 18.6272 11.9649 19.5712C12.8866 18.6272 22.5717 11.3672 22.5717 6.72603C22.5717 0.592318 15.6449 -2.5454 11.9649 3.12832Z" fill="#3a3a3a" />
                              </svg>
                            </div>
                          </button>
                          <span>{comment.likes}</span>

                          <button
                            onClick={() => handleDislike(comment.id, comment.dislikes)}
                            className={disliked.includes(comment.id)  ? 'disliked-button' : 'undisliked-button'}
                          >
                            <div className="svg-container">
                              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 26 20" fill="none">
                                <path d="M9.00003 17.9999V13.9999H3.34003C3.05012 14.0032 2.76297 13.9434 2.49846 13.8247C2.23395 13.706 1.99842 13.5311 1.80817 13.3124C1.61793 13.0936 1.47753 12.8361 1.39669 12.5576C1.31586 12.2792 1.29652 11.9865 1.34003 11.6999L2.72003 2.69988C2.79235 2.22298 3.0346 1.78828 3.40212 1.47588C3.76965 1.16348 4.2377 0.994431 4.72003 0.999884H16V11.9999L12 20.9999C11.2044 20.9999 10.4413 20.6838 9.87871 20.1212C9.3161 19.5586 9.00003 18.7955 9.00003 17.9999Z" fill="#3A3A3A" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20 1.00036V12.0004H22.67C23.236 12.0104 23.7859 11.8122 24.2154 11.4435C24.6449 11.0749 24.9241 10.5613 25 10.0004V3.00036C24.9241 2.43942 24.6449 1.92586 24.2154 1.55718C23.7859 1.1885 23.236 0.990352 22.67 1.00036H20Z" fill="#3A3A3A" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </button>

                          <span>{comment.dislikes}</span>
                        </div>
                        
                      </div>
                    )}

                  </div>
                ))}
              </div>


              {newRatingIdObj && Object.keys(newRatingIdObj).length !== 0 && newRatingIdObj[currentLocation] && (
                <div id='comment-bar-outer-container'>
                  <div id='comment-bar-container'>
                    <input
                      id='comment-bar'
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={maxCharacters}
                      placeholder="Message"
                    />
                    <button id='submit-comment' onClick={handleCommentSubmit} disabled={!commentText} style={{ opacity: commentText ? 1 : 0.5 }}>
                      <div className="svg-container-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-up" width="23" height="23" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M12 5l0 14"/>
                          <path d="M18 11l-6 -6"/>
                          <path d="M6 11l6 -6"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                  
                  <div id='character-count'>
                    Characters remaining: {maxCharacters - commentText.length}/{maxCharacters}
                  </div>
                </div>
              )}

              {!newRatingIdObj[currentLocation] && (
                <div id='comment-bar-outer-container'>
                  <div id='comment-bar-container'>
                    <div id='comment-bar'>Please rate before you can comment</div>
                    <button id='submit-comment-grey'>
                      <div className="svg-container-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-up" width="23" height="23" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 5l0 14"/>
                            <path d="M18 11l-6 -6"/>
                            <path d="M6 11l6 -6"/>
                          </svg>
                        </div>
                    </button>
                  </div>
                  
                  <div id='character-count'>
                    Characters remaining: {maxCharacters - commentText.length}/{maxCharacters}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        
        </div>
      </div>


      <div>
        {isStoryVisible && (
          <div
            id='story-container'
            style={containerStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Slider ref={slider} {...storySettings} className='story'>
              {imageUrls.map((url, index) => (
                <div key={index} className='image-container'>
                  <img className='story-photo' src={url} alt={`Supabase Image ${index}`} />

                  {locations && (
                    <div>
                      {locations.map((location) => {
                        const locationObject = location.name === currentLocation ? location : null;
                        const eventName = imageEventNames[index]
                        
                        if (locationObject) {
                          const imageEventIndex = locationObject['eventName'].indexOf(imageEventNames[index])
                          const startTimestamp = locationObject.start[imageEventIndex];
                          const endTimestamp = locationObject.end[imageEventIndex];

                          const startTime = new Date(startTimestamp);
                          const endTime = new Date(endTimestamp);

                          const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'long' });

                          const startHour = startTime.getHours() % 12 || 12;
                          const endHour = endTime.getHours() % 12 || 12;

                          const startPeriod = startTime.getHours() >= 12 ? 'pm' : 'am';
                          const endPeriod = endTime.getHours() >= 12 ? 'pm' : 'am';

                          const formattedDate = startTime.toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'short'
                          });

                          return (
                            <div key={index}>

                              <div className="story-timestamp">
                                <div>{dayOfWeek}, {formattedDate}</div>
                                <div className='circle'></div>
                                <div>{startHour} - {endHour}{endPeriod}</div>
                              </div>
                             
                              <div className='story-info'>

                                <div className='story-title'>{eventName}</div>

                                <div className='event-buttons-story'>
                                  <a className="buy" href={locationObject['buyLink'][imageEventIndex]} target="_blank" rel="noopener noreferrer">
                                    <div className="buy-box">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-currency-dollar" width="14" height="14" viewBox="0 0 24 24" strokeWidth="3" stroke="#7bff82" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2"/>
                                        <path d="M12 3v3m0 12v3"/>
                                      </svg>
                                    </div>
                                    <div className="price-container">{locationObject['price'][imageEventIndex]}</div>
                                  </a>

                                  <button
                                    className={`going ${goingOn[currentLocation]?.[eventName] ? 'on' : 'off'}`}
                                    onClick={() => handleGoingClick(currentLocation, eventName, goingCount[currentLocation]?.[eventName])}
                                  >
                                    <div className={`going-box ${goingOn[currentLocation]?.[eventName] ? 'on' : 'off'}`}>
                                      {goingCount[currentLocation]?.[eventName]}
                                    </div>
                                    <div className='going-container'>going</div>
                                  </button>
                                </div>

                                <div className='story-desciption'>{locationObject['description'][imageEventIndex]}</div>

                              </div>

                            </div>
                          )
                        }
                      })}
                    </div>
                  )}
                  
                  
                  <button className='prev-button' onClick={() => slider?.current?.slickPrev()}></button>
                  {index === imageUrls.length - 1 ? (
                    <button className='next-button' onClick={closeStoryContainer}></button>
                  ) : (
                    <button className='next-button' onClick={handleNextButtonClick}></button>
                  )}
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
              
      
      


    </div>
  );
}

export default LocationPage;
