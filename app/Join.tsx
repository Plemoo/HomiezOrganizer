import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface'
import { IGroup } from '@/assets/interfaces/GroupInterface'
import { IJoinLinkSearchParams } from '@/assets/interfaces/JoinInterface'
import { ILocalUser } from '@/assets/interfaces/ProfileInterface'
import { FirebaseExchange } from '@/assets/ts/firebaseExchange'
import { parseFirebaseInvitation } from '@/assets/ts/parsing'
import { useAlert } from '@/components/AlertContext'
import LoadingDots from '@/components/Loading'
import { useUser } from '@/components/ProfileInformationContext'
import { UnknownInputParams, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function JoinPage() {
    const { groupId, inviteCode }: IJoinLinkSearchParams = useLocalSearchParams()
    const router = useRouter()
    const { user, userLoading } = useUser();
    const { showAlert } = useAlert();
    const { t } = useTranslation();

    useEffect(() => {
        if (userLoading || !user) {
            return; // wait for user to be loaded
        }
        if (!groupId || !inviteCode || !user || !user.id) {
            console.error("Invalid parameters for joining group:", { groupId, inviteCode, user });
            router.replace('/(tabs)/activities/Activities')
            return
        }
        FirebaseExchange.getFirebaseDocument(inviteCode, "Group", groupId, "Invitation")
            .then((inviteDoc) => {
                if (!inviteDoc.exists()) throw new Error("Invite does not exist or is invalid");
                const firebaseInvitation = parseFirebaseInvitation(inviteDoc);
                if (firebaseInvitation == null) throw new Error("Invite parsing failed, invite is invalid");
                const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
                if (Date.now() - firebaseInvitation.createdAt.getTime() > TEN_DAYS_MS) throw new Error("Invite has expired")
                return;
            }).then(() => {
                // redeem the invite
                return redeemInvite(groupId, user.id)
            })
            .then(() => {
                let searchParams: IFirebaseSearchParameter = {
                    groupIdParameter: groupId
                }
                // success → navigate into the group screen
                setTimeout(() => {
                    router.replace({ pathname: '/(tabs)/groups/GroupDetail', params: searchParams as UnknownInputParams })
                }, 2000) // wait 2 seconds to make sure the enty is added to the database
            })
            .catch((err: any) => {
                if (err.message === "Invite has expired") {
                    showAlert({
                        title: t("groups.joinGroupErrorDialog.title"),
                        message: t("groups.joinGroupErrorDialog.message")
                    })
                }
                console.error("Error redeeming invite:", err);
                router.replace('/(tabs)/activities/Activities')
            })
    }, [groupId, inviteCode, userLoading, user]);


    const redeemInvite = async (groupId: string, userId: string) => {
        if (user && user.groupUuids && user.groupUuids.includes(groupId)) {
            // User is already in the group, so just return
            console.warn("User is already a member of the group, no need to redeem invite.");
            return;
        }
        const userGroupId: keyof ILocalUser = "groupUuids";
        const groupMemberIds: keyof IGroup = "memberUuids";
        return FirebaseExchange.addFirestoreValueToArray(groupId, "Group", groupMemberIds, userId)
        .then(() => {
            return FirebaseExchange.addFirestoreValueToArray(userId, "User", userGroupId, groupId)
        }).catch((err: any) => {
            console.error("Error adding user to group:", err);
            throw new Error("Failed to add user to group");
        })
    }

    return <LoadingDots visible />
}