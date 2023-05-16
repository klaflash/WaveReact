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



  return (
    <div id='main-page'>
      
      {/* {!isMobile ? */}
        <div id="content">
        <div className='color-bar'></div>
          <div id="header">
            <div id='logo'><svg xmlns="http://www.w3.org/2000/svg" width="95" height="39" viewBox="0 0 95 39" fill="none">
              <path d="M0.198 7.857H6.072L11.0385 25.347H9.8175L14.52 8.517H18.084L23.265 24.951H22.1925L26.8785 7.857H32.868L25.476 30H19.9155L16.3515 18.846H16.5825L13.1835 30H7.6395L0.198 7.857ZM32.0471 30L39.5051 7.857H46.2206L53.2661 30H47.7056L46.5011 26.106H38.8616L37.6571 30H32.0471ZM40.1981 22.1955H45.2966L42.7886 14.094L40.1981 22.1955ZM63.0532 24.1425L67.8382 7.857H73.3492L66.0232 30H60.4462L53.2522 7.857H58.8292L63.5152 24.1425H63.0532ZM76.6832 30V7.857H91.4837V12.4275H81.9632V16.6845H90.8897V21.2715H81.9632V25.38H91.4837V30H76.6832Z" fill="#181818"/>
              <path d="M0.198 7.857V6.857H-1.19303L-0.749903 8.17556L0.198 7.857ZM6.072 7.857L7.03397 7.58384L6.82757 6.857H6.072V7.857ZM11.0385 25.347V26.347H12.362L12.0005 25.0738L11.0385 25.347ZM9.8175 25.347L8.85439 25.0779L8.49979 26.347H9.8175V25.347ZM14.52 8.517V7.517H13.7611L13.5569 8.24789L14.52 8.517ZM18.084 8.517L19.0377 8.21633L18.8173 7.517H18.084V8.517ZM23.265 24.951V25.951H24.6288L24.2187 24.6503L23.265 24.951ZM22.1925 24.951L21.2281 24.6866L20.8815 25.951H22.1925V24.951ZM26.8785 7.857V6.857H26.1157L25.9141 7.59262L26.8785 7.857ZM32.868 7.857L33.8165 8.17365L34.2561 6.857H32.868V7.857ZM25.476 30V31H26.1964L26.4245 30.3167L25.476 30ZM19.9155 30L18.9629 30.3044L19.1852 31H19.9155V30ZM16.3515 18.846V17.846H14.9822L15.3989 19.1504L16.3515 18.846ZM16.5825 18.846L17.5391 19.1375L17.9326 17.846H16.5825V18.846ZM13.1835 30V31H13.9242L14.1401 30.2915L13.1835 30ZM7.6395 30L6.6916 30.3186L6.92061 31H7.6395V30ZM0.198 8.857H6.072V6.857H0.198V8.857ZM5.11003 8.13016L10.0765 25.6202L12.0005 25.0738L7.03397 7.58384L5.11003 8.13016ZM11.0385 24.347H9.8175V26.347H11.0385V24.347ZM10.7806 25.6161L15.4831 8.7861L13.5569 8.24789L8.85439 25.0779L10.7806 25.6161ZM14.52 9.517H18.084V7.517H14.52V9.517ZM17.1303 8.81767L22.3113 25.2517L24.2187 24.6503L19.0377 8.21633L17.1303 8.81767ZM23.265 23.951H22.1925V25.951H23.265V23.951ZM23.1569 25.2154L27.8429 8.12138L25.9141 7.59262L21.2281 24.6866L23.1569 25.2154ZM26.8785 8.857H32.868V6.857H26.8785V8.857ZM31.9195 7.54035L24.5275 29.6833L26.4245 30.3167L33.8165 8.17365L31.9195 7.54035ZM25.476 29H19.9155V31H25.476V29ZM20.8681 29.6956L17.3041 18.5416L15.3989 19.1504L18.9629 30.3044L20.8681 29.6956ZM16.3515 19.846H16.5825V17.846H16.3515V19.846ZM15.6259 18.5545L12.2269 29.7085L14.1401 30.2915L17.5391 19.1375L15.6259 18.5545ZM13.1835 29H7.6395V31H13.1835V29ZM8.5874 29.6814L1.1459 7.53844L-0.749903 8.17556L6.6916 30.3186L8.5874 29.6814ZM32.0471 30L31.0994 29.6808L30.6551 31H32.0471V30ZM39.5051 7.857V6.857H38.7867L38.5574 7.53781L39.5051 7.857ZM46.2206 7.857L47.1736 7.5538L46.9518 6.857H46.2206V7.857ZM53.2661 30V31H54.6337L54.2191 29.6968L53.2661 30ZM47.7056 30L46.7503 30.2955L46.9682 31H47.7056V30ZM46.5011 26.106L47.4565 25.8105L47.2386 25.106H46.5011V26.106ZM38.8616 26.106V25.106H38.1242L37.9063 25.8105L38.8616 26.106ZM37.6571 30V31H38.3946L38.6125 30.2955L37.6571 30ZM40.1981 22.1955L39.2456 21.8909L38.8285 23.1955H40.1981V22.1955ZM45.2966 22.1955V23.1955H46.653L46.2519 21.8998L45.2966 22.1955ZM42.7886 14.094L43.7439 13.7983L42.8041 10.7624L41.8361 13.7894L42.7886 14.094ZM32.9948 30.3192L40.4528 8.17619L38.5574 7.53781L31.0994 29.6808L32.9948 30.3192ZM39.5051 8.857H46.2206V6.857H39.5051V8.857ZM45.2677 8.1602L52.3132 30.3032L54.2191 29.6968L47.1736 7.5538L45.2677 8.1602ZM53.2661 29H47.7056V31H53.2661V29ZM48.661 29.7045L47.4565 25.8105L45.5458 26.4015L46.7503 30.2955L48.661 29.7045ZM46.5011 25.106H38.8616V27.106H46.5011V25.106ZM37.9063 25.8105L36.7018 29.7045L38.6125 30.2955L39.817 26.4015L37.9063 25.8105ZM37.6571 29H32.0471V31H37.6571V29ZM40.1981 23.1955H45.2966V21.1955H40.1981V23.1955ZM46.2519 21.8998L43.7439 13.7983L41.8334 14.3897L44.3414 22.4912L46.2519 21.8998ZM41.8361 13.7894L39.2456 21.8909L41.1506 22.5001L43.7411 14.3986L41.8361 13.7894ZM63.0532 24.1425L62.0938 23.8606L61.7171 25.1425H63.0532V24.1425ZM67.8382 7.857V6.857H67.0898L66.8788 7.5751L67.8382 7.857ZM73.3492 7.857L74.2986 8.1711L74.7334 6.857H73.3492V7.857ZM66.0232 30V31H66.7457L66.9726 30.3141L66.0232 30ZM60.4462 30L59.4951 30.309L59.7196 31H60.4462V30ZM53.2522 7.857V6.857H51.8759L52.3011 8.16599L53.2522 7.857ZM58.8292 7.857L59.7902 7.58048L59.582 6.857H58.8292V7.857ZM63.5152 24.1425V25.1425H64.8435L64.4762 23.866L63.5152 24.1425ZM64.0126 24.4244L68.7976 8.1389L66.8788 7.5751L62.0938 23.8606L64.0126 24.4244ZM67.8382 8.857H73.3492V6.857H67.8382V8.857ZM72.3998 7.5429L65.0738 29.6859L66.9726 30.3141L74.2986 8.1711L72.3998 7.5429ZM66.0232 29H60.4462V31H66.0232V29ZM61.3973 29.691L54.2033 7.54801L52.3011 8.16599L59.4951 30.309L61.3973 29.691ZM53.2522 8.857H58.8292V6.857H53.2522V8.857ZM57.8682 8.13352L62.5542 24.419L64.4762 23.866L59.7902 7.58048L57.8682 8.13352ZM63.5152 23.1425H63.0532V25.1425H63.5152V23.1425ZM76.6832 30H75.6832V31H76.6832V30ZM76.6832 7.857V6.857H75.6832V7.857H76.6832ZM91.4837 7.857H92.4837V6.857H91.4837V7.857ZM91.4837 12.4275V13.4275H92.4837V12.4275H91.4837ZM81.9632 12.4275V11.4275H80.9632V12.4275H81.9632ZM81.9632 16.6845H80.9632V17.6845H81.9632V16.6845ZM90.8897 16.6845H91.8897V15.6845H90.8897V16.6845ZM90.8897 21.2715V22.2715H91.8897V21.2715H90.8897ZM81.9632 21.2715V20.2715H80.9632V21.2715H81.9632ZM81.9632 25.38H80.9632V26.38H81.9632V25.38ZM91.4837 25.38H92.4837V24.38H91.4837V25.38ZM91.4837 30V31H92.4837V30H91.4837ZM77.6832 30V7.857H75.6832V30H77.6832ZM76.6832 8.857H91.4837V6.857H76.6832V8.857ZM90.4837 7.857V12.4275H92.4837V7.857H90.4837ZM91.4837 11.4275H81.9632V13.4275H91.4837V11.4275ZM80.9632 12.4275V16.6845H82.9632V12.4275H80.9632ZM81.9632 17.6845H90.8897V15.6845H81.9632V17.6845ZM89.8897 16.6845V21.2715H91.8897V16.6845H89.8897ZM90.8897 20.2715H81.9632V22.2715H90.8897V20.2715ZM80.9632 21.2715V25.38H82.9632V21.2715H80.9632ZM81.9632 26.38H91.4837V24.38H81.9632V26.38ZM90.4837 25.38V30H92.4837V25.38H90.4837ZM91.4837 29H76.6832V31H91.4837V29Z" fill="#4E6376"/>
              <path d="M65.3119 10.131C62.4767 10.5603 59.9087 15.4366 58.9792 17.8211C60.4123 16.2116 64.7657 13.529 68.3911 15.6751C69.3013 15.9731 71.7375 17.3562 74.2009 20.5037C76.6642 23.6513 78.9068 25.2727 79.7202 25.69C80.8241 26.7035 83.6128 28.7661 85.9367 28.9091C88.8416 29.088 90.5265 29.4457 95 24.9747C90.9099 25.8331 85.3945 22.9478 83.148 21.3979C81.3857 19.9672 77.4776 16.605 75.9438 14.602C74.41 12.599 72.1287 11.2637 71.1798 10.8464C70.4051 10.4291 68.1471 9.70183 65.3119 10.131Z" fill="#267CFE"/>
              <path d="M45.5202 28.869C42.685 28.4397 40.1171 23.5634 39.1875 21.1789C40.6206 22.7884 44.9741 25.471 48.5994 23.3249C49.5096 23.0269 51.9458 21.6438 54.4092 18.4963C56.8726 15.3487 59.1152 13.7273 59.9285 13.31C61.0324 12.2965 63.8211 10.2339 66.145 10.0909C69.0499 9.91203 70.7348 9.55435 75.2083 14.0253C71.1182 13.1669 65.6028 16.0522 63.3563 17.6021C61.594 19.0328 57.6859 22.395 56.1522 24.398C54.6184 26.401 52.337 27.7363 51.3881 28.1536C50.6135 28.5709 48.3554 29.2982 45.5202 28.869Z" fill="url(#paint0_linear_271_211)"/>
              <path d="M26.1244 10.131C23.2892 10.5603 20.7212 15.4366 19.7917 17.8211C21.2247 16.2116 25.5782 13.529 29.2036 15.6751C30.1138 15.9731 32.55 17.3562 35.0134 20.5037C37.4767 23.6513 39.7193 25.2727 40.5327 25.69C41.6366 26.7035 44.4253 28.7661 46.7492 28.9091C49.6541 29.088 51.3389 29.4457 55.8125 24.9747C51.7224 25.8331 46.2069 22.9478 43.9605 21.3979C42.1982 19.9672 38.2901 16.605 36.7563 14.602C35.2225 12.599 32.9412 11.2637 31.9923 10.8464C31.2176 10.4291 28.9595 9.70183 26.1244 10.131Z" fill="url(#paint1_linear_271_211)"/>
              <path d="M6.3327 28.869C3.49751 28.4397 0.92957 23.5634 0 21.1789C1.43309 22.7884 5.78657 25.471 9.4119 23.3249C10.3221 23.0269 12.7583 21.6438 15.2217 18.4963C17.6851 15.3487 19.9277 13.7273 20.741 13.31C21.8449 12.2965 24.6336 10.2339 26.9575 10.0909C29.8624 9.91203 31.5473 9.55435 36.0208 14.0253C31.9307 13.1669 26.4153 16.0522 24.1688 17.6021C22.4065 19.0328 18.4984 22.395 16.9647 24.398C15.4309 26.401 13.1495 27.7363 12.2006 28.1536C11.426 28.5709 9.16788 29.2982 6.3327 28.869Z" fill="#267CFE"/>
              <defs>
              <linearGradient id="paint0_linear_271_211" x1="57.1979" y1="29" x2="57.1979" y2="10" gradientUnits="userSpaceOnUse">
              <stop stop-color="#267CFE"/>
              <stop offset="1" stop-color="#59AFFF"/>
              </linearGradient>
              <linearGradient id="paint1_linear_271_211" x1="37.8021" y1="10" x2="37.8021" y2="29" gradientUnits="userSpaceOnUse">
              <stop stop-color="#59AFFF"/>
              <stop offset="1" stop-color="#267CFE"/>
              </linearGradient>
              </defs>
              </svg>
            </div>
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
                  <div className='card-left'>
                    <div className='bar-name'>{location.name}</div>
                    <div className='bar-addy'>{location.addy}</div>
                  </div>
                  <div className='card-right-stack'>
                    <div id='card-right-substack'>
                      {Object.keys(averages).length !== 0 && (
                        <div className='card-right'>{averages && averages[location.name] ? averages[location.name]['averageScore'] : ''}</div>
                      )}
                      {Object.keys(mostRecent).length !== 0 && mostRecent[location.name] >= 0 && (
                        <div className='timestamp'>{mostRecent[location.name]} min ago</div>
                      )}
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
        <div id='copyright'>Copyright © 2023 Wave411 Inc</div>
        <div className='color-bar'></div>
      </div>
      
    </div>
  );
}

export default MainPage;
