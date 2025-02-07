import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const HomeWorker = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [picture, setPicture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const taskQuery = query(collection(db, "tasks"), where("assignedTo", "==", user.email));
      const taskSnap = await getDocs(taskQuery);
      const tasksList = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignedTasks(tasksList);
      setLoading(false);
    };

    fetchAssignedTasks();
  }, []);

  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    setChecklist(task.checklist || []);
    setShowCompletePopup(true);
  };

  const handleCompleteTaskSubmit = async () => {
    const taskRef = doc(db, "tasks", selectedTask.id);
    const pictureBase64 = picture ? await convertImageToBase64(picture) : null;
    await updateDoc(taskRef, {
      lastCompletedAt: new Date().toISOString(),
      checklist: checklist,
      pictureBase64: pictureBase64,
    });
    setShowCompletePopup(false);
    setChecklist([]);
    setPicture(null);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

 

  if (loading) return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center h-[88vh] bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Assigned Tasks</h2>

        {assignedTasks.length === 0 ? (
          <p className="text-center text-xl md:text-2xl">No tasks assigned</p>
        ) : (
          <ul className="mb-4">
            {assignedTasks.map((task) => (
              <li key={task.id} className="flex justify-between items-center bg-gray-200 p-3 rounded mb-2 text-lg md:text-xl">
                <span>
                  {task.name} (Location: {task.locationName}, Asset: {task.assetName})
                </span>
                <button onClick={() => handleCompleteTask(task)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm md:text-xl">Complete Task</button>
              </li>
            ))}
          </ul>
        )}

      
      </div>

      {showCompletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Complete Task</h2>
            <div>
              {selectedTask.checklist.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={checklist.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setChecklist([...checklist, item]);
                      } else {
                        setChecklist(checklist.filter(i => i !== item));
                      }
                    }}
                  />
                  <span className="ml-2">{item}</span>
                </div>
              ))}
            </div>
            <input type="file" onChange={(e) => setPicture(e.target.files[0])} className="mt-4" />
            <button onClick={handleCompleteTaskSubmit} className="bg-green-500 text-white p-3 rounded mt-4">Submit</button>
            <button onClick={() => setShowCompletePopup(false)} className="bg-gray-500 text-white p-3 rounded mt-4 ml-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeWorker;