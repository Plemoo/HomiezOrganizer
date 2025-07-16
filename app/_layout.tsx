import { AlertProvider } from "@/components/AlertContext";
import { NotificationsProvider } from "@/components/NotificationContext";
import { UserProvider } from "@/components/ProfileInformationContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
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
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="Join" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </AlertProvider>
            </I18nextProvider>
          </SafeAreaView>
        </ThemeProvider>
      </NotificationsProvider>
    </UserProvider >
  );
}
