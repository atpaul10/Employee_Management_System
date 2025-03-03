import { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { collection, query, where, onSnapshot} from "firebase/firestore";

const useAttendanceData = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCheckinToday, setTotalCheckinToday]=useState(0)
  const [totalCheckoutToday, setTotalCheckoutToday]=useState(0)

  useEffect(() => {
    const subscribeToRealTimeUpdates = () => {
      setLoading(true);
      try {
        const usersQuery = query(collection(db, "users"), where("role", "==", "User"));
        const unsubscribe = onSnapshot(usersQuery, (usersSnapshot) => {
          const users = usersSnapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          }));

          const employeeDetailsQuery = collection(db, "employeeDetails");
          const unsubscribeDetails = onSnapshot(employeeDetailsQuery, (detailsSnapshot) => {
            const allEmployeeDetails = detailsSnapshot.docs.map((doc) => ({
              ...doc.data(),
            }));

            const employeeMap = {};
            let checkInCount =  0;
            let checkOutCount =  0
            let pendingSnapshots = users.length

            users.forEach((user) => {
              const matchedDetails = allEmployeeDetails.find(
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
                if (!attendanceRecords.some((record) => new Date(record.date).toLocaleDateString() === today)) {
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
                      empID: matchedDetails?.employeeId || "N/A",
                      name: matchedDetails?.fullName || user.name || "Unknown",
                      department: matchedDetails?.department || "N/A",
                      date: record.date,
                      checkIn: record.checkIn,
                      checkOut: record.checkOut,
                    };
                  } else {
                    employeeMap[key].checkIn = employeeMap[key].checkIn || record.checkIn;
                    employeeMap[key].checkOut = employeeMap[key].checkOut || record.checkOut;
                  }

                  if (recordDate === today) {
                    if (record.checkIn) checkInCount++;
                    if (record.checkOut) checkOutCount++;
                  }
                });
                pendingSnapshots --
                if (pendingSnapshots === 0) {
                  const flattenedData = Object.values(employeeMap).flat();
                  flattenedData.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                  setEmployees(flattenedData);
                  setLoading(false);
                  setTotalCheckinToday(checkInCount);
                  setTotalCheckoutToday(checkOutCount);
                }
              });
            }); 
          });

          return unsubscribeDetails;
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error subscribing to real-time updates:", error);
        setLoading(false);
      }
    };
    const unsubscribe = subscribeToRealTimeUpdates();
    return () => unsubscribe && unsubscribe();
  }, []);

  return { employees, loading,totalCheckinToday,totalCheckoutToday };
};
export default useAttendanceData;