import { FirebaseError } from "firebase/app";
import { signInAnonymously } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { TAvailableFirebaseCollections } from "../interfaces/FirebaseInterface";
import { IDbGroup } from "../interfaces/GroupInterface";
import { IDbUser, ILocalUser } from "../interfaces/ProfileInterface";
import { firebaseAuth, firestoreDb } from "./firebaseConfig";


export const addDocumentToCollection = (collectionName: TAvailableFirebaseCollections, newFirebaseDocument: IDbGroup | IDbUser) => {
  return addDoc(getFirebaseCollection(collectionName), newFirebaseDocument)
}

const getFirebaseCollection = (collectionName: TAvailableFirebaseCollections) => {
  return collection(firestoreDb, collectionName)
}

const getFirebaseDocRef = (docId: string, collectionName: TAvailableFirebaseCollections) => {
  return doc(firestoreDb, collectionName, docId);
}

export const getFirebaseDocumentArray = (docIdArr: string[], collectionName: TAvailableFirebaseCollections) => {
  let documentsOfArray = docIdArr//
    .map((docId) => getFirebaseDocRef(docId, collectionName))//
    .map((docRef) => getDoc(docRef));
  return Promise.all(documentsOfArray);
}

export const overwriteFirebaseUser = async (user: ILocalUser) => {
  let dbUser: IDbUser = {...user,}
  dbUser.updatedAt = serverTimestamp();
  const userDocRef = getFirebaseDocRef(dbUser.id, "User");
  return setDoc(userDocRef, dbUser);
}


export const firebaseErrorHandling = (err:any) => {
  if (err instanceof FirebaseError) {
    // You can now check the error code
    if (err.code === "permission-denied") {
      // Handle permission denied
      console.error("Permission denied!", err.code, err.message);
    } else {
      console.error("Firebase error:", err.code, err.message);
    }
  } else {
    // Not a Firebase error
    console.error("Unknown error:", err);
  }
}

export function getFirebaseUserUid() {
  return new Promise<string>((res, rej) => {
    if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid) {
      res(firebaseAuth.currentUser.uid);
    } else {
      signInAnonymously(firebaseAuth).then(() => {
        if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid) {
          res(firebaseAuth.currentUser.uid);
        } else {
          rej("No UUID found");
        }
      });
    }
  });
}