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
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </div>
                <div className='i-line'>Select <strong>Add to Home Screen</strong>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-square"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
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