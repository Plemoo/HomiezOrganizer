import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import { initializeApp } from 'firebase-admin/app'
import { DocumentData, FieldValue, Firestore, getFirestore } from 'firebase-admin/firestore'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
initializeApp()
const expo = new Expo()

const activityCollectionString = "Activity";
const groupCollectionString = "Group";
const commentCollectionString = "Comment";
const userCollectionString = "User";
// const invitationCollectionString: TAvailableFirebaseSubCollections = "Invitation";
const groupIdString = "{groupId}";
const activityIdString = "{activityId}";
const commentIdString = "{commentId}";
const bodyCharacterLimit = 150; // Limit for the body of the notification
const inviteValidityMs = 10 * 24 * 60 * 60 * 1000;
// const invitationIdString = "{invitationId}";


// IDEEN:
// - Füge eine Benachrichtigung hinzu, wenn ein Benutzer einer Gruppe beitritt oder sie verlässt
// - Sende Erinnerungen für bevorstehende Aktivitäten
// - Benachrichtigung wenn neuer Zeitslot hinzugefügt wird



export const createGroup = onCall(
    {region: "europe-west3"},
    async request => {
        const userId = request.auth?.uid;
        const name = request.data?.name;
        const description = request.data?.description;
        const icon = request.data?.icon;
        if (!userId) throw new HttpsError("unauthenticated", "Authentication is required.");
        if (typeof name !== "string" || !name.trim() || name.length > 100) {
            throw new HttpsError("invalid-argument", "A group name between 1 and 100 characters is required.");
        }
        if (typeof description !== "string" || description.length > 1000 || typeof icon !== "string") {
            throw new HttpsError("invalid-argument", "The group data is invalid.");
        }

        const db = getFirestore();
        const groupRef = db.collection(groupCollectionString).doc();
        const userRef = db.doc(`${userCollectionString}/${userId}`);

        await db.runTransaction(async transaction => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists) throw new HttpsError("failed-precondition", "The user profile does not exist.");

            transaction.create(groupRef, {
                name: name.trim(),
                description,
                icon,
                memberUuids: [userId],
                ownerUuid: userId,
                updatedAt: FieldValue.serverTimestamp(),
            });
            transaction.update(userRef, {
                groupUuids: FieldValue.arrayUnion(groupRef.id),
                updatedAt: FieldValue.serverTimestamp(),
            });
        });

        return {groupId: groupRef.id};
    }
);

export const redeemGroupInvite = onCall(
    {region: "europe-west3"},
    async request => {
        const userId = request.auth?.uid;
        const groupId = request.data?.groupId;
        const inviteCode = request.data?.inviteCode;
        if (!userId) throw new HttpsError("unauthenticated", "Authentication is required.");
        if (typeof groupId !== "string" || typeof inviteCode !== "string") {
            throw new HttpsError("invalid-argument", "A group ID and invite code are required.");
        }

        const db = getFirestore();
        const groupRef = db.doc(`${groupCollectionString}/${groupId}`);
        const inviteRef = groupRef.collection("Invitation").doc(inviteCode);
        const userRef = db.doc(`${userCollectionString}/${userId}`);

        await db.runTransaction(async transaction => {
            const [groupSnap, inviteSnap, userSnap] = await transaction.getAll(groupRef, inviteRef, userRef);
            if (!groupSnap.exists || !inviteSnap.exists) {
                throw new HttpsError("not-found", "The invitation does not exist.");
            }
            if (!userSnap.exists) throw new HttpsError("failed-precondition", "The user profile does not exist.");

            const invite = inviteSnap.data();
            const createdAt = invite?.createdAt?.toDate?.();
            if (invite?.groupId !== groupId || !(createdAt instanceof Date) || Date.now() - createdAt.getTime() > inviteValidityMs) {
                throw new HttpsError("failed-precondition", "The invitation is invalid or expired.");
            }

            transaction.update(groupRef, {
                memberUuids: FieldValue.arrayUnion(userId),
                updatedAt: FieldValue.serverTimestamp(),
            });
            transaction.update(userRef, {
                groupUuids: FieldValue.arrayUnion(groupId),
                updatedAt: FieldValue.serverTimestamp(),
            });
        });

        return {groupId};
    }
);

export const removeGroupMember = onCall(
    {region: "europe-west3"},
    async request => {
        const requestingUserId = request.auth?.uid;
        const groupId = request.data?.groupId;
        const memberUuid = request.data?.memberUuid;
        if (!requestingUserId) throw new HttpsError("unauthenticated", "Authentication is required.");
        if (typeof groupId !== "string" || typeof memberUuid !== "string") {
            throw new HttpsError("invalid-argument", "A group ID and member ID are required.");
        }
        if (requestingUserId === memberUuid) {
            throw new HttpsError("failed-precondition", "The group owner cannot remove themselves.");
        }

        const db = getFirestore();
        const groupRef = db.doc(`${groupCollectionString}/${groupId}`);
        const memberRef = db.doc(`${userCollectionString}/${memberUuid}`);

        await db.runTransaction(async transaction => {
            const [groupSnap, memberSnap] = await transaction.getAll(groupRef, memberRef);
            if (!groupSnap.exists) throw new HttpsError("not-found", "The group does not exist.");

            const group = groupSnap.data();
            const members = Array.isArray(group?.memberUuids) ? group.memberUuids : [];
            const ownerUuid = group?.ownerUuid || members[0];
            if (ownerUuid !== requestingUserId) {
                throw new HttpsError("permission-denied", "Only the group owner may remove members.");
            }
            if (!members.includes(memberUuid)) {
                throw new HttpsError("failed-precondition", "The user is not a member of this group.");
            }

            transaction.update(groupRef, {
                memberUuids: FieldValue.arrayRemove(memberUuid),
                updatedAt: FieldValue.serverTimestamp(),
            });
            if (memberSnap.exists) {
                transaction.update(memberRef, {
                    groupUuids: FieldValue.arrayRemove(groupId),
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }
        });

        return {groupId, memberUuid};
    }
);

export const leaveGroup = onCall(
    {region: "europe-west3"},
    async request => {
        const userId = request.auth?.uid;
        const groupId = request.data?.groupId;
        if (!userId) throw new HttpsError("unauthenticated", "Authentication is required.");
        if (typeof groupId !== "string") {
            throw new HttpsError("invalid-argument", "A group ID is required.");
        }

        const db = getFirestore();
        const groupRef = db.doc(`${groupCollectionString}/${groupId}`);
        const userRef = db.doc(`${userCollectionString}/${userId}`);

        await db.runTransaction(async transaction => {
            const [groupSnap, userSnap] = await transaction.getAll(groupRef, userRef);
            if (!groupSnap.exists) throw new HttpsError("not-found", "The group does not exist.");

            const group = groupSnap.data();
            const members = Array.isArray(group?.memberUuids) ? group.memberUuids : [];
            const ownerUuid = group?.ownerUuid || members[0];
            if (!members.includes(userId)) {
                throw new HttpsError("failed-precondition", "The user is not a member of this group.");
            }
            if (ownerUuid === userId) {
                throw new HttpsError("failed-precondition", "The group owner cannot leave the group.");
            }

            transaction.update(groupRef, {
                memberUuids: FieldValue.arrayRemove(userId),
                updatedAt: FieldValue.serverTimestamp(),
            });
            if (userSnap.exists) {
                transaction.update(userRef, {
                    groupUuids: FieldValue.arrayRemove(groupId),
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }
        });

        return {groupId};
    }
);

/**
 * Send notification if activity is scheduled or closed OR if timeslot changed
 */
export const sendActivityStateChangeNotification = onDocumentUpdated(
    {
        document: groupCollectionString + "/" + groupIdString + "/" + activityCollectionString + "/" + activityIdString,
        region: "europe-west3"
    },
    async event => {
        try {
            if (!event) throw new Error("No event data in cloud function:sendActivityStateChangeNotification")
            const snap = event.data  // v2 event.data is a FirestoreDocumentSnapshot
            if (!snap) throw new Error("No data in cloud function, nothing to do");
            if (!snap.before || !snap.after) throw new Error("No before or after data in snapshot:sendActivityStateChangeNotification");
            const beforeChange = snap.before.data() // type assertion to IDbActivity
            const afterChange = snap.after.data() // type assertion to IDbActivity
            const activityIdPara = event.params.activityId//[activityIdString]
            const groupIdPara = event.params.groupId//[groupIdString]
            const db = getFirestore();
            // Aktivität angesetzt/gestartet
            if (beforeChange.state === "pending" && afterChange.state === "scheduled") {
                await sendActivityScheduledNotification(db, afterChange, groupIdPara, activityIdPara);
            }
            if (beforeChange.state === "pending" && afterChange.state === "cancelled") {
                await sendActivityCancelledNotification(db, afterChange, groupIdPara, activityIdPara);
            }
            if (beforeChange.state === "pending" && afterChange.state === "pending" && beforeChange.timeSlotsPerUserUuid.length > 0 && beforeChange.timeSlotsPerUserUuid.length < afterChange.timeSlotsPerUserUuid.length) {
                await sendNewTimeslotForActivityNotification(db, afterChange, beforeChange, groupIdPara, activityIdPara);
            }
        } catch (error) {
            console.error("Error in sendActivityStateChangeNotification function:", error);
        }
    }
)

async function sendNewTimeslotForActivityNotification(db: Firestore, afterChange: any, beforeChange: any, groupIdPara: string, activityIdPara: string) {
    const users = await getFirebaseUsersOfGroup(db, groupIdPara);
    let expoPushNotifications: ExpoPushMessage[] = [];
    if (!users || users.length === 0) throw new Error(`No users found for group with ID ${groupIdPara} when new timeslot is added`);
    for (const user of users) {
        if (!user || !user.expoPushToken) continue;
        if (afterChange.declinedUserUuids && afterChange.declinedUserUuids.includes(user.id)) continue; // Do not send notification to users who declined the activity
        const notificationTitle = user.language === "de" ? "Neuer Zeitslot für Aktivität " + afterChange.name : "New timeslot for activity " + afterChange.name;
        let notificationBody = user.language === "de" ? "Ein neuer Zeitslot wurde hinzugefügt" : "A new timeslot has been added";
        let newTimeSlot = afterChange.timeSlotsPerUserUuid.filter((slot: any) => !containsTimeSlot(beforeChange, slot.slots));
        if (newTimeSlot.length === 1) {
            if (newTimeSlot[0].userUuid.includes(user.id)) continue; // Skip notification if the user is the one who added the timeslot
            notificationBody += `: ${formatDateAndTime(newTimeSlot[0].slots.start.toDate(), user.language)} - ${formatDateAndTime(newTimeSlot[0].slots.end.toDate(), user.language)}`;
        } else {
            console.error("ERROR: Not exactly one timeslot found", newTimeSlot)
        }
        const newNotification = createNotification(user.expoPushToken, notificationTitle, notificationBody, "newTimeslot", groupIdPara, activityIdPara);
        expoPushNotifications.push(newNotification);
    }
    if (expoPushNotifications.length !== 0) {
        publishExpoPushMessage(expoPushNotifications)
    } else {
        throw new Error(`No Expo push notifications created for group with ID ${groupIdPara} when activity is cancelled`);
    }
}

function containsTimeSlot(beforeChange: any, afterSlot: any) {
    return beforeChange.timeSlotsPerUserUuid.some((s: any) => s.slots.start.toMillis() === afterSlot.start.toMillis() && s.slots.end.toMillis() === afterSlot.end.toMillis());
}

async function sendActivityCancelledNotification(db: Firestore, afterChange: any, groupIdPara: string, activityIdPara: string) {
    const users = await getFirebaseUsersOfGroup(db, groupIdPara);
    let expoPushNotifications: ExpoPushMessage[] = [];
    if (!users || users.length === 0) throw new Error(`No users found for group with ID ${groupIdPara} for activity cancellation`);
    for (const user of users) {
        if (!user || !user.expoPushToken) continue;
        if (afterChange.declinedUserUuids && afterChange.declinedUserUuids.includes(user.id)) continue; // Do not send notification to users who declined the activity
        const notificationTitle = user.language === "de" ? "Aktivität " + afterChange.name + " abgesagt" : "Activity " + afterChange.name + " cancelled";
        let notificationBody = user.language === "de" ? "Die Aktivität ist jetzt abgesagt" : "The activity is now cancelled";
        const newNotification = createNotification(user.expoPushToken, notificationTitle, notificationBody, "activityCancelled", groupIdPara, activityIdPara);
        expoPushNotifications.push(newNotification);
    }
    if (expoPushNotifications.length !== 0) {
        publishExpoPushMessage(expoPushNotifications)
    } else {
        throw new Error(`No Expo push notifications created for group with ID ${groupIdPara} when activity is cancelled`);
    }
}

async function sendActivityScheduledNotification(db: Firestore, afterChange: any, groupIdPara: string, activityIdPara: string) {
    const users = await getFirebaseUsersOfGroup(db, groupIdPara);
    let expoPushNotifications: ExpoPushMessage[] = [];
    if (!users || users.length === 0) throw new Error(`No users found for group with ID ${groupIdPara} when activity is scheduled`);
    for (const user of users) {
        if (!user || !user.expoPushToken) continue;
        if (afterChange.declinedUserUuids && afterChange.declinedUserUuids.includes(user.id)) continue; // Do not send notification to users who declined the activity
        const notificationTitle = user.language === "de" ? "Aktivität " + afterChange.name + " findet statt" : "Activity " + afterChange.name + " scheduled";
        let notificationBody = user.language === "de" ? "Navigiere zur Aktivität für Details" : "Navigate to the activity for details";
        if (afterChange.time && afterChange.time.start && afterChange.time.end) {
            let startOfScheduledTime = afterChange.time.start.toDate();
            let endOfScheduledTime = afterChange.time.end.toDate();
            const formattedStart = formatDateAndTime(startOfScheduledTime, user.language || "de");
            const formattedEnd = formatDateAndTime(endOfScheduledTime, user.language || "de");
            notificationBody = user.language === "de" ? `Die Aktivität findet am ${formattedStart} bis ${formattedEnd} statt` : `The activity is scheduled for ${formattedStart} to ${formattedEnd}`;
        }
        const newNotification = createNotification(user.expoPushToken, notificationTitle, notificationBody, "activityScheduled", groupIdPara, activityIdPara);
        expoPushNotifications.push(newNotification);
    }
    if (expoPushNotifications.length !== 0) {
        publishExpoPushMessage(expoPushNotifications)
    } else {
        throw new Error(`No Expo push notifications created for group with ID ${groupIdPara} when activity is scheduled`);
    }
}

/**
 * Send notification to whole group when a new comment is added to an activity
 */
export const sendNewCommentForActivityNotification = onDocumentCreated(
    {
        document: groupCollectionString + "/" + groupIdString + "/" + activityCollectionString + "/" + activityIdString + "/" + commentCollectionString + "/" + commentIdString,
        region: "europe-west3"
    },
    async event => {
        try {
            if (!event) throw new Error("No event data in cloud function:sendNewCommentForActivityNotification");
            const snap = event.data  // v2 event.data is a FirestoreDocumentSnapshot
            if (!snap) throw new Error("No data in cloud function, nothing to do");
            const comment = snap.data()
            const activitySnap = await snap.ref.parent.parent?.get();
            const activityIdPara = event.params.activityId
            const groupIdPara = event.params.groupId
            const db = getFirestore();
            const users = await getFirebaseUsersOfGroup(db, groupIdPara);
            let expoNotifications: ExpoPushMessage[] = [];
            if (!users || users.length === 0) throw new Error(`No users found for group with ID ${groupIdPara}`);
            for (const user of users) {
                if (!user || !user.expoPushToken) continue;
                if (!user.id || !comment.userUuid || user.id === comment.userUuid) continue; // Do not send notification to the user who wrote the comment
                const language = user.language || "en"; // Default to English if no language is set
                let notificationTitle = language === "de" ? "Neues Kommentar" : "New comment";
                const activity = activitySnap?.data();
                if (activitySnap?.exists && activity?.name) {
                    if (activity.declinedUserUuids?.includes(user.id)) continue;
                    notificationTitle += " in " + activity.name;
                }
                let notificationBody = comment.userName + ": " + (comment.text.length > bodyCharacterLimit ? comment.text.substring(0, bodyCharacterLimit) + "..." : comment.text);
                const notification = createNotification(user.expoPushToken, notificationTitle, notificationBody, "newComment", groupIdPara, activityIdPara);
                expoNotifications.push(notification);
            }
            if (expoNotifications.length !== 0) {
                publishExpoPushMessage(expoNotifications)
            } else {
                throw new Error(`No Expo push notifications created for group with ID ${groupIdPara} when new comment is added`);
            }
        } catch (error) {
            console.error("Error in sendNewCommentForActivityNotification function:", error);
        }
    }
)

/**
 * Send notification to whole group when a new activity is created
 */
export const sendNewActivityNotification = onDocumentCreated(
    {
        document: groupCollectionString + "/" + groupIdString + "/" + activityCollectionString + "/" + activityIdString,
        region: "europe-west3"
    },
    async event => {
        try {
            if (!event) throw new Error("No event data in cloud function:sendNewActivityNotification");
            const snap = event.data  // v2 event.data is a FirestoreDocumentSnapshot
            if (!snap) throw new Error("No data in cloud function, nothing to do");
            const activity = snap.data()
            const activityIdPara = event.params.activityId//[activityIdString]
            const groupIdPara = event.params.groupId//[groupIdString]
            const db = getFirestore();
            // Get users
            const users: (DocumentData | undefined)[] = await getFirebaseUsersOfGroup(db, groupIdPara);

            if (!users || users.length === 0) throw new Error(`No users found for group with ID ${groupIdPara}`);
            let expoNotifications: ExpoPushMessage[] = [];
            for (const user of users) {
                if (!user || !user.expoPushToken) continue;
                if (activity.declinedUserUuids && activity.declinedUserUuids.includes(user.id)) continue; // Do not send notification to users who declined the activity
                if (!user.id || !activity.createdBy || user.id === activity.createdBy) continue; // Do not send notification to the user who created the activity
                const language = user.language || "en"; // Default to English if no language is set
                const notificationTitle = language === "de" ? "Neue Aktivität erstellt" : "New activity created";
                let notificationBody = language === "de" ? "Aktivität: " + activity.name : "Activity: " + activity.name;
                if (activity.description) {
                    notificationBody += " - " + (activity.description.length > bodyCharacterLimit ? activity.description.substring(0, bodyCharacterLimit) + "..." : activity.description);
                }
                const notification = createNotification(user.expoPushToken, notificationTitle, notificationBody, "newActivity", groupIdPara, activityIdPara);
                expoNotifications.push(notification);
            }
            if (expoNotifications.length !== 0) {
                publishExpoPushMessage(expoNotifications)
            } else {
                throw new Error(`No Expo push notifications created for group with ID ${groupIdPara} when new activity is created`);
            }
        } catch (error) {
            console.error("Error in sendNewActivityNotification function:", error);
        }
    }
)

function createNotification(
    token: string,
    title: string,
    body: string,
    customNotificationType: "newActivity" | "newComment" | "activityScheduled" | "activityCancelled" | "newTimeslot",
    groupIdPara: string,
    activityIdPara: string
): ExpoPushMessage {
    let imageUrl;
    if (customNotificationType === "newActivity") {
        imageUrl = "https://yogaroma-julie.de/img/homiesOrganizer/newActivity.png";
    } else if (customNotificationType === "newComment") {
        imageUrl = "https://yogaroma-julie.de/img/homiesOrganizer/notification.png";
    } else if (customNotificationType === "activityScheduled") {
        imageUrl = "https://yogaroma-julie.de/img/homiesOrganizer/activityScheduled.png";
    } else if (customNotificationType === "activityCancelled") {
        imageUrl = "https://yogaroma-julie.de/img/homiesOrganizer/activityCancelled.png";
    } else if (customNotificationType === "newTimeslot") {
        imageUrl = "https://yogaroma-julie.de/img/homiesOrganizer/newActivity.png";
    }
    let notificationData = {
        type: customNotificationType,
        params: {
            groupIdParameter: groupIdPara,
            activityIdParameter: activityIdPara,
        }
    }
    const notification: ExpoPushMessage = {
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: notificationData as unknown as Record<string, unknown>,
        richContent: {
            image: imageUrl
        }
    }
    return notification
}


function publishExpoPushMessage(messages: ExpoPushMessage[]) {
    return Promise.all(expo.chunkPushNotifications(messages)
        .map((chunk) => expo.sendPushNotificationsAsync(chunk)))
}


function getFirebaseUsersOfGroup(db: Firestore, groupId: string) {
    return db.doc(groupCollectionString + "/" + groupId)
        .get()
        .then((groupSnap) => {
            if (!groupSnap.exists) throw new Error(`Group with ID ${groupId} does not exist`);
            return groupSnap.data()
        }).then((group) => {
            if (!group) throw new Error(`Group with ID ${groupId} does not exist`);
            const usersOfGroupDocs = group.memberUuids.map((uuid: any) => db.doc(userCollectionString + "/" + uuid));
            return db.getAll(...usersOfGroupDocs)
        }).then((firebaseuserArr) => {
            if (!firebaseuserArr || !firebaseuserArr.length) throw new Error(`No users found for group with ID ${groupId}`);
            return firebaseuserArr
                .filter(user => user.exists)
                .map(user => user.data())
        })
}

function formatDateAndTime(date: Date, language: string): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid date object");
    }
    const options: Intl.DateTimeFormatOptions = {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        weekday: "short",
        minute: "2-digit",
        hour: "2-digit"
    };
    return date.toLocaleDateString(language, options);
}
