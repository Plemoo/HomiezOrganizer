import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore/lite";
import { IActivity } from "../interfaces/ActivityInterface";
import { IComment } from "../interfaces/CommentInterface";
import { IGroup } from "../interfaces/GroupInterface";
import { IInvitation } from "../interfaces/InviteInterface";
import { ILocalUser } from "../interfaces/ProfileInterface";
import { ActivitySchema, CommentSchema, GroupSchema, InvitationSchema, LocalUserSchema, zodErrorLogging } from "./schemas";

export const parseFirebaseGroup = (groupDoc: QueryDocumentSnapshot<DocumentData, DocumentData>|DocumentSnapshot<DocumentData, DocumentData>): IGroup | null => {
    if (groupDoc.exists()) {
        try {
            return GroupSchema.parse({ id: groupDoc.id, ...groupDoc.data() } as IGroup);
        } catch (err) {
            zodErrorLogging(err)
            return null;
        }
    }
    return null;
}
export const parseFirebaseUser = (userDoc: QueryDocumentSnapshot<DocumentData, DocumentData>|DocumentSnapshot<DocumentData, DocumentData>): ILocalUser | null => {
    if (userDoc.exists()) {
        try {
            return LocalUserSchema.parse({ id: userDoc.id, ...userDoc.data() } as ILocalUser);
        } catch (err) {
            zodErrorLogging(err)
            return null;
        }
    }
    return null;
}

export const parseFirebaseActivity = (activityDoc:QueryDocumentSnapshot<DocumentData, DocumentData>|DocumentSnapshot<DocumentData, DocumentData>): IActivity | null => {
    if (activityDoc.exists() && activityDoc.ref.parent.parent && activityDoc.ref.parent.parent.id) {
        try {
            return ActivitySchema.parse({ id: activityDoc.id, ...activityDoc.data(), owningGroupId: activityDoc.ref.parent.parent.id } as IActivity);
        } catch (err) {
            zodErrorLogging(err)
            return null;
        }
    }
    return null;
}


export const parseFirebaseComment = (commentDoc:QueryDocumentSnapshot<DocumentData, DocumentData>|DocumentSnapshot<DocumentData, DocumentData>): IComment | null => {
    if (commentDoc.exists() && commentDoc.ref.parent.parent && commentDoc.ref.parent.parent.id) {
        try {
            return CommentSchema.parse({ id: commentDoc.id, ...commentDoc.data()} as IComment);
        } catch (err) {
            zodErrorLogging(err)
            return null;
        }
    }
    return null;
}


export const parseFirebaseInvitation = (invitationDoc:QueryDocumentSnapshot<DocumentData, DocumentData>|DocumentSnapshot<DocumentData, DocumentData>): IInvitation | null => {
    if (invitationDoc.exists() && invitationDoc.ref.parent.parent && invitationDoc.ref.parent.parent.id) {
        try {
            return InvitationSchema.parse({ id: invitationDoc.id, ...invitationDoc.data()} as IInvitation);
        } catch (err) {
            zodErrorLogging(err)
            return null;
        }
    }
    return null;
}