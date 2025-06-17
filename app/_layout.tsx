import { UserProvider } from "@/components/ProfileInformationContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack initialRouteName="Startpage" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Startpage" />
            <Stack.Screen name="Join" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaView>
      </ThemeProvider>
    </UserProvider>
  );
}
