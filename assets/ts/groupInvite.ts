import * as Linking from 'expo-linking'
import { serverTimestamp } from 'firebase/firestore/lite'
import { IDbInvitation } from '../interfaces/InviteInterface'
import { addDocumentToCollection } from './firebaseExchange'

export const createInviteLink = (groupId: string): Promise<string> => {
    let newInvitation: IDbInvitation = {
        groupId,
        createdAt: serverTimestamp() as any
    }
    return addDocumentToCollection("Group", newInvitation, groupId, "Invitation")
        .then((docId) => {
            return Linking.createURL("Join", {
                queryParams: { groupId, inviteCode: docId.id }
            })
        })

}

export const redeemInvite = async (groupId: string, inviteCode: string, userId: string) => {
    console.log("TEST FOREVER")
    return "REDEEM"
    // TODO: LOGIK SCHREIBEN
    // Füge die userId zu der Gruppe hinzu
    // Aber nur wenn der User noch nicht in der Gruppe ist und wenn für den invitationeCode ein Dokument gefunden wurde und wenn das Invitattion Dokument nicht älter als 7 Tage ist
}