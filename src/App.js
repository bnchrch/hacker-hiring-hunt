import React from 'react';

import HackerSearch from './components/HackerSearch';

import './App.css';

/**
 * Hacker Hiring Hunt App
 * @returns {*} React Component
 */
const App = () => (
  <div className="App">
    <h1>Hacker Hiring Hunt</h1>
    <HackerSearch />
  </div>
);

export default App;
