import { elements } from "chart.js";
import React from "react";
// import LoginComponent from "../Components/loginEmplove/LoginComponent";
const LoginComponent = React.lazy(()=> import('../Components/loginEmplove/LoginComponent'))
// import RegisterEmploye from "../Components/registerEmploye/RegisterEmploye";
const RegisterEmploye = React.lazy(()=>import('../Components/registerEmploye/RegisterEmploye'))
// import ForgotPassword from "../Components/forgotPassword/ForgotPassword";
const ForgotPassword = React.lazy (()=> import('../Components/forgotPassword/ForgotPassword'))
// import AdminDashboard from "../Components/Admin Management/adminDashboard/AdminDashboard";
const AdminDashboard = React.lazy(()=>import('../Components/Admin Management/adminDashboard/AdminDashboard'))
// import UserDashboard from "../Components/User Management/userDashboard/UserDashboard";
const UserDashboard = React.lazy(()=> import('../Components/User Management/userDashboard/UserDashboard'))
// import EmployeeDirctory from "../Components/Admin Management/employeeManagement/EmployeeDirectory";
const EmployeeDirctory = React.lazy(()=> import("../Components/Admin Management/employeeManagement/EmployeeDirectory"))
// import AddEmployee from "../Components/Admin Management/employeeManagement/AddEmployee";
const AddEmployee = React.lazy(()=>import("../Components/Admin Management/employeeManagement/AddEmployee"))
// import Layout from "../Components/Admin Management/Layout/layout";
const Layout = React.lazy(()=> import('../Components/Admin Management/Layout/layout'))
// import UserLayout from "../Components/User Management/Layout/UserLayout";
const UserLayout = React.lazy(()=> import('../Components/User Management/Layout/UserLayout'))
// import EmployeeAttendanceManagement from "../Components/Admin Management/employeeAttedanceMangement/EmployeeAttendanceManagement";
const EmployeeAttendanceManagement = React.lazy(()=> import('../Components/Admin Management/employeeAttedanceMangement/EmployeeAttendanceManagement'))
// import AttendanceManager from "../Components/User Management/userAttendance/AttendanceManager";
const AttendanceManager = React.lazy(()=>import('../Components/User Management/userAttendance/AttendanceManager'))
// import LeaveRequest from "../Components/User Management/leaveRequest/LeaveRequest";
const LeaveRequest = React.lazy(()=> import('../Components/User Management/leaveRequest/LeaveRequest'))
// import EmployeeLeaveRequest from "../Components/Admin Management/employeeAttedanceMangement/EmployeeLeaveRequest";
const EmployeeLeaveRequest = React.lazy(()=> import('../Components/Admin Management/employeeAttedanceMangement/EmployeeLeaveRequest'))
const AddWorkLogs = React.lazy(()=>import("../Components/User Management/WorkLogs/AddWorkLogs"))
const ViewWorkLogs = React.lazy(()=> import("../Components/User Management/WorkLogs/ViewWorkLogs"))
const EmployeeWorkLogs = React.lazy(()=>import("../Components/Admin Management/employeeWorklogs/EmployeeWorkLogs"))



const routes = [
  {
    path: "/login",
    element: <LoginComponent />,  
  },
  {
    path: "/register",
    element: <RegisterEmploye />,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },

  // protected routes
  {
    path: "/admindashboard",
    element: (
      <Layout>
        <AdminDashboard />,
      </Layout>
    ),
    role: "Admin",
  },
  {
    path: "/userdashboard",
    element: (
      <UserLayout>
        <UserDashboard />
      </UserLayout>
    ),
    role: "User",
  },
  {
    path: "/employee-directory",
    element: (
      <Layout>
        <EmployeeDirctory />,
      </Layout>
    ),
    role: "Admin",
  },
  {
    path: "/add-employee",
    element: (
      <Layout>
        <AddEmployee />,
      </Layout>
    ),
    role: "Admin",
  },
  {
    path: "/attendance-manager",
    element: (
      <UserLayout >
        <AttendanceManager />
      </UserLayout>
    ),
    role: "User",
  },
  {
    path:"/employee-attendance-management",
    element:(
      <Layout>
        <EmployeeAttendanceManagement/>
      </Layout>
    ),
    role:"Admin"
  },
  {
    path: "/leave-request",
    element:(
      <UserLayout>
          <LeaveRequest/>
      </UserLayout>
    ),
    role: "User"
  },
  {
    path:"/leave-request-management",
    element:(
      <Layout>
        <EmployeeLeaveRequest/>
      </Layout>
    ),
    role:"Admin"
  },
  {
    path:"/worklogs",
    element:(
      <UserLayout>
        <AddWorkLogs/>
      </UserLayout>
    )
  },
  {
    path:"/view-work-logs",
    element:(
      <UserLayout>
        <ViewWorkLogs/>
      </UserLayout>
    )
  },
  {
    path:"/employee-worklogs",
    element:(
      <Layout>
        <EmployeeWorkLogs/>
      </Layout>
    )
  }
];
export default routes;
