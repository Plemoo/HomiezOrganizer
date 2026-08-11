import useUiIcons from '@/assets/hooks/uiIconHook';
import { useCustomTheme } from '@/components/ThemeContext';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

const Settings = () => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const router = useRouter();
  const uiIcons = useUiIcons();
  const privacyPolicyUrl = "https://plemoo.github.io/HomiezOrganizer/privacyPolicy.html";
  
  return (
    <View style={theme.containers.rootContainer}>
      <View>
        <View>
          <Text style={theme.typography.heading1}>{t("settings.account")}</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/settings/Profile")} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
          <View style={[settingsRowStyle(theme), { borderBottomWidth: 0 }]}>
            <View style={iconStyle(theme)}>
              <uiIcons.HumanIcon size={30} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={theme.typography.heading3}>{t("settings.profileSettings")}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.muted }]}>{t("settings.profileSettingsSubtext")}</Text>
            </View>
          </View>
        </Pressable>
      </View>
      <View>
        <View>
          <Text style={theme.typography.heading1}>{t("settings.appSettings")}</Text>
        </View>
        <View style={settingsRowStyle(theme)}>
          <View style={iconStyle(theme)}>
            <uiIcons.NotificationIcon size={30} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={theme.typography.heading3}>{t("settings.notifications")}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.muted, width: "90%" }]}>{t("settings.notificationsSubtext")}</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/settings/PersonalAvailability")} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
        <View style={settingsRowStyle(theme)}>
          <View style={iconStyle(theme)}>
            <uiIcons.CalendarIcon size={30} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={theme.typography.heading3}>{t("settings.personalAvailability")}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.muted, width: "90%" }]}>{t("settings.personalAvailabilitySubtext")}</Text>
          </View>
        </View>
        </Pressable>
        <Pressable onPress={() => void WebBrowser.openBrowserAsync(privacyPolicyUrl)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
          <View style={[settingsRowStyle(theme), { borderBottomWidth: 0 }]}>
            <View style={iconStyle(theme)}>
              <uiIcons.InfoIcon size={30} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={theme.typography.heading3}>{t("settings.privacyPolicy")}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.muted, width: "90%" }]}>{t("settings.privacyPolicySubtext")}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

export default Settings

const settingsRowStyle = (theme: ReturnType<typeof useCustomTheme>["theme"]) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  } as const)

const iconStyle = (theme: ReturnType<typeof useCustomTheme>["theme"]) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.colors.secondary,
} as const)
