
// import { FirebaseOptions, initializeApp } from "firebase/app";
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from "firebase/firestore";

import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';
import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from '@react-native-firebase/functions';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';


// 1) Grab the default instances
export const authInst = getAuth()
export const firestoreInst = getFirestore()
export const firestoreCloudFunctions = getFunctions(undefined, "europe-west3")


if (__DEV__) {
    // Android emulators see the host machine at 10.0.2.2
    const host =  Platform.OS === 'android' && DeviceInfo.isEmulatorSync() ? '10.0.2.2' : "192.168.2.183";
    connectAuthEmulator(authInst, `http://${host}:9099`);
    connectFirestoreEmulator(firestoreInst, host, 8080);
    connectFunctionsEmulator(firestoreCloudFunctions, host, 5001);
}
