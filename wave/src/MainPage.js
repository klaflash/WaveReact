import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js'
import logo from './waveLogo.png';
import { useNavigate } from 'react-router-dom';

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
    { name: 'Test2', latitude: 42.299103, longitude: -71.785020, addy: '123 Whatever Ave'},
    { name: 'Seattle', latitude: 47.607480, longitude: -122.336241, addy: '123 Whatever Ave'}
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
  }, []);

  useEffect(() => {

    const Ratings = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Ratings' },
      async (payload) => {
        console.log('Change received!', payload)
        const newAverages = await updateAverages();
        setAverages(newAverages[0]);
        setMostRecent(newAverages[1])
      }
    )
    .subscribe()


    // Cleanup subscription on component unmount
    return () => {
      Ratings.unsubscribe();
    };
    
    // const intervalId = setInterval(async () => {
    //   const newAverages = await updateAverages();
    //   setAverages(newAverages[0]);
    //   setMostRecent(newAverages[1])
    // }, 10000);
  
    // return () => {
    //   clearInterval(intervalId);
    // };
  }, []);

  console.log(averages)
  console.log(mostRecent)

  const runLocationUpdate = () => {
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
      setDeniedLocation(true);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

  }

  useEffect(() => {

    runLocationUpdate()

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

      // const timeDiff = (new Date() - new Date(rating.created_at)) / (1000 * 60);
      // if (!mostRecent[locationName] || Math.round(timeDiff) < mostRecent[locationName]) {
      //   mostRecent[locationName] = Math.round(timeDiff)
      // }

      // const formattedTimeDiff = getTimeSince(rating.created_at);
      // console.log(formattedTimeDiff)

      const createdAtTimestamp = new Date(rating.created_at).getTime();
      const currentTimestamp = Date.now();
      const timeDiff = (currentTimestamp - createdAtTimestamp) / 1000;

      if (!mostRecent[locationName] || timeDiff < mostRecent[locationName]) {
        mostRecent[locationName] = timeDiff;
      }

      // if (!mostRecent[locationName] || formattedTimeDiff < mostRecent[locationName]) {
      //   mostRecent[locationName] = formattedTimeDiff;
      // }
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

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const filtered = sortedLocations.filter(location => location.name.toLowerCase().includes(query) || location.addy.toLowerCase().includes(query));
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locationsByDistance);
    }
  
    //setFilteredLocations(locationsByDistance);
  }, [sortOrder, selectedDistance, searchQuery]);
  
  

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

    // if (searchQuery.trim() !== '') {
    //   const query = searchQuery.toLowerCase().trim();
    //   const filtered = locationsByDistance.filter(location => location.name.toLowerCase().includes(query) || location.addy.toLowerCase().includes(query));
    //   setFilteredLocations(filtered);
    // } else {
    //   setFilteredLocations(locationsByDistance);
    // }
  // }, [sortedLocations, selectedDistance, searchQuery]);

  useEffect(() => {
    localStorage.setItem('sortOrder', sortOrder);
  }, [sortOrder]);

  const handleDistanceChange = (e) => {
    const newSelectedDistance = parseInt(e.target.value);
    setSelectedDistance(newSelectedDistance);
    localStorage.setItem('selectedDistance', newSelectedDistance);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const [muted, setMuted] = useState(localStorage.getItem('muted') === 'true');

  useEffect(() => {
    localStorage.setItem('muted', muted);
  }, [muted]);

  const handleClick = () => {
    setMuted(prevMuted => !prevMuted);
  };

  const [deniedLocation, setDeniedLocation] = useState(false)
  
  const handleNoti = () => {
    setTimeout(() => {
      setDeniedLocation(false);
    }, 5000);
  };


  const navigate = useNavigate();

  const goHome = () => {
    navigate('/', { replace: true });
    window.location.reload(); // Refresh the page
  };

  function getTimeSince(seconds) {
    //const seconds = Math.floor((Date.now() - timestamp) / 1000);
    // const createdAt = new Date(timestamp);
    // const seconds = Math.floor((Date.now() - createdAt) / 1000);

    const rounded = Math.ceil(seconds)
    
    if (rounded < 60) {
      return `${rounded}s`;
    } else if (rounded < 3600) {
      const minutes = Math.floor(rounded / 60);
      return `${minutes}m`;
    } else if (rounded < 86400) {
      const hours = Math.floor(rounded / 3600);
      return `${hours}h`;
    } else if (rounded < 604800) {
      const days = Math.floor(rounded / 86400);
      return `${days}d`;
    } else {
      const weeks = Math.floor(rounded / 604800);
      return `${weeks}w`;
    }
  }

  return (
    <div id='main-page'>

        {deniedLocation && (
          <div className='noti-container-location'>
            <img className='wave-logo' src={logo} alt="Logo" />
            <div className='noti-inner-container'>
              <div className='noti-line-one'>
                <div className='noti-user'>Wave Team</div>
                <div className='noti-timestamp'>Now</div>
              </div>
              <div id='allow-location-container'>
                <button onClick={goHome} id='allow-location'>Allow your location</button>
                <span>to use all of wave's features</span>
              </div>
            </div>
          </div>
        )}
      
      {/* {!isMobile ? */}
        <div id="content">
        <div className='color-bar'></div>
          <div id="header">
            <div id='logo'>
              <svg xmlns="http://www.w3.org/2000/svg" width="95" height="39" viewBox="0 0 95 39" fill="none">
                <path d="M0.198 7.857V7.357H-0.497513L-0.275952 8.01628L0.198 7.857ZM6.072 7.857L6.55298 7.72042L6.44979 7.357H6.072V7.857ZM11.0385 25.347V25.847H11.7002L11.5195 25.2104L11.0385 25.347ZM9.8175 25.347L9.33594 25.2124L9.15864 25.847H9.8175V25.347ZM14.52 8.517V8.017H14.1406L14.0384 8.38245L14.52 8.517ZM18.084 8.517L18.5609 8.36666L18.4506 8.017H18.084V8.517ZM23.265 24.951V25.451H23.9469L23.7419 24.8007L23.265 24.951ZM22.1925 24.951L21.7103 24.8188L21.537 25.451H22.1925V24.951ZM26.8785 7.857V7.357H26.4971L26.3963 7.72481L26.8785 7.857ZM32.868 7.857L33.3423 8.01533L33.562 7.357H32.868V7.857ZM25.476 30V30.5H25.8362L25.9503 30.1583L25.476 30ZM19.9155 30L19.4392 30.1522L19.5504 30.5H19.9155V30ZM16.3515 18.846V18.346H15.6668L15.8752 18.9982L16.3515 18.846ZM16.5825 18.846L17.0608 18.9917L17.2576 18.346H16.5825V18.846ZM13.1835 30V30.5H13.5538L13.6618 30.1457L13.1835 30ZM7.6395 30L7.16555 30.1593L7.28005 30.5H7.6395V30ZM0.198 8.357H6.072V7.357H0.198V8.357ZM5.59102 7.99358L10.5575 25.4836L11.5195 25.2104L6.55298 7.72042L5.59102 7.99358ZM11.0385 24.847H9.8175V25.847H11.0385V24.847ZM10.2991 25.4816L15.0016 8.65155L14.0384 8.38245L9.33594 25.2124L10.2991 25.4816ZM14.52 9.017H18.084V8.017H14.52V9.017ZM17.6071 8.66734L22.7881 25.1013L23.7419 24.8007L18.5609 8.36666L17.6071 8.66734ZM23.265 24.451H22.1925V25.451H23.265V24.451ZM22.6747 25.0832L27.3607 7.98919L26.3963 7.72481L21.7103 24.8188L22.6747 25.0832ZM26.8785 8.357H32.868V7.357H26.8785V8.357ZM32.3937 7.69867L25.0017 29.8417L25.9503 30.1583L33.3423 8.01533L32.3937 7.69867ZM25.476 29.5H19.9155V30.5H25.476V29.5ZM20.3918 29.8478L16.8278 18.6938L15.8752 18.9982L19.4392 30.1522L20.3918 29.8478ZM16.3515 19.346H16.5825V18.346H16.3515V19.346ZM16.1042 18.7002L12.7052 29.8543L13.6618 30.1457L17.0608 18.9917L16.1042 18.7002ZM13.1835 29.5H7.6395V30.5H13.1835V29.5ZM8.11345 29.8407L0.671952 7.69772L-0.275952 8.01628L7.16555 30.1593L8.11345 29.8407ZM32.0471 30L31.5733 29.8404L31.3511 30.5H32.0471V30ZM39.5051 7.857V7.357H39.1459L39.0313 7.6974L39.5051 7.857ZM46.2206 7.857L46.6971 7.7054L46.5862 7.357H46.2206V7.857ZM53.2661 30V30.5H53.9499L53.7426 29.8484L53.2661 30ZM47.7056 30L47.228 30.1478L47.3369 30.5H47.7056V30ZM46.5011 26.106L46.9788 25.9582L46.8698 25.606H46.5011V26.106ZM38.8616 26.106V25.606H38.4929L38.384 25.9582L38.8616 26.106ZM37.6571 30V30.5H38.0258L38.1348 30.1478L37.6571 30ZM40.1981 22.1955L39.7219 22.0432L39.5133 22.6955H40.1981V22.1955ZM45.2966 22.1955V22.6955H45.9748L45.7743 22.0476L45.2966 22.1955ZM42.7886 14.094L43.2663 13.9461L42.7963 12.4282L42.3124 13.9417L42.7886 14.094ZM32.521 30.1596L39.979 8.0166L39.0313 7.6974L31.5733 29.8404L32.521 30.1596ZM39.5051 8.357H46.2206V7.357H39.5051V8.357ZM45.7442 8.0086L52.7897 30.1516L53.7426 29.8484L46.6971 7.7054L45.7442 8.0086ZM53.2661 29.5H47.7056V30.5H53.2661V29.5ZM48.1833 29.8522L46.9788 25.9582L46.0235 26.2538L47.228 30.1478L48.1833 29.8522ZM46.5011 25.606H38.8616V26.606H46.5011V25.606ZM38.384 25.9582L37.1795 29.8522L38.1348 30.1478L39.3393 26.2538L38.384 25.9582ZM37.6571 29.5H32.0471V30.5H37.6571V29.5ZM40.1981 22.6955H45.2966V21.6955H40.1981V22.6955ZM45.7743 22.0476L43.2663 13.9461L42.311 14.2419L44.819 22.3434L45.7743 22.0476ZM42.3124 13.9417L39.7219 22.0432L40.6744 22.3478L43.2649 14.2463L42.3124 13.9417ZM63.0532 24.1425L62.5735 24.0015L62.3852 24.6425H63.0532V24.1425ZM67.8382 7.857V7.357H67.464L67.3585 7.71605L67.8382 7.857ZM73.3492 7.857L73.8239 8.01405L74.0413 7.357H73.3492V7.857ZM66.0232 30V30.5H66.3844L66.4979 30.1571L66.0232 30ZM60.4462 30L59.9707 30.1545L60.0829 30.5H60.4462V30ZM53.2522 7.857V7.357H52.564L52.7767 8.01149L53.2522 7.857ZM58.8292 7.857L59.3097 7.71874L59.2056 7.357H58.8292V7.857ZM63.5152 24.1425V24.6425H64.1794L63.9957 24.0042L63.5152 24.1425ZM63.5329 24.2835L68.3179 7.99795L67.3585 7.71605L62.5735 24.0015L63.5329 24.2835ZM67.8382 8.357H73.3492V7.357H67.8382V8.357ZM72.8745 7.69995L65.5485 29.8429L66.4979 30.1571L73.8239 8.01405L72.8745 7.69995ZM66.0232 29.5H60.4462V30.5H66.0232V29.5ZM60.9217 29.8455L53.7277 7.7025L52.7767 8.01149L59.9707 30.1545L60.9217 29.8455ZM53.2522 8.357H58.8292V7.357H53.2522V8.357ZM58.3487 7.99526L63.0347 24.2808L63.9957 24.0042L59.3097 7.71874L58.3487 7.99526ZM63.5152 23.6425H63.0532V24.6425H63.5152V23.6425ZM76.6832 30H76.1832V30.5H76.6832V30ZM76.6832 7.857V7.357H76.1832V7.857H76.6832ZM91.4837 7.857H91.9837V7.357H91.4837V7.857ZM91.4837 12.4275V12.9275H91.9837V12.4275H91.4837ZM81.9632 12.4275V11.9275H81.4632V12.4275H81.9632ZM81.9632 16.6845H81.4632V17.1845H81.9632V16.6845ZM90.8897 16.6845H91.3897V16.1845H90.8897V16.6845ZM90.8897 21.2715V21.7715H91.3897V21.2715H90.8897ZM81.9632 21.2715V20.7715H81.4632V21.2715H81.9632ZM81.9632 25.38H81.4632V25.88H81.9632V25.38ZM91.4837 25.38H91.9837V24.88H91.4837V25.38ZM91.4837 30V30.5H91.9837V30H91.4837ZM77.1832 30V7.857H76.1832V30H77.1832ZM76.6832 8.357H91.4837V7.357H76.6832V8.357ZM90.9837 7.857V12.4275H91.9837V7.857H90.9837ZM91.4837 11.9275H81.9632V12.9275H91.4837V11.9275ZM81.4632 12.4275V16.6845H82.4632V12.4275H81.4632ZM81.9632 17.1845H90.8897V16.1845H81.9632V17.1845ZM90.3897 16.6845V21.2715H91.3897V16.6845H90.3897ZM90.8897 20.7715H81.9632V21.7715H90.8897V20.7715ZM81.4632 21.2715V25.38H82.4632V21.2715H81.4632ZM81.9632 25.88H91.4837V24.88H81.9632V25.88ZM90.9837 25.38V30H91.9837V25.38H90.9837ZM91.4837 29.5H76.6832V30.5H91.4837V29.5Z" fill="#2C2C2C"/>
                <path d="M61 14.0001C58.2 16.4001 56.8333 18.0001 56.5 18.5001L60 30.5H66.5L72.5 12.5001C69.7 10.5001 67.3333 10.6668 66.5 11.0001L63.5 23L61 14.0001Z" fill="url(#paint0_linear_275_7)"/>
                <path d="M37.5 12.5L38 13C38.7487 14.0482 40.4931 16.1997 42 17.206L40.5 22H45L44.5 19.5C46.0185 21.4741 49.3357 24.7487 51.4261 23.5L53.5 30H47.5L46.5 26.5H39L38 30H31.5L37.5 12.5Z" fill="url(#paint1_linear_275_7)"/>
                <path d="M24.5 13.299C26.1667 11.799 30 9.09904 32 10.299L25.5 30.2991H19L16.0191 20.3628C16.0016 20.3788 15.984 20.3949 15.9664 20.411L13 30.2991H7L5 24.2991C8.55012 25.8205 12.6897 23.4035 15.9664 20.411L16 20.2991L16.0191 20.3628C17.8882 18.6474 19.4725 16.7497 20.5 15.2991L22 21.7991L24.5 13.299Z" fill="url(#paint2_linear_275_7)"/>
                <path d="M82.5 22.5C79.7 21.3 77.3333 18 76.5 16.5V30H92V26C90.4 26.4 88 25.5 87 25H82.5V22.5Z" fill="url(#paint3_linear_275_7)"/>
                <defs>
                <linearGradient id="paint0_linear_275_7" x1="58.5" y1="27" x2="70" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#59AFFF"/>
                <stop offset="1" stopColor="#267CFE"/>
                </linearGradient>
                <linearGradient id="paint1_linear_275_7" x1="34.5" y1="21" x2="52.5" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#267CFE"/>
                <stop offset="1" stopColor="#59AFFF"/>
                </linearGradient>
                <linearGradient id="paint2_linear_275_7" x1="30.5" y1="18" x2="5" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#267CFE"/>
                <stop offset="1" stopColor="#59AFFF"/>
                </linearGradient>
                <linearGradient id="paint3_linear_275_7" x1="76" y1="24.5" x2="92" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#267CFE"/>
                <stop offset="1" stopColor="#59AFFF"/>
                </linearGradient>
                </defs>
              </svg>
            </div>

            <button id='mute-button' onClick={handleClick}>
              {muted ? (
                <div className='bell-container'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBCBCB" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-bell-off"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </div>
              ) : (
                <div className='bell-container'>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBCBCB" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-bell"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
              )}
            </button>


            <a id='ig-button' href="https://www.instagram.com/wavepurdue" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-instagram" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1" stroke="#CBCBCB" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"/>
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                <path d="M16.5 7.5l0 .01"/>
              </svg>
            </a>

          </div>

          <div id='explore'>Explore Locations</div>

          <div id='search-bar'>
            <input
              type="text"
              id="search-input"
              placeholder="Search"
              onChange={handleSearchChange}
              value={searchQuery}
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none"><path d="M7 14C10.3137 14 13 11.0899 13 7.5C13 3.91015 10.3137 1 7 1C3.68629 1 1 3.91015 1 7.5C1 11.0899 3.68629 14 7 14Z" stroke="%23666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 16L12 13" stroke="%23666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "20px center",
                backgroundSize: "auto 50%",
              }}
            />
          </div>

          <div id='filter-options'>
            <div>
              <select id="distance-select" onChange={handleDistanceChange} value={selectedDistance} style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="%23CBCBCB" stroke-linecap="round" stroke-linejoin="round"/></svg>')`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "auto 25%",
              }} >
                <option value="10">10 mi</option>
                <option value="20">25 mi</option>
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
          </div>

          <div id='locations-subtitle'>locations</div>

          <ul>
            {filteredLocations.length === 0 ? (
              <div id='no-results'>No matching results</div>
            ) : filteredLocations.map((location) => (
              <li key={location.name}>
                <Link className='button-link' to={`/location/${location.name}?inRange=${encodeURIComponent(JSON.stringify(props.inRange[location.name]))}`} onClick={() => handleLocationClick(location.name)} style={{backgroundColor: 
                  averages && averages[location.name] && averages[location.name]['averageScore'] >= 0 && averages[location.name]['averageScore'] <= 2 ? '#A1D1FE' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 2 && averages[location.name]['averageScore'] <= 4 ? '#59AFFF' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 4 && averages[location.name]['averageScore'] <= 6 ? '#59AFFF' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 6 && averages[location.name]['averageScore'] <= 8 ? '#267CFE' :
                  averages && averages[location.name] && averages[location.name]['averageScore'] > 8 && averages[location.name]['averageScore'] <= 10 ? '#267CFE' :
                  ''
                }}>
                  <div className='card-container'>
                    <div className='card-left'>
                      <div className='bar-name'>{location.name}</div>
                      <div className='bar-addy'>{location.addy}</div>
                    </div>
                    <div className='card-right-stack'>
                      <div id='card-right-substack'>
                        {Object.keys(averages).length !== 0 && (
                          <div className='card-right'>{averages && averages[location.name] ? averages[location.name]['averageScore'] : ''}</div>
                        )}
                        {Object.keys(mostRecent).length !== 0 && mostRecent[location.name] && (
                          <div className='timestamp'>{getTimeSince(mostRecent[location.name])}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </Link>
                
              </li>
            ))}
          </ul>
        </div>
        {/* <div id="not-mobile">Sorry, wave is currently only supported on mobile devices</div> */}
      {/* } */}
      <div id='footer'>
        <div className='report-line'>
          <div>Report threatening comments to @wavepurdue</div>
          <a id='ig-logo' href="https://www.instagram.com/wavepurdue" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-instagram" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="#4d4d4d" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"/>
              <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
              <path d="M16.5 7.5l0 .01"/>
            </svg>
          </a>
        </div>
        
        <div id='copyright'>Copyright © 2023 Wave411 Inc</div>
        <div className='color-bar'></div>
      </div>
      
    </div>
  );
}

export default MainPage;
