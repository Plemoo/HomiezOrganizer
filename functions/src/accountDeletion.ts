// Keep this planning logic independent of the Firebase Admin SDK so it can be
// type-checked and unit-tested without installing the Functions dependencies.
type DocumentData = Record<string, unknown>;

export type GroupDeletionPlan =
    {deleteGroup: true} |
    {deleteGroup: false; memberUuids: unknown[]; ownerUuid?: unknown};

export function planGroupDeletion(group: DocumentData, userId: string): GroupDeletionPlan {
    const members = Array.isArray(group.memberUuids) ? group.memberUuids : [];
    const remainingMembers = members.filter(memberId => memberId !== userId);
    if (remainingMembers.length === 0) return {deleteGroup: true};

    const ownerUuid = group.ownerUuid || members[0];
    return {
        deleteGroup: false,
        memberUuids: remainingMembers,
        ...(ownerUuid === userId ? {ownerUuid: remainingMembers[0]} : {}),
    };
}

export function planActivityDeletion(activity: DocumentData, userId: string): DocumentData | null {
    if (activity.createdBy === userId) return null;

    const declinedUserUuids = removeUserFromArray(activity.declinedUserUuids, userId);
    const memberUuids = Array.isArray(activity.memberUuids) ?
        removeUserFromArray(activity.memberUuids, userId) : undefined;
    const timeSlotsPerUserUuid = Array.isArray(activity.timeSlotsPerUserUuid) ?
        activity.timeSlotsPerUserUuid
            .filter(isDocumentData)
            .map(timeSlot => ({
                ...timeSlot,
                userUuid: removeUserFromArray(timeSlot.userUuid, userId),
            }))
            .filter(timeSlot => timeSlot.userUuid.length > 0) : [];

    return {
        declinedUserUuids,
        timeSlotsPerUserUuid,
        ...(memberUuids !== undefined ? {memberUuids} : {}),
    };
}

function removeUserFromArray(value: unknown, userId: string): unknown[] {
    return Array.isArray(value) ? value.filter(memberId => memberId !== userId) : [];
}

function isDocumentData(value: unknown): value is DocumentData {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
