import { doc, updateDoc } from "firebase/firestore/lite";
import { TAvailableFirebaseCollections } from "../interfaces/FirebaseInterface";
import { firestoreDb } from "./firebaseConfig";

export const updateDocument = async (docId:string, collectionName:TAvailableFirebaseCollections) => {
    const docRef = doc(firestoreDb, collectionName, docId);
    try {
      await updateDoc(docRef, { field: 'updated value' });
      console.log("Document updated successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };