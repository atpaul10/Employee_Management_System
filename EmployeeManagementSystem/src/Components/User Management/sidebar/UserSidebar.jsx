import {FaUsers,FaPlusCircle,FaHome,} from "react-icons/fa";
import { Link } from "react-router-dom";
import React from "react";
import OptraLogo1 from "../../../../public/OptraLogo1.png"

  const Sidebar = () => {
    return (
      <div className="bg-[#40513B] text-white h-screen w-60 fixed top-0 left-0 overflow-y-auto z-20">
        <div className="p-4 flex">
          <Link to="/userdashboard">
          <img
            src={OptraLogo1}
            alt="Optra logo"
            className="h-13 w-auto"
          />

          </Link>
        </div>
        <div className="space-y-1 px-4">
          <Link
            to="/userdashboard"
            className="flex items-center space-x-2 py-2 text-sm hover:bg-[#609966] rounded-md px-2"
          >
            <FaHome />
            <span className="ml-2">Dashboard</span>
          </Link>
  
          {/* Employee Management */}
          <div className="space-y-2">
            <button className="flex items-center space-x-2 py-2 text-sm w-full hover:bg-[#609966] rounded-md px-2">
              <FaUsers />
              <span className="ml-2">Attendance & Leave </span>
            </button>
            <div className="pl-6">
              <Link
                to="/attendance-manager"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-[#609966] rounded-md px-2"
              >
                <FaPlusCircle />
                <span>Attendance History </span>
              </Link>
      
              <Link
                to="/leave-request"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-[#609966] rounded-md px-2"
              >
                <FaPlusCircle />
                <span>Leave Request</span>
              </Link>
            </div>
          </div>

          {/* worklogs */}
          <div className="space-y-2">
            <button className="flex items-center space-x-2 py-2 text-sm w-full px-2">
              <FaUsers />
              <span className="ml-2">Work-Logs</span>
            </button>
            <div className="pl-6">
              <Link
                to="/worklogs"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-[#609966] rounded-md px-2"
              >
                <FaPlusCircle />
                <span>Add Work-logs </span>
              </Link>
      
              <Link
                to="/view-work-logs"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-[#609966] rounded-md px-2"
              >
                <FaPlusCircle />
                <span>View Work-logs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };
  export default Sidebar;