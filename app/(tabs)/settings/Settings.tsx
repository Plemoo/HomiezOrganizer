import useUiIcons from '@/assets/hooks/uiIconHook';
import { useCustomTheme } from '@/components/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const Settings = () => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const router = useRouter();
  const uiIcons = useUiIcons();
  
  return (
    <View style={theme.containers.rootContainer}>
      <View>
        <View>
          <Text style={theme.typography.heading1}>{t("settings.account")}</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/settings/Profile")}>
          <View style={styles.settingsRowContainer}>
            <View>
              <uiIcons.HumanIcon size={30} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={theme.typography.heading3}>{t("settings.profileSettings")}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>{t("settings.profileSettingsSubtext")}</Text>
            </View>
          </View>
        </Pressable>
      </View>
      <View>
        <View>
          <Text style={theme.typography.heading1}>{t("settings.appSettings")}</Text>
        </View>
        <View style={styles.settingsRowContainer}>
          <View>
            <uiIcons.NotificationIcon size={30} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={theme.typography.heading3}>{t("settings.notifications")}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.secondary, width: "90%" }]}>{t("settings.notificationsSubtext")}</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/settings/PersonalAvailability")}>
        <View style={styles.settingsRowContainer}>
          <View>
            <uiIcons.CalendarIcon size={30} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={theme.typography.heading3}>{t("settings.personalAvailability")}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.secondary, width: "90%" }]}>{t("settings.personalAvailabilitySubtext")}</Text>
          </View>
        </View>
        </Pressable>
      </View>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  settingsRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    paddingVertical: 10
  }
})