import { z } from "zod";
import { ActivityDurationSchema, ActivitySchema, DbActivitySchema, TimeIntervalSchema, TimeSlotsPerUserSchema } from "../ts/schemas";
import { IGroup } from "./GroupInterface";

export type IActivity = z.infer<typeof ActivitySchema>;
export type IDbActivity = z.infer<typeof DbActivitySchema>;
export type ITimeSlot = z.infer<typeof TimeSlotsPerUserSchema>;
export type ITimeInterval = z.infer<typeof TimeIntervalSchema>;
export type IDuration = z.infer<typeof ActivityDurationSchema>;

// export interface IActivity extends IDbActivity {
//   id: string;
// }

export interface IActivityWithGroupIcon extends IActivity {
  groupIcon:string;
}

export interface IActivitiesWithGroup{
  group: IGroup,
  activities: IActivity[]
}

// Dieses Interface ist wichtig, weil bei der Initialisierung die ID von Firebase gesetzt wird
// export interface IDbActivity{
//   name: string;
//   minParticipants: number;
//   duration: IDuration;
//   time?:ITimeInterval;
//   destination:string;
//   description: string;
//   memberUuids:string[];
//   timeSlotsPerUserUuid: ITimeSlot[];
//   declinedUserUuids: string[];
//   state: "pending" |"scheduled"| "closed";
//   owningGroupId:string;
// }

// export interface ITimeSlot{
//   userUuid: string[];
//   slots: ITimeInterval;
// }

// export interface ITimeInterval{
//   start:Date,
//   end:Date
// }

// export interface IDuration{
//   minutes?:number,
//   hours?:number,
//   days?: number
// }
