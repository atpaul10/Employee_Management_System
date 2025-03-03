import { createSlice,createAsyncThunk,  } from "@reduxjs/toolkit";
import { db } from "../firebase";
import { collection,getDocs,addDoc,doc, getDoc, updateDoc, startAfter, } from "firebase/firestore";
import { toast } from "react-toastify";
import { calculateLeaveDays } from "../utils/CalculateLeavesDays";

 const initialLeaveBalances = {
    Casual: 10,
    Sick: 10,
    Earned: 10
}
export const fetchLeaveRequests = createAsyncThunk(
    "leave/fetchLeaveRequest",
    async(userId,{rejectWithValue})=>{
        try {
            const leaveCollection = collection(db,`users/${userId}/leaveRequest`)
            const leaveRequests = []
            const querySnapshot = await getDocs(leaveCollection)
            querySnapshot.forEach((doc)=>{
                leaveRequests.push({id:doc.id, ...doc.data()})
            })
          return leaveRequests
        } catch (error) {
            return rejectWithValue(error.mesage)    
        }
    }
);
export const addLeaveRequest = createAsyncThunk(
    "leave/addLeaveRequest",
    async({ userId, leaveData }, { rejectWithValue, dispatch }) => {
      try {
        const leaveDays = calculateLeaveDays(leaveData.startDate, leaveData.endDate)
  
        // Get user reference and check if leaveBalance exists
        const userRef = doc(db, `users/${userId}`);
        const userSnapshot = await getDoc(userRef);
        const currentData = userSnapshot.data();
  
        // If leaveBalance does not exist, initialize with default values
        if (!currentData.leaveBalance) {
          await updateDoc(userRef, {
           leaveBalance: initialLeaveBalances
          });
        }
        // Re-fetch user data after updating the leaveBalance
        const updatedUserSnapshot = await getDoc(userRef);
        const updatedUserData = updatedUserSnapshot.data();
  
        // Check if leave balance is sufficient
        if (updatedUserData.leaveBalance[leaveData.leaveType] < leaveDays) {
          toast.error("Insufficient leave balance");
          return rejectWithValue("Insufficient leave balance")   
        }
        // Calculate new leave balance after the request
        const newBalance = updatedUserData.leaveBalance[leaveData.leaveType] - leaveDays;
  
        // Update the users leave balance
        await updateDoc(userRef, { [`leaveBalance.${leaveData.leaveType}`]: newBalance });
        const finalUserSnapshot = await getDoc(userRef);
        const finalUserData = finalUserSnapshot.data();

        dispatch(updateLeaveBalance(finalUserData.leaveBalance));
           // Add leave request to the user's collection with leaveDays included
             const userLeaveRef = collection(db, `users/${userId}/leaveRequest`);
             await addDoc(userLeaveRef, { ...leaveData, leaveDays });   

        // Fetch updated leave requests
        dispatch(fetchLeaveRequests(userId));
  
        return { ...leaveData, leaveDays };

      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  // export const fetchAllPendingLeaves = createAsyncThunk(
  //   "leave/fetchAllPendingLeaves",
  //   async (_, { rejectWithValue }) => {
  //     try {
  //       const usersCollection = collection(db, "users");
  //       const usersSnapshot = await getDocs(usersCollection);
        
  //       // Fetch pending leave counts for all users in parallel
  //       const pendingLeaveCountPromises = usersSnapshot.docs.map(async (userDoc) => {
  //         const leaveCollection = collection(db, `users/${userDoc.id}/leaveRequest`);
  //         const leaveSnapshot = await getDocs(leaveCollection);
          
  //         // Count only the leave requests that have "Pending" status
  //         return leaveSnapshot.docs.filter((doc) => doc.data().status === "Pending").length;
  //       });
  
  //       const pendingLeaveCounts = await Promise.all(pendingLeaveCountPromises);
        
  //       // Calculate total pending leave count
  //       const totalPendingLeaves = pendingLeaveCounts.reduce((sum, count) => sum + count, 0);
  
  //       return totalPendingLeaves;
  //     } catch (error) {
  //       return rejectWithValue(error.message);
  //     }
  //   }
  // );
  
  export const fetchAllPendingLeaves = createAsyncThunk(
    "leave/fetchAllPendingLeaves",
    async (_, { rejectWithValue }) => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        
        let totalPendingLeaves = 0;
        let pendingLeaveDetails = [];
  
        // Fetch pending leave requests for all users
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const leaveCollection = collection(db, `users/${userId}/leaveRequest`);
          const leaveSnapshot = await getDocs(leaveCollection);
  
          const userPendingLeaves = leaveSnapshot.docs
            .filter((doc) => doc.data().status === "Pending")
            .map((doc) => ({
              id: doc.id,
              userId,
              ...doc.data(),
            }));
  
          totalPendingLeaves += userPendingLeaves.length;
          pendingLeaveDetails.push(...userPendingLeaves);
        }
  
        return { totalPendingLeaves, pendingLeaveDetails };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
const leaveSlice = createSlice({
    name:"leave",
    initialState:{
        leaveRequests: [],
        leaveBalance:{...initialLeaveBalances},
        loading: false,
        error: null,
        pendingLeaveCount: 0,
        pendingLeaveDetails: [],
        status: "idle"
    },
    reducers:{
        updateLeaveBalance:(state , action )=>{
            state.leaveBalance = action.payload
        }
    },
    extraReducers:(builder)=>{
        builder
        // fetchLeaveRequests
        .addCase(fetchLeaveRequests.pending,(state)=>{
            state.loading = true
            state.error = null
            state.status = "loading"
        })
        .addCase(fetchLeaveRequests.fulfilled,(state,action)=>{
            state.loading = false,
            state.leaveRequests = action.payload
            state.status ="Succeeded"
        })
        .addCase(fetchLeaveRequests.rejected,(state,action)=>{
            state.loading = false
            state.error = action.payload
            state.status = "Rejected"
        })
        // addLeaveRequest
        .addCase(addLeaveRequest.pending,(state,)=>{
          state.loading = true
          state.error = null
          state.status = "loading"          
        })
        .addCase(addLeaveRequest.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.status = "Rejected"
        })
        .addCase(addLeaveRequest.fulfilled,(state,action)=>{
            state.leaveRequests.push(action.payload)
            state.status ="Succeeded"
        })
        // fetchAllPendingLeaves
        .addCase(fetchAllPendingLeaves.fulfilled,(state,action)=>{
          // state.pendingLeaveCount = action.payload;
        state.pendingLeaveCount = action.payload.totalPendingLeaves;
         state.pendingLeaveDetails = action.payload.pendingLeaveDetails;

          state.status ="Succeeded"
        })
        .addCase(fetchAllPendingLeaves.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.status = "loading"
        })
        .addCase(fetchAllPendingLeaves.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.status = "Rejected"
        });
    }
})
export const {updateLeaveBalance} =  leaveSlice.actions
export default leaveSlice.reducer