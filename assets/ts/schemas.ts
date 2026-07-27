import { z, ZodError } from 'zod';
import { getDefaultLanguage } from './i18next';

export const BusyAvailableTimesSchema = z.object({
    day: z.number(),
    startHour: z.number(),
    startMinute: z.number(),
    endHour: z.number(),
    endMinute: z.number()
})

const FirestoreTimestampSchema = z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
});

const DateOrFirestoreTimestamp = z.union([
    z.date(),
    FirestoreTimestampSchema,
    z.string()
]).transform((val) => {
    if (val instanceof Date) return val;
    if (typeof val === "string") {
        const date = new Date(val); // This will throw if the string is not a valid date
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date string");
        } else {
            return date;
        }
    }
    // Firestore timestamp object
    return new Date(val.seconds * 1000 + val.nanoseconds / 1e6);
});

export const CommonUserSchema = z.object({
    id: z.string(),
    available: z.array(BusyAvailableTimesSchema).optional(),
    birthday: DateOrFirestoreTimestamp.optional(), // You can also use z.date() if you want to handle Date objects
    busy: z.array(BusyAvailableTimesSchema).optional(),
    username: z.string().optional(),
    groupUuids: z.array(z.string()).optional(),
    icon: z.string().default(""),
    expoPushToken: z.string().optional(),
    appearance: z.enum(["light", "dark"]).default("light"), // Default to light theme
});

export const LocalUserSchema = CommonUserSchema.extend({
    language: z.union([z.literal("en"), z.literal("de")]).default(getDefaultLanguage())
});

export const DbGroupSchema = z.object({
    icon: z.string(),
    name: z.string(),
    description: z.string(),
    memberUuids: z.array(z.string()),
    // Groups created before ownership was introduced use their first member.
    ownerUuid: z.string().optional()
})

export const GroupSchema = DbGroupSchema.extend({
    id: z.string(),
})

export const TimeIntervalSchema = z.object({
    start: DateOrFirestoreTimestamp,
    end: DateOrFirestoreTimestamp
})

export const TimeSlotsPerUserSchema = z.object({
    userUuid: z.array(z.string()),
    slots: TimeIntervalSchema,
    selected: z.boolean().optional()
})

export const ActivityDurationSchema = z.object({
    days: z.number().optional(), 
    hours: z.number().optional(), 
    minutes: z.number().optional() 
})

export const ActivityStateSchema = z.enum(["scheduled", "pending", "closed","cancelled"]);


export const DbActivitySchema = z.object({
    name: z.string(),
    description: z.string(),
    destination: z.string(),
    memberUuids: z.array(z.string()).optional(), // Only filled when the activity is scheduled
    minParticipants: z.number(),
    duration: ActivityDurationSchema,
    time: TimeIntervalSchema.optional(),
    declinedUserUuids: z.array(z.string()),
    timeSlotsPerUserUuid: z.array(TimeSlotsPerUserSchema),
    state: ActivityStateSchema,
    owningGroupId: z.string(),
    createdBy: z.string()
})



export const ActivitySchema = DbActivitySchema.extend({
    id: z.string(),
})

export const DbCommentSchema = z.object({
    userUuid: z.string(),
    text: z.string(),
    userIcon:z.string(),
    userName: z.string(),
    createdAt:DateOrFirestoreTimestamp
})

export const CommentSchema = DbCommentSchema.extend({
    id: z.string(),
})

export const DbInvitationSchema = z.object({
    groupId: z.string(),
    createdAt: DateOrFirestoreTimestamp
})

export const InvitationSchema = DbInvitationSchema.extend({
    id: z.string(),
})


export function zodErrorLogging(error: any) {
    if (error instanceof ZodError) {
        console.error(`Error during zod parse: ${error.errors.map(e => e.message + " for " + e.path.join(".")).join(" - ")}`)
    }
    console.error("Unknown Error", error);
}
