import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Assets from './components/Assets';
import Task from './components/Task';
 import AssetsList from './components/AssetsList';
import HomeWorker from './components/HomeWorker';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/assets/:locationId" element={<Assets />} />
        <Route path="/assets" element={<AssetsList/>} />
        <Route path="/tasks/:assetId" element={<Task/>} />
        <Route path="/homeworker" element={<HomeWorker/>} />
      </Routes>
    </Router>
  );
};

export default App;
