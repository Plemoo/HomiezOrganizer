
import { onAuthStateChanged, signInAnonymously } from '@react-native-firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, doc, FirebaseFirestoreTypes, getDoc, getDocs, query, setDoc, updateDoc, where } from '@react-native-firebase/firestore';
import { IActivity, IDbActivity } from "../interfaces/ActivityInterface";
import { IDbComment } from "../interfaces/CommentInterface";
import { TAvailableFirebaseCollections, TAvailableFirebaseSubCollections, TAvailableFirebaseSubSubCollections } from "../interfaces/FirebaseInterface";
import { IDbGroup, IGroup } from "../interfaces/GroupInterface";
import { IDbInvitation } from "../interfaces/InviteInterface";
import { IBusyAvailableTimes, IDbUser, ILocalUser } from "../interfaces/ProfileInterface";
import { authInst, firestoreInst } from './firebaseConfig';


export class FirebaseExchange {
  /**
   * CARE: ADDS WITH FIREBASE GENERATED ID. Adds a new document to a Firestore collection.
   * @param collectionName The name of the collection to add the document to.
   * @param newFirebaseDocument The document data to add.
   * @param idOfArtefactContainingSubcollection The ID of the artifact containing the subcollection (if any).
   * @param subcollectionName The name of the subcollection (if any).
   * @param idOfArtefactContainingSubSubCollection The ID of the artifact containing the sub-subcollection (if any).
   * @param subSubCollectionName The name of the sub-subcollection (if any).
   * @returns A promise that resolves with the document reference of the newly created document.
   */
  static addDocumentToCollection(
    collectionName: TAvailableFirebaseCollections,
    newFirebaseDocument: IDbGroup | IDbUser | IDbActivity | IDbComment | IDbInvitation,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ): Promise<FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>> {
    const firebaseCollection = this.getFirebaseCollection(
      collectionName,
      idOfArtefactContainingSubcollection,
      subcollectionName,
      idOfArtefactContainingSubSubCollection,
      subSubCollectionName
    );
    return addDoc(firebaseCollection, newFirebaseDocument as FirebaseFirestoreTypes.DocumentData);
  }

  static getAllDocumentsOfCollection(
    collectionName: TAvailableFirebaseCollections,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ) {
    return getDocs(
      this.getFirebaseCollection(
        collectionName,
        idOfArtefactContainingSubcollection,
        subcollectionName,
        idOfArtefactContainingSubSubCollection,
        subSubCollectionName
      )
    );
  }

  static getFirebaseCollection(
    collectionName: TAvailableFirebaseCollections,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ): FirebaseFirestoreTypes.CollectionReference {
    if (
      idOfArtefactContainingSubSubCollection &&
      subSubCollectionName &&
      idOfArtefactContainingSubcollection &&
      subcollectionName
    ) {
      return collection(
        firestoreInst,
        collectionName,
        idOfArtefactContainingSubcollection,
        subcollectionName,
        idOfArtefactContainingSubSubCollection,
        subSubCollectionName
      );
    }
    if (subcollectionName && idOfArtefactContainingSubcollection) {
      return collection(
        firestoreInst,
        collectionName,
        idOfArtefactContainingSubcollection,
        subcollectionName
      );
    }
    return collection(firestoreInst, collectionName);
  }

  static getFirebaseDocRef(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    return doc(
      this.getFirebaseCollection(
        collectionName,
        idOfArtefactContainingSubcollection,
        subcollectionName,
        idOfArtefactContainingSubSubCollection,
        subSubCollectionName
      ),
      docId
    );
  }

  static getFirebaseDocument(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ) {
    return getDoc(
      this.getFirebaseDocRef(
        docId,
        collectionName,
        idOfArtefactContainingSubcollection,
        subcollectionName,
        idOfArtefactContainingSubSubCollection,
        subSubCollectionName
      )
    );
  }

  static getFirebaseDocumentArray(
    docIdArr: string[],
    collectionName: TAvailableFirebaseCollections,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ) {
    const chunks: string[][] = [];
    for (let i = 0; i < docIdArr.length; i += 10) {
      chunks.push(docIdArr.slice(i, i + 10));
    }
    const collectionRef = this.getFirebaseCollection(
      collectionName,
      idOfArtefactContainingSubcollection,
      subcollectionName,
      idOfArtefactContainingSubSubCollection,
      subSubCollectionName
    );
    const snapshotPromises = Promise.all(
      chunks.map(documentInCollection => {
        const documentsByIdQuery = query(collectionRef, where("__name__", "in", documentInCollection));
        return getDocs(documentsByIdQuery);
      })
    );
    return snapshotPromises.then(snapshots => {
      return snapshots.flatMap(snap => snap.docs);
    });
  }

  static updateFirebaseDocument(
    document: ILocalUser | IGroup | IActivity,
    collectionName: TAvailableFirebaseCollections,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ) {
    const docRef = this.getFirebaseDocRef(
      document.id,
      collectionName,
      idOfArtefactContainingSubcollection,
      subcollectionName,
      idOfArtefactContainingSubSubCollection,
      subSubCollectionName
    );
    return setDoc(docRef, document as IDbUser | IDbGroup | IDbActivity);
  }

  static addFirestoreValueToArray(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: string,
    value: string
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayUnion(value) });
  }

  static updateFirestoreValueOfKey(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: string,
    value: string
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: value });
  }

  static updateFirestoreAvailableBusyTimes(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: "available"| "busy",
    value: IBusyAvailableTimes
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayUnion(value) });
  }

    static removeFirestoreAvailableBusyTimes(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: "available"| "busy",
    value: IBusyAvailableTimes
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayRemove(value) });
  }

  static firebaseErrorHandling(err: any) {
    if (true) {
      if (err.code === "permission-denied") {
        console.error("Permission denied!", err.code, err.message);
      } else {
        console.error("Firebase error:", err.code, err.message);
      }
    }
  }

  static getFirebaseUserUid(): Promise<string> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(authInst, user => {
        if (user && user.uid) {
          resolve(user.uid);
        } else {
          signInAnonymously(authInst)
            .then(result => resolve(result.user.uid))
            .catch(reject);
        }
      });
    });
  }
}
// export const addDocumentToCollection = (
//   collectionName: TAvailableFirebaseCollections,
//   newFirebaseDocument: IDbGroup | IDbUser | IDbActivity | IDbComment | IDbInvitation,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ): Promise<FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>> => {
//   const firebaseCollection = getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName)
//   return addDoc(firebaseCollection, newFirebaseDocument as FirebaseFirestoreTypes.DocumentData);
//   // if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
//   //   return addDoc(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName), newFirebaseDocument)
//   // }
//   // if (subcollectionName && idOfArtefactContainingSubcollection) {
//   //   return addDoc(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName), newFirebaseDocument)
//   // }
//   // return addDoc(getFirebaseCollection(collectionName), newFirebaseDocument)
// }

// export const getAllDocumentsOfCollection = (
//   collectionName: TAvailableFirebaseCollections,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ) => {
//   return getDocs(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName));
// }

// export const getFirebaseCollection = (
//   collectionName: TAvailableFirebaseCollections,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ): FirebaseFirestoreTypes.CollectionReference => {
//   if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
//     return collection(getFirestore(), collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName);

//   }
//   if (subcollectionName && idOfArtefactContainingSubcollection) {
//     return collection(getFirestore(), collectionName, idOfArtefactContainingSubcollection, subcollectionName);

//   }
//   return collection(getFirestore(), collectionName);
// }

// export const getFirebaseDocRef = (
//   docId: string,
//   collectionName: TAvailableFirebaseCollections,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> => {
//   return doc(getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName), docId);
//   // if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
//   //   return doc(firestoreDb, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName, docId);
//   // }
//   // if (subcollectionName && idOfArtefactContainingSubcollection) {
//   //   return doc(firestoreDb, collectionName, idOfArtefactContainingSubcollection, subcollectionName, docId);
//   // }
//   // return doc(firestoreDb, collectionName, docId);
// }

// export const getFirebaseDocument = (
//   docId: string,
//   collectionName: TAvailableFirebaseCollections,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ) => {
//   return getDoc(getFirebaseDocRef(docId, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName));
//   // if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
//   //   return getDoc(getFirebaseDocRef(docId, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName))
//   // }
//   // if (subcollectionName && idOfArtefactContainingSubcollection) {
//   //   return getDoc(getFirebaseDocRef(docId, collectionName, idOfArtefactContainingSubcollection, subcollectionName))
//   // }
//   // return getDoc(getFirebaseDocRef(docId, collectionName))
// }

// export const getFirebaseDocumentArray = (
//   docIdArr: string[],
//   collectionName: TAvailableFirebaseCollections,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ) => {
//   const chunks: string[][] = []
//   for (let i = 0; i < docIdArr.length; i += 10) {
//     chunks.push(docIdArr.slice(i, i + 10))
//   }
//   let snapshotPromises = null;
//   // if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
//   const collectionRef = getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName);
//   snapshotPromises = Promise.all(
//     chunks.map(documentInCollection => {
//       const documentsByIdQuery = query(collectionRef, where("__name__", "in", documentInCollection)) // __name__ is the document ID in Firestore
//       return getDocs(documentsByIdQuery);
//     })
//   )
// }
// if (idOfArtefactContainingSubcollection && subcollectionName) {
//   snapshotPromises = Promise.all(
//     chunks.map(chunk => {
//       return getFirebaseCollection(collectionName, idOfArtefactContainingSubcollection, subcollectionName)
//         .where("__name__", "in", chunk)
//         .get();
//     })
//   )
// } else {
//   snapshotPromises = Promise.all(
//     chunks.map(chunk => {
//       return getFirebaseCollection(collectionName)
//         .where("__name__", "in", chunk)
//         .get();

//     })
//   )
// }
//   return snapshotPromises.then(snapshots => {
//     return snapshots.flatMap(snap => snap.docs);
//   })
// }



// export const updateFirebaseDocument = (
//   document: ILocalUser | IGroup | IActivity,
//   collectionName: TAvailableFirebaseCollections,
//   idOfArtefactContainingSubcollection?: string,
//   subcollectionName?: TAvailableFirebaseSubCollections,
//   idOfArtefactContainingSubSubCollection?: string,
//   subSubCollectionName?: TAvailableFirebaseSubSubCollections
// ) => {
//   const docRef = getFirebaseDocRef(document.id, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName)
//   // const {id, ...documentWithoutId} = document; // remove id from document, because it is not a valid field in Firestore
//   // ID has to be added aswell, especially for new User, because the id has to be the firebase UUID and not generated by firebase
//   return setDoc(docRef, document as IDbUser | IDbGroup | IDbActivity);
//   // if (idOfArtefactContainingSubSubCollection && subSubCollectionName && idOfArtefactContainingSubcollection && subcollectionName) {
//   //   const docRef = getFirebaseDocRef(document.id, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName);
//   //   return setDoc(docRef, document);
//   // }
//   // if (idOfArtefactContainingSubcollection && subcollectionName) {
//   //   const docRef = getFirebaseDocRef(document.id, collectionName, idOfArtefactContainingSubcollection, subcollectionName);
//   //   return setDoc(docRef, document);
//   // }
//   // const docRef = getFirebaseDocRef(document.id, collectionName);
//   // return setDoc(docRef, document);
// }

// export const addFirestoreValueToArray = (docId: string, collectionName: TAvailableFirebaseCollections, key: string, value: string) => {
//   const docRef = getFirebaseDocRef(docId, collectionName);
//   return updateDoc(docRef, { [key]: arrayUnion(value) });
// }

// export const firebaseErrorHandling = (err: any) => {
//   if (true) {
//     // You can now check the error code
//     if (err.code === "permission-denied") {
//       // Handle permission denied
//       console.error("Permission denied!", err.code, err.message);
//     } else {
//       console.error("Firebase error:", err.code, err.message);
//     }
//   } else {
//   }
// }

// export function getFirebaseUserUid(): Promise<string> {
//   return new Promise((resolve, reject) => {
//     // 2) Listen once for Auth state
//     onAuthStateChanged(getAuth(), user => {
//       if (user && user.uid) {
//         // already signed in
//         resolve(user.uid)
//       } else {
//         // not signed in → sign in anonymously
//         signInAnonymously(getAuth())
//           .then(result => resolve(result.user.uid))
//           .catch(reject)
//       }
//     })
//   })
// }