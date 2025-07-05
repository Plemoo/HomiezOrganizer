import { collectionGroup, FirestoreError, onSnapshot, query, Unsubscribe, where } from '@react-native-firebase/firestore';
import { IActivitiesWithGroup, IActivity } from "../interfaces/ActivityInterface";
import { IComment } from "../interfaces/CommentInterface";
import { TAvailableFirebaseSubCollections } from '../interfaces/FirebaseInterface';
import { ILocalUser } from "../interfaces/ProfileInterface";
import { getAllActivitiesByGroupIds } from './componentFunctions/activities';
import { firestoreInst } from './firebaseConfig';
import { FirebaseExchange } from "./firebaseExchange";
import { parseFirebaseActivity, parseFirebaseComment, parseFirebaseGroup, parseFirebaseUser } from "./parsing";

// Kann hier nur implementierung aus 'firebase/firestore' verwenden und nicht aus firebase/firestore/lite, da onSnapshot nicht in lite verfügbar ist
export class FirebaseSnapshotListener {

  /**
   * Listens to the User document, if anything changes with the user, e.g. groupUuids, icon, language, etc.
   * @param userDocId 
   * @param callback 
   * @returns 
   */
  static snapshotListenerForUserChange(userDocId: string, callback: (userWithNewGroupId: ILocalUser | null) => void): Unsubscribe {
    return onSnapshot(FirebaseExchange.getFirebaseDocRef(userDocId, "User"), (snapshot) => {
      callback(parseFirebaseUser(snapshot));
    }, (err) => console.error("Error setting up snapshot listener for user:", err));
  }

  /**
   * Listen when a user joins a new group and return all the activities for all the groups
   * @param userDocId 
   * @param callback 
   * @returns 
   */
  static snapshotListenerForUserJoinsNewGroup(userDocId: string, callback: (newGroupOfUser: IActivitiesWithGroup[] | null) => void): Unsubscribe {
    return onSnapshot(FirebaseExchange.getFirebaseDocRef(userDocId, "User"), (snapshot) => {
      try{
      if (!snapshot.exists()) throw new Error("User document does not exist for snapshot listener for user joining new group.");
      let firebaseUser: ILocalUser | null = parseFirebaseUser(snapshot)
      if (!firebaseUser || !firebaseUser.groupUuids || firebaseUser.groupUuids.length === 0) throw new Error("User has no groupUuids on snapshot listener for user joining new group.");
      getAllActivitiesByGroupIds(firebaseUser.groupUuids)
        .then((activitiesWithGroup) => {
          callback(activitiesWithGroup || null);
        }).catch((err) => {
          console.error("Error fetching activities for new group in user regarding Activities:", err);
          callback(null); // In case of error, return null to avoid further processing
        });
      }catch (err) {
        callback(null); // In case of error, return null to avoid further processing
        console.error("Error during snapshot", err);
      }
    }, (err) => {
      console.error("Error setting up snapshot listener for new group in user regarding Activities:", err);
      callback(null);
    });
  }

  static snapshotListenerForActivityDetailChange(groupId: string, activityId: string, callback: (activityWithChange: IActivity | null) => void): Unsubscribe {
    return onSnapshot(FirebaseExchange.getFirebaseDocRef(activityId, "Group", groupId, "Activity"), (snapshot) => {
      callback(parseFirebaseActivity(snapshot));
    }, (err) => console.error("Error setting up snapshot listener for activity detail change:", err));
  }

  /**
   * Listens to new Activities that were created for the groups of the user and returns the new activity with the group it belongs to.
   * @param callback 
   */
  static snapshotListenerForNewActivitiesInGroupsOfUser(groupIdsOfUser: string[], callback: (newlyCreatedActivity: IActivitiesWithGroup | null) => void): Unsubscribe {
    const chunks: string[][] = [] // Split in chunks of 10, because Firestore has a limit of 10 where clauses per query
    for (let i = 0; i < groupIdsOfUser.length; i += 10) {
      chunks.push(groupIdsOfUser.slice(i, i + 10))
    }
    const subcollection: TAvailableFirebaseSubCollections = "Activity";
    const activityGroupIdKey: keyof IActivity = "owningGroupId"; // Key in Activity document that contains the groupId
    const subcollectionRef = collectionGroup(firestoreInst, subcollection)
    const unsubscribes = chunks.map((chunk) => {
      const q = query(subcollectionRef, where(activityGroupIdKey, "in", chunk));
      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let newActivity = parseFirebaseActivity(change.doc);
            if (!newActivity) return null
            FirebaseExchange.getFirebaseDocument(newActivity.owningGroupId, "Group")
              .then((groupDoc) => {
                if (!groupDoc.exists()) return callback(null);
                let groupOfActivity = parseFirebaseGroup(groupDoc);
                if (!groupOfActivity) return callback(null);
                let actByGroup: IActivitiesWithGroup = { group: groupOfActivity, activities: [newActivity] };
                callback(actByGroup);
              })
              .catch((err) => {
                console.error("Error fetching group document for new activity:", q, err);
                callback(null);
              });
          }
        });
      }, (error:FirestoreError) => console.error("Error setting up snapshot listener for new Activity:", error.name, error.message, error.cause));
      return unsub;
    });
    // Return a cleanup function that unsubscribes from all listeners
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }


  /**
 * Listens to new Comments that were created for the selected activity
 * @param subcollection Subcollection name, e.g. "Comment" or "Activity"
 * @param callback 
 */
  static snapshotListenerForNewCommentInActivity(groupId: string, activityId: string, callback: (newlyCreatedComment: IComment | null) => void) {
    const commentCollectionRef = FirebaseExchange.getFirebaseCollection("Group", groupId, "Activity", activityId, "Comment");
    return onSnapshot(commentCollectionRef, (snapshot) => {
      if (snapshot.empty) return callback(null); // No comments yet
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          callback(parseFirebaseComment(change.doc));
        }
      });
    }, (err) => console.error("Error setting up snapshot listener for new Comment:", err));
  }



}