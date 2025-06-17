import useAvatarIcons from '@/assets/hooks/iconGatheringHook'
import { ILocalUser } from '@/assets/interfaces/ProfileInterface'
import { Image } from 'expo-image'
import React, { JSX } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useCustomTheme } from './ThemeContext'

const ShowUserIconOrName = ({users, showNamesOrIcons}: {users: ILocalUser[], showNamesOrIcons: "names" | "icons"}): JSX.Element | null => {
    const { avatars } = useAvatarIcons()
    const { theme } = useCustomTheme();

    if (showNamesOrIcons === "icons") {
        return (
            <FlatList
                data={users}
                numColumns={4}
                key={"icons"}
                keyExtractor={u => u.id + "icon"}
                scrollEnabled={false}
                extraData={showNamesOrIcons}
                renderItem={({ item, index }) => (
                    <View key={index + "activityMemberIcon"}>
                        <View style={{ borderRadius: 50, borderWidth: 2, borderColor: theme.colors.secondary, padding: 5 }}>
                            <Image
                                style={{ height: 50, width: 50 }}
                                source={avatars[item.icon]}
                            />
                        </View>
                    </View>
                )}
            />
        )}
        if(showNamesOrIcons === "names") {
        return (
            <FlatList
                data={users}
                numColumns={2}
                key={"names"}
                keyExtractor={u => u.id + "name"}
                scrollEnabled={false}
                extraData={showNamesOrIcons}
                renderItem={({ item, index }) => (
                    <View key={index + "activityMemberName"}>
                        <Text style={[theme.typography.heading3, { textAlign: "center" }]}>{item.username}</Text>
                    </View>
                )}
            />
        )
    }
    return null;
}

    export default ShowUserIconOrName