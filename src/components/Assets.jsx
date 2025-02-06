import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const AssetsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedLocation, setUpdatedLocation] = useState({ name: "", address: "", description: "" });

  useEffect(() => {
    const fetchLocation = async () => {
      const locationRef = doc(db, "locations", id);
      const locationSnap = await getDoc(locationRef);
      if (locationSnap.exists()) {
        setLocation({ id: locationSnap.id, ...locationSnap.data() });
        setUpdatedLocation(locationSnap.data());
      } else {
        console.log("No such location!");
        navigate("/");
      }
    };
    fetchLocation();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (updatedLocation.name && updatedLocation.address && updatedLocation.description) {
      const locationRef = doc(db, "locations", id);
      await updateDoc(locationRef, updatedLocation);
      setLocation({ id, ...updatedLocation });
      setEditMode(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      await deleteDoc(doc(db, "locations", id));
      navigate("/");
    }
  };

  if (!location) return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-3xl font-semibold mb-4">Location Details</h2>
        {editMode ? (
          <div className="flex flex-col space-y-2">
            <input type="text" placeholder="Location Name" className="p-3 border rounded text-lg" value={updatedLocation.name} onChange={(e) => setUpdatedLocation({ ...updatedLocation, name: e.target.value })} />
            <input type="text" placeholder="Address" className="p-3 border rounded text-lg" value={updatedLocation.address} onChange={(e) => setUpdatedLocation({ ...updatedLocation, address: e.target.value })} />
            <input type="text" placeholder="Description" className="p-3 border rounded text-lg" value={updatedLocation.description} onChange={(e) => setUpdatedLocation({ ...updatedLocation, description: e.target.value })} />
            <button onClick={handleUpdate} className="bg-green-500 text-white p-3 rounded text-lg">Save Changes</button>
            <button onClick={() => setEditMode(false)} className="bg-gray-500 text-white p-3 rounded text-lg">Cancel</button>
          </div>
        ) : (
          <div>
            <p className="text-xl mb-2"><strong>Name:</strong> {location.name}</p>
            <p className="text-xl mb-2"><strong>Address:</strong> {location.address}</p>
            <p className="text-xl mb-4"><strong>Description:</strong> {location.description}</p>
            <button onClick={() => setEditMode(true)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
            <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsScreen;
