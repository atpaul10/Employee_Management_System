import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAttendanceData } from "../../../Redux/attendanceSlice";
import React from "react";
import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TableSortLabel,TablePagination, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs";
import FilterListIcon from '@mui/icons-material/FilterList';

const AttendanceManager = () => {
  const dispatch = useDispatch();
  const { checkins, loading } = useSelector((state) => state.attendance);
  const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("rawDate");
  const [searchTerm ,setSearchTerm]= useState("")
  const [openFilterDialog , setOpenFilterDialog] = useState(false)
  const [filteredOption, setFilterOption ] =  useState({fromDate: null, toDate: null, month:""})


  useEffect(() => {
    document.title=("Attendance History")
    if (currentUser) {
      dispatch(fetchAttendanceData(currentUser));
    }
  }, [dispatch]);

  const formattedData = checkins.map((record) => ({
    ...record,
    date: record.date ? new Date(record.date).toLocaleDateString("en-US") : "",
    checkInTime: record.checkIn
      ? new Date(record.checkIn).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    checkOutTime: record.checkOut
      ? new Date(record.checkOut).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    day: record.date
      ? new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })
      : "",
    month: record.date
      ? new Date(record.date).toLocaleDateString("en-US", { month: "long" })
      : "",
    rawDate: record.date ? new Date(record.date) : null,
  }));
  
  const filteredData = formattedData.filter((record) => {
    const matchesSearch = [record.date, record.day, record.month].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const recordDate = dayjs(record.rawDate);
    const { fromDate, toDate, month } = filteredOption;

    const matchesFromDate = fromDate
         ? recordDate.isSame(dayjs(fromDate), "day") || recordDate.isAfter(dayjs(fromDate), "day")
         : true;
       const matchesToDate = toDate
         ? recordDate.isSame(dayjs(toDate), "day") || recordDate.isBefore(dayjs(toDate), "day")
         : true;
       const matchesMonth = month
         ? record.month.toLowerCase() === month.toLowerCase()
         : true;

    return matchesSearch && matchesFromDate && matchesToDate && matchesMonth;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortData = (data, comparator) => {
    const stabilizedThis = data.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const orderResult = comparator(a[0], b[0]);
      if (orderResult !== 0) return orderResult;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "rawDate") {
      if (!a[orderBy] || !b[orderBy]) return 0;
      return b[orderBy] - a[orderBy];
    }
    if (orderBy === "checkInTime" || orderBy === "checkOutTime") {
      const timeA = a[orderBy] === "-" ? "" : a[orderBy];
      const timeB = b[orderBy] === "-" ? "" : b[orderBy];
      return timeB.localeCompare(timeA);
    }
    return b[orderBy].localeCompare(a[orderBy]);
  };

  // Sorted and paginated data
  const sortedData = sortData(filteredData, getComparator(order, orderBy));
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = (event)=>{
    setSearchTerm(event.target.value)
    setPage(0)
  }
  const handleFilterOpen = ()=> setOpenFilterDialog(true)
  const handleFilterClose = ()=> setOpenFilterDialog(false)
  const handleFilterApply = ()=> {
    setOrder("asc")
    setOrderBy("rawDate")
    setPage(0)
    setOpenFilterDialog(false)
  }
  const handleFilterRest =()=>{
    setFilterOption({ fromDate: null, toDate: null, month: "" });
    setOrder("desc")
    setOrderBy("rawDate")
    setPage(0)
  }
  const isFilterActive = filteredOption.fromDate || filteredOption.toDate || filteredOption.month
  return (
    <Box sx={{ minHeight: "100vh", padding: 3 }}>
        {/* Attendance History Section */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#40513B",
            textAlign: "center",
            mb: 3,
          }}
        >
          Attendance History
        </Typography>

        <Box sx={{maxWidth:"500px", margin:"0 auto 20px", display:"flex", gap:2}}>
          <TextField 
          fullWidth 
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ 
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#40513B" },
              "&:hover fieldset": { borderColor: "#40513B" },
              "&.Mui-focused fieldset": { borderColor: "#40513B" },
            },
            "& .MuiInputLabel-root": { color: "#40513B" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#40513B" },
          }}
          >
          </TextField>
          <Button variant="contained"startIcon={<FilterListIcon/>} onClick={isFilterActive ? handleFilterRest : handleFilterOpen} sx={{background:"#40513B","&:hover": { backgroundColor: "#33402F" } }}>
          {isFilterActive ? "Reset" : "Filter"}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress sx={{ color: "#40513B" }} size={30} thickness={5} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="attendance table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#40513B" }}>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel
                        active={orderBy === "rawDate"}
                        direction={orderBy === "rawDate" ? order : "asc"}
                        onClick={() => handleRequestSort("rawDate")}
                        sx={{
                          color: "white !important",
                          "&:hover": { color: "white" },
                          "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel
                        active={orderBy === "day"}
                        direction={orderBy === "day" ? order : "asc"}
                        onClick={() => handleRequestSort("day")}
                        sx={{
                          color: "white !important",
                          "&:hover": { color: "white" },
                          "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                      >
                        Day
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel
                        active={orderBy === "month"}
                        direction={orderBy === "month" ? order : "asc"}
                        onClick={() => handleRequestSort("month")}
                        sx={{
                          color: "white !important",
                          "&:hover": { color: "white" },
                          "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                      >
                        Month
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel
                        active={orderBy === "checkInTime"}
                        direction={orderBy === "checkInTime" ? order : "asc"}
                        onClick={() => handleRequestSort("checkInTime")}
                        sx={{
                          color: "white !important",
                          "&:hover": { color: "white" },
                          "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                      >
                        Clock-In Time
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel
                        active={orderBy === "checkOutTime"}
                        direction={orderBy === "checkOutTime" ? order : "asc"}
                        onClick={() => handleRequestSort("checkOutTime")}
                        sx={{
                          color: "white !important",
                          "&:hover": { color: "white" },
                          "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                      >
                        Clock-Out Time
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography sx={{ py: 2 }}>
                          {searchTerm || filteredOption.fromDate || filteredOption.toDate || filteredOption.month ? "No matching attendance record found":"No attendance record found"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow
                        key={record.id}
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.day}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>{record.checkInTime}</TableCell>
                        <TableCell>{record.checkOutTime}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Dialog open={openFilterDialog} onClose={handleFilterOpen}>
            <DialogTitle>Filter Attendance Record</DialogTitle>
            <DialogContent>
              <Box sx={{display:"flex", flexDirection:"column",gap:2,mt:2}}>
                <DatePicker 
                  label= "From Date"
                  value={filteredOption.fromDate}
                  onChange={(newValue)=> setFilterOption((prev)=> ({...prev,fromDate:newValue}))}
                  renderInput={(params)=> <TextField {...params} fullWidth/>}
                />
                <DatePicker
                  label = "To Date"
                  value={filteredOption.toDate}
                  onChange={(newValue) => setFilterOption((prev) => ({ ...prev, toDate: newValue }))}
                  renderInput = {(params)=> <TextField {...params} fullWidth/>}
                />
              <TextField
                label="Month"
                value={filteredOption.month}
                onChange={(e) =>
                  setFilterOption((prev) => ({ ...prev, month: e.target.value }))
                }
                placeholder="e.g., January"
                fullWidth
              />
              </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFilterClose}>Cancel</Button>
                <Button onClick={handleFilterApply} color="primary">
                  Apply
                </Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>
    </Box>
  );
};

export default AttendanceManager;