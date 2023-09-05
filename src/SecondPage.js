import { currentLocation } from './LocationPage';

console.log(currentLocation);

if (!inRange[currentLocation.name]) {
  document.getElementById('rating').style.display = 'none';
  document.getElementById('range-message').textContent = 'To rate this location get within range and refresh';
}

document.getElementById('place').textContent = `${currentLocation.name}`;
