import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
const initialState = {
  checkins: [],
  loading: false,
  error: null,
  hasCheckedIn: false,
  hasCheckedOut: false,
  notCheckedInCount: 0
};
export const checkInOut = createAsyncThunk(
  'attendance/checkInOut',
  async ({ type, currentUser }, { dispatch }) => {
    try {
      if (!currentUser || !currentUser.uid) {
        throw new Error("Invaid User. Please Log in. ")
      }
      const db = getFirestore()
      const checkinsRef = collection(db, "users", currentUser.uid, "checkins");
      const today = new Date().toLocaleDateString("en-CA");
      const q = query(checkinsRef, where("date", "==", today))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const checkinDocRef = doc(db, "users", currentUser.uid, "checkins", docId)
        const existingData = querySnapshot.docs[0].data();

        if (type === "check-in") {
          toast.error("Clock-In already recorded for toady.")
          return;
        }
        if (type === "check-out") {
          if (existingData.checkOut) {
            toast.error("Clock-Out already recorded for today.")
            return;
          }
          await setDoc(checkinDocRef, { checkOut: serverTimestamp() }, { merge: true });
          toast.success("Clock-Out recorded Successfully")
          dispatch(setHasCheckedIn(false))
          dispatch(setHasCheckedOut(true))
        }
      } else {
        if (type === "check-in") {
          await setDoc(doc(checkinsRef), {
            date: today,
            checkIn: serverTimestamp(),
            checkOut: null,
            status: "Present"
          })  
          toast.success("Clock-in recorded Successfully")
          dispatch(setHasCheckedIn(true))
        } else {
          toast.error("You Need to Clock-in first ")
        }
      }
      dispatch(fetchAttendanceData(currentUser))
    } catch (error) {
      console.error(`Error Prosseing ${type}:`, error)
      toast.error(`Failed to record ${type}. Please try again.`);
    }
  }
)
export const fetchAttendanceData = createAsyncThunk(
  "attendance/fetchAttendanceData",
  async (currentUser, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const db = getFirestore();
      const today = new Date().toLocaleDateString("en-CA");

      /* Fetch individual attendance history in the user */
      if (currentUser && currentUser.uid) {
        const checkinsRef = collection(db, "users", currentUser.uid, "checkins");
        const snapshot = await getDocs(checkinsRef);

        const data = snapshot.docs.map((doc) => {
          const record = doc.data();
          return {
            id: doc.id,
            ...record,
            checkIn: record?.checkIn?.toMillis ? record.checkIn.toMillis() : null,
            checkOut: record?.checkOut?.toMillis ? record.checkOut.toMillis() : null,
          };
        });

        dispatch(setCheckins(data));

        const todayRecord = data.find((record) => record.date === today);
        const hasCheckedInToday = todayRecord?.checkIn ? true : false;
        const hasCheckedOutToday = todayRecord?.checkOut ? true : false;

        dispatch(setHasCheckedIn(hasCheckedInToday));
        dispatch(setHasCheckedOut(hasCheckedOutToday));
      }

      const userRef = collection(db, "users");
      const usersSnapshot = await getDocs(userRef);
      const allEmployees = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((employee)=>employee.role ==="User")

      
      let checkedInUsers = new Set();
      await Promise.all(
        allEmployees.map(async (employee) => {
          const checkinsRef = collection(db, "users", employee.id, "checkins");
          const q = query(checkinsRef, where("date", "==", today));
          const snapShot = await getDocs(q);

          if (!snapShot.empty) {
            checkedInUsers.add(employee.id);
          }
        })
      );

      const employeesNotCheckedIn = allEmployees.length - checkedInUsers.size;
      dispatch(setCheckinsCount(employeesNotCheckedIn));
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance history");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setCheckins: (state, action) => {
      state.checkins = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setHasCheckedIn: (state, action) => {
      state.hasCheckedIn = action.payload;
    },
    setHasCheckedOut: (state,action)=>{
      state.hasCheckedOut = action.payload;
    },
    setCheckinsCount: (state, action) => {
      state.notCheckedInCount = action.payload;
    }

  },
});
export const { setCheckins, setLoading, setError, setHasCheckedIn ,setHasCheckedOut,setCheckinsCount} = attendanceSlice.actions;
export default attendanceSlice.reducer;