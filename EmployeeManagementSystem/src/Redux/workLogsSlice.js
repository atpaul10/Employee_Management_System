import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";

export const fetchCurrentEmployeeWorkLogs = createAsyncThunk(
  "workLogs/fetchCurrentEmployeeWorkLogs",
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
      const workLogsRef = collection(db, "users", currentUser.uid, "workLogs");
      const snapshot = await getDocs(workLogsRef);
      const workLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tasks: Array.isArray(doc.data().tasks) ? doc.data().tasks : [],
      }));  
      return workLogs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllEmployeesWorkLogs = createAsyncThunk(
  "workLogs/fetchAllEmployeesWorkLogs",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const userRef = collection(db, "users");
      let workLogUnsubscribes = [];

      const unsubscribeUsers = onSnapshot(
        userRef,
        (usersSnapshot) => {
          workLogUnsubscribes.forEach((unsub) => unsub());
          workLogUnsubscribes = [];

          const allWorkLogs = [];
          usersSnapshot.docs.forEach((userDoc) => {
            const workLogsRef = collection(db, "users", userDoc.id, "workLogs");
            const unsubscribeWorkLogs = onSnapshot(
              workLogsRef,
              (workLogsSnapshot) => {
                const employeeWorkLogs = {
                  employeeId: userDoc.id,
                  employeeData: userDoc.data(),
                  workLogs: workLogsSnapshot.docs.map((logDoc) => ({
                    id: logDoc.id,
                    ...logDoc.data(),
                    tasks: Array.isArray(logDoc.data().tasks) ? logDoc.data().tasks : [],
                  })),
                };
                allWorkLogs.push(employeeWorkLogs);
                
                dispatch(updateAllEmployeesWorkLogs([...allWorkLogs]));
              },
              (error) => {
                console.error("Work logs snapshot error:", error);
                dispatch(rejectWithValue(error.message));
              }
            );
            workLogUnsubscribes.push(unsubscribeWorkLogs);
          });
        },
        (error) => {
          console.error("Users snapshot error:", error);
          dispatch(rejectWithValue(error.message));
        }
      );

      return () => {
        workLogUnsubscribes.forEach((unsub) => unsub());
        unsubscribeUsers();
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLog = createAsyncThunk(
  "workLogs/updateLog",
  async ({ logId, updatedTask, taskIndex }, { rejectWithValue }) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
      const logRef = doc(db, "users", currentUser.uid, "workLogs", logId);
      const docSnapshot = await getDoc(logRef);

      if (!docSnapshot.exists()) 
         toast.error("Work Log Not Found");

      const workLogData = docSnapshot.data();
      const updatedTasks = [...workLogData.tasks];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTask };

      await updateDoc(logRef, { tasks: updatedTasks });
      return { logId, taskIndex, updatedTask };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const workLogSlice = createSlice({
  name: "workLogs",
  initialState: {
    currentEmployeeWorkLogs: [],
    allEmployeesWorkLogs: [],
    loading: false,
    error: null,
    updating: false,
  },
  reducers: {
    updateAllEmployeesWorkLogs: (state, action) => {
      state.allEmployeesWorkLogs = action.payload; 
    },
    updateEmployeeWorkLogsRealTime: (state, action) => {
      const updatedEmployee = action.payload;
      const index = state.allEmployeesWorkLogs.findIndex(
        (emp) => emp.employeeId === updatedEmployee.employeeId
      );
      if (index !== -1) {
        state.allEmployeesWorkLogs[index] = {
          ...state.allEmployeesWorkLogs[index],
          workLogs: updatedEmployee.workLogs,
        };
      } else {
        state.allEmployeesWorkLogs.push(updatedEmployee);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentEmployeeWorkLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentEmployeeWorkLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployeeWorkLogs = action.payload;
      })
      .addCase(fetchCurrentEmployeeWorkLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLog.fulfilled, (state, action) => {
        state.updating = false;
        const { logId, taskIndex, updatedTask } = action.payload;
        const logIndex = state.currentEmployeeWorkLogs.findIndex((log) => log.id === logId);
        if (logIndex !== -1) {
          const newTasks = [...state.currentEmployeeWorkLogs[logIndex].tasks];
          newTasks[taskIndex] = { ...newTasks[taskIndex], ...updatedTask };
          state.currentEmployeeWorkLogs = [
            ...state.currentEmployeeWorkLogs.slice(0, logIndex),
            { ...state.currentEmployeeWorkLogs[logIndex], tasks: newTasks },
            ...state.currentEmployeeWorkLogs.slice(logIndex + 1),
          ];
        }
      })
      .addCase(updateLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllEmployeesWorkLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployeesWorkLogs.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchAllEmployeesWorkLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default workLogSlice.reducer;
export const { updateAllEmployeesWorkLogs, updateEmployeeWorkLogsRealTime } = workLogSlice.actions;