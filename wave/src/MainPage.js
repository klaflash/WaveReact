import React, { useState } from 'react';

function MainPage(props) {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const isMobileDevice = /Mobi/.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  const handleLocationClick = (locationName) => {
    props.updateLocation(locationName);
    window.location.href = '/location';
  }

  return (
    <div>
      {isMobile ?
        <div id="content">
          <div id="welcome">Welcome to wave</div>
          <div id="locations">Current locations</div>
          <div id="list">
            <button onClick={() => handleLocationClick('Location 1')}>Location 1</button>
            <button onClick={() => handleLocationClick('Location 2')}>Location 2</button>
            <button onClick={() => handleLocationClick('Location 3')}>Location 3</button>
          </div>
        </div> :
        <div id="not-mobile">Sorry, wave is currently only supported on mobile devices</div>
      }
    </div>
  );
}

export default MainPage;
