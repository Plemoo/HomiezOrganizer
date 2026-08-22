import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { SecureStorageHandler } from '@/assets/ts/asyncStorage';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import { getDefaultLanguage } from '@/assets/ts/i18next';
import { Unsubscribe } from '@react-native-firebase/firestore';
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface UserContextType {
  user: ILocalUser | undefined;
  // setUser: React.Dispatch<React.SetStateAction<ILocalUser>>;
  // setUserIncludingLocalStorageAndFirebase: (userData: ILocalUser) => Promise<void | [(keyof ILocalUser)[], void]>;
  // makeSureUserIsLoggedIn: (userData: ILocalUser) => Promise<ILocalUser>;
  userLoading: boolean;
  accountDeleted: boolean;
  deleteAccount: () => Promise<void>;
  createNewAccount: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

/**
 * UserProvider component to provide user context. The onSnapshot Listener is set up to listen for changes in the user document in Firebase. When a change is detected there, the user and the secure store will be updated
 * @param param0 
 * @returns 
 */
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getRandomAvatarKey } = useAvatarIcons()
  const [user, setUser] = useState<ILocalUser | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [accountDeleted, setAccountDeleted] = useState(false);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const deletionInProgressRef = useRef(false);

  const [initRandomUserIcon] = useState(() => getRandomAvatarKey())
  const [userLanguage] = useState<"de" | "en">(() => getDefaultLanguage() === "de" ? "de" : "en")
  const initUserName = ""
  const setupUserOnStartupRef = useRef(setupUserOnStartup);


  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setupUserOnStartupRef.current()
      .then((unsub) => {
        if (cancelled) {
          unsub();
          return;
        }
        unsubscribeRef.current = unsub;
      }).catch((error) => {
        console.error("Error setting up user on startup in ProfileInformationContext:", error);
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    }
  }, []);



  /**
   * Use Case 1: User opens the app for the first time-> no user is stored in secure store and in user context
   * Use Case 2: User opens the app after a logout-> firebase ID new
   * Use Case 3: User interacts with the app after a change in the db
   * Use Case 4: User opens the app after a change in the secure store (lost internet connection, app crash, etc.)
   */
  async function setupUserOnStartup(): Promise<Unsubscribe> {
    try {
      const firebaseUserId = await FirebaseExchange.getFirebaseUserUid(); // Get Authorization ID (has nothing to do with Firebase)
      try {
        const firebaseUser = await FirebaseExchange.getFirebaseDocument(firebaseUserId, "User"); // Get the user document from Firebase
        if (!firebaseUser.exists()) throw new Error("Firebase user document does not exist for UID: " + firebaseUserId);
      } catch {
        let newUser = await createNewUserBasedOnSecureStoreLeftover(firebaseUserId); // Create a new user, with the new id, originating form a new sign in
        const expoPushToken = await getExpoPushTokenSafely();
        if (expoPushToken) newUser.expoPushToken = expoPushToken;
        // NEED TO UPDATE USER HERE, BECAUSE fo the setDoc functionality lets you define my own id
        await FirebaseExchange.updateFirebaseDocument(newUser, "User", firebaseUserId); // Write the new User into the firebase db
      }
      // Existiert ein Firebase User, wird der SecureStore mit den Einträgen des Firebase Users überschrieben
      return FirebaseSnapshotListener.snapshotListenerForUserChange(firebaseUserId, async (userWithChanges) => {
        // Firebase User HAS to exist, because it is created new in lines before + when user doesnt exist, a read is not allowed -> no Permisison exception
        if (!userWithChanges) {
          if (!deletionInProgressRef.current) console.warn("User document no longer exists.");
          return;
        }
        const expoPushToken = await getExpoPushTokenSafely();
        if(expoPushToken && userWithChanges.expoPushToken !== expoPushToken){
          userWithChanges.expoPushToken = expoPushToken;
          await FirebaseExchange.updateFirebaseDocument(userWithChanges, "User", firebaseUserId); // Write the new User into the firebase db
        }
        SecureStorageHandler.updateSecureStore(userWithChanges).catch((error) => console.error("Error updating secure store with user changes in ProfileInformationContext:", error))
        setUser(userWithChanges); // Update the context state for the user
      });
    } catch (error) {
      console.error("Error setting up user on startup in ProfileInformationContext:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async function createNewUserBasedOnSecureStoreLeftover(newUserId: string): Promise<ILocalUser> {
    const secureStoreUser = await SecureStorageHandler.getUserStoredInSecureStore();
    return {
      id: newUserId,
      username: secureStoreUser?.username || initUserName,
      appearance: secureStoreUser?.appearance || "light",
      icon: secureStoreUser?.icon || initRandomUserIcon,
      language: secureStoreUser?.language || userLanguage,
      ...(secureStoreUser?.busy ? { busy: secureStoreUser.busy } : {}),
      ...(secureStoreUser?.available ? { available: secureStoreUser.available } : {}),
      ...(secureStoreUser?.birthday ? { birthday: secureStoreUser.birthday } : {}),
    };
  }

  async function deleteAccount(): Promise<void> {
    deletionInProgressRef.current = true;
    setLoading(true);
    try {
      await FirebaseExchange.deleteAccount();
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      await SecureStorageHandler.clearUserFromSecureStore()
        .catch((error) => console.warn("Could not clear all local data after account deletion:", error));
      await FirebaseExchange.signOut().catch((error) => console.warn("Could not sign out deleted account locally:", error));
      setUser(undefined);
      setAccountDeleted(true);
    } finally {
      deletionInProgressRef.current = false;
      setLoading(false);
    }
  }

  async function createNewAccount(): Promise<void> {
    setLoading(true);
    try {
      const unsubscribe = await setupUserOnStartup();
      unsubscribeRef.current = unsubscribe;
      setAccountDeleted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserContext.Provider value={{ user, userLoading: loading, accountDeleted, deleteAccount, createNewAccount }}>
      {children}
    </UserContext.Provider>
  );
};

async function getExpoPushTokenSafely(): Promise<string | undefined> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return undefined;
    return (await Notifications.getExpoPushTokenAsync()).data;
  } catch (error) {
    console.warn("Push token could not be loaded; continuing without notifications.", error);
    return undefined;
  }
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

