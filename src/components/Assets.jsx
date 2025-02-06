import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

const Assets = () => {
  const { locationId } = useParams();
  const [assets, setAssets] = useState([
    { id: 1, name: "Laptop", description: "Dell XPS 15", locationId: 1 },
    { id: 2, name: "Projector", description: "Epson 4K", locationId: 1 }
  ]);
  const [newAsset, setNewAsset] = useState({ name: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (id) => {
    const assetName = prompt("Enter new asset name:");
    const assetDescription = prompt("Enter new asset description:");
    if (assetName && assetDescription) {
      setAssets(assets.map(asset => asset.id === id ? { ...asset, name: assetName, description: assetDescription } : asset));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setAssets(assets.filter(asset => asset.id !== id));
    }
  };

  const handleAddAsset = () => {
    if (newAsset.name && newAsset.description) {
      setAssets([...assets, { id: Date.now(), ...newAsset, locationId }]);
      setNewAsset({ name: "", description: "" });
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Assets Screen</h2>
        <p className="mb-4">Manage assets for this location.</p>
        <ul className="mb-4">
          {assets.filter(asset => asset.locationId === Number(locationId)).map((asset) => (
            <li key={asset.id} className="flex justify-between items-center bg-gray-200 p-2 rounded mb-2">
              <Link to={`/tasks/${asset.id}`} className="flex-1">{asset.name}</Link>
              <button onClick={() => handleEdit(asset.id)} className="bg-yellow-500 text-white px-2 py-1 rounded ml-2">Edit</button>
              <button onClick={() => handleDelete(asset.id)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
            </li>
          ))}
        </ul>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white p-2 rounded mb-4">
          {showForm ? "Cancel" : "Add Asset"}
        </button>
        {showForm && (
          <div className="flex flex-col space-y-2">
            <input type="text" placeholder="Asset Name" className="p-2 border rounded" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
            <input type="text" placeholder="Description" className="p-2 border rounded" value={newAsset.description} onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })} />
            <button onClick={handleAddAsset} className="bg-green-500 text-white p-2 rounded">Save Asset</button>
          </div>
        )}
        <button className="bg-red-500 text-white p-2 rounded mt-4">Logout</button>
      </div>
    </div>
  );
};

export default Assets;
