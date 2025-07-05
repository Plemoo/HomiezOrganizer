import { IActivityState } from "./ActivityInterface";

export type TAvailableFirebaseCollections = "User" | "Group";
export type TAvailableFirebaseSubCollections =  "Activity"|"Invitation";
export type TAvailableFirebaseSubSubCollections =  "Comment";

export interface IFirebaseDataActivityNotification {
    type: IActivityState |"comment";
    params: IFirebaseSearchParameter;
}

export interface IFirebaseSearchParameter{
        groupIdParameter?: string;// Used in Notifications(layout.tsx) -> ScheduledActivity/ActivityDetail
        activityIdParameter?: string; // Used in Notifications(layout.tsx) -> ScheduledActivity/ActivityDetail
        // activityStringified?:string; // Used in ActivityListItem -> ActivityDetail/ScheduledActivity
        userIdsForGroupStringified?: string; // Used in newGroup ->Groups
}