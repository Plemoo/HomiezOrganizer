
export interface IGroup extends IDbGroup {
  id: string;
}


export interface IDbGroup {
  name: string;
  icon:string;
  memberUuids: string[];
  description: string;
  activityUuids: string[];
}