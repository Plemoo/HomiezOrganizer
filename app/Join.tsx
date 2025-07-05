import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface'
import { IGroup } from '@/assets/interfaces/GroupInterface'
import { IJoinLinkSearchParams } from '@/assets/interfaces/JoinInterface'
import { ILocalUser } from '@/assets/interfaces/ProfileInterface'
import { FirebaseExchange } from '@/assets/ts/firebaseExchange'
import LoadingDots from '@/components/Loading'
import { useUser } from '@/components/ProfileInformationContext'
import { UnknownInputParams, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

export default function JoinPage() {
    const { groupId, inviteCode }: IJoinLinkSearchParams = useLocalSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const { user, userLoading } = useUser();
    // TODO: LOggings ausbauen und Fehlermeldungen lokalisieren
    useEffect(() => {
        if (userLoading) return // wait for user to be loaded
        if (!groupId || !inviteCode || !user || !user.id) {
            router.replace('..')
            return
        }
        // TODO: Invite lesen und prüfen ob der DB Eintrag nicht schon zu alt ist
        redeemInvite(groupId, user.id)
            .then(() => {
                let searchParams: IFirebaseSearchParameter = {
                    groupIdParameter: groupId
                }
                // success → navigate into the group screen
                router.replace({ pathname: '/(tabs)/groups/GroupDetail', params: searchParams as UnknownInputParams })
            })
            .catch((err: any) => {
                console.error("Error redeeming invite:", err);
                router.replace('..')
            })
            .finally(() => setLoading(false))
    }, [groupId, inviteCode, userLoading]);


    const redeemInvite = async (groupId: string, userId: string) => {
        if (user && user.groupUuids && user.groupUuids.includes(groupId)) {
            // User is already in the group, so just return
            console.warn("User is already a member of the group, no need to redeem invite.");
            return;
        }
        const userGroupId: keyof ILocalUser = "groupUuids";
        const groupMemberIds: keyof IGroup = "memberUuids";
        // no await, to throw exceptions in the catch block of the redeemInvite function
        FirebaseExchange.addFirestoreValueToArray(userId, "User", userGroupId, groupId)
        FirebaseExchange.addFirestoreValueToArray(groupId, "Group", groupMemberIds, userId)
    }

    if (loading) return <LoadingDots visible />

    return null
}