import { IActivity, IActivityWithGroupIconAndName } from "@/assets/interfaces/ActivityInterface"
import { IGroup } from "@/assets/interfaces/GroupInterface"
import { FirebaseExchange } from "../firebaseExchange"
import { parseFirebaseActivity, parseFirebaseGroup } from "../parsing"

// TODO: Test schreiben?
export const getAllActivitiesByGroupIds = (groupIds: string[]): Promise<{ group: IGroup, activities: IActivity[] }[]> => {
    return FirebaseExchange.getFirebaseDocumentArray(groupIds, "Group")
        .then((groupDocs) => {
            return groupDocs.filter((groupDoc) => groupDoc.exists())
                .map((groupDoc) => parseFirebaseGroup(groupDoc))
                .filter((group) => group !== null)
        })
        .then((groups) => {
            const activityPromises = groups.map((group) => FirebaseExchange.getAllDocumentsOfCollection("Group", group.id, "Activity"));
            return Promise.all(activityPromises)
                .then((activityDocsArray) => {
                    return groups.map((group, idx) => ({
                        group,
                        activities: activityDocsArray[idx].docs
                            .map((activityDoc) => parseFirebaseActivity(activityDoc))
                            .filter((activity) => activity !== null)
                    }));
                });
        })
}


export const sortActivitiesByDueDate = (activity1: IActivity, activity2: IActivity): number => {
    const activity1Time = activity1.time ? new Date(activity1.time.start).getTime() : null;
    const activity2Time = activity2.time ? new Date(activity2.time.start).getTime() : null;
    if (activity1Time === null && activity2Time === null) return 0;
    if (activity1Time === null) return 1;
    if (activity2Time === null) return -1;
    return activity1Time - activity2Time;
};

export const sortActivitiesByEarliestAvailability = (activity1: IActivity, activity2: IActivity): number => {
    const activity1StartTimes = activity1.timeSlotsPerUserUuid.map(slot => slot.slots).flat().map(slot => slot.start.getTime());
    const activity2StartTimes = activity2.timeSlotsPerUserUuid.map(slot => slot.slots).flat().map(slot => slot.start.getTime());
    const earliestActivity1 = activity1StartTimes.length > 0 ? Math.min(...activity1StartTimes) : null;
    const earliestActivity2 = activity2StartTimes.length > 0 ? Math.min(...activity2StartTimes) : null;
    if (earliestActivity1 === null && earliestActivity2 === null) return 0;
    if (earliestActivity1 === null) return 1;
    if (earliestActivity2 === null) return -1;
    return earliestActivity1 - earliestActivity2;
};

export const getUniqueActivitiesWithGroupIcon = (oldActivitesByGroupIcon: IActivityWithGroupIconAndName[], newActivitesByGroupIcon: IActivityWithGroupIconAndName[]): IActivityWithGroupIconAndName[] => {
    const uniqueActivities = new Map<string, IActivityWithGroupIconAndName>();
    oldActivitesByGroupIcon.forEach(actWithIconAndName => uniqueActivities.set(actWithIconAndName.id, actWithIconAndName));
    // Overwrite existing groups with new ones
    newActivitesByGroupIcon.forEach(actWithIconAndName => uniqueActivities.set(actWithIconAndName.id, actWithIconAndName));

    return Array.from(uniqueActivities.values());
};

export const setStateForEndedActivitesToClosed = (activities: IActivity[]) => {
    activities
        .filter((a) => a.state === "scheduled")
        .filter((sa) => sa.time)
        .filter((sa) => sa.time!.end.getTime() < Date.now())
        .forEach((sa) => {
            const stateKey: keyof IActivity = "state";
            const stateKeyValue: IActivity["state"] = "closed";
            FirebaseExchange.updateFirestoreValueOfKey(sa.id, "Group", stateKey, stateKeyValue, sa.owningGroupId, "Activity")
        });
}