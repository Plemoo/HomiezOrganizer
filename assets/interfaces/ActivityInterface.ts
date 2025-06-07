

export interface IActivity {
  id: string;
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
  state: "planning" | "pending" | "closed";
} 

interface ITimeInterval{
  start:Date,
  end:Date
}
