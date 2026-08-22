import useUiIcons from '@/assets/hooks/uiIconHook';
import { useCustomTheme } from '@/components/ThemeContext';
import { useAlert } from '@/components/AlertContext';
import { useUser } from '@/components/ProfileInformationContext';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

const Settings = () => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const { showAlert } = useAlert();
  const { deleteAccount } = useUser();
  const router = useRouter();
  const uiIcons = useUiIcons();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const privacyPolicyUrl = "https://homiesorganizer.web.app/privacyPolicy.html";

  const confirmAccountDeletion = () => {
    showAlert({
      title: t("settings.deleteAccountDialog.title"),
      message: t("settings.deleteAccountDialog.message"),
      cancelText: t("settings.deleteAccountDialog.cancel"),
      confirmText: t("settings.deleteAccountDialog.confirm"),
      onConfirm: () => {
        setIsDeletingAccount(true);
        void deleteAccount().catch((error) => {
          console.error("Account deletion failed:", error);
          setIsDeletingAccount(false);
          showAlert({
            title: t("settings.deleteAccountDialog.errorTitle"),
            message: t("settings.deleteAccountDialog.errorMessage"),
          });
        });
      },
    });
  };
  
  return (
    <View style={theme.containers.rootContainer}>
      <View>
        <View>
          <Text style={theme.typography.heading1}>{t("settings.account")}</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/settings/Profile")} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
          <View style={settingsRowStyle(theme)}>
            <View style={iconStyle(theme)}>
              <uiIcons.HumanIcon size={30} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={theme.typography.heading3}>{t("settings.profileSettings")}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.muted }]}>{t("settings.profileSettingsSubtext")}</Text>
            </View>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isDeletingAccount}
          onPress={confirmAccountDeletion}
          style={({ pressed }) => ({ opacity: pressed || isDeletingAccount ? 0.55 : 1 })}
        >
          <View style={[settingsRowStyle(theme), { borderBottomWidth: 0 }]}>
            <View style={iconStyle(theme)}>
              <uiIcons.TrashBinIcon size={30} color={theme.colors.error} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={[theme.typography.heading3, { color: theme.colors.error }]}>{t("settings.deleteAccount")}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.muted }]}>
                {isDeletingAccount ? t("settings.deletingAccount") : t("settings.deleteAccountSubtext")}
              </Text>
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
