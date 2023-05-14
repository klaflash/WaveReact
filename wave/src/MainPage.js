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

// const getFilteredLocations = (locations, selectedDistance, searchQuery) => {
//   const filteredLocations = selectedDistance >= 0 ? locations.filter((location) => location.dist * 0.621371 <= selectedDistance) : locations;
//   if (searchQuery.trim() !== '') {
//     const query = searchQuery.toLowerCase().trim();
//     return filteredLocations.filter(location => location.name.toLowerCase().includes(query) || location.addy.toLowerCase().includes(query));
//   }
//   return filteredLocations;
// }


function MainPage(props) {
  const [isMobile, setIsMobile] = useState(false);
  //const threshold = 0.09;
  const threshold = 100;
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

      //const sortedLocations = locations.sort((a, b) => a.dist - b.dist);
      console.log(averages)
      console.log(sortOrder)
      const sortedLocations = [...locations].sort((a, b) => {
        if (sortOrder === 'desc') {
          if (!averages[b.name]) {
            return -1;
          } else if (!averages[a.name]) {
            return 1;
          } else {
            return averages[b.name]['averageScore'] - averages[a.name]['averageScore'];
          }
        } else {
          return a.dist - b.dist;
        }
      });

      const locationsByDistance = selectedDistance >= 0 ? sortedLocations.filter((location) => location.dist * 0.621371 <= selectedDistance) : sortedLocations;
      setFilteredLocations(locationsByDistance);
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

  const [sortOrder, setSortOrder] = useState(localStorage.getItem('sortOrder') || 'loc');
  const [selectedDistance, setSelectedDistance] = useState(parseInt(localStorage.getItem('selectedDistance')) || 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([])

  useEffect(() => {
    const sortedLocations = [...locations].sort((a, b) => {
      console.log('averages LOWER')
      console.log(averages)
      if (sortOrder === 'desc') {
        if (!averages[b.name]) {
          return -1;
        } else if (!averages[a.name]) {
          return 1;
        } else {
          return averages[b.name]['averageScore'] - averages[a.name]['averageScore'];
        }
      } else {
        return a.dist - b.dist;
      }
    });

    console.log('Now sorted')
    console.log(sortedLocations)

    const locationsByDistance = selectedDistance >= 0 ? sortedLocations.filter((location) => location.dist * 0.621371 <= selectedDistance) : sortedLocations;
  
    setFilteredLocations(locationsByDistance);
  }, [sortOrder, selectedDistance]);
  
  

  // useEffect(() => {
  //   // This code will run once when the component mounts
  //   console.log("IS IT EVEN RUNNING")
  //   const locationsByDistance = [...locations].sort((a, b) => {
  //     if (sortOrder === 'desc') {
  //       return (averages && averages[b.name] && averages[b.name]['averageScore']) - (averages && averages[a.name] && averages[a.name]['averageScore']);
  //     } else {
  //       return (a.dist - b.dist);
  //     }
  //   });
  //   setFilteredLocations(locationsByDistance);    
  //   console.log(locationsByDistance)
  //   console.log("DONE RUNNING")
  // }, [locations, averages, sortOrder]);


  // const sortedLocations = useMemo(() => {
  //   return [...locations].sort((a, b) => {
  //     if (sortOrder === 'desc') {
  //       return (averages && averages[b.name] && averages[b.name]['averageScore']) - (averages && averages[a.name] && averages[a.name]['averageScore']);
  //     } else {
  //       return (a.dist - b.dist);
  //     }
  //   });
  // }, [locations, averages, sortOrder]);

  // useEffect(() => {
  //   const locationsByDistance = selectedDistance >= 0 ? sortedLocations.filter((location) => location.dist * 0.621371 <= selectedDistance) : sortedLocations;
  //   setFilteredLocations(locationsByDistance);
  // }, [sortedLocations, selectedDistance]);

  // useEffect(() => {
  //   const locationsByDistance = selectedDistance >= 0 ? sortedLocations.filter((location) => location.dist * 0.621371 <= selectedDistance) : sortedLocations;

  //   if (searchQuery.trim() !== '') {
  //     const query = searchQuery.toLowerCase().trim();
  //     const filtered = locationsByDistance.filter(location => location.name.toLowerCase().includes(query) || location.addy.toLowerCase().includes(query));
  //     setFilteredLocations(filtered);
  //   } else {
  //     setFilteredLocations(locationsByDistance);
  //   }
  // }, [sortedLocations, selectedDistance, searchQuery]);

  useEffect(() => {
    localStorage.setItem('sortOrder', sortOrder);
  }, [sortOrder]);

  // useEffect(() => {
  //   localStorage.setItem('selectedDistance', selectedDistance);
  // }, [selectedDistance]);

  const handleDistanceChange = (e) => {
    const newSelectedDistance = parseInt(e.target.value);
    setSelectedDistance(newSelectedDistance);
    localStorage.setItem('selectedDistance', newSelectedDistance);
  };

  // const handleSearchChange = (event) => {
  //   setSearchQuery(event.target.value);
  // };



  return (
    <div>
      {/* 
      <div>
        <label htmlFor="search-input">Search:</label>
        <input type="text" id="search-input" placeholder='Search' onChange={handleSearchChange} value={searchQuery} />
      </div>
      */}
      <div>
        <label htmlFor="distance-select">Show locations within:</label>
        <select id="distance-select" onChange={handleDistanceChange} value={selectedDistance}>
          <option value="10">10 mi</option>
          <option value="20">20 mi</option>
          <option value="50">50 mi</option>
          <option value="-1">All</option>
        </select>
      </div>
      
      <button className={sortOrder === 'desc' ? 'blue-button' : 'normal-button'} onClick={() => {setSortOrder(sortOrder === 'desc' ? 'desc' : 'desc'); localStorage.setItem('sortOrder', 'desc')}}>
        Top
      </button>
      <button className={sortOrder === 'loc' ? 'blue-button' : 'normal-button'} onClick={() => {setSortOrder(sortOrder === 'loc' ? 'loc' : 'loc'); localStorage.setItem('sortOrder', 'loc')}}>
        Near Me
      </button>
      {/* {!isMobile ? */}
        <div id="content">
          <div id="header">
            <div id='logo'>Wave</div>
          </div>
          <ul>
            {filteredLocations.map((location) => (
              <li key={location.name}>
                <Link className='button-link' to={`/location/${location.name}?inRange=${encodeURIComponent(JSON.stringify(props.inRange[location.name]))}`} onClick={() => handleLocationClick(location.name)} style={{backgroundColor: 
                  averages && averages[location.name] && averages[location.name]['averageScore'] >= 0 && averages[location.name]['averageScore'] <= 2 ? 'red' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 2 && averages[location.name]['averageScore'] <= 4 ? 'orange' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 4 && averages[location.name]['averageScore'] <= 6 ? 'yellow' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 6 && averages[location.name]['averageScore'] <= 8 ? 'green' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 8 && averages[location.name]['averageScore'] <= 10 ? 'blue' :
                  ''
                }}>
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
