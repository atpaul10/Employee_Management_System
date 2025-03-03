import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {getFirestore,collection,query,where,onSnapshot,} from "firebase/firestore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {TableSortLabel, TablePagination,} from "@mui/material"


const EmployeeAttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);      
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const[order , setOrder] = useState("desc")
  const[orderBy, setOrderBy] = useState("date")
  const[page, setPage] = useState(0)
  const[rowPerPage, setRowPerPage]= useState(5)

  const db = getFirestore();
  
  useEffect(() => {
    const unsubscribeUsers = subscribeToRealTimeUpdates();
   
    document.title = "Employee Attendance Record ";
    return () => {
      unsubscribeUsers();
    };
  }, []);

  const subscribeToRealTimeUpdates = () => {
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "User")
      );

      const unsubscribe = onSnapshot(usersQuery, (usersSnapshot) => {
        const users = usersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        const allEmployeeDetailsQuery = collection(db, "employeeDetails");
        const unsubscribeEmployeeDetails = onSnapshot(
          allEmployeeDetailsQuery,
          (detailsSnapshot) => {
            const allEmployeeDetails = detailsSnapshot.docs.map((doc) => ({
              ...doc.data(),
            }));

            const employeeMap = {};

            // it find the employeedetail where fullname of the matche the name of user
            users.forEach((user) => {
              const matchedEmployeeDetails = allEmployeeDetails.find(
                (detail) =>
                  detail.fullName?.trim().toLowerCase() === user.name?.trim().toLowerCase());

              const checkinsRef = collection(db, "users", user.uid, "checkins");
              onSnapshot(checkinsRef, (checkinsSnapshot) => {
                const attendanceRecords = checkinsSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));

                const today = new Date().toLocaleDateString();
                if (
                  !attendanceRecords.some(
                    (record) =>
                      new Date(record.date).toLocaleDateString() === today
                  )
                ) {
                  attendanceRecords.push({
                    id: "no-checkin",
                    date: new Date(),
                    checkIn: null,
                    checkOut: null,
                  });
                }

                attendanceRecords.forEach((record) => {
                  const recordDate = new Date(record.date).toLocaleDateString();
                  const key = `${user.uid}-${recordDate}`;

                  if (!employeeMap[key]) {
                    employeeMap[key] = {
                      empID:
                        matchedEmployeeDetails?.employeeId || "N/A Employee ID",
                      name:
                        matchedEmployeeDetails?.fullName ||
                        user.name ||
                        "Unknown Employee",
                      department:
                        matchedEmployeeDetails?.department || "N/A Department",
                      date: record.date,
                      checkIn: record.checkIn,
                      checkOut: record.checkOut,
                    };
                  } else {
                    employeeMap[key].checkIn =
                      employeeMap[key].checkIn || record.checkIn;
                    employeeMap[key].checkOut =
                      employeeMap[key].checkOut || record.checkOut;
                  }
                });

                // Flatten the array and sort the data by date
                const flattenedData = Object.values(employeeMap).flat();
                flattenedData.sort(
                  (a, b) => new Date(b.date) - new Date(a.date)
                );
                setEmployees(flattenedData);
                setLoading(false);
              });
            });
          }
        );
        return unsubscribeEmployeeDetails;
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to real-time updates:", error);
      toast.error("Failed to subscribe to updates.");
      setLoading(false);  
    }
  };

  
    const handleRequestSort = (property)=>{
      const isAsc = orderBy === property && order ==="asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property)
    }

    const handleChangePage = (event, newPage)=>{
        setPage(newPage)
    }

    const handleChangeRowPerPage = (event)=>{
          setRowPerPage(parseInt(event.target.value,10))
    }

    const sortData = (data) => {
      return data.sort((a, b) => {
        if (orderBy === "name") {
          return order === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (orderBy === "date") {
          return order === "asc"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        return 0;
      });
    };
    const sortedEmployee = sortData(employees)

  const determineStatus = (checkIn, checkOut) => {
    if (checkIn && checkOut) {
      return "Present";
    } else if (checkIn && !checkOut) {
      return "Incomplete";
    } else {
      return "Absent";
    }
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const checkInTime = checkIn.toDate ? checkIn.toDate() : new Date(checkIn);
    const checkOutTime = checkOut.toDate
      ? checkOut.toDate()
      : new Date(checkOut);
    const diff = checkOutTime - checkInTime;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hrs ${minutes} mins`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = date.toDate ? date.toDate() : new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "-";
    const t = time.toDate ? time.toDate() : new Date(time);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(t);
  };

const exportToExcel = async () => {
  if (employees.length === 0) {
    toast.warn("No data available to export.");
    return;
  }
  const filteredEmployees = employees.filter((record) => {
    const matchEmployee =
      employeeFilter === "" ||
      record.name.toLowerCase().includes(employeeFilter.toLowerCase());

    const matchDate =
      dateFilter === "" || formatDate(record.date) === formatDate(dateFilter);

    const matchMonth =
      monthFilter === "" ||
      (() => {
        const [year, month] = monthFilter.split("-");
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear();
        const recordMonth = (recordDate.getMonth() + 1)
          .toString()
          .padStart(2, "0");

        return `${recordYear}-${recordMonth}` === `${year}-${month}`;
      })();

    return matchEmployee && matchDate && matchMonth;
  });

  if (filteredEmployees.length === 0) {
    toast.warn("No matching data found.");
    return;
  }

  // Create a new Excel workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance Data");

  const headers = [ "Employee ID", "Name", "Department", "Date", "Clock-In Time", "Clock-Out Time", "Work Hours", "Status",];

  // Add headers to the worksheet with bold styling
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" }, 
    };
  });

  // Add employee data to the worksheet
  filteredEmployees.forEach((record) => {
    const status = determineStatus(record.checkIn, record.checkOut);
    const row = worksheet.addRow([
      record.empID,
      record.name,
      record.department,
      formatDate(record.date),
      formatTime(record.checkIn),
      formatTime(record.checkOut),
      calculateWorkHours(record.checkIn, record.checkOut),
      status,
    ]);

    const statusCell = row.getCell(8); 
    if (status === "Present") {
      statusCell.font = { color: { argb: "FF008000" } }; 
    } else if (status === "Absent") {
      statusCell.font = { color: { argb: "FFFF0000" } }; 
    }
  });
  let filename = "Employee_Attendance.xlsx";
  if (employeeFilter) {
    filename = `${employeeFilter.replace(/\s+/g, "_")}_Attendance.xlsx`;
  }
  if (monthFilter) {
    const [year, month] = monthFilter.split("-");
    filename = `${filename}_${month}-${year}.xlsx`;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);

  toast.success("Exported Successfully!");
}; 
  return (
    <div className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-6xl bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-indigo-950 text-center mb-4">
          Employee Attendance
        </h2>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Employee Name"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <label htmlFor="date"> Search by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <label htmlFor="date"> Search by Month</label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={exportToExcel}
          className="bg-indigo-500 text-white px-4 py-2 rounded mb-4 hover:bg-indigo-700" 
        >
          Export to Excel
        </button>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-indigo-950 text-white">
                  <th className="px-4 py-2 border border-gray-200">
                    Employee ID
                  </th>
                  <th className="px-4 py-2 border border-gray-200">

                    <TableSortLabel 
                    active={orderBy==="name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={()=> handleRequestSort("name")}
                    sx={{
                      color: 'white',  
                      '&.Mui-active': { color: 'white' }, 
                      '& .MuiTableSortLabel-icon': { color: 'white !important' } 
                    }}
                    >
                    Name
                    </TableSortLabel>
                    </th>
                  <th className="px-4 py-2 border border-gray-200">
                    Department
                  </th>
                  <th className="px-4 py-2 border border-gray-200">
                  <TableSortLabel
                    active ={orderBy === "date"}
                    direction={orderBy === "date" ? order : "asc"}
                    onClick={()=> handleRequestSort("date")}
                    sx={{
                      color: 'white',
                      '&.Mui-active': { color: 'white' }, 
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                     Date
                  </TableSortLabel>
                    </th>
                  <th className="px-4 py-2 border border-gray-200">
                    Clock-In Time
                  </th>
                  <th className="px-4 py-2 border border-gray-200">
                    Clock-Out Time
                  </th>
                  <th className="px-4 py-2 border border-gray-200">
                    Work Hours
                  </th>
                  <th className="px-4 py-2 border border-gray-200">  Status </th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No Attendance Record Found 
                    </td>
                  </tr>
                ):(
                  sortedEmployee.slice(page * rowPerPage, page * rowPerPage + rowPerPage)
                  .map((record, index)=>{
                    const date = formatDate(record.date)
                    const checkInTime = formatTime(record.checkIn)
                    const checkOutTime = formatTime(record.checkOut)
                    const workHours = calculateWorkHours(record.checkIn, record.checkOut)
                    const status = determineStatus(record.checkIn , record.checkOut)

                    const statusClass =   
                    status=== "Present"
                    ? "text-green-600 font-semibold"
                    :status ==="Absent"
                    ? "text-red-600 font-semibold"
                    : "text-gray-600"
                    return(
                      <tr key={index}>
                          <td className="px-4 py-2 border border-grey-200">{record.empID}</td>
                          <td className="px-4 py-2 border border-grey-200">{record.name}</td>
                          <td className="px-4 py-2 border border-grey-200">{record.department}</td>
                          <td className="px-4 py-2 border border-grey-200">{date}</td>
                          <td className="px-4 py-2 border border-grey-200">{checkInTime}</td>
                          <td className="px-4 py-2 border border-grey-200">{checkOutTime}</td>
                          <td className="px-4 py-2 border border-grey-200">{workHours}</td>
                        <td className={`px-4 py-2 border border-grey-200 ${statusClass}`}>{status}</td>
                      </tr>
                    )
                  })
                )
                }
              </tbody>
            </table>
            <TablePagination
              rowsPerPageOptions={[5,10,25]}
              component="div"
              count={sortedEmployee.length}
              rowsPerPage={rowPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default EmployeeAttendanceManagement;