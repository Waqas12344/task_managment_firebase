import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "task-managment-app", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
          if (userDoc.data().role === "admin" && location.pathname === "/login") {
            navigate("/");
          } else if (userDoc.data().role === "worker" && location.pathname !== "/task") {
            navigate("/task");
          }
        }
      } else {
        if (location.pathname !== "/login") {
          navigate("/login");
        }
        setRole("");
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole("");
    navigate("/login");
  };

  return (
    <div className='flex max-w-[1260px] h-[12vh] items-center justify-between mx-auto p-10 text-xl'>
      <div className='text-3xl font-bold'>Task Management</div>
      <ul className='flex items-center space-x-4'>
        {user && role === "admin" && <li><Link to="/">Home</Link></li>}
        {/* {user && role === "admin" && <li><Link to="/assets">Assets</Link></li>}
        {user && <li><Link to="/task">Task</Link></li>} */}
        {!user && <li><Link to="/login">Auth</Link></li>}
        {user && <li><button onClick={handleLogout} className='px-4 py-2 text-xl bg-black text-white border rounded-xl'>LogOut</button></li>}
      </ul>
    </div>
  );
};

export default Navbar;
