import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { FIRESTORE_USER_COLLECTION } from '@/assets/ts/constants';
import { firebaseAuth, firestoreDb } from '@/assets/ts/firebaseConfig';
import { getRandomAvatarIcon } from '@/assets/ts/generalHelper';
import { LocalUserSchema } from '@/assets/ts/schemas';
import * as SecureStore from 'expo-secure-store';
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore/lite';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserContextType {
  user: ILocalUser;
  setUser: React.Dispatch<React.SetStateAction<ILocalUser>>;
  loading:boolean
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ILocalUser>({ uuid: "", icon: getRandomAvatarIcon() });
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let userUuidKey: keyof ILocalUser = "uuid";
    SecureStore.getItemAsync(userUuidKey).then(async (userUuid) => {
      if (userUuid == null) { // No User found in local storage, create new one
        let userUuid = getFirebaseUserUid()
        userUuid.then((firebaseUid) => {
          setDoc(doc(firestoreDb, FIRESTORE_USER_COLLECTION, firebaseUid), { name: "Max" })//
            .then(() => {
              setUser({ ...user, uuid: firebaseUid }); // Set user as state + define random avatar icon
              SecureStore.setItemAsync(userUuidKey, firebaseUid); // Set User in local storage
            })//
            .catch((e) => console.error("Error creating user in firestore", e))//
            .finally(()=>setLoading(false));
        });
      } else {
        // Since the Client is the master for the profile settings, I can assume the Information from local storage is correct and it is parsed into the state
        setUserDataBasedOnLocalStorage(setUser)//
        .finally(()=>setLoading(false));
      }
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser , loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

function getFirebaseUserUid() {
  return new Promise<string>((res, rej) => {
    if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid) {
      res(firebaseAuth.currentUser.uid);
    } else {
      signInAnonymously(firebaseAuth).then(() => {
        if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid) {
          res(firebaseAuth.currentUser.uid);
        } else {
          rej("No UUID found");
        }
      });
    }
  });
}

async function setUserDataBasedOnLocalStorage(setUser: React.Dispatch<React.SetStateAction<ILocalUser>>) {
  const localStorageKeys: (keyof ILocalUser)[] = ["uuid", "available", "birthday", "busy", "username", "groupUuids", "icon"];
  const localStoragePromises = localStorageKeys.map((key) => SecureStore.getItemAsync(key));
  const localStorageValues = await Promise.all(localStoragePromises);
  const retrievedData: Record<string, any> = {};
  localStorageKeys.forEach((key, index) => {
    if (localStorageValues[index] !== null) {
      if (key === "available" || key === "busy" || key === "groupUuids") {
        retrievedData[key] = JSON.parse(localStorageValues[index]);
      } else if (key === "birthday") {
        retrievedData[key] = new Date(localStorageValues[index]);
      } else if (key)
        retrievedData[key] = localStorageValues[index];
    }
  });
  try {
    let localStorageUser: ILocalUser = LocalUserSchema.parse(retrievedData);
    setUser(localStorageUser);
  } catch (error) {
    console.error("Validation failed:", error);
  }
}
