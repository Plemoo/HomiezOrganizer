import { serverTimestamp } from '@react-native-firebase/firestore'
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
            return `https://homiesorganizer.web.app/Join?groupId=${params.groupId}&inviteCode=${params.inviteCode}`;
            // return Linking.createURL("Join", {
            //     queryParams: params as Linking.QueryParams
            // })
        })

}

