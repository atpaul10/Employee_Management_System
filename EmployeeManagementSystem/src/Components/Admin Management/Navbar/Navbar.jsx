import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { persistor } from "../../../Redux/store";
import { toggleTheme } from "../../../Redux/themeSlice";
import {Switch,FormControlLabel} from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useDispatch ,useSelector} from "react-redux";

const Navbar = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {mode} = useSelector((state)=>state.theme)

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = ()=>{
    persistor.purge()
    localStorage.removeItem("CurrentUser")
    navigate("/login")
  }
  const handleToggleTheme = ()=>{
    dispatch(toggleTheme())
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
            <FormControlLabel
              control={
                <Switch 
                    checked = {mode === 'dark'}
                    onChange={handleToggleTheme}
                    icon={<Brightness7Icon/>}
                    checkedIcon = {<Brightness4Icon/>}
                    color="default"
                
                />
              }
              sx={{color:"white"}}
            />
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