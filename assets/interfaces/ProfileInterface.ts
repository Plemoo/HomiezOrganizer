import { ITimeInterval } from "./HelperInterface";

export interface IDbUser extends ICommonUser{
    id:string;
}

export interface ILocalUser extends ICommonUser{
    uuid:string;
}

export interface ICommonUser{
    username?: string;
    icon: string;
    birthday?:Date;
    busy?:ITimeInterval[];
    available?:ITimeInterval[];
    groupUuids?:string[];
}