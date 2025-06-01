// Aktivität Datenstruktur:
// {
// activityUuid:string,
// name:string,
// minParticipants:number,
// owningGroupUuid:string,
// duration:number,
// start:date,
// end:date,
// description:string
// timeSlotsPerUserUuid:[{userUuid:string, slots:[{start:date, end:date}]}]
// declinedUserUuids:string[]
// state:planning|pending|closed

import { ITimeInterval } from "./HelperInterface";

export interface IActivity {
  activityUuid: string;
  name: string;
  minParticipants: number;
  owningGroupUuid: string;
  duration: number; // in minutes
  time:ITimeInterval;
  description: string;
  timeSlotsPerUserUuid: {
    userUuid: string;
    slots: ITimeInterval[];
  }[];
  declinedUserUuids: string[];
  state: IActivityState;
} 

interface IActivityState{
      state: "planning" | "pending" | "closed";
}