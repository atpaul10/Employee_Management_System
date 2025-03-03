// import { getToken } from "firebase/messaging";
// import { collection, doc, getDocs, query, setDoc, updateDoc, where,getDoc } from "firebase/firestore";
// import { auth, db, messaging } from "../firebase";

// export const requestNotificationPermission = async () => {
//     try {
//         const permission = await Notification.requestPermission();
//         if (permission === "granted") {
//             const fcmToken = await getToken(messaging, {
//                 vapidKey: "BKXdiT_JYZjEPp2xqJRo3Gd1oBakQiEWRfeWTTubIeHFGEDPTx5ARpGPmAmvFgSrN6GUMqbStv510x9IYOFH-LA",
//             });
//             console.log("FCM Token:", fcmToken);

//             if (auth.currentUser) {
//                 const userRef = doc(db, "users", auth.currentUser.uid);
//                 const userSnap = await getDoc(userRef);

//                 if (userSnap.exists()) {
                    
//                     await updateDoc(userRef, { fcmToken: fcmToken });
//                 } else {
//                     const userData = JSON.parse(localStorage.getItem("currentUser"));
//                     if (userData) {
//                         await setDoc(userRef, { ...userData, fcmToken: fcmToken }, { merge: true });
//                     }
//                 }
//                 console.log("Notification token updated successfully");
//             }
//         } else {
//             console.log("Notification permission not granted");
//         }
//     } catch (error) {
//         console.log("Error getting FCM token:", error);
//     }
// };

// export const getAdminToken = async () => {
//     try {
//         const q = query(collection(db, "users"), where("role", "==", "Admin"));
//         const querySnapshot = await getDocs(q);

//         console.log("Total Admin Users Found:", querySnapshot.size); 

//         let adminToken = null;
//         querySnapshot.forEach((doc) => {
//             console.log("Admin User Data:", doc.data()); 
//             adminToken = doc.data().fcmToken;
//         });
//         console.log("Admin FCM Token:", adminToken); 

//         return adminToken;
//     } catch (error) {
//         console.error("Error fetching admin FCM token", error);
//         return null;
//     }
// };
