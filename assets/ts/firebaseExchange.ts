
import { onAuthStateChanged, signInAnonymously } from '@react-native-firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, doc, FirebaseFirestoreTypes, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from '@react-native-firebase/firestore';
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
    return addDoc(firebaseCollection, {...newFirebaseDocument, updatedAt: serverTimestamp()});
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
    return setDoc(docRef, {...document, updatedAt: serverTimestamp()});
  }

  static addFirestoreValueToArray(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: string,
    value: string
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayUnion(value), updatedAt: serverTimestamp() });
  }

  static removeFirestoreValueFromArray(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: string,
    value: string
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayRemove(value), updatedAt: serverTimestamp() });
  }

  static updateFirestoreValueOfKey(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: string,
    value: string,
    idOfArtefactContainingSubcollection?: string,
    subcollectionName?: TAvailableFirebaseSubCollections,
    idOfArtefactContainingSubSubCollection?: string,
    subSubCollectionName?: TAvailableFirebaseSubSubCollections
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName, idOfArtefactContainingSubcollection, subcollectionName, idOfArtefactContainingSubSubCollection, subSubCollectionName);
    return updateDoc(docRef, { [key]: value, updatedAt: serverTimestamp() });
  }

  static updateFirestoreAvailableBusyTimes(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: "available"| "busy",
    value: IBusyAvailableTimes
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayUnion(value), updatedAt: serverTimestamp() });
  }

    static removeFirestoreAvailableBusyTimes(
    docId: string,
    collectionName: TAvailableFirebaseCollections,
    key: "available"| "busy",
    value: IBusyAvailableTimes
  ) {
    const docRef = this.getFirebaseDocRef(docId, collectionName);
    return updateDoc(docRef, { [key]: arrayRemove(value), updatedAt: serverTimestamp() });
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