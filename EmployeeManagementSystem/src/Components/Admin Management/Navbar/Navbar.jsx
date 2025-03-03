import { useState, useEffect } from "react";
import { useNavigate } from "react-router";


const Navbar = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = ()=>{
    localStorage.removeItem("CurrentUser")
    navigate("/login")
  }

  return (
    <>
    <header className="bg-indigo-950 text-white fixed top-0 left-60 right-0 z-10 h-16 shadow-md">
      <div className="flex justify-between items-center h-full px-4">
      
        <div className="flex items-center space-x-2">
        </div>
        {/* {/* Date,} */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            <span>{date.toLocaleDateString()}</span>
            <span>{date.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-4">
           <button onClick={handleLogout}
           className="px-4 py-2 bg-indigo-900  text-white rounded hover:bg-blue-600 transition"> Logout
           </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
