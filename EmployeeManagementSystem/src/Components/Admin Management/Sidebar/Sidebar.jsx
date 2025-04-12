import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaClipboardList, FaPlusCircle, FaHome, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LuLogs } from "react-icons/lu";
import { MdOutlinePreview } from "react-icons/md";
import OptraLogo from "../../../../public/OptraLogo.png"

const Sidebar = () => {

  const [openSections, setOpenSections] = useState({
    employeeManagement: false,
    attendanceLeave: false,
    employeeworklogs: false,
  });
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section] , 
    }));  
  };

  return (
    <div className="bg-indigo-950 text-white h-screen w-60 fixed top-0 left-0 overflow-y-auto z-20">
      <div className="p-4 flex items-center justify-center">

        <div className="text-white text-xl cursor-pointer"></div>
        <Link to='/admindashboard'>
        <img
          src={OptraLogo}
          alt="Optra logo"
          className="h-15 w-auto"
        />
        </Link>
        </div>

      <div className="space-y-6 px-4">
        {/* Dashboard */}
        <Link
          to="/admindashboard"
          className="flex items-center space-x-2 py-2 text-sm hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
        >
          <FaHome />
          <span className="ml-2">Dashboard</span>
        </Link>

        {/* Employee Management */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("employeeManagement")}
            className="flex items-center justify-between w-full py-2 text-sm hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
            aria-expanded={openSections.employeeManagement}
          >
            <div className="flex items-center space-x-2">
              <FaUsers />
              <span>Employee Management</span>
            </div>
            {openSections.employeeManagement ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openSections.employeeManagement && (
            <div className="pl-6">
              <Link
                to="/employee-directory"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
              >
                <FaClipboardList />
                <span>Employee Directory</span>
              </Link>
              <Link
                to="/add-employee"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
              >
                <FaPlusCircle />
                <span>Add Employee</span>
              </Link>
            </div>
          )}
        </div>

        {/* Attendance & Leave */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("attendanceLeave")}
            className="flex items-center justify-between w-full py-2 text-sm hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
            aria-expanded={openSections.attendanceLeave}
          >
            <div className="flex items-center space-x-2">
              <FaCalendarAlt />
              <span>Attendance & Leave</span>
            </div>
            {openSections.attendanceLeave ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openSections.attendanceLeave && (
            <div className="pl-6">
              <Link
                to="/employee-attendance-management"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
              >
                <FaCalendarAlt />
                <span>Employee Attendance Management</span>
              </Link>
            <Link
                to="/leave-request-management"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
              >
                <FaClipboardList />
                <span>Leave Request Management</span>
              </Link>
            </div>
          )}
        </div>

        {/* Work Logs */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("employeeworklogs")}
            className="flex items-center justify-between w-full py-2 text-sm hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
            aria-expanded={openSections.employeeworklogs}
          >
            <div className="flex items-center space-x-2">
              <LuLogs />
              <span>Employee Work-Logs</span>
            </div>
            {openSections.employeeworklogs ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openSections.employeeworklogs && (
            <div className="pl-6">
              <Link
                to="/employee-worklogs"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2 transition-all duration-200"
              >
                <MdOutlinePreview />
                <span>View Employee Work-logs</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
