import { FirebaseError } from "firebase/app";
import { signInAnonymously } from "firebase/auth";
import { addDoc, collection, doc, DocumentData, DocumentReference, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore/lite";
import { IActivity, IDbActivity } from "../interfaces/ActivityInterface";
import { IDbComment } from "../interfaces/CommentInterface";
import { TAvailableFirebaseCollections, TAvailableFirebaseSubCollections, TAvailableFirebaseSubSubCollections } from "../interfaces/FirebaseInterface";
import { IDbGroup, IGroup } from "../interfaces/GroupInterface";
import { IDbInvitation } from "../interfaces/InviteInterface";
import { IDbUser, ILocalUser } from "../interfaces/ProfileInterface";
import { firebaseAuth, firestoreDb } from "./firebaseConfig";



export const addDocumentToCollection = (
  collectionName: TAvailableFirebaseCollections,
  newFirebaseDocument: IDbGroup | IDbUser | IDbActivity| IDbComment | IDbInvitation,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
) => {
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    return addDoc(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName), newFirebaseDocument)
  }
  if (subcollectionName && idOfArtefactContainingSubcollection) {
    return addDoc(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName), newFirebaseDocument)
  }
  return addDoc(getFirebaseCollection(collectionName), newFirebaseDocument)
}

export const getAllDocumentsOfCollection = (
  collectionName: TAvailableFirebaseCollections,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
) => {
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    return getDocs(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName));
  }
  if (idOfArtefactContainingSubcollection && subcollectionName) {
    return getDocs(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName));
  }
  return getDocs(getFirebaseCollection(collectionName));
}

const getFirebaseCollection = (
  collectionName: TAvailableFirebaseCollections,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
) => {
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    return collection(firestoreDb, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName)
  }
  if (subcollectionName && idOfArtefactContainingSubcollection) {
    return collection(firestoreDb, collectionName, idOfArtefactContainingSubcollection, subcollectionName)
  }
  return collection(firestoreDb, collectionName)
}

export const getFirebaseDocRef = (
  docId: string,
  collectionName: TAvailableFirebaseCollections,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
): DocumentReference<DocumentData, DocumentData> => {
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    return doc(firestoreDb, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName, docId);
  }
  if (subcollectionName && idOfArtefactContainingSubcollection) {
    return doc(firestoreDb, collectionName, idOfArtefactContainingSubcollection, subcollectionName, docId);
  }
  return doc(firestoreDb, collectionName, docId);
}

export const getFirebaseDocument = (
  docId: string,
  collectionName: TAvailableFirebaseCollections,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
) => {
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    return getDoc(getFirebaseDocRef(docId, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName))
  }
  if (subcollectionName && idOfArtefactContainingSubcollection) {
    return getDoc(getFirebaseDocRef(docId, collectionName, idOfArtefactContainingSubcollection, subcollectionName))
  }
  return getDoc(getFirebaseDocRef(docId, collectionName))
}

export const getFirebaseDocumentArray = (
  docIdArr: string[],
  collectionName: TAvailableFirebaseCollections,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
) => {
  const chunks: string[][] = []
  for (let i = 0; i < docIdArr.length; i += 10) {
    chunks.push(docIdArr.slice(i, i + 10))
  }
  let snapshotPromises = null;
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    snapshotPromises = Promise.all(
      chunks.map(chunk =>{
        const q = query(
          getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName),
          where("__name__", "in", chunk)
        )
        return getDocs(q);
      })
    )
  }
  if (idOfArtefactContainingSubcollection && subcollectionName) {
    snapshotPromises = Promise.all(
      chunks.map(chunk =>{
        const q = query(
          getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName),
          where("__name__", "in", chunk)
        )
        return getDocs(q);
      })
    )
  } else {
    snapshotPromises = Promise.all(
      chunks.map(chunk =>{
        const q = query(
          getFirebaseCollection(collectionName),
          where("__name__", "in", chunk)
        )
        return getDocs(q);
      })
    )
  }
  return snapshotPromises.then(snapshots => {
    return snapshots.flatMap(snap => snap.docs);
  })
}

export const overwriteFirebaseUser = async (user: ILocalUser) => {
  let dbUser: IDbUser = { ...user }
  // TODO: Prüfen ob hier nicht evtl das id Feld doppelt gesetzt wird?
  dbUser.updatedAt = serverTimestamp();
  const userDocRef = getFirebaseDocRef(dbUser.id, "User");
  return setDoc(userDocRef, dbUser);
}

export const updateFirebaseDocument = (
  document: ILocalUser | IGroup | IActivity,
  collectionName: TAvailableFirebaseCollections,
  idOfArtefactContainingSubcollection?: string,
  subcollectionName?: TAvailableFirebaseSubCollections,
  idOfArtefactContainingSubSubCollection?: string,
  subSubCollectionName?: TAvailableFirebaseSubSubCollections
) => {
  if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
    const docRef = getFirebaseDocRef(document.id, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName);
    return setDoc(docRef, document);
  }
  if (idOfArtefactContainingSubcollection && subcollectionName) {
    const docRef = getFirebaseDocRef(document.id, collectionName, idOfArtefactContainingSubcollection, subcollectionName);
    return setDoc(docRef, document);
  }
  const docRef = getFirebaseDocRef(document.id, collectionName);
  return setDoc(docRef, document);
}

export const firebaseErrorHandling = (err: any) => {
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