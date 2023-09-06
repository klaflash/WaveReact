import React from 'react';
import logo from './waveLogo.png';

function PopupMessage({ isPwa }) {

    const userAgent = navigator.userAgent;
    let message = null

    if (userAgent.match(/Android/i)) {
        // The user is on an Android device
        message = (
            <div className='instructions'>
                <img className='pop-up-logo' src={logo} alt="Wave logo"></img>
                <div className='i-title'>Add To Home Screen To Install</div>
                <div>In your <strong>Chrome</strong> browser</div>
                <div className='i-line'>Tap the <strong>Three Dots</strong> Icon
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#858585" stroke="currentColor"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
                </div>
                <div className='i-line'>Select <strong>Add to Home Screen</strong>
                </div>
                <div>Tap <strong>Add</strong></div>
            </div>
        );
    } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
        // The user is on an iOS device (iPhone, iPad, or iPod)
        message = (
            <div className='instructions'>
                <img className='pop-up-logo' src={logo} alt="Wave logo"></img>
                <div className='i-title'>Add To Home Screen To Install</div>
                <div>In your <strong>Safari</strong> browser</div>
                <div className='i-line'>Tap <strong>Share</strong> Icon
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#858585" stroke="currentColor"><path d="M240-40q-33 0-56.5-23.5T160-120v-440q0-33 23.5-56.5T240-640h120v80H240v440h480v-440H600v-80h120q33 0 56.5 23.5T800-560v440q0 33-23.5 56.5T720-40H240Zm200-280v-447l-64 64-56-57 160-160 160 160-56 57-64-64v447h-80Z"/></svg>
                </div>
                <div className='i-line'>Select <strong>Add to Home Screen</strong>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus-square"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <div>Tap <strong>Add</strong></div>
            </div>
        );
    } else {
        // Assuming it's a computer, as it doesn't match Android or iOS
        message = (
            <div className='instructions'>
                <img className='pop-up-logo' src={logo} alt="Wave logo"></img>
                <div className='i-title'>Not Avalible on This Device</div>
                <div>Visit wave411.com on a phone to install the app</div>
            </div>
        );
    }

    return (
    <div>
        {!isPwa && (
            <div className="browser-popup">
                <div className="browser-container">{message}</div>
            </div>
        )}
    </div>
    );
}

export default PopupMessage;