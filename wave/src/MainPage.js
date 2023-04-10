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
    { name: 'test', latitude: 26.775044, longitude: -80.032890 },
    { name: 'Hub', latitude: 40.422203, longitude: -86.906227 },
    { name: 'Rise', latitude: 40.422677, longitude: -86.906967 }
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
        if (dist < threshold) {
          newInRange[location.name] = true;
        } else {
          newInRange[location.name] = false;
        }
      }
      props.setInRange(newInRange);
    };

    const errorCallback = (error) => {
      console.log(error);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

  }, [locations, props.setInRange, threshold]);

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
  

  console.log(averages)

  async function updateAverages() {
    const { data: ratings, error } = await supabase
      .from('Ratings')
      .select('*');
  
    if (error) {
      console.error(error);
      return;
    }

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // Get the timestamp 2 hours ago
    const filteredRatings = ratings.filter((rating) => {
      const createdAtTimestamp = new Date(rating.created_at).getTime(); // Get the timestamp of the rating's creation time
      return createdAtTimestamp > twoHoursAgo.getTime(); // Check if the timestamp is after 2 hours ago
    });

    //console.log(filteredRatings)
  
    const averages = {};
  
    for (const rating of filteredRatings) {
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
    }
  
    return averages;
  }

  return (
    <div>
      {/* {!isMobile ? */}
        <div id="content">
          <div id="welcome">Welcome to wave</div>
          <div id="locations">Current locations</div>
          <ul>
            {locations.map((location) => (
              <li key={location.name}>
                <Link to={`/location/${location.name}?inRange=${encodeURIComponent(JSON.stringify(props.inRange))}`} onClick={() => handleLocationClick(location.name)}>
                  {location.name}
                </Link>
                {Object.keys(averages).length !== 0 && (
                  <span>{averages && averages[location.name] ? averages[location.name]['averageScore'] : ''}</span>
                )}
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
