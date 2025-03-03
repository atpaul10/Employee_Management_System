import LoginComponent from "../Components/loginEmplove/LoginComponent";
import RegisterEmploye from "../Components/registerEmploye/RegisterEmploye";
import ForgotPassword from "../Components/forgotPassword/ForgotPassword";
import AdminDashboard from "../Components/Admin Management/adminDashboard/AdminDashboard";
import UserDashboard from "../Components/User Management/userDashboard/UserDashboard";
import EmployeeDirctory from "../Components/Admin Management/employeeManagement/EmployeeDirectory";
import AddEmployee from "../Components/Admin Management/employeeManagement/AddEmployee";
import Layout from "../Components/Admin Management/Layout/layout";
import UserLayout from "../Components/User Management/Layout/UserLayout";
import EmployeeAttendanceManagement from "../Components/Admin Management/employeeAttedanceMangement/EmployeeAttendanceManagement";
import AttendanceManager from "../Components/User Management/userAttendance/AttendanceManager";
import LeaveRequest from "../Components/User Management/leaveRequest/LeaveRequest";
import EmployeeLeaveRequest from "../Components/Admin Management/employeeAttedanceMangement/EmployeeLeaveRequest";


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
  }
];
export default routes;
