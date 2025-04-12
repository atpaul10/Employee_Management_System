import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployeesWorkLogs } from "../../../Redux/workLogsSlice";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box, TablePagination, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, TableSortLabel,} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import FilterListIcon from "@mui/icons-material/FilterList";


const EmployeeWorkLogs = () => {
  const dispatch = useDispatch();
  const { allEmployeesWorkLogs, loading } = useSelector((state) => state.workLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("");
  


  useEffect(() => {
    document.title = "Employee Work-Logs";
    let cleanup;
    // console.log("Dispatching fetchAllEmployeesWorkLogs...");
    dispatch(fetchAllEmployeesWorkLogs()).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        cleanup = result.payload;
        // console.log("Fetch fulfilled with payload:", result.payload);
      } else {
        console.log("Fetch failed or rejected:", result);
      }
    });
    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [dispatch]);

  const formatTimestampToDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return dayjs(date).format("DD-MM-YYYY");
  };
  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return duration;
  };
  const isNewLog = (rawDate) => {
    const now = dayjs().unix();
    const twentyFourHoursAgo = now - 24 * 60 * 60;
    return rawDate >= twentyFourHoursAgo;
  };
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const filterWorkLogs = useMemo(() => {
    const flatLogs = allEmployeesWorkLogs.flatMap((employee) =>
      employee.workLogs.flatMap((log) =>
        log.tasks.map((task, taskIndex) => ({
          employeeName: employee.employeeData.name,
          date: formatTimestampToDate(task.startTime),
          task: task.task || "N/A",
          description: task.description || "N/A",
          duration: task.duration,
          status: task.status || "N/A",
          department: task.department || "N/A",
          rawDate: task.startTime?.seconds || 0,
          employeeId: task.employeeId,
          logId: log.id,
          taskIndex,
        }))
      )
    );
    const filteredLogs = flatLogs.filter((log) => {
      const searchMatch =
        log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.task.toLowerCase().includes(searchTerm.toLowerCase());

      const fromTimestamp = fromDate
        ? dayjs(fromDate).startOf("day").unix() || -Infinity
        : -Infinity;
      const toTimestamp = toDate
        ? dayjs(toDate).endOf("day").unix() || Infinity
        : Infinity;
      const dateMatch =
        log.rawDate >= fromTimestamp && log.rawDate <= toTimestamp;

      return searchMatch && dateMatch;
    });

   return filteredLogs.sort((a, b) => {
      if (!orderBy) {
        return b.rawDate - a.rawDate; 
      }

      // Custom sorting based on user selection
      if (orderBy === 'rawDate') {
        return order === 'desc' ? b.rawDate - a.rawDate : a.rawDate - b.rawDate;
      }
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      return order === 'asc'
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  }, [allEmployeesWorkLogs, searchTerm, fromDate, toDate, order,orderBy]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setOpenDialog(false);
    setPage(0);
  };
  const handleOpenDialog = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleResetFilter = () => {
    setFromDate(null);
    setToDate(null);
    setTempFromDate(null);
    setTempToDate(null);
    setPage(0);
  };
  const isSearchDisabled = () => {
    if (!tempFromDate || !tempToDate) return true;
    return dayjs(tempToDate).isBefore(dayjs(tempFromDate));
  };

  const paginatedData = filterWorkLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading || !allEmployeesWorkLogs) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom align="center" color="textPrimary">
        Employee Work Logs
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", m: 3 }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          variant="standard"
        />
        <Button
          variant="text"
          startIcon={<FilterListIcon />}
          onClick={fromDate || toDate ? handleResetFilter : handleOpenDialog}
          sx={{ minWidth: 100 }}
        >
          {fromDate || toDate ? "Reset Filter" : "Filter"}
        </Button>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From Date"
                  value={tempFromDate}
                  onChange={(newValue) => setTempFromDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} size="small" />
                  )}
                  maxDate={tempToDate || dayjs()}
                />
                <DatePicker
                  label="To Date"
                  value={tempToDate}
                  onChange={(newValue) => setTempToDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} size="small" />
                  )}
                  minDate={tempFromDate}
                  maxDate={dayjs()}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button
              onClick={handleSearch}
              variant="contained"
              disabled={isSearchDisabled()}
            >
              Search
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: "95%", margin: "auto", border: "1px soild #e0e0e0" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#0d1667" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", borderBottom: "2px solid #e0e0e0", color: "whitesmoke",}}>
                <TableSortLabel
                  active={orderBy === "employeeName"}
                  direction={orderBy === "employeeName" ? order : "asc"}
                  onClick={() => handleRequestSort("employeeName")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}
                >
                  Employee Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{fontWeight: "bold",borderBottom: "2px solid #e0e0e0",color: "whitesmoke",}} >
                <TableSortLabel
                  active={orderBy === "rawDate"}
                  direction={orderBy === "rawDate" ? order : "asc"}
                  onClick={() => handleRequestSort("rawDate")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}>
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{fontWeight: "bold",borderBottom: "2px solid #e0e0e0",color: "whitesmoke",}}>
                <TableSortLabel
                  active={orderBy === "task"}
                  direction={orderBy === "task" ? order : "asc"}
                  onClick={() => handleRequestSort("task")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}>
                  Task
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderBottom: "2px solid #e0e0e0",
                  color: "whitesmoke",
                }}
              >
                <TableSortLabel
                  active={orderBy === "description"}
                  direction={orderBy === "description" ? order : "asc"}
                  onClick={() => handleRequestSort("description")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderBottom: "2px solid #e0e0e0",
                  color: "whitesmoke",
                }}
              >
                <TableSortLabel
                  active={orderBy === "duration"}
                  direction={orderBy === "duration" ? order : "asc"}
                  onClick={() => handleRequestSort("duration")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}
                >
                  Total Hours
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderBottom: "2px solid #e0e0e0",
                  color: "whitesmoke",
                }}
              >
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderBottom: "2px solid #e0e0e0",
                  color: "whitesmoke",
                }}
              >
                <TableSortLabel
                  active={orderBy === "department"}
                  direction={orderBy === "department" ? order : "asc"}
                  onClick={() => handleRequestSort("department")}
                  sx={{
                    color: "whitesmoke", 
                    "&:hover": { color: "white" }, 
                    "&.Mui-active": { color: "white" }, 
                    "& .MuiTableSortLabel-icon": { color: "white !important" } 
                  }}>
                  Department
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filterWorkLogs.length > 0 ? (
              paginatedData.map((log, index) => (
                <TableRow
                  key={`${log.employeeId}-${log.logId}-${log.taskIndex}-${index}`}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor: isNewLog(log.rawDate)
                  }}
                >
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {log.employeeName}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {log.date}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {log.task}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {log.description}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {formatDuration(log.duration)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {log.status}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {log.department}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body" color="textSecondary">
                    No data found for the applied Filter....
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filterWorkLogs.length > 0 && !loading && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={filterWorkLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </Box>
  );
};
export default EmployeeWorkLogs;
