import { redeemInvite } from '@/assets/ts/groupInvite'
import { useUser } from '@/components/ProfileInformationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'

export default function JoinPage() {
    const allParames = useLocalSearchParams()
    const { groupId, inviteCode } = useLocalSearchParams<{
        groupId: string
        inviteCode: string
    }>()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const { user } = useUser();

    useEffect(() => {
        console.log("ALL SEARCH PARAMS",allParames )
        console.log("join group", groupId, inviteCode, user)
        console.log("user",user)
        console.log("group", groupId)
        console.log("invite",inviteCode)
        if (!groupId || !inviteCode || !user) {
            Alert.alert('Could not join group')
            router.replace('..')
            return
        }
        redeemInvite(groupId, inviteCode, user.id)
            .then(() => {
                // success → navigate into the group screen
                router.replace({ pathname: '/(tabs)/groups/GroupDetail', params: { groupIdString: groupId } })
            })
            .catch((err:any) => {
                Alert.alert('Could not join group', err)
                router.replace('..')
            })
            .finally(() => setLoading(false))
    }, [groupId, inviteCode])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
                <Text>Joining group…</Text>
            </View>
        )
    }
    return null
}