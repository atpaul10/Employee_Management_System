import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  Typography,
} from "@mui/material";

const EmployeeAttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportType, setExportType] = useState("");
  const [exportValue, setExportValue] = useState("");
  const [openExportDialog, setOpenExportDialog] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    const unsubscribeUsers = subscribeToRealTimeUpdates();
    document.title = "Employee Attendance Record";
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
            users.forEach((user) => {
              const matchedEmployeeDetails = allEmployeeDetails.find(
                (detail) =>
                  detail.fullName?.trim().toLowerCase() === user.name?.trim().toLowerCase()
              );

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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const determineStatus = (checkIn, checkOut) => {
    if (checkIn && checkOut) return "Present";
    else if (checkIn && !checkOut) return "Incomplete";
    else return "Absent";
  };

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

  const filterData = (data) => {
    if (!searchQuery) return data;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return data.filter((record) => {
      const status = determineStatus(record.checkIn, record.checkOut).toLowerCase();
      return (
        record.empID.toLowerCase().includes(lowerCaseQuery) ||
        record.name.toLowerCase().includes(lowerCaseQuery) ||
        record.department.toLowerCase().includes(lowerCaseQuery) ||
        status.includes(lowerCaseQuery)
      );
    });
  };

  const sortedEmployee = sortData(filterData(employees));

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const checkInTime = checkIn.toDate ? checkIn.toDate() : new Date(checkIn);
    const checkOutTime = checkOut.toDate ? checkOut.toDate() : new Date(checkOut);
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

  const handleExportDialogOpen = () => {
    setOpenExportDialog(true);
  };

  const handleExportDialogClose = () => {
    setOpenExportDialog(false);
    setExportType("");
    setExportValue("");
  };

  const getUniqueValues = (key) => {
    return [...new Set(employees.map((emp) => emp[key]))].sort();
  };

  const exportToExcel = () => {
    const workBook = new ExcelJS.Workbook();
    const workSheet = workBook.addWorksheet("Attendance Data");

    workSheet.columns = [
      { header: "Employee ID", key: "empID", width: 15 },
      { header: "Name", key: "name", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Check In", key: "checkIn", width: 15 },
      { header: "Check Out", key: "checkOut", width: 15 },
      { header: "Work Hours", key: "workHours", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    let filterData = [...employees];
    let fileName = "Attendance Data";

    switch (exportType) {
      case "name":
        filterData = employees.filter((emp) => emp.name === exportValue);
        fileName = `${exportValue}_AttendanceData`;
        break;
      case "id":
        filterData = employees.filter((emp) => emp.empID === exportValue);
        fileName = `${exportValue}_Attendance`;
        break;
      case "month":
        filterData = employees.filter(
          (emp) =>
            new Date(emp.date).getMonth() === parseInt(exportValue.split("-")[1]) - 1 &&
            new Date(emp.date).getFullYear() === parseInt(exportValue.split("-")[0])
        );
        fileName = `Attendance_${exportValue}`;
        break;
      case "year":
        filterData = employees.filter(
          (emp) => new Date(emp.date).getFullYear() === parseInt(exportValue)
        );
        fileName = `Attendance_${exportValue}`;
        break;
      default:
        break;
    }

    filterData.forEach((record) => {
      workSheet.addRow({
        empID: record.empID,
        name: record.name,
        department: record.department,
        date: formatDate(record.date),
        checkIn: formatTime(record.checkIn),
        checkOut: formatTime(record.checkOut),
        workHours: calculateWorkHours(record.checkIn, record.checkOut),
        status: determineStatus(record.checkIn, record.checkOut),
      });
    });

    workBook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), `${fileName}.xlsx`);
    });

    handleExportDialogClose();
    toast.success("Export Data Successfully");
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Paper sx={{ maxWidth: '1200px', width: '100%', mx: 'auto', p: 3 }}>
        <Typography variant="h5" align="center" sx={{ mb: 2,  }}>
          Employee Attendance
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="Search"
            variant="standard"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ maxWidth: 300, flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleExportDialogOpen}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            Export
          </Button>
        </Box>

        <Dialog open={openExportDialog} onClose={handleExportDialogClose}>
          <DialogTitle>Export Attendance Data</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Export By</InputLabel>
              <Select
                value={exportType}
                label="Export by"
                onChange={(e) => setExportType(e.target.value)}
              >
                <MenuItem value="name">Employee Name</MenuItem>
                <MenuItem value="id">Employee ID</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            {exportType === "name" && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={exportValue}
                  label="Select Employee"
                  onChange={(e) => setExportValue(e.target.value)}
                >
                  {getUniqueValues("name").map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {exportType === "id" && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select ID</InputLabel>
                <Select
                  value={exportValue}
                  label="Select ID"
                  onChange={(e) => setExportValue(e.target.value)}
                >
                  {getUniqueValues("empID").map((id) => (
                    <MenuItem key={id} value={id}>
                      {id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {exportType === "month" && (
              <TextField
                fullWidth
                sx={{ mt: 2 }}
                type="month"
                value={exportValue}
                onChange={(e) => setExportValue(e.target.value)}
                label="Select Month"
              />
            )}
            {exportType === "year" && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Year</InputLabel>
                <Select
                  value={exportValue}
                  label="Select Year"
                  onChange={(e) => setExportValue(e.target.value)}
                >
                  {[...new Set(employees.map((emp) => new Date(emp.date).getFullYear()))]
                    .sort()
                    .map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportDialogClose}>Close</Button>
            <Button
              onClick={exportToExcel}
              variant="contained"
              disabled={!exportType || !exportValue}
            >
              Export Excel Sheet
            </Button>
          </DialogActions>
        </Dialog>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1e3a8a' }}>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Employee ID
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={orderBy === "name" ? order : "asc"}
                        onClick={() => handleRequestSort("name")}
                        sx={{
                          color: 'white',
                          '&.Mui-active': { color: 'white' },
                          '& .MuiTableSortLabel-icon': { color: 'white !important' },
                        }}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <TableSortLabel
                        active={orderBy === "date"}
                        direction={orderBy === "date" ? order : "asc"}
                        onClick={() => handleRequestSort("date")}
                        sx={{
                          color: 'white',
                          '&.Mui-active': { color: 'white' },
                          '& .MuiTableSortLabel-icon': { color: 'white !important' },
                        }}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Clock-In Time
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Clock-Out Time
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Work Hours
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        {searchQuery ? "No Matching record found" : "No Attendance data found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedEmployee
                      .slice(page * rowPerPage, page * rowPerPage + rowPerPage)
                      .map((record, index) => {
                        const date = formatDate(record.date);
                        const checkInTime = formatTime(record.checkIn);
                        const checkOutTime = formatTime(record.checkOut);
                        const workHours = calculateWorkHours(record.checkIn, record.checkOut);
                        const status = determineStatus(record.checkIn, record.checkOut);

                        const statusStyle =
                          status === "Present"
                            ? { color: '#16a34a', fontWeight: '600' }
                            : status === "Absent"
                            ? { color: '#dc2626', fontWeight: '600' }
                            : { color: '#666' };

                        return (
                          <TableRow key={index}>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {record.empID}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {record.name}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {record.department}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {date}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {checkInTime}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {checkOutTime}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                              {workHours}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid rgba(0,0,0,0.1)', ...statusStyle }}>
                              {status}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedEmployee.length}
              rowsPerPage={rowPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeAttendanceManagement;