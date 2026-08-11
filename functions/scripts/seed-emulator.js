/* eslint-disable no-console */

const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const projectId = process.env.GCLOUD_PROJECT || "homiesorganizer";

assertLocalEmulatorHost(firestoreHost, "FIRESTORE_EMULATOR_HOST");
assertLocalEmulatorHost(authHost, "FIREBASE_AUTH_EMULATOR_HOST");

process.env.FIRESTORE_EMULATOR_HOST = firestoreHost;
process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
process.env.GCLOUD_PROJECT = projectId;

const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {FieldValue, Timestamp, getFirestore} = require("firebase-admin/firestore");

initializeApp({projectId});

const auth = getAuth();
const db = getFirestore();

const seedUserIds = {
  lena: "seed-user-lena",
  malik: "seed-user-malik",
  sophie: "seed-user-sophie",
};

const groupIds = {
  friends: "seed-group-freundeskreis",
  flat: "seed-group-wg",
};

async function main() {
  // npm may consume --uid as one of its own options and forward only the value.
  const requestedUid = readArgument("--uid") || readPositionalUid();
  console.log(`Verbinde mit Auth ${authHost} und Firestore ${firestoreHost} (${projectId}) ...`);
  const primaryUid = requestedUid || await findPrimaryUserUid();

  console.log(`Verwende ${primaryUid} als primären App-Nutzer.`);
  console.log("Lege Auth-Nutzer an ...");
  await ensureAuthUser(primaryUid);
  await Promise.all([
    ensureAuthUser(seedUserIds.lena, "Lena"),
    ensureAuthUser(seedUserIds.malik, "Malik"),
    ensureAuthUser(seedUserIds.sophie, "Sophie"),
  ]);

  console.log("Schreibe Profile, Gruppen und Aktivitäten ...");
  const primaryRef = db.doc(`User/${primaryUid}`);
  const primarySnapshot = await primaryRef.get();
  const primaryData = primarySnapshot.data() || {};
  const existingGroupIds = Array.isArray(primaryData.groupUuids) ? primaryData.groupUuids : [];
  const primaryGroupIds = [...new Set([...existingGroupIds, ...Object.values(groupIds)])];
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();

  batch.set(primaryRef, {
    id: primaryUid,
    username: primaryData.username || "Alex (Test)",
    icon: primaryData.icon || "avatar1",
    language: primaryData.language || "de",
    appearance: primaryData.appearance || "light",
    groupUuids: primaryGroupIds,
    updatedAt: now,
  }, {merge: true});

  setUser(batch, seedUserIds.lena, "Lena", "avatar4", [groupIds.friends, groupIds.flat]);
  setUser(batch, seedUserIds.malik, "Malik", "avatar8", [groupIds.friends]);
  setUser(batch, seedUserIds.sophie, "Sophie", "avatar12", [groupIds.friends, groupIds.flat]);

  batch.set(db.doc(`Group/${groupIds.friends}`), {
    name: "Freundeskreis",
    description: "Gemeinsame Unternehmungen, Essen und Wochenendpläne.",
    icon: "friends",
    ownerUuid: primaryUid,
    memberUuids: [primaryUid, seedUserIds.lena, seedUserIds.malik, seedUserIds.sophie],
    updatedAt: now,
  });

  batch.set(db.doc(`Group/${groupIds.flat}`), {
    name: "Unsere WG",
    description: "Alles rund um die Wohnung und gemeinsame Abende.",
    icon: "home",
    ownerUuid: primaryUid,
    memberUuids: [primaryUid, seedUserIds.lena, seedUserIds.sophie],
    updatedAt: now,
  });

  const dates = createRelativeDates();

  setActivity(batch, groupIds.friends, "seed-activity-brunch", {
    name: "Sonntagsbrunch planen",
    description: "Gemütlich brunchen und danach eine Runde spazieren gehen.",
    destination: "Café Morgenrot",
    minParticipants: 3,
    duration: {hours: 2, minutes: 30},
    declinedUserUuids: [seedUserIds.malik],
    timeSlotsPerUserUuid: [
      timeSlot([primaryUid, seedUserIds.lena, seedUserIds.sophie], dates.nextSaturday, 10, 0, 13, 0),
      timeSlot([primaryUid, seedUserIds.lena], dates.nextSunday, 11, 0, 14, 0),
    ],
    state: "pending",
    createdBy: primaryUid,
  });

  const boulderingTime = interval(dates.inThreeDays, 18, 30, 21, 0);
  setActivity(batch, groupIds.friends, "seed-activity-bouldering", {
    name: "Bouldern",
    description: "Ein paar Routen klettern und anschließend etwas trinken.",
    destination: "Boulderhalle Nord",
    minParticipants: 2,
    duration: {hours: 2},
    memberUuids: [primaryUid, seedUserIds.malik, seedUserIds.sophie],
    time: boulderingTime,
    declinedUserUuids: [seedUserIds.lena],
    timeSlotsPerUserUuid: [{userUuid: [primaryUid, seedUserIds.malik, seedUserIds.sophie], slots: boulderingTime, selected: true}],
    state: "scheduled",
    createdBy: seedUserIds.malik,
  });

  setActivity(batch, groupIds.flat, "seed-activity-games", {
    name: "Spieleabend",
    description: "Jede Person bringt ein Lieblingsspiel und einen Snack mit.",
    destination: "Wohnzimmer",
    minParticipants: 2,
    duration: {hours: 3},
    declinedUserUuids: [],
    timeSlotsPerUserUuid: [
      timeSlot([primaryUid, seedUserIds.lena], dates.inTwoDays, 19, 0, 23, 0),
      timeSlot([primaryUid, seedUserIds.sophie], dates.inFourDays, 18, 30, 22, 30),
    ],
    state: "pending",
    createdBy: seedUserIds.lena,
  });

  const cookingTime = interval(dates.inSevenDays, 17, 30, 21, 30);
  setActivity(batch, groupIds.flat, "seed-activity-cooking", {
    name: "Gemeinsam kochen",
    description: "Neue Pasta ausprobieren und den Einkaufszettel vorher abstimmen.",
    destination: "WG-Küche",
    minParticipants: 2,
    duration: {hours: 3},
    memberUuids: [primaryUid, seedUserIds.lena, seedUserIds.sophie],
    time: cookingTime,
    declinedUserUuids: [],
    timeSlotsPerUserUuid: [{userUuid: [primaryUid, seedUserIds.lena, seedUserIds.sophie], slots: cookingTime, selected: true}],
    state: "scheduled",
    createdBy: seedUserIds.sophie,
  });

  await batch.commit();
  await verifySeed(primaryUid);

  console.log("\nTestdaten wurden angelegt bzw. aktualisiert.");
  console.log(`Primärer App-Nutzer: ${primaryUid}`);
  console.log("4 User, 2 Gruppen und 4 Aktivitäten sind jetzt verfügbar.");
  console.log("Falls die App mit einer anderen UID läuft: npm run seedEmulator -- --uid <UID>");
}

async function verifySeed(primaryUid) {
  const [friendsGroup, friendsActivities, flatGroup, flatActivities, primaryUser] = await Promise.all([
    db.doc(`Group/${groupIds.friends}`).get(),
    db.collection(`Group/${groupIds.friends}/Activity`).get(),
    db.doc(`Group/${groupIds.flat}`).get(),
    db.collection(`Group/${groupIds.flat}/Activity`).get(),
    db.doc(`User/${primaryUid}`).get(),
  ]);

  const primaryGroups = primaryUser.data()?.groupUuids || [];
  const valid = friendsGroup.exists && flatGroup.exists && primaryUser.exists &&
    friendsActivities.size === 2 && flatActivities.size === 2 &&
    Object.values(groupIds).every((groupId) => primaryGroups.includes(groupId));

  if (!valid) throw new Error("Die Kontrolle der geschriebenen Testdaten ist fehlgeschlagen.");
  console.log("Seed-Kontrolle erfolgreich: 2 Gruppen und 4 Aktivitäten gefunden.");
}

function setUser(batch, uid, username, icon, userGroupIds) {
  batch.set(db.doc(`User/${uid}`), {
    id: uid,
    username,
    icon,
    language: "de",
    appearance: "light",
    groupUuids: userGroupIds,
    available: [
      {day: 5, startHour: 18, startMinute: 0, endHour: 23, endMinute: 0},
      {day: 6, startHour: 10, startMinute: 0, endHour: 22, endMinute: 0},
    ],
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});
}

function setActivity(batch, groupId, activityId, activity) {
  batch.set(db.doc(`Group/${groupId}/Activity/${activityId}`), {
    ...activity,
    owningGroupId: groupId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function timeSlot(userUuid, date, startHour, startMinute, endHour, endMinute) {
  return {userUuid, slots: interval(date, startHour, startMinute, endHour, endMinute)};
}

function interval(date, startHour, startMinute, endHour, endMinute) {
  return {
    start: Timestamp.fromDate(atLocalTime(date, startHour, startMinute)),
    end: Timestamp.fromDate(atLocalTime(date, endHour, endMinute)),
  };
}

function atLocalTime(date, hour, minute) {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function createRelativeDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    inTwoDays: addDays(today, 2),
    inThreeDays: addDays(today, 3),
    inFourDays: addDays(today, 4),
    inSevenDays: addDays(today, 7),
    nextSaturday: nextWeekday(today, 6),
    nextSunday: nextWeekday(today, 0),
  };
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function nextWeekday(date, weekday) {
  const daysUntil = (weekday - date.getDay() + 7) % 7 || 7;
  return addDays(date, daysUntil);
}

async function findPrimaryUserUid() {
  const users = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);

  const appUsers = users
    .filter((user) => !user.uid.startsWith("seed-user-"))
    .sort((a, b) => userActivityTime(b) - userActivityTime(a));

  if (appUsers.length === 0) {
    throw new Error(
      "Kein App-Nutzer im Auth-Emulator gefunden. Starte die App einmal, " +
      "warte auf die anonyme Anmeldung und führe das Seed-Script danach erneut aus.",
    );
  }
  return appUsers[0].uid;
}

function userActivityTime(user) {
  const time = user.metadata.lastSignInTime || user.metadata.creationTime;
  return time ? new Date(time).getTime() : 0;
}

async function ensureAuthUser(uid, displayName) {
  try {
    await auth.getUser(uid);
    if (displayName) await auth.updateUser(uid, {displayName});
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    await auth.createUser({uid, ...(displayName ? {displayName} : {})});
  }
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} benötigt einen Wert.`);
  return value;
}

function readPositionalUid() {
  return process.argv.slice(2).find((value) => !value.startsWith("--"));
}

function assertLocalEmulatorHost(host, variableName) {
  const hostname = host.replace(/^https?:\/\//, "").split(":")[0];
  if (!["127.0.0.1", "localhost", "0.0.0.0", "::1"].includes(hostname)) {
    throw new Error(`${variableName} muss auf einen lokalen Emulator zeigen, erhalten: ${host}`);
  }
}

main().catch((error) => {
  console.error("\nTestdaten konnten nicht angelegt werden:", error.message);
  process.exitCode = 1;
});
