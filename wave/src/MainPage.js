import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js'

//const supabaseUrl = process.env.REACT_APP_PROJECT_URL
//const supabaseKey = process.env.REACT_APP_API_KEY

const supabaseUrl = "https://cgynrutxxwafteiunwho.supabase.co" 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneW5ydXR4eHdhZnRlaXVud2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMDg5MTgsImV4cCI6MTk5NjU4NDkxOH0.kIwLWQB-Z9QFVn7SZgJM5fAfEmWN7dKNkJKYj62kFjw"

const supabase = createClient(supabaseUrl, supabaseKey)

const updateAverages = async () => {
  const { data: ratings, error } = await supabase.from('Ratings').select('*');

  if (error) {
    console.error('Error fetching ratings:', error.message);
    return {};
  }

  const averages = {};

  ratings.forEach((rating) => {
    if (averages[rating.location]) {
      averages[rating.location].totalScore += rating.score;
      averages[rating.location].count += 1;
    } else {
      averages[rating.location] = { totalScore: rating.score, count: 1 };
    }
  });

  Object.keys(averages).forEach((location) => {
    averages[location] = averages[location].totalScore / averages[location].count;
  });

  return averages;
};


function MainPage(props) {
  const [isMobile, setIsMobile] = useState(false);
  const threshold = 0.09;
  const locations = useMemo(() => [
    { name: 'Nova', latitude: 40.415171, longitude: -86.893275, addy: '200 S Fourth St'},
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227, addy: '111 S Salisbury St'},
    { name: 'Rise', latitude: 40.422677, longitude: -86.906967, addy: '134 W State St'},
    { name: 'Test', latitude: 42.111683, longitude: -71.872295, addy: '123 Random St'},
    { name: 'Test2', latitude: 42.299103, longitude: -71.785020, addy: '123 Whatever Ave'}
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
        location['dist'] = dist;
        if (dist < threshold) {
          newInRange[location.name] = true;
        } else {
          newInRange[location.name] = false;
        }
      }
      props.setInRange(newInRange);
      
      const sortedLocations = locations.sort((a, b) => a.dist - b.dist);
      props.setLocations(sortedLocations)
    };

    const errorCallback = (error) => {
      console.log(error);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

  }, [locations, props.setInRange, props.setLocations, threshold]);

  const [averages, setAverages] = useState({});
  const [mostRecent, setMostRecent] = useState({});

  useEffect(() => {
    const getAverages = async () => {
      const firstAverages = await updateAverages();
      const secondAverages = await updateAverages();
      setAverages(secondAverages[0]);
      setMostRecent(secondAverages[1])
    };
    getAverages();
  
    const intervalId = setInterval(async () => {
      const newAverages = await updateAverages();
      setAverages(newAverages[0]);
      setMostRecent(newAverages[1])
    }, 10000);
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  

  console.log(averages)
  console.log(mostRecent)

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
          //l_rating: rating.u_l_rating || rating.l_rating
          score: rating.u_score || rating.score,
          location: rating.location
        };
      } else {
        return {
          created_at: rating.created_at,
          m_rating: rating.m_rating,
          s_rating: rating.s_rating,
          e_rating: rating.e_rating,
          //l_rating: rating.l_rating
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

    //console.log(filteredRatings)
  
    const averages = {};
    const mostRecent = {};
  
    for (const rating of filteredRatings) {
      //set averages
      if (!averages[rating.location]) {
        averages[rating.location] = {
          totalScore: 0,
          count: 0,
          averageScore: 0,
        };
      }
  
      averages[rating.location].totalScore += rating.score
      averages[rating.location].count++;
      averages[rating.location].averageScore = Math.round(
        averages[rating.location].totalScore / averages[rating.location].count * 10) / 10;

      //set mostRecent
      const locationName = rating.location;

      //console.log(rating.created_at)

      const timeDiff = (new Date() - new Date(rating.created_at)) / (1000 * 60);
      if (!mostRecent[locationName] || Math.round(timeDiff) < mostRecent[locationName]) {
        //const timeDiff = (new Date() - new Date(rating.created_at)) / (1000 * 60);
        mostRecent[locationName] = Math.round(timeDiff)
      }
    }

    console.log(mostRecent)

    const results = [averages, mostRecent]
  
    return results;
  }

  return (
    <div>
      {/* {!isMobile ? */}
        <div id="content">
          <div id="header">
            <div id='logo'>Wave</div>
          </div>
          <ul>
            {locations.map((location) => (
              <li key={location.name}>
                <Link className='button-link' to={`/location/${location.name}?inRange=${encodeURIComponent(JSON.stringify(props.inRange[location.name]))}`} onClick={() => handleLocationClick(location.name)}>
                  <div className='card-left'>
                    <div className='bar-name'>{location.name}</div>
                    <div className='bar-addy'>{location.addy}</div>
                    {Object.keys(mostRecent).length !== 0 && mostRecent[location.name] >= 0 && (
                      <div className='timestamp'>Rated {mostRecent[location.name]} minutes ago</div>
                    )}
                  </div>
                  {Object.keys(averages).length !== 0 && (
                    <div className='card-right'>{averages && averages[location.name] ? averages[location.name]['averageScore'] : ''}</div>
                  )}
                </Link>
                
              </li>
            ))}
          </ul>
        </div>
        {/* <div id="not-mobile">Sorry, wave is currently only supported on mobile devices</div> */}
      {/* } */}
    </div>
  );
}

export default MainPage;
