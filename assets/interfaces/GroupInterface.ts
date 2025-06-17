import { z } from "zod";
import { DbGroupSchema, GroupSchema } from "../ts/schemas";

export type IDbGroup = z.infer<typeof DbGroupSchema>;
export type IGroup = z.infer<typeof GroupSchema>;


// export interface IGroup extends IDbGroup {
//   id: string;
// }


// // Dieses Interface ist wichtig, weil bei der Initialisierung die ID von Firebase gesetzt wird
// export interface IDbGroup {
//   name: string;
//   icon:string;
//   memberUuids: string[];
//   description: string;
// }