// EventsPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://cgynrutxxwafteiunwho.supabase.co" 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneW5ydXR4eHdhZnRlaXVud2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwMDg5MTgsImV4cCI6MTk5NjU4NDkxOH0.kIwLWQB-Z9QFVn7SZgJM5fAfEmWN7dKNkJKYj62kFjw"

const supabase = createClient(supabaseUrl, supabaseKey)

const EventsPage = (props) => {
  const locations = useMemo(() => props.locations, []);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const serializedProp = searchParams.get('propObject'); // Extract the serialized object from the query parameter

  // Parse the JSON string back into an object
  const averages = JSON.parse(decodeURIComponent(serializedProp));

  useEffect(() => {
    console.log(locations)
  }, []);

  const [selectedDate, setSelectedDate] = useState(null);
  const [shortDate, setShortDate] = useState(null)
  const currentDate = new Date();
  const daysToShow = 10;

  useEffect(() => {
    setSelectedDate(currentDate); // Set the default selected date to the current date
    const temp = formatDate(currentDate);
    setShortDate(temp)
  }, []);

  const handleDateSelection = (date) => {
    setSelectedDate(date);
    const temp = formatDate(date);
    setShortDate(temp)
  };

  const renderCalendar = () => {
    const calendar = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);

      const dayOfMonth = date.getDate();
      const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

      const isSelectedDate = selectedDate && selectedDate.toDateString() === date.toDateString();

      const isCurrentDate = date.toDateString() === currentDate.toDateString();

      const buttonStyles = {
        backgroundColor: isSelectedDate ? '#F0F0F0' : 'transparent'
      };

      const dayOfWeekStyles = {
        color: isSelectedDate ? '#151515' : '#858585', // Change font color to blue for selected date's day of the week
      };

      const dayOfMonthStyles = {
        color: isSelectedDate ? '#090909' : '#CBCBCB', // Change font color to blue for selected date's day of the week
      };

      calendar.push(
        <button className='day' key={i} onClick={() => handleDateSelection(date)} style={buttonStyles}>
          <div className='day-of-month' style={dayOfMonthStyles}>{dayOfMonth}</div>
          <div className='week-day' style={dayOfWeekStyles}>{dayOfWeek}</div>
        </button>
      );
    }
    return calendar;
  };

  const handleLocationClick = useCallback((locationName) => {
    props.setCurrentLocation(locationName);
  }, [props]);

  let hasMatchingResults = false;

  useEffect(() => {
    fetchGoingCountData();

    const Events = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Events'},
      async (payload) => {
        console.log('Change received!', payload)
        fetchGoingCountData()
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
      
      const filtered = sortedLocations.filter(location => {
        const lowerQuery = query.toLowerCase(); // Convert query to lowercase
      
        const eventNameMatches = location.eventName && location.eventName.some(item => item.toLowerCase().includes(lowerQuery));
        const priceMatches = location.price && location.price.some(item => item.toLowerCase().includes(lowerQuery));
      
        const startMatches = location.start && location.start.some(item => {
          const date = new Date(item);
          const formattedDate = `${date.toLocaleDateString('en-US')} ${date.toLocaleTimeString('en-US')}`;
          return formattedDate.toLowerCase().includes(lowerQuery);
        });
      
        const endMatches = location.end && location.end.some(item => {
          const date = new Date(item);
          const formattedDate = `${date.toLocaleDateString('en-US')} ${date.toLocaleTimeString('en-US')}`;
          return formattedDate.toLowerCase().includes(lowerQuery);
        });
      
        return (
          location.name.toLowerCase().includes(lowerQuery) ||
          (location.addy && location.addy.toLowerCase().includes(lowerQuery)) ||
          eventNameMatches ||
          priceMatches ||
          startMatches ||
          endMatches
        );
      });
      
      
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locationsByDistance);
    }

  }, [sortOrder, selectedDistance, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    localStorage.setItem('sortOrder', sortOrder);
  }, [sortOrder]);

  const handleDistanceChange = (e) => {
    const newSelectedDistance = parseInt(e.target.value);
    setSelectedDistance(newSelectedDistance);
    localStorage.setItem('selectedDistance', newSelectedDistance);
  };

  function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  return (
    <div>
      <div className='events-title'>Events</div>

      <div id='search-bar'>
        <input
          type="text"
          id="search-input"
          placeholder={`Search ${shortDate} Events`}
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
      <div className="calendar">{renderCalendar()}</div>
      <ul className='event-grid'>
            {filteredLocations
              .filter((location) => location.event === true)
              .flatMap((location) => {
                const starts = Array.isArray(location.start) ? location.start : [location.start];
                const ends = Array.isArray(location.end) ? location.end : [location.end];
                const eventNames = Array.isArray(location.eventName) ? location.eventName : [location.eventName];
                const prices = Array.isArray(location.price) ? location.price : [location.price];
                const buyLinks = Array.isArray(location.buyLink) ? location.buyLink : [location.buyLink];
                const iterations = Math.max(starts.length, ends.length, eventNames.length, prices.length, buyLinks.length);
                
                return Array.from({ length: iterations }, (_, index) => ({
                  name: location.name,
                  start: starts[index] || '',
                  end: ends[index] || '',
                  eventName: eventNames[index] || '',
                  price: prices[index] || '',
                  buyLink: buyLinks[index] || ''
                }));
              })
              .filter((event) => {
                const { start, end } = event;
                const startDate = new Date(start);
                const endDateTime = new Date(end);
                const today = new Date(selectedDate); // Convert selectedDate to a Date object

                // Check if event's start timestamp is on the same day as selectedDate
                const isSameDay = startDate.getDate() === today.getDate() &&
                  startDate.getMonth() === today.getMonth() &&
                  startDate.getFullYear() === today.getFullYear();

                // Check if the end time of the event has not been reached yet
                const hasNotEnded = endDateTime >= today;

                return isSameDay && hasNotEnded;
              })
              .map((event, index, array) => {
                const { name, start, end, eventName, price, buyLink } = event;
                // Render each event using the start, end, eventName, price, and buyLink values
  
                return (
                  <li
                    key={`${name}-${eventName}`}
                    className={`card-two`}
                  >
                    <Link className='event-button-link' to={`/location/${name}?inRange=${encodeURIComponent(JSON.stringify(props.inRange[name]))}`} onClick={() => handleLocationClick(name)} style={{backgroundColor: 
                      averages && averages[name] && averages[name]['averageScore'] >= 0 && averages[name]['averageScore'] <= 2 ? '#A1D1FE' :
                      averages && averages[name] && averages[name]['averageScore'] > 2 && averages[name]['averageScore'] <= 4 ? '#59AFFF' :
                      averages && averages[name] && averages[name]['averageScore'] > 4 && averages[name]['averageScore'] <= 6 ? '#59AFFF' :
                      averages && averages[name] && averages[name]['averageScore'] > 6 && averages[name]['averageScore'] <= 8 ? '#267CFE' :
                      averages && averages[name] && averages[name]['averageScore'] > 8 && averages[name]['averageScore'] <= 10 ? '#267CFE' :
                      ''
                    }}>
                      <div className='event-card-container'>
                        <div className='event-card-inner'>
                          <div className='event-time'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-clock-hour-10" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                              <path d="M12 12l-3 -2"/>
                              <path d="M12 7v5"/>
                            </svg>
                            <div>
                              {(() => {
                                const startTime = new Date(start);
                                const endTime = new Date(end);

                                const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'short' });
    
                                const startHour = startTime.getHours() % 12 || 12;
                                const endHour = endTime.getHours() % 12 || 12;
    
                                const startPeriod = startTime.getHours() >= 12 ? 'pm' : 'am';
                                const endPeriod = endTime.getHours() >= 12 ? 'pm' : 'am';
    
                                const formattedDate = startTime.toLocaleString('en-US', {
                                  day: 'numeric',
                                  month: 'short'
                                });
    
                                return `${dayOfWeek}, ${formattedDate}, ${startHour} - ${endHour}${endPeriod}`;
                              })()}
                            </div>
    
                          </div>
                          <div className='bar-name-small-line'>
                            <div className="circle"></div>
                            <div className='bar-name-small'>{name}</div>
                          </div>
                          <div className='event-name'>{eventName}</div>
                        </div>
    
                      </div>
                    </Link>
    
                    <div className='event-buttons-background' style={{backgroundColor: 
                      averages && averages[name] && averages[name]['averageScore'] >= 0 && averages[name]['averageScore'] <= 2 ? '#A1D1FE' :
                      averages && averages[name] && averages[name]['averageScore'] > 2 && averages[name]['averageScore'] <= 4 ? '#59AFFF' :
                      averages && averages[name] && averages[name]['averageScore'] > 4 && averages[name]['averageScore'] <= 6 ? '#59AFFF' :
                      averages && averages[name] && averages[name]['averageScore'] > 6 && averages[name]['averageScore'] <= 8 ? '#267CFE' :
                      averages && averages[name] && averages[name]['averageScore'] > 8 && averages[name]['averageScore'] <= 10 ? '#267CFE' :
                      ''
                    }}>
                      <div className='event-buttons'>
                        <a className="buy" href={buyLink} target="_blank" rel="noopener noreferrer">
                          <div className="buy-box">
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-currency-dollar" width="14" height="14" viewBox="0 0 24 24" strokeWidth="3" stroke="#7bff82" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2"/>
                              <path d="M12 3v3m0 12v3"/>
                            </svg>
                          </div>
                          <div className="price-container">{price}</div>
                        </a>

                        <button
                          className={`going ${goingOn[name]?.[eventName] ? 'on' : 'off'}`}
                          onClick={() => handleGoingClick(name, eventName, goingCount[name]?.[eventName])}
                        >
                          <div className={`going-box ${goingOn[name]?.[eventName] ? 'on' : 'off'}`}>
                            {goingCount[name]?.[eventName]}
                          </div>
                          <div className='going-container'>going</div>
                        </button>

    
                      </div>
                    </div>
    
                    {hasMatchingResults = true}
                    
                </li>
                );
              })
            }
          </ul>
          {!hasMatchingResults && <div id='no-events'>More events coming soon</div>}
    </div>
  );
};

export default EventsPage;
