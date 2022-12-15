import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./styles.css";

// Create a root ReactDOM component and render the App component within it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

