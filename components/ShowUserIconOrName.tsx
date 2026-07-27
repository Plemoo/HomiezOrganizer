import useAvatarIcons from '@/assets/hooks/iconGatheringHook'
import useUiIcons from '@/assets/hooks/uiIconHook'
import { ILocalUser } from '@/assets/interfaces/ProfileInterface'
import { Image } from 'expo-image'
import React, { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useCustomTheme } from './ThemeContext'

type Props = {
    users: ILocalUser[];
    showNamesOrIcons: "names" | "icons";
    onRemoveUser?: (user: ILocalUser) => void;
    canRemoveUser?: (user: ILocalUser) => boolean;
};

const ShowUserIconOrName = ({ users, showNamesOrIcons, onRemoveUser, canRemoveUser }: Props): JSX.Element | null => {
    const { avatars } = useAvatarIcons()
    const { theme } = useCustomTheme();
    const uiIcons = useUiIcons();
    const { t } = useTranslation();

    if (showNamesOrIcons === "icons") {
        return (
            <FlatList
                data={users}
                numColumns={4}
                key={"icons"}
                keyExtractor={u => u.id + "icon"}
                scrollEnabled={false}
                // contentContainerStyle={{flex:1, alignItems: "baseline", backgroundColor:"red", gap:20}}
                columnWrapperStyle={{ justifyContent: "space-around", alignItems: "center" }}
                extraData={showNamesOrIcons}
                renderItem={({ item, index }) => (
                    <View key={index + "activityMemberIcon"} style={{ alignItems: "center" }}>
                        <View style={{ borderRadius: 50, borderWidth: 2, borderColor: theme.colors.secondary, padding: 5, backgroundColor:theme.colors.secondary }}>
                            <Image
                                style={{ height: 50, width: 50 }}
                                source={avatars[item.icon]}
                            />
                        </View>
                        {onRemoveUser && (canRemoveUser?.(item) ?? true) && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("groups.removeMemberAction", { name: item.username ?? t("groups.unnamedMember") })}
                                onPress={() => onRemoveUser(item)}
                                hitSlop={8}
                                style={{ marginTop: theme.spacing.small }}
                            >
                                <uiIcons.RemoveUser size={22} color={theme.colors.primary} />
                            </Pressable>
                        )}
                    </View>
                )}
            />
        )
    }
    if (showNamesOrIcons === "names") {
        return (
            <FlatList
                data={users}
                numColumns={2}
                key={"names"}
                keyExtractor={u => u.id + "name"}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: "space-around", alignItems: "center" }}
                extraData={showNamesOrIcons}
                renderItem={({ item, index }) => (
                    <View key={index + "activityMemberName"} style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.small }}>
                        <Text style={[theme.typography.body, { textAlign: "center" }]}>{item.username}</Text>
                        {onRemoveUser && (canRemoveUser?.(item) ?? true) && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("groups.removeMemberAction", { name: item.username ?? t("groups.unnamedMember") })}
                                onPress={() => onRemoveUser(item)}
                                hitSlop={8}
                            >
                                <uiIcons.RemoveUser size={22} color={theme.colors.primary} />
                            </Pressable>
                        )}
                    </View>
                )}
            />
        )
    }
    return null;
}

export default ShowUserIconOrName
