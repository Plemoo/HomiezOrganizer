import { UserProvider } from "@/components/ProfileInformationContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
      <Stack initialRouteName="Startpage" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Startpage" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      </ThemeProvider>
    </UserProvider>

  );
}
