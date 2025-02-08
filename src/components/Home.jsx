import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config"; // Ensure auth is imported
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

const Home = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", description: "" });
  const [editLocation, setEditLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
  // console.log(user)
    const q = query(collection(db, "locations"), where("adminId", "==", user.uid));
  
    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const locationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(locationsList);
      setLoading(false);
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  const handleAddOrUpdateLocation = async () => {
    if (newLocation.name && newLocation.address && newLocation.description) {
      const user = auth.currentUser;
      if (!user) return;

      if (editLocation) {
        const locationRef = doc(db, "locations", editLocation);
        await updateDoc(locationRef, newLocation);
        setLocations(locations.map(loc => loc.id === editLocation ? { id: editLocation, ...newLocation } : loc));
        setEditLocation(null);
      } else {
        const docRef = await addDoc(collection(db, "locations"), {
          ...newLocation,
          adminId: user.uid, // Store admin ID
        });
        setLocations([...locations, { id: docRef.id, ...newLocation, adminId: user.uid }]);
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

  const handleLocationClick = (locationId) => {
    navigate(`/assets/${locationId}`); // Navigate to Assets Screen
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[88vh] bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Home Screen</h2>
      <p className="text-lg text-gray-600 mb-6">Welcome to the Task Management App!</p>
      <h2 className="text-center text-2xl font-bold uppercase text-gray-800 mb-8">List of Locations</h2>
  
      {loading ? (
        <p className="text-center text-2xl text-gray-600 my-6">Loading...</p>
      ) : locations.length === 0 ? (
        <p className="text-center text-xl text-gray-600">No locations found</p>
      ) : (
        <ul className="space-y-4">
          {locations.map((location) => (
            <li key={location.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              <Link to={`/assets/${location.id}`} className="flex-1 text-lg text-blue-600 hover:underline" onClick={() => handleLocationClick(location.id)}>
                {location.name}
              </Link>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(location.id)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">Edit</button>
                <button onClick={() => handleDelete(location.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
  
      <button
        onClick={() => { setShowForm(!showForm); setEditLocation(null); setNewLocation({ name: "", address: "", description: "" }); }}
        className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
      >
        {showForm ? "Cancel" : "Add Location"}
      </button>
  
      {showForm && (
        <div className="mt-6 space-y-4">
          <input type="text" placeholder="Location Name" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} />
          <input type="text" placeholder="Address" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} />
          <input type="text" placeholder="Description" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newLocation.description} onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })} />
          <button onClick={handleAddOrUpdateLocation} className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors">
            {editLocation ? "Update Location" : "Save Location"}
          </button>
        </div>
      )}
    </div>
  </div>
  );
};

export default Home;
