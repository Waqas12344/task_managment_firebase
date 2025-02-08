import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";

const Assets = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editLocation, setEditLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", description: "" });
  const [newAsset, setNewAsset] = useState({ name: "", description: "" });
  const [editAsset, setEditAsset] = useState(null);
  const [updatedAsset, setUpdatedAsset] = useState({ name: "", description: "" });


  useEffect(() => {
    const fetchLocationAndAssets = async () => {
      const locationRef = doc(db, "locations", locationId);
      const locationSnap = await getDoc(locationRef);
      if (locationSnap.exists()) {
        setLocation({ id: locationSnap.id, ...locationSnap.data() });
        setNewLocation({ name: locationSnap.data().name, address: locationSnap.data().address, description: locationSnap.data().description });
      }
      const assetQuery = query(collection(db, "assets"), where("locationId", "==", locationId));

      const assetSnap = await getDocs(assetQuery);
      setAssets(assetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchLocationAndAssets();
  }, [locationId]);

  const handleAddAsset = async () => {
    if (!newAsset.name.trim()) return;
    const assetRef = collection(db, "assets");
    await addDoc(assetRef, { ...newAsset, locationId });
    setAssets([...assets, { ...newAsset, locationId, id: Math.random().toString() }]);
    setNewAsset({ name: "", description: "" });
  };

  const handleUpdateLocation = async () => {
    if (!editLocation) return;
    const locationRef = doc(db, "locations", locationId);
    await updateDoc(locationRef, newLocation);
    setLocation({ id: locationId, ...newLocation });
    setEditLocation(null);
  };

  const handleDeleteLocation = async () => {
    if (!window.confirm("Are you sure you want to delete this location and all its assets?")) return;
    const assetQuery = query(collection(db, "assets"), where("locationId", "==", locationId));
    const assetSnap = await getDocs(assetQuery);
    assetSnap.forEach(async (asset) => {
      await deleteDoc(doc(db, "assets", asset.id));
    });
    await deleteDoc(doc(db, "locations", locationId));
    navigate("/");
  };

  const handleUpdateAsset = async (assetId) => {
    const assetRef = doc(db, "assets", assetId);
    await updateDoc(assetRef, updatedAsset);
    setAssets(assets.map(asset => (asset.id === assetId ? { ...asset, ...updatedAsset } : asset)));
    setEditAsset(null);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    await deleteDoc(doc(db, "assets", assetId));
    setAssets(assets.filter(asset => asset.id !== assetId));
  };
  if (loading) return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[88vh] bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Assets for {location.name}</h2>
  
      {editLocation ? (
        <div className="space-y-4">
          <input type="text" placeholder="Location Name" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} />
          <input type="text" placeholder="Address" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} />
          <input type="text" placeholder="Description" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newLocation.description} onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })} />
          <button onClick={handleUpdateLocation} className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors">Update Location</button>
          <button onClick={() => setEditLocation(null)} className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
        </div>
      ) : (
        <>
          <p className="text-lg text-gray-700"><strong>Address:</strong> {location.address}</p>
          <p className="text-lg text-gray-700 mb-6"><strong>Description:</strong> {location.description}</p>
          <div className="flex gap-2">
            <button onClick={() => setEditLocation(true)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">Edit Location</button>
            <button onClick={handleDeleteLocation} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Delete Location</button>
          </div>
        </>
      )}
  
      <h2 className="text-2xl font-bold text-gray-800 mt-8">Assets List</h2>
      {assets.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No assets found</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {assets.map((asset) => (
            <li key={asset.id} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              {editAsset === asset.id ? (
                <div className="space-y-4">
                  <input type="text" value={updatedAsset.name} placeholder="Update Name" onChange={(e) => setUpdatedAsset({ ...updatedAsset, name: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={updatedAsset.description} placeholder="Update Description" onChange={(e) => setUpdatedAsset({ ...updatedAsset, description: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateAsset(asset.id)} className="flex-1 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors">Save</button>
                    <button onClick={() => setEditAsset(null)} className="flex-1 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span onClick={() => navigate(`/tasks/${asset.id}`)} className="text-lg text-blue-600 hover:underline cursor-pointer">{asset.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditAsset(asset.id)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteAsset(asset.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
  
      <div className="mt-6 space-y-4">
        <input type="text" placeholder="Asset Name" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
        <input type="text" placeholder="Description" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newAsset.description} onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })} />
        <button onClick={handleAddAsset} className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors">Add Asset</button>
      </div>
    </div>
  </div>
  );
};

export default Assets;
