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
  FirestoreTimestampSchema
]).transform((val) => {
  if (val instanceof Date) return val;
  // Firestore timestamp object
  return new Date(val.seconds * 1000 + val.nanoseconds / 1e6);
});

const CommonUserSchema = z.object({
    id: z.string(),
    available: z.array(BusyAvailableTimesSchema).optional(),
    birthday: DateOrFirestoreTimestamp.optional(), // You can also use z.date() if you want to handle Date objects
    busy: z.array(BusyAvailableTimesSchema).optional(),
    username: z.string().optional(),
    groupUuids: z.array(z.string()).optional(),
    icon: z.string().default(""),
});

export const LocalUserSchema = CommonUserSchema.extend({
    language: z.union([z.literal("en"), z.literal("de")]).default(getDefaultLanguage())
});

export const DbUserSchema = CommonUserSchema;

export const GroupSchema = z.object({
    id: z.string(),
    icon: z.string(),
    name: z.string(),
    description: z.string(),
    memberUuids: z.array(z.string()),
    activityUuids: z.array(z.string())
})

const TimeIntervalSchema = z.object({
    start: z.date(),
    end: z.date()
})

const TimeSlotsPerUserSchema = z.object({
    userUuid: z.string(),
    slots: z.array(TimeIntervalSchema)
})

export const ActivitySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    memberUuids: z.array(z.string()),
    owningGroupUuid: z.string(),
    minParticipants: z.number(),
    duration: z.number(),
    time: TimeIntervalSchema,
    declinedUserUuids: z.array(z.string()),
    timeSlotsPerUserUuid: z.array(TimeSlotsPerUserSchema),
    state: z.enum(["planning", "pending", "closed"])
})


export function zodErrorLogging(error: any) {
    if (error instanceof ZodError) {
        console.error(`Error during zod parse: ${error.errors.map(e => e.message + " for " + e.path.join(".")).join(" - ")}`)
    }
    console.error("Unknonw Error",error);
}