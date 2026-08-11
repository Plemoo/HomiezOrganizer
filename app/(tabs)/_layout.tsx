import { useUser } from "@/components/ProfileInformationContext";
import { useCustomTheme } from "@/components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TFunction } from "i18next";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

type TabScreenOptions = Exclude<ComponentProps<typeof Tabs.Screen>["options"], Function | undefined>;

enum TAB_NAMES {
  GROUPS = "groups",
  PLANNING = "planning",
  ACTIVITIES = "activities",
  SETTINGS = "settings"
}
export default function TabLayout() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { theme } = useCustomTheme();

  return (
    <Tabs safeAreaInsets={{ bottom: 0 }} screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text,
      headerShown: false,
      tabBarHideOnKeyboard: false,
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
      tabBarItemStyle: { paddingVertical: 6 },
      tabBarStyle: {
        height: 68,
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.secondary,
        borderTopWidth: 1,
        elevation: 0,
      },
    }}>
      <Tabs.Screen name={TAB_NAMES.GROUPS} options={({ route }) => defineTabOptions(route, t)} />
      <Tabs.Screen name={TAB_NAMES.PLANNING} options={({ route }) => defineTabOptions(route, t)} />
      <Tabs.Screen name={TAB_NAMES.ACTIVITIES} options={({ route }) => defineTabOptions(route, t)} /> 
      <Tabs.Screen name={TAB_NAMES.SETTINGS} options={({ route }) => defineTabOptions(route, t, user?.username ? undefined : { tabBarBadge: "!" })} />
    </Tabs>
  )
}

function defineTabOptions(route: { name: string }, t: TFunction, customOptions?: TabScreenOptions): TabScreenOptions {
  let title;
  let iconName: keyof typeof Ionicons.glyphMap;
  let iconNameOutline: keyof typeof Ionicons.glyphMap;
  switch (route.name) {
    case TAB_NAMES.GROUPS:
      title = t("groups.groupsTitle");
      iconName = "people";
      iconNameOutline = "people-outline";
      break;
    case TAB_NAMES.PLANNING:
      title = t("planning.planningTitle");
      iconName = "duplicate";
      iconNameOutline = "duplicate-outline";
      break;
    case TAB_NAMES.ACTIVITIES:
      title = t("activities.activitiesTitle");
      iconName = "calendar";
      iconNameOutline = "calendar-outline";
      break;
    case TAB_NAMES.SETTINGS:
      title = t("settings.settingsTitle");
      iconName = "settings";
      iconNameOutline = "settings-outline";
      break;
    default:
      title = route.name;
      iconName = "home";
      iconNameOutline = "home-outline";
  }
  return {
    title: title,
    tabBarIcon: ({ color, focused }) => (
      <View style={{
        width: 42,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        backgroundColor: focused ? color : "transparent",
      }}>
        <Ionicons name={focused ? iconName : iconNameOutline} size={21} color={focused ? "#FFFFFF" : color} />
      </View>
    ),
    ...customOptions
  }
}
