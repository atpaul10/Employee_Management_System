import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../../Redux/employeeSlice";
import { fetchAllPendingLeaves } from "../../../Redux/leaveSlice";
import { fetchAttendanceData } from "../../../Redux/attendanceSlice";
import GreetingMessage from "../../../utils/GreetingMessage";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import CountUp from "react-countup";
import useAttendanceData from "../employeeAttedanceMangement/Hooks/useAttendance";
import { Timestamp } from "firebase/firestore";
import DailyThoughts from "../../DailyThoughts/DailyThoughts";
import PendingLeaveRequest from "../../../utils/PendingLeaveList";
import HolidayCalendar from "../../../HoildayCalendar/hoildayCalendar";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employee.employees);
  const departmentWiseCount = useSelector(
    (state) => state.employee.departmentWiseCount
  );
  // const pendingLeaveCount = useSelector((state) => state.leave.pendingLeaveCount);
  const { pendingLeaveCount, pendingLeaveDetails } = useSelector(
    (state) => state.leave
  );
  const totalEmployees = employees.length;
  const totalDepartment = Object.keys(departmentWiseCount).length;
  const totalPendingLeaves = pendingLeaveCount ? pendingLeaveCount : 0;
  const notCheckinToady = useSelector(
    (state) => state.attendance.notCheckedInCount
  );
  const upcomingBirthday = useSelector(
    (state) => state.employee.upcomingBirthday
  );

  const {
    employees: attendanceRecords,
    totalCheckinToday,
    totalCheckoutToday,
  } = useAttendanceData();

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchAllPendingLeaves());
    dispatch(fetchAttendanceData());
    document.title = "Admin Dashoard";
  }, [dispatch]);

  const departmentPieChartData = {
    labels: Object.keys(departmentWiseCount),
    datasets: [
      {
        label: "Employees",
        data: Object.values(departmentWiseCount),
        backgroundColor: [
          "#1976d2",
          "#4caf50",
          "#f44336",
          "#ff9800",
          "#9c27b0",
          "#00bcd4",
          "#8bc34a",
          "#ffc107",
          "#795548",
          "#607d8b",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        color: "white", 
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceTimeTrend = attendanceRecords
    .filter((record) => {
      const checkInDate = record.checkIn
        ? new Date(record.checkIn.toDate())
        : null;
      const checkOutDate = record.checkOut
        ? new Date(record.checkOut.toDate())
        : null;

      return (
        (checkInDate && checkInDate >= today) ||
        (checkOutDate && checkOutDate >= today)
      );
    })
    .map((record) => [
      record.checkIn
        ? {
            time: formatTime(record.checkIn),
            timeValue: getTimeValue(record.checkIn),
            type: "Check-In",
          }
        : null,
      record.checkOut
        ? {
            time: formatTime(record.checkOut),
            timeValue: getTimeValue(record.checkOut),
            type: "Check-Out",
          }
        : null,
    ])
    .flat()
    .filter(Boolean);

  const checkInCount = {};
  const checkOutCount = {};
  attendanceTimeTrend.forEach((item) => {
    if (item.type === "Check-In") {
      checkInCount[item.time] = (checkInCount[item.time] || 0) + 1;
    } else if (item.type === "Check-Out") {
      checkOutCount[item.time] = (checkOutCount[item.time] || 0) + 1;
    }
  });
  const sortedTimeLabels = [
    ...new Set(Object.keys(checkInCount).concat(Object.keys(checkOutCount))),
  ].sort((a, b) => new Date(a) - new Date(b));

  // Prepare grouped bar chart data
  const groupedBarChartData = {
    labels: sortedTimeLabels,
    datasets: [
      {
        label: "Check-Ins",
        data: sortedTimeLabels.map((time) => checkInCount[time] || 0),
        backgroundColor: "#4caf50",
        borderRadius: 5,
      },
      {
        label: "Check-Outs",
        data: sortedTimeLabels.map((time) => checkOutCount[time] || 0),
        backgroundColor: "#f44336",
        borderRadius: 5,
      },
    ],
  };
  const options = {
    indexAxis: "y",
    responsive: true,
    maintaninAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  function formatTime(time) {
    if (time instanceof Timestamp) {
      time = time.toDate();
    }
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getTimeValue(time) {
    if (time instanceof Timestamp) {
      time = time.toDate();
    }
    return time.getTime();
  }

  // console.log("Attendance record",attendanceRecords)
  return (
    <>
      {/* Greeting Message at the top */}
      <Box sx={{ marginBottom: 3 }}>
        <GreetingMessage />
      </Box>
      <DailyThoughts />

      {/* Dashboard Stats Section */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {[
          { title: "Total Employees", value: totalEmployees },
          { title: "Total Department", value: totalDepartment },
          { title: "Pending Leaves", value: totalPendingLeaves },
          { title: "Absent Today", value: notCheckinToady },
          { title: "Total Clock-In Today", value: totalCheckinToday },
          { title: "Total Clock-Out Today", value: totalCheckoutToday },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Box
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: 2,
                borderRadius: 2,
                boxShadow: 2,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: "150px",
              }}
            >
              <Typography variant="h6">{stat.title}</Typography>
              <Typography variant="h4">
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  separator=","
                  delay={index * 0.2}
                  decimal={stat.value % 1 !== 0 ? 2 : 0}
                />
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ marginTop: 6, width: "100%", display: "flex", gap: 4 }}>
        {/* pie graph section  */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              <strong>Employee Distribution by Department</strong>
            </Typography>
            <Pie data={departmentPieChartData} options={pieChartOptions} />
          </Grid>

          {/* upcoming birthday section*/}
          <Grid item xs={12} md={6} sx={{ padding: 2 }}>
            <Card
              sx={{ height: 150, width: 250, padding: 2, overflowY: "auto" }}
            >
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                {" "}
                Upcoming Birthday{" "}
              </Typography>
              {upcomingBirthday.length > 0 ? (
                upcomingBirthday
                  .filter(
                    (employee) => employee !== null && employee !== undefined
                  )
                  .map((employee) => (
                    <CardContent
                      key={employee.id}
                      sx={{
                        padding: "8px 0",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography>
                        {employee?.fullName || "----"} -{" "}
                        {employee?.day || "----"} {employee?.month || "---"}
                      </Typography>
                    </CardContent>
                  ))
              ) : (
                <Typography color="textSecondary">
                  No Upcoming Birthdays
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/*  Check-In & Check-Out Trends and Holiday calendar */}
      <Box sx={{ marginTop: 6, width: "100%" }}>
        <Grid container spacing={3}>
          {/* Holiday calendar */}
          <Grid item xs={12} md={4}>
            {/* <Box sx={{width:"100%",textAlign:"center", maxWidth:400, maxHeight:300}}> */}
              <HolidayCalendar countryCode="IN" year={2025} />
            {/* </Box> */}
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ width: "100%", maxWidth:600, maxHeight:300,textAlign: "center" }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                <strong>Clock-In & Clock-Out Trends</strong>
              </Typography>
              <Bar data={groupedBarChartData} options={options} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* <Box sx={{ marginTop: 6, width: "100%", maxWidth: 500, height: 250 
      </Box> */}
      <PendingLeaveRequest pendingLeaves={pendingLeaveDetails} />
    </>
  );
};
export default AdminDashboard;
