import { z } from "zod";
import { DbInvitationSchema, InvitationSchema } from "../ts/schemas";

export type IInvitation = z.infer<typeof InvitationSchema>;
export type IDbInvitation = z.infer<typeof DbInvitationSchema>;
