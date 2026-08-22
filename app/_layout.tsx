import { AlertProvider } from "@/components/AlertContext";
import { NotificationsProvider } from "@/components/NotificationContext";
import { UserProvider, useUser } from "@/components/ProfileInformationContext";
import { ThemeProvider, useCustomTheme } from "@/components/ThemeContext";
import LoadingDots from "@/components/Loading";
import { Stack } from "expo-router";
import { I18nextProvider, useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../assets/ts/i18next";

export default function RootLayout() {
  // const router = useRouter()
  // // 1) Handle taps when app is **already running**
  // useEffect(() => {
  //   const sub = Notifications.addNotificationResponseReceivedListener(resp => {
  //     const data: any = resp.notification.request.content.data
  //     handleNotificationResponse(data)
  //   })
  //   return () => sub.remove()
  // }, [])

  // // 2) Handle taps when app is **cold-started** via a notification
  // useEffect(() => {
  //   Notifications.getLastNotificationResponseAsync().then(resp => {
  //     if (!resp) return
  //     const data: any = resp.notification.request.content.data
  //     handleNotificationResponse(data)
  //   })
  // }, [])


  // const handleNotificationResponse = (data: IFirebaseDataActivityNotification) => {
  //   if (data.params && data.params.activityIdParameter && data.params.groupIdParameter) {
  //     let routeParameter: IFirebaseSearchParameter = {
  //       groupIdParameter: data.params?.groupIdParameter,
  //       activityIdParameter: data.params?.activityIdParameter
  //     }
  //     if (data.type === "pending") { // Neue Aktivität
  //       router.replace({ pathname: "/(tabs)/activities/ActivityDetail", params: routeParameter as UnknownInputParams })
  //     } else if (data.type === "scheduled") { // Aktivität bestätigt
  //       router.replace({ pathname: "/(tabs)/activities/ScheduledActivity", params: routeParameter as UnknownInputParams })
  //     } else if (data.type === "cancelled") { // Aktivität abgesagt
  //       router.replace({ pathname: "/(tabs)/groups/GroupDetail", params: routeParameter as UnknownInputParams })
  //     }
  //   }
  // }

  return (
    <UserProvider>
      <NotificationsProvider>
        <ThemeProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <I18nextProvider i18n={i18n}>
              <AlertProvider>
                <RootContent />
              </AlertProvider>
            </I18nextProvider>
          </SafeAreaView>
        </ThemeProvider>
      </NotificationsProvider>
    </UserProvider >
  );
}

function RootContent() {
  const { accountDeleted, createNewAccount, userLoading } = useUser();
  const { theme } = useCustomTheme();
  const { t } = useTranslation();

  if (accountDeleted) {
    return (
      <View style={[theme.containers.rootContainer, theme.containers.centeredContainer, { gap: theme.spacing.large }]}>
        <Text style={[theme.typography.heading1, { textAlign: "center" }]}>{t("settings.accountDeletedTitle")}</Text>
        <Text style={[theme.typography.body, { textAlign: "center" }]}>{t("settings.accountDeletedMessage")}</Text>
        {userLoading ? (
          <LoadingDots visible />
        ) : (
          <Pressable style={theme.button} onPress={() => void createNewAccount()}>
            <Text style={theme.buttonText}>{t("settings.createNewAccount")}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Join" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
