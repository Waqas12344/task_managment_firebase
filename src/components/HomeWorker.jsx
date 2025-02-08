import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";

const HomeWorker = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch assigned tasks for the logged-in worker
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch tasks assigned to the current user
        const taskQuery = query(
          collection(db, "tasks"),
          where("assignedTo", "==", user.email),
          where("lastCompletedAt", "==", null) // Only fetch incomplete tasks
        );
        const taskSnap = await getDocs(taskQuery);
        const tasksList = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch location and asset details for each task
        const tasksWithDetails = await Promise.all(
          tasksList.map(async (task) => {
            // Fetch location details
            const locationRef = doc(db, "locations", task.locationId);
            const locationSnap = await getDocs(locationRef);
            const locationData = locationSnap.data();

            // Fetch asset details
            const assetRef = doc(db, "assets", task.assetId);
            const assetSnap = await getDocs(assetRef);
            const assetData = assetSnap.data();

            return {
              ...task,
              locationName: locationData?.name || "Unknown Location",
              assetName: assetData?.name || "Unknown Asset",
            };
          })
        );

        setAssignedTasks(tasksWithDetails);
      } catch (err) {
        setError("Failed to fetch tasks. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, []);

  // Handle "Complete Task" button click
  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    setChecklist(task.checklist || []);
    setShowCompletePopup(true);
  };

  // Handle checklist item toggle
  const handleChecklistToggle = (item) => {
    if (checklist.includes(item)) {
      setChecklist(checklist.filter((i) => i !== item)); // Uncheck item
    } else {
      setChecklist([...checklist, item]); // Check item
    }
  };

  // Handle task completion submission
  const handleCompleteTaskSubmit = async () => {
    try {
      const taskRef = doc(db, "tasks", selectedTask.id);
      const pictureBase64 = picture ? await convertImageToBase64(picture) : null;

      // Update the task with completion details
      await updateDoc(taskRef, {
        lastCompletedAt: new Date().toISOString(),
        checklist: checklist,
        pictureBase64: pictureBase64,
      });

      // Save completion history
      const historyRef = collection(db, "taskHistory");
      await addDoc(historyRef, {
        taskId: selectedTask.id,
        taskName: selectedTask.name,
        completedBy: auth.currentUser.email,
        completedAt: new Date().toISOString(),
        checklist: checklist,
        pictureBase64: pictureBase64,
      });

      // Close the popup and reset state
      setShowCompletePopup(false);
      setChecklist([]);
      setPicture(null);

      // Refresh the task list to exclude the completed task
      const updatedTasks = assignedTasks.filter(task => task.id !== selectedTask.id);
      setAssignedTasks(updatedTasks);
    } catch (err) {
      setError("Failed to complete task. Please try again.");
      console.error(err);
    }
  };

  // Convert image to Base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  if (loading) {
    return <p className="text-center text-2xl">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-2xl text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[88vh] bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Assigned Tasks</h2>

        {assignedTasks.length === 0 ? (
          <p className="text-center text-lg text-gray-600">No tasks assigned</p>
        ) : (
          <ul className="space-y-4">
            {assignedTasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <span className="text-lg text-gray-700">
                  {task.name} (Location: {task.locationName}, Asset: {task.assetName})
                </span>
                <button
                  onClick={() => handleCompleteTask(task)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Complete Task
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Complete Task Popup */}
      {showCompletePopup && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Task</h2>
            <div className="space-y-4">
              {selectedTask.checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.includes(item)}
                    onChange={() => handleChecklistToggle(item)}
                  />
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
              <input
                type="file"
                onChange={(e) => setPicture(e.target.files[0])}
                className="mt-4"
                accept="image/*"
              />
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleCompleteTaskSubmit}
                  className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowCompletePopup(false)}
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeWorker;