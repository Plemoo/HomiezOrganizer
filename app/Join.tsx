import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface'
import { IJoinLinkSearchParams } from '@/assets/interfaces/JoinInterface'
import { FirebaseExchange } from '@/assets/ts/firebaseExchange'
import { useAlert } from '@/components/AlertContext'
import LoadingDots from '@/components/Loading'
import { useUser } from '@/components/ProfileInformationContext'
import { UnknownInputParams, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function JoinPage() {
    const { groupId, inviteCode }: IJoinLinkSearchParams = useLocalSearchParams()
    const router = useRouter()
    const { user, userLoading } = useUser()
    const { showAlert } = useAlert()
    const { t } = useTranslation()

    useEffect(() => {
        if (userLoading || !user) return

        if (!groupId || !inviteCode || !user.id) {
            console.error("Invalid parameters for joining group:", { groupId, inviteCode, user })
            router.replace('/(tabs)/activities/Activities')
            return
        }

        FirebaseExchange.redeemGroupInvite(groupId, inviteCode)
            .then(() => {
                const searchParams: IFirebaseSearchParameter = { groupIdParameter: groupId }
                router.replace({
                    pathname: '/(tabs)/groups/GroupDetail',
                    params: searchParams as UnknownInputParams
                })
            })
            .catch((err: unknown) => {
                showAlert({
                    title: t("groups.joinGroupErrorDialog.title"),
                    message: t("groups.joinGroupErrorDialog.message")
                })
                console.error("Error redeeming invite:", err)
                router.replace('/(tabs)/activities/Activities')
            })
    }, [groupId, inviteCode, router, showAlert, t, user, userLoading])

    return <LoadingDots visible />
}
