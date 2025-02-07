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
    <div className="flex flex-col items-center justify-center h-auto md:h-[88vh] bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Assets for {location.name}</h2>

        {editLocation ? (
          <div className="flex flex-col space-y-2">
            <input type="text" placeholder="Location Name" className="p-2 md:p-3 border rounded " value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} />
            <input type="text" placeholder="Address" className="p-2 md:p-3 border rounded" value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} />
            <input type="text" placeholder="Description" className="p-2 md:p-3 border rounded" value={newLocation.description} onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })} />
            <button onClick={handleUpdateLocation} className="bg-green-500 text-white p-2 md:p-3 rounded">Update Location</button>
            <button onClick={() => setEditLocation(null)} className="bg-gray-500 text-white p-2 md:p-3 rounded">Cancel</button>
          </div>
        ) : (
          <>
            <p><strong>Address:</strong> {location.address}</p>
            <p><strong>Description:</strong> {location.description}</p>
            <button onClick={() => setEditLocation(true)} className="bg-yellow-500 text-white text-sm md:text-lg px-4 py-2 rounded mt-3">Edit Location</button>
            <button onClick={handleDeleteLocation} className="bg-red-500 text-white text-sm md:text-lg px-4 py-2 rounded mt-3 ml-2">Delete Location</button>
          </>
        )}


        {/* assets list section  */}

        <h2 className="text-2xl font-semibold mt-6">Assets List</h2>
        {assets.length === 0 ? (
          <p className="text-center">No assets found</p>
        ) : (
          <ul className="mt-4">
            {assets.map((asset) => (
              <li key={asset.id} className="bg-gray-200 p-2 md:p-3 rounded mb-2 text-lg flex justify-between items-center">
                {editAsset === asset.id ? (
                  <div className="w-full flex flex-col md:flex-row items-center gap-1 ">
                    <input type="text" value={updatedAsset.name} placeholder="Update Name .." onChange={(e) => setUpdatedAsset({ ...updatedAsset, name: e.target.value })} className="p-2 border  rounded text-sm md:text-lg w-full md:w-auto" />
                    <input type="text" value={updatedAsset.description} placeholder="Update Description .." onChange={(e) => setUpdatedAsset({ ...updatedAsset, description: e.target.value })} className="p-2 border rounded text-sm md:text-lg  w-full md:w-auto" />
                   
                   <div className="flex gap-1">
                   <button onClick={() => handleUpdateAsset(asset.id)} className="bg-green-500 text-white px-2 py-1 rounded text-sm md:text-lg">Save</button>
                   <button onClick={() => setEditAsset(null)} className="bg-gray-500 text-white px-2 py-1 rounded text-sm md:text-lg">Cancel</button>
                   </div>
                  </div>
                ) : (
                  <>
                    <span onClick={() => navigate(`/tasks/${asset.id}`)} className="cursor-pointer hover:underline text-base md:text-lg">{asset.name}</span>
                    <div>
                      <button onClick={() => setEditAsset(asset.id)} className="bg-yellow-500 text-white px-2 py-1 text-sm md:text-xl md:w-20 w-15  rounded">Edit</button>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="bg-red-500 text-white px-2 py-1 text-sm md:text-xl md:w-20 w-15  rounded ml-2">Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <input type="text" placeholder="Asset Name" className=" p-2  md:p-3 border rounded  my-1  w-full" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
          <input type="text" placeholder="Description" className=" p-2  md:p-3 border rounded my-1  w-full" value={newAsset.description} onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })} />
          <button onClick={handleAddAsset} className="bg-green-500 text-white p-2  md:p-3 text-sm md:text-lg rounded">Add Asset</button>
        </div>
        </div>
    </div>
  );
};

export default Assets;
