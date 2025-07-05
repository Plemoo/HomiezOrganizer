import { serverTimestamp } from '@react-native-firebase/firestore'
import * as Linking from 'expo-linking'
import { IDbInvitation } from '../interfaces/InviteInterface'
import { IJoinLinkSearchParams } from '../interfaces/JoinInterface'
import { FirebaseExchange } from './firebaseExchange'

export const createInviteLink = (groupId: string): Promise<string> => {
    let newInvitation: IDbInvitation = {
        groupId,
        createdAt: serverTimestamp() as any
    }
    return FirebaseExchange.addDocumentToCollection("Group", newInvitation, groupId, "Invitation")
        .then((docId) => {
            let params: IJoinLinkSearchParams = {
                groupId,
                inviteCode: docId.id
            }
            return Linking.createURL("Join", {
                queryParams: params as Linking.QueryParams
            })
        })

}

