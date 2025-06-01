
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2QuyneEr5PvGnCMdwKFIigeOWgRIo_Dc",
  authDomain: "homiesorganizer.firebaseapp.com",
  projectId: "homiesorganizer",
  storageBucket: "homiesorganizer.firebasestorage.app",
  messagingSenderId: "1085142789628",
  appId: "1:1085142789628:web:391e548187aeabbccfd679"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);
const firebaseAuth = getAuth(app);
export { firebaseAuth, firestoreDb };

