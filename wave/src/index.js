import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// import { createClient } from '@supabase/supabase-js'
// const API_KEY = process.env.REACT_APP_API_KEY
// const PROJECT_URL = process.env.REACT_APP_PROJECT_URL
// const supabase = createClient(`${PROJECT_URL}`, `${API_KEY}`)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
