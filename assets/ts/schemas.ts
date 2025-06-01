import { z } from 'zod';
import { getRandomAvatarIcon } from './generalHelper';

const TimeIntervalSchema = z.object({
    start:z.date(),
    end:z.date()
})

export const LocalUserSchema = z.object({
    uuid: z.string(),
    available:z.array(TimeIntervalSchema).optional(),
    birthday: z.date().optional(), // You can also use z.date() if you want to handle Date objects
    busy: z.array(TimeIntervalSchema).optional(),
    username: z.string().optional(),
    groupUuids: z.array(z.string()).optional(),
    icon: z.string().default(getRandomAvatarIcon()),
});