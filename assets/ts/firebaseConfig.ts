
// import { FirebaseOptions, initializeApp } from "firebase/app";
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from "firebase/firestore";

import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';
import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';
import getFunctions, { connectFunctionsEmulator } from '@react-native-firebase/functions';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig: FirebaseOptions = {
//   apiKey: "AIzaSyC2QuyneEr5PvGnCMdwKFIigeOWgRIo_Dc",
//   authDomain: "homiesorganizer.firebaseapp.com",
//   projectId: "homiesorganizer",
//   storageBucket: "homiesorganizer.firebasestorage.app",
//   messagingSenderId: "1085142789628",
//   appId: "1:1085142789628:web:391e548187aeabbccfd679"
// };
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const firestoreDb = getFirestore(app);
// const firebaseAuth = getAuth(app)
// export { firebaseAuth, firestoreDb };



// 1) Grab the default instances
export const authInst = getAuth()
export const firestoreInst = getFirestore()
export const firestoreCloudFunctions = getFunctions()
// 2) If we’re in dev, divert these to localhost
// terminate(firestoreInst).then(() => {
//     return clearIndexedDbPersistence(firestoreInst)
// }).catch((e) => {
//     console.warn("⚠️ Error terminating Firestore instance:", e);
// });

if (__DEV__) {
    // Android emulators see the host machine at 10.0.2.2
    console.log("Is Emulator:", DeviceInfo.isEmulatorSync());
    const host =  Platform.OS === 'android' && DeviceInfo.isEmulatorSync() ? '10.0.2.2' : "192.168.2.183";

    connectAuthEmulator(authInst, `http://${host}:9099`);
    connectFirestoreEmulator(firestoreInst, host, 8080);
    connectFunctionsEmulator(firestoreCloudFunctions, host, 5001);

    // Firestore emulator
    // if(!authEmu){
    //     throw new Error("Firebase Auth emulator is not configured correctly. Please check your setup.");
    // }
    // if(!fsHost){
    //     throw new Error("Firebase Firestore emulator is not configured correctly. Please check your setup.");
    // }
    console.log("DEV ENVIRONMENT: Using firebase emulators with host:", host);
}