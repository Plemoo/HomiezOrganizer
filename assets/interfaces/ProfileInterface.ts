import { FieldValue } from "firebase/firestore/lite";
import { z } from "zod";
import { BusyAvailableTimesSchema, CommonUserSchema, LocalUserSchema } from "../ts/schemas";

export type ICommonUser = z.infer<typeof CommonUserSchema>;
export type ILocalUser = z.infer<typeof LocalUserSchema>;
export type IBusyAvailableTimes = z.infer<typeof BusyAvailableTimesSchema>;


export interface IDbUser extends ICommonUser{
    updatedAt?:Date|FieldValue;
}

// export interface ILocalUser extends ICommonUser{
//     language:"de"|"en";
// }

// export interface ICommonUser{
//     id:string;
//     username?: string;
//     icon: string;
//     birthday?:Date;
//     busy?:IBusyAvailableTimes[];
//     available?:IBusyAvailableTimes[];
//     groupUuids?:string[];
// }

export interface ITimePickerProps extends IBusyAvailableModalType {
  submitTimes:(time:IBusyAvailableTimes, type:IBusyAvailableModalType)=>void;
  title:string;
  buttonText:string;
}

// export interface IBusyAvailableTimes{
//   day: number;
//   startHour: number;
//   startMinute: number;
//   endHour: number;
//   endMinute: number;
// }

  export interface IBusyAvailableModalType{
    type:"busy"|"available";
  }

    export interface IBusyAvailableModal extends IBusyAvailableModalType{
    title:string;
    buttonText:string;
  }
