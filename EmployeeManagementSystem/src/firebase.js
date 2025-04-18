  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";
  import {getMessaging,onMessage,getToken} from "firebase/messaging"


  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDCLQoWlMAlqSGv_C0_F7JH4pan-CoCyKU",
    authDomain: "employeemangementsystem-62ef0.firebaseapp.com",
    projectId: "employeemangementsystem-62ef0",
    storageBucket: "employeemangementsystem-62ef0.firebasestorage.app",
    messagingSenderId: "860183891363",
    appId: "1:860183891363:web:a4507005a4d1a3e9e79e16"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app)
  const db = getFirestore(app)
  const messaging = getMessaging(app)

  export {auth,db,messaging,getToken,onMessage};