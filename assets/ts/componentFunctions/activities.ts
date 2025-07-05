import { IActivity, IActivityWithGroupIcon } from "@/assets/interfaces/ActivityInterface"
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

// export const getCombinedArrayWithUniqueActivities = (activities1: IActivityWithGroupIcon[] | IActivity[], activities2: IActivityWithGroupIcon[] | IActivity[]): IActivityWithGroupIcon[] | IActivity[] => {
//     const existingIds = new Set(activities1.map(activity => activity.id));
//     const newActivities = activities2.filter(activity => !existingIds.has(activity.id));
//     return [...activities1, ...newActivities];
// };


export const sortActivitiesByDueDate = (activity1: IActivity, activity2: IActivity): number => {
    const activity1Time = activity1.time ? new Date(activity1.time.start).getTime() : null;
    const activity2Time = activity2.time ? new Date(activity2.time.start).getTime() : null;
    if (activity1Time === null && activity2Time === null) return 0;
    if (activity1Time === null) return 1;
    if (activity2Time === null) return -1;
    return activity1Time - activity2Time;
};

export const sortActivitiesByEarliestAvailability = (activity1: IActivity, activity2: IActivity): number => {
    const activity1StartTimes = activity1.timeSlotsPerUserUuid.map(slot=>slot.slots).flat().map(slot=>slot.start.getTime());
    const activity2StartTimes = activity2.timeSlotsPerUserUuid.map(slot=>slot.slots).flat().map(slot=>slot.start.getTime());
    const earliestActivity1 = activity1StartTimes.length > 0 ? Math.min(...activity1StartTimes) : null;
    const earliestActivity2 = activity2StartTimes.length > 0 ? Math.min(...activity2StartTimes) : null;
    if (earliestActivity1 === null && earliestActivity2 === null) return 0;
    if (earliestActivity1 === null) return 1;
    if (earliestActivity2 === null) return -1;
    return earliestActivity1 - earliestActivity2;
};

export const getUniqueActivitiesWithGroupIcon = (oldActivitesByGroupIcon: IActivityWithGroupIcon[], newActivitesByGroupIcon: IActivityWithGroupIcon[]): IActivityWithGroupIcon[] => {
    const uniqueActivities = new Map<string, IActivityWithGroupIcon>();
    oldActivitesByGroupIcon.forEach(actWithIcon => uniqueActivities.set(actWithIcon.id, actWithIcon));
    // Overwrite existing groups with new ones
    newActivitesByGroupIcon.forEach(actWithIcon => uniqueActivities.set(actWithIcon.id, actWithIcon));

    return Array.from(uniqueActivities.values());
};