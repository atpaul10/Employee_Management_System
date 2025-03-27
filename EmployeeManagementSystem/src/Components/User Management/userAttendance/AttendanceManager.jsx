import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAttendanceData } from "../../../Redux/attendanceSlice";
import React from "react";
import { Box, CircularProgress, Grid2 } from "@mui/material";

const AttendanceManager = () => {
  const dispatch = useDispatch();
  const { checkins, loading } = useSelector((state) => state.attendance);
  const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

  useEffect(() => {
    if (currentUser) {
      // console.log("Fetching attedance data ", fetchAttendanceData)
      dispatch(fetchAttendanceData(currentUser));
    }
  }, [dispatch]);

  //  Format attendance history for display
  const formattedData = checkins.map((record) => ({
    ...record,
    date: record.date || "",
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
  }));
  return (
    <>
      <div className="flex flex-col items-center min-h-screen  py-6">
        <div className="w-full max-w-4xl bg-white rounded-lg p-6">
          {/* Attendance History Section */}
          <h2 className="text-xl font-semibold text-indigo-950 text-center mb-4">
            Attendance History
          </h2>
          {loading ? (
            <Box  display="grid" justifyContent="center" alignItems="center">
              <CircularProgress style={{color:"#40513B"}} size={30} thickness={5} />
            </Box>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-[#40513B] text-white">
                    <th className="px-4 py-2 border border-gray-200">Date</th>
                    <th className="px-4 py-2 border border-gray-200">Day</th>
                    <th className="px-4 py-2 border border-gray-200">Month</th>
                    <th className="px-4 py-2 border border-gray-200">
                      Clock-In Time
                    </th>
                    <th className="px-4 py-2 border border-gray-200">
                      Clock-Out Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formattedData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    formattedData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-100">
                        <td className="px-4 py-2 border border-gray-200">
                          {record.date}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {record.day}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {record.month}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {record.checkInTime}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {record.checkOutTime}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default AttendanceManager;