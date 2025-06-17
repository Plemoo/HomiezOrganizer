import { z } from "zod";
import { CommentSchema, DbCommentSchema } from "../ts/schemas";

export type IComment = z.infer<typeof CommentSchema>;
export type IDbComment = z.infer<typeof DbCommentSchema>;
