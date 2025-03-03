import { useState } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaPlusCircle,
  FaBars,
  FaHome,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-indigo-950 text-white h-screen w-60 fixed top-0 left-0 overflow-y-auto z-20">
      <div className="p-4 flex items-center justify-center">
        <FaBars className="text-white text-xl cursor-pointer" />
      </div>
      <div className="space-y-6 px-4">
        <Link
          to="/admindashboard"
          className="flex items-center space-x-2 py-2 text-sm hover:bg-indigo-800 rounded-md px-2"
        >
          <FaHome />
          <span className="ml-2">Dashboard</span>
        </Link>

        {/* Employee Management */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection("employeeManagement")}
            className="flex items-center justify-between w-full py-2 text-sm hover:bg-indigo-800 rounded-md px-2"
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
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2"
              >
                <FaClipboardList />
                <span>Employee Directory</span>
              </Link>
              <Link
                to="/add-employee"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2"
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
            className="flex items-center justify-between w-full py-2 text-sm hover:bg-indigo-800 rounded-md px-2"
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
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2"
              >
                <FaCalendarAlt />
                <span>Employee Attendance Management</span>
              </Link>
              <Link
                to="/leave-request-management"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2"
              >
                <FaClipboardList />
                <span>Leave Request Management</span>
              </Link>
            </div>
          )}
        </div>

        {/* Payroll Management */}
        {/* <div className="space-y-2">
          <button
            onClick={() => toggleSection("payrollManagement")}
            className="flex items-center justify-between w-full py-2 text-sm hover:bg-indigo-800 rounded-md px-2"
          >
            <div className="flex items-center space-x-2">
              <FaDollarSign />
              <span>Payroll Management</span>
            </div>
            {openSections.payrollManagement ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openSections.payrollManagement && (
            <div className="pl-6">
              <Link
                to="/salary-processing"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2"
              >
                <FaDollarSign />
                <span>Salary Processing</span>
              </Link>
              <Link
                to="/pay-slip"
                className="py-2 text-sm flex items-center space-x-2 hover:bg-indigo-800 rounded-md px-2"
              >
                <FaFileInvoiceDollar />
                <span>Pay Slip Generation</span>
              </Link>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
