import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const Home = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", description: "" });
  const [editLocation, setEditLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      const querySnapshot = await getDocs(collection(db, "locations"));
      const locationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(locationsList);
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const handleAddOrUpdateLocation = async () => {
    if (newLocation.name && newLocation.address && newLocation.description) {
      if (editLocation) {
        const locationRef = doc(db, "locations", editLocation);
        await updateDoc(locationRef, newLocation);
        setLocations(locations.map(loc => loc.id === editLocation ? { id: editLocation, ...newLocation } : loc));
        setEditLocation(null);
      } else {
        const docRef = await addDoc(collection(db, "locations"), newLocation);
        setLocations([...locations, { id: docRef.id, ...newLocation }]);
      }
      setNewLocation({ name: "", address: "", description: "" });
      setShowForm(false);
    }
  };

  const handleEdit = (id) => {
    const locationToEdit = locations.find(loc => loc.id === id);
    setNewLocation({ name: locationToEdit.name, address: locationToEdit.address, description: locationToEdit.description });
    setEditLocation(id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location and its assets?")) {
      await deleteDoc(doc(db, "locations", id));
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[88vh] bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h2 className="text-3xl font-semibold mb-4">Home Screen</h2>
        <p className="mb-4 text-xl">Welcome to the Task Management App!</p>
        <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-bold uppercase m-2">List of Locations</h2>
        {loading ? (
          <p className="text-center text-2xl">Loading...</p>
        ) : locations.length === 0 ? (
          <p className="text-center">No list found</p>
        ) : (
          <ul className="mb-4">
            {locations.map((location) => (
              <li key={location.id} className="flex justify-between items-center bg-gray-200 p-3 rounded mb-2 text-lg md:text-xl">
                <Link to={`/assets/${location.id}`} className="flex-1">{location.name}</Link>
                <button onClick={() => handleEdit(location.id)} className="bg-yellow-500 text-white px-2 py-1 rounded ml-2">Edit</button>
                <button onClick={() => handleDelete(location.id)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => { setShowForm(!showForm); setEditLocation(null); setNewLocation({ name: "", address: "", description: "" }); }} className="bg-blue-500 text-white p-2 rounded mb-4">
          {showForm ? "Cancel" : "Add Location"}
        </button>
        {showForm && (
          <div className="flex flex-col space-y-2">
            <input type="text" placeholder="Location Name" className="p-3 border rounded text-lg md:text-xl" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} />
            <input type="text" placeholder="Address" className="p-3 border rounded text-lg md:text-xl" value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} />
            <input type="text" placeholder="Description" className="p-3 border rounded text-lg md:text-xl" value={newLocation.description} onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })} />
            <button onClick={handleAddOrUpdateLocation} className="bg-green-500 text-white p-3 rounded text-lg md:text-xl">{editLocation ? "Update Location" : "Save Location"}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
