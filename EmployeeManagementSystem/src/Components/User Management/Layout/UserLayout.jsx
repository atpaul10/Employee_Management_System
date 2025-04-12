import React from "react";
import UserNavbar from "../navbar/UserNavbar"
import UserSidebar from "../sidebar/UserSidebar"
import { useSelector } from "react-redux";
import { ThemeProvider } from "@emotion/react";
import { getTheme } from "../../Theme/muiTheme";

const UserLayout = ({ children }) => {
  const {mode}= useSelector((state)=> state.theme)
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <div className={`flex min-h-screen ${mode === 'light' ? 'bg-white' : 'bg-gray-900'}`}> 
      <UserSidebar />
      <div className="flex-grow ml-60 p-1 overflow-y-auto"> 
        <UserNavbar/>
        <div className="mt-16 ">{children}</div>
      </div>
    </div>
    </ThemeProvider>
  );
};
export default UserLayout;
