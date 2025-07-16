import { useUser } from "@/components/ProfileInformationContext";
import { useCustomTheme } from "@/components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
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
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.colors.text,
      tabBarInactiveBackgroundColor: theme.colors.background,
      headerShown: false,
      tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: theme.colors.text, borderTopWidth: 0.5 },
    }}>
      <Tabs.Screen name={TAB_NAMES.GROUPS} options={({ route }) => defineTabOptions(route, t)} />
      <Tabs.Screen name={TAB_NAMES.PLANNING} options={({ route }) => defineTabOptions(route, t)} />
      <Tabs.Screen name={TAB_NAMES.ACTIVITIES} options={({ route }) => defineTabOptions(route, t)} /> 
      <Tabs.Screen name={TAB_NAMES.SETTINGS} options={({ route }) => defineTabOptions(route, t, user?.username ? undefined : { tabBarBadge: "!" })} />
    </Tabs>
  )
}

function defineTabOptions(route: RouteProp<ParamListBase, string>, t: TFunction, customOptions?: BottomTabNavigationOptions): BottomTabNavigationOptions {
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
    tabBarIcon: ({ color, focused, size }) => focused ? <Ionicons name={iconName} size={size} color={color} /> : <Ionicons name={iconNameOutline} size={size} color={color} />,
    ...customOptions
  }
}