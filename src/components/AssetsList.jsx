import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({ name: "", description: "" });
  const [editAssetId, setEditAssetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "assets"));
        const assetsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssets(assetsList);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleAddOrUpdateAsset = async () => {
    if (newAsset.name && newAsset.description) {
      try {
        if (editAssetId) {
          const assetRef = doc(db, "assets", editAssetId);
          await updateDoc(assetRef, newAsset);
          setAssets(assets.map(asset => asset.id === editAssetId ? { id: editAssetId, ...newAsset } : asset));
          setEditAssetId(null);
        } else {
          const docRef = await addDoc(collection(db, "assets"), newAsset);
          setAssets([...assets, { id: docRef.id, ...newAsset }]);
        }
        setNewAsset({ name: "", description: "" });
      } catch (error) {
        console.error("Error adding/updating asset:", error);
      }
    }
  };

  const handleEdit = (assetId) => {
    const assetToEdit = assets.find(asset => asset.id === assetId);
    setNewAsset({ name: assetToEdit.name, description: assetToEdit.description });
    setEditAssetId(assetId);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteDoc(doc(db, "assets", assetId));
        setAssets(assets.filter(asset => asset.id !== assetId));
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-[88vh] bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Assets Screen</h2>
        <p className="mb-4">Manage assets.</p>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : assets.length === 0 ? (
          <p className="text-center">No assets found</p>
        ) : (
          <ul className="mb-4">
            {assets.map((asset) => (
              <li key={asset.id} className="flex justify-between items-center bg-gray-200 p-2 rounded mb-2">
                <Link to={`/tasks/${asset.id}`} className="flex-1">{asset.name}</Link>
                <button onClick={() => handleEdit(asset.id)} className="bg-yellow-500 text-white px-2 py-1 rounded ml-2">Edit</button>
                <button onClick={() => handleDelete(asset.id)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col space-y-2">
          <input type="text" placeholder="Asset Name" className="p-2 border rounded" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
          <input type="text" placeholder="Description" className="p-2 border rounded" value={newAsset.description} onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })} />
          <button onClick={handleAddOrUpdateAsset} className="bg-green-500 text-white p-2 rounded">{editAssetId ? "Update Asset" : "Add Asset"}</button>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded mt-4">Logout</button>
      </div>
    </div>
  );
};

export default Assets;
