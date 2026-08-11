import { IActivity } from '@/assets/interfaces/ActivityInterface';
import { CloudFunctionInterface } from '@/assets/interfaces/CoudFunctionInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { parseFirebaseActivity } from '@/assets/ts/parsing';
import * as Notifications from 'expo-notifications';
import { UnknownInputParams, useRouter } from 'expo-router';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect
} from 'react';
import { Platform } from 'react-native';



// 2) create it
const NotificationsContext = createContext<undefined>(undefined);


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


// 3) provider impl
export function NotificationsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();

    // Ask & get token
    const registerForPushNotifications = useCallback(async () => {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FFFFFFFF'
            });
        }
        try {
            // 1. ask for permission
            const { status: existing } = await Notifications.getPermissionsAsync();
            let finalStatus = existing;
            if (existing !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            const granted = finalStatus === 'granted';
            if (!granted) return false;
            return true;
        } catch (error) {
            console.error("Error registering for push notifications:", error);
            return false;
        }
    }, []);

    const handleNotification = useCallback((notificationData: Notifications.NotificationContent | CloudFunctionInterface) => {
        if (!isCloudFunctionNotification(notificationData)) return;
        const searchParams: IFirebaseSearchParameter = {
            activityIdParameter: notificationData.data.params.activityIdParameter,
            groupIdParameter: notificationData.data.params.groupIdParameter
        };
        if (notificationData.data.type === "newComment") {
            FirebaseExchange.getFirebaseDocument(searchParams.activityIdParameter!, "Group", searchParams.groupIdParameter, "Activity")
                .then((activityDoc) => {
                    if (!activityDoc.exists()) return;
                    const activity: IActivity | null = parseFirebaseActivity(activityDoc);
                    if (activity?.state === "pending") {
                        router.replace({ pathname: "/(tabs)/activities/ActivityDetail", params: searchParams as UnknownInputParams });
                    } else if (activity?.state === "scheduled") {
                        router.replace({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
                    }
                })
                .catch((error) => console.error("Could not open notification target:", error));
        } else if (notificationData.data.type === "activityScheduled") {
            router.replace({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
        } else if (notificationData.data.type === "activityCancelled") {
            router.replace({ pathname: "/(tabs)/groups/GroupDetail", params: searchParams as UnknownInputParams });
        } else {
            router.replace({ pathname: "/(tabs)/activities/ActivityDetail", params: searchParams as UnknownInputParams });
        }
    }, [router]);

    // Listen for notifications
    useEffect(() => {
        let responseListener: Notifications.EventSubscription | null = null;
        // let sub: Notifications.EventSubscription | null = null;
        // Ensure we call register once
        void registerForPushNotifications();
        responseListener = Notifications.addNotificationResponseReceivedListener(
            (response) => handleNotification(response.notification.request.content)
        );
        Notifications.getLastNotificationResponseAsync()
            .then((response) => {
                if (response) handleNotification(response.notification.request.content);
            })
            .catch((error) => console.error("Error reading the initial notification:", error));
        // Handles notifications when the app is in the foreground

        return () => {
            // sub?.remove();
            responseListener?.remove();
        };
    }, [handleNotification, registerForPushNotifications]);

    return (
        <NotificationsContext.Provider value={undefined}>
            {children}
        </NotificationsContext.Provider>
    );
}

// 4) consumer hook
export function useNotifications() {
    return useContext(NotificationsContext);
}

function isCloudFunctionNotification(value: Notifications.NotificationContent | CloudFunctionInterface): value is CloudFunctionInterface {
    const candidate = value as Partial<CloudFunctionInterface>;
    const type = candidate.data?.type;
    const params = candidate.data?.params;
    return typeof type === 'string'
        && ['newActivity', 'newComment', 'activityScheduled', 'activityCancelled', 'newTimeslot'].includes(type)
        && typeof params?.groupIdParameter === 'string'
        && typeof params?.activityIdParameter === 'string';
}
