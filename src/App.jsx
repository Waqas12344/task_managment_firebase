import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Assets from './components/Assets';
import Task from './components/Task';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/assets/:id" element={<Assets />} />
        <Route path="/task" element={<Task />} />
      </Routes>
    </Router>
  );
};

export default App;
