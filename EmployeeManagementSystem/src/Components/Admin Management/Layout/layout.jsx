import React from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useSelector} from "react-redux";
import { ThemeProvider } from "@mui/material";
import { getTheme } from "../../Theme/muiTheme";


const Layout = ({ children }) => {
  const {mode}= useSelector((state)=>state.theme)
  return (
    <ThemeProvider theme={getTheme(mode)}>
    <div className={`flex min-h-screen ${mode === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
      <Sidebar />
      {/* <div className="flex-grow ml-60 p-1 ">  */}
      <div className="flex-grow ml-60 p-1 overflow-y-auto "> 
        <Navbar />
        <div className="mt-16 p-4">{children}</div>
      </div>
    </div>
    </ThemeProvider>
  );
};
export default Layout;