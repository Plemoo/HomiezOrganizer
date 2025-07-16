import * as SecureStore from 'expo-secure-store';
import _ from "lodash";
import { z } from 'zod';
import { IBusyAvailableTimes, ILocalUser } from "../interfaces/ProfileInterface";
import { BusyAvailableTimesSchema, LocalUserSchema } from './schemas';

type TSecureStoreValueType = string | Date | IBusyAvailableTimes[] | string[];


export class SecureStorageHandler {
  protected constructor() { }

  private static overwriteSecureStoreTimeArray = (entry: (keyof ILocalUser), newAvailableTimes: IBusyAvailableTimes[] | string[]): Promise<void> => {
    return SecureStore.setItemAsync(entry, JSON.stringify(newAvailableTimes));
  }
  private static overwriteSecureStoreString = (entry: (keyof ILocalUser), secureStoreValue: string): Promise<void> => {
    return SecureStore.setItemAsync(entry, secureStoreValue);
  }


  protected static overwriteSecureStore = (secureStoreKey: (keyof ILocalUser), secureStoreValue: TSecureStoreValueType): Promise<(keyof ILocalUser)> => {
    let stringLocalUserKeys: (keyof ILocalUser)[] = ["id", "username", "icon", "language", "expoPushToken", "appearance"];
    let dateLocalUserKeys: (keyof ILocalUser)[] = ["birthday"];
    let timeArrayLocalUserKeys: (keyof ILocalUser)[] = ["busy", "available"];
    let stringArrayLocalUserKeys: (keyof ILocalUser)[] = ["groupUuids"];
    if (typeof secureStoreValue === "string" && stringLocalUserKeys.includes(secureStoreKey)) { // date, username, icon, language
      return SecureStorageHandler.overwriteSecureStoreString(secureStoreKey, secureStoreValue).then(() => secureStoreKey);
    } else if (secureStoreValue instanceof Date && dateLocalUserKeys.includes(secureStoreKey)) { // birthday
      return SecureStorageHandler.overwriteSecureStoreString(secureStoreKey, secureStoreValue.toISOString()).then(() => secureStoreKey);
    } else if (z.array(BusyAvailableTimesSchema).safeParse(secureStoreValue).success && timeArrayLocalUserKeys.includes(secureStoreKey)) { // busy or available times
      let secureStoreValues: IBusyAvailableTimes[] = z.array(BusyAvailableTimesSchema).safeParse(secureStoreValue).data!;
      return SecureStorageHandler.overwriteSecureStoreTimeArray(secureStoreKey, secureStoreValues).then(() => secureStoreKey);
    } else if (z.array(z.string()).safeParse(secureStoreValue).success && stringArrayLocalUserKeys.includes(secureStoreKey)) { // groupUUids
      let secureStoreValues: string[] = z.array(z.string()).safeParse(secureStoreValue).data!;
      return SecureStorageHandler.overwriteSecureStoreTimeArray(secureStoreKey, secureStoreValues).then(() => secureStoreKey);
    } else {
      throw new Error(`Unsupported type for secure store key: ${secureStoreKey}`);
    }
  }


  static updateSecureStore = (newUserData: ILocalUser): Promise<(keyof ILocalUser)[]> => {
    return SecureStorageHandler.getUserStoredInSecureStore()//
      .then((secureStoreUser: ILocalUser | null) => {
        let secureStorageOverwritePromises: Promise<(keyof ILocalUser)>[] = [];
        for (const key in newUserData) {
          const localUserKey = key as keyof ILocalUser;
          if (newUserData.hasOwnProperty(localUserKey)) {
            const newUserValue = newUserData[localUserKey]!;
            if (secureStoreUser == null) {
              secureStorageOverwritePromises.push(SecureStorageHandler.overwriteSecureStore(localUserKey, newUserValue));
            } else {
              const secureStoreUserValue = secureStoreUser[localUserKey];
              if (!_.isEqual(newUserValue, secureStoreUserValue)) {
                secureStorageOverwritePromises.push(SecureStorageHandler.overwriteSecureStore(localUserKey, newUserValue));
              }
            }
          }
        }
        return Promise.all(secureStorageOverwritePromises)
      })
  }

  static getUserStoredInSecureStore = async (): Promise<ILocalUser | null> => {
    const localStorageKeys: (keyof ILocalUser)[] = ["id", "available", "birthday", "busy", "username", "groupUuids", "icon", "language", "expoPushToken", "appearance"];
    const localStoragePromises = localStorageKeys.map((key) => SecureStore.getItemAsync(key));
    const localStorageValues = await Promise.all(localStoragePromises);
    const retrievedData: Record<string, any> = {};
    localStorageKeys.forEach((key, index) => {
      if (localStorageValues[index] !== null) {
        try {
          if (key === "available" || key === "busy" || key === "groupUuids") {
            retrievedData[key] = JSON.parse(localStorageValues[index]);
          } else if (key === "birthday") {
            retrievedData[key] = new Date(localStorageValues[index]);
          } else if (key === "id" || key === "username" || key === "icon" || key === "language" || key === "expoPushToken" || key === "appearance") {
            retrievedData[key] = localStorageValues[index];
          } else {
            throw new Error(`Unsupported key ${key} in Secure Storage`);
          }
        } catch (error) {
          // just skip the parse
          console.error(`Error parsing JSON for key ${key} and value ${localStorageValues[index]}: ${error}`);
          return null;
        }
      }
    });
    try {
      return LocalUserSchema.parse(retrievedData);
    } catch (error) {
      console.error("Error parsing user data from Secure Storage:", error);
      // Throwing an error here, means the user in the Secure Storage is corrupt
      return null;
    }
  }

}


export class SecureStorageHandlerTestable extends SecureStorageHandler {

  static overwriteSecureStoreTestable = (secureStoreKey: (keyof ILocalUser), secureStoreValue: TSecureStoreValueType) => {
    return SecureStorageHandler.overwriteSecureStore(secureStoreKey, secureStoreValue);
  }
}
