import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployeesWorkLogs } from "../../../Redux/workLogsSlice"; 
import {Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Typography,CircularProgress,Box, TablePagination, TextField, duration,} from "@mui/material";

const EmployeeWorkLogs = () => {
  const dispatch = useDispatch();
  const { allEmployeesWorkLogs, loading,} = useSelector((state) => state.workLogs);
  const [searchTerm, setSearchTerm] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate,setToDate] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  useEffect(() => {
    let cleanup;
    console.log("Dispatching fetchAllEmployeesWorkLogs...");
    dispatch(fetchAllEmployeesWorkLogs()).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        cleanup = result.payload;
        console.log("Fetch fulfilled with payload:", result.payload);
      } else {
        console.log("Fetch failed or rejected:", result);
      }
    });
    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [dispatch])
    
  const formatTimestampToDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000); 
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return duration;
  };
  const isNewLog = (rawDate)=>{
    const now = Date.now() / 1000;
    const twentyFourHoursAgo = now - 24 * 60 * 60 
    return rawDate >= twentyFourHoursAgo
  }
  const filterWorkLogs = useMemo(()=>{
    const flatLogs = allEmployeesWorkLogs.flatMap((employee)=>
      employee.workLogs.flatMap((log)=>
        log.tasks.map((task,taskIndex)=>({
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
          taskIndex
        }))
      ) 
    )
      const filteredLogs = flatLogs.filter((log)=>{
        const searchMatch = 
        log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.task.toLowerCase().includes(searchTerm.toLowerCase())

        const fromTimestamp = fromDate
        ? Math.floor(new Date(fromDate).setHours(0, 0, 0, 0) / 1000) || -Infinity
        : -Infinity;
      const toTimestamp = toDate
        ? Math.floor(new Date(toDate).setHours(23, 59, 59, 999) / 1000) || Infinity
        : Infinity;
      const dateMatch = log.rawDate >= fromTimestamp && log.rawDate <= toTimestamp;

        return searchMatch && dateMatch
      })
      return filteredLogs.sort((a, b) => b.rawDate - a.rawDate) 
  },[allEmployeesWorkLogs,searchTerm,fromDate,toDate])

  const handleChangePage = (event,newPage)=>{
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event)=>{
    setRowsPerPage(parseInt(event.target.value,10))
    setPage(0)
  }
  const paginatedData = filterWorkLogs.slice(page* rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (loading  || !allEmployeesWorkLogs) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom align="center" color="textPrimary">
        Employee Work Logs
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", m:3}}>
      <TextField
          label = "Search"
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          size="small"
          sx={{minWidth: 300}}
       />
      <TextField
        label= "From Date"
        type="date"
        value={fromDate}
        onChange={(e)=>setFromDate(e.target.value)}
        size="small"
        InputLabelProps={{shrink:true}}
        sx={{minWidth: 300}}
      />
      <TextField
        label= "To Date"
        type="date"
        value={toDate}
        onChange={(e)=>setToDate(e.target.value)}
        size="small"
        InputLabelProps={{shrink:true}}
        sx={{minWidth: 300}}
      />  
    </Box>
    <TableContainer 
    component={Paper}
    sx={{maxWidth: "95%", margin:"auto", border:"1px soild #e0e0e0"}}>

    <Table>
    <TableHead sx={{backgroundColor:"#0d1667"}}>
        <TableRow>
            <TableCell sx={{ fontWeight: "bold",borderBottom: "2px solid #e0e0e0",color:"whitesmoke"}}>Employee Name</TableCell>
            <TableCell sx={{fontWeight: "bold",borderBottom: "2px solid #e0e0e0",color:"whitesmoke"}}>Date </TableCell>
            <TableCell sx={{ fontWeight: "bold", borderBottom: "2px solid #e0e0e0",color:"whitesmoke"}}>Task </TableCell>
            <TableCell sx={{fontWeight: "bold", borderBottom: "2px solid #e0e0e0",color:"whitesmoke"}}> Description</TableCell>
            <TableCell sx={{fontWeight: "bold", borderBottom: "2px solid #e0e0e0",color:"whitesmoke"}}>  Total Hours </TableCell>
            <TableCell sx={{fontWeight: "bold",borderBottom: "2px solid #e0e0e0",color:"whitesmoke"}}> Status </TableCell>
            <TableCell sx={{ fontWeight: "bold",borderBottom: "2px solid #e0e0e0", color:"whitesmoke"}} > Department </TableCell>
        </TableRow>
    </TableHead>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={7} align="center"><CircularProgress/></TableCell>
        </TableRow>
      ) : filterWorkLogs.length > 0 ? (
        paginatedData.map((log,index)=>(
          <TableRow key={`${log.employeeId}-${log.logId}-${log.taskIndex}-${index}`}
          sx={{
            "&:last-child td, &:last-child th": { border: 0 },
            backgroundColor: isNewLog(log.rawDate) ? "#e8f5e9" : "inherit",
          }}>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {log.employeeName}</TableCell>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {log.date}</TableCell>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {log.task}</TableCell>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {log.description}</TableCell>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {formatDuration(log.duration)}</TableCell>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {log.status}</TableCell>
            <TableCell sx={{borderBottom:"1px solid #e0e0e0"}}> {log.department}</TableCell>
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
        rowsPerPageOptions={[5,10,20]}
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