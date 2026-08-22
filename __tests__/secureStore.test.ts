import { IBusyAvailableTimes, ILocalUser } from "@/assets/interfaces/ProfileInterface";
import { SecureStorageHandler, SecureStorageHandlerTestable } from "@/assets/ts/asyncStorage";
import * as SecureStore from 'expo-secure-store';

// Mock the expo-secure-store module
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn().mockResolvedValue(undefined)
}));
let times: IBusyAvailableTimes[] = [{ day: 1, endHour: 1, endMinute: 1, startHour: 1, startMinute: 1 }]
let newTimes: IBusyAvailableTimes[] = [{ day: 2, endHour: 2, endMinute: 2, startHour: 2, startMinute: 2 }]

const allLocalStorageKeys: (keyof ILocalUser)[] = ["id", "available", "birthday", "busy", "username", "groupUuids", "icon", "language"];

describe("clearUserFromSecureStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("deletes every locally stored user field", async () => {
        await SecureStorageHandler.clearUserFromSecureStore();

        expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(10);
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("id");
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("groupUuids");
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("expoPushToken");
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("appearance");
    });
});
describe("overwriteSecureStoreTestable: SecureStore Overwrites", () => {
    describe("SecureStore KeyValue String Overwrite Correct", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        test("Username valid string", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("username", "anyString");
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("username", "anyString");
        })
        test("language valid string", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("language", "anyString");
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("language", "anyString");
        })
        test("icon valid string", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("icon", "anyString");
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("icon", "anyString");
        })
        test("uuid valid string", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("id", "anyString");
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("id", "anyString");
        })
    })
    describe("SecureStore KeyValue String Promise Return", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test("Username promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("username", "anyString")).resolves.toBe("username")
        })
        test("language promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("language", "anyString")).resolves.toBe("language")
        })
        test("icon promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("icon", "anyString")).resolves.toBe("icon")
        })
        test("uuid promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("id", "anyString")).resolves.toBe("id")
        })
    })
    describe("SecureStore KeyValue String Overwrite Error", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        describe("Invalid Username", () => {
            test("Username invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("username", ["anyString"])).toThrow("Unsupported type for secure store key: username")
            })
            test("Username invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("username", new Date())).toThrow("Unsupported type for secure store key: username")
            })
            test("Username invalid TimeArray", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("username", times)).toThrow("Unsupported type for secure store key: username")
            })
        })
        describe("Invalid language", () => {
            test("language invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("language", ["anyString"])).toThrow("Unsupported type for secure store key: language")
            })
            test("language invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("language", new Date())).toThrow("Unsupported type for secure store key: language")
            })
            test("language invalid TimeArray", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("language", times)).toThrow("Unsupported type for secure store key: language")
            })
        })
        describe("Invalid icon", () => {
            test("icon invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("icon", ["anyString"])).toThrow("Unsupported type for secure store key: icon")
            })
            test("icon invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("icon", new Date())).toThrow("Unsupported type for secure store key: icon")
            })
            test("icon invalid TimeArray", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("icon", times)).toThrow("Unsupported type for secure store key: icon")
            })
        })
        describe("Invalid uuid", () => {
            test("uuid invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("id", ["anyString"])).toThrow("Unsupported type for secure store key: id")
            })
            test("uuid invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("id", new Date())).toThrow("Unsupported type for secure store key: id")
            })
            test("uuid invalid TimeArray", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("id", times)).toThrow("Unsupported type for secure store key: id")
            })
        })
    })
    describe("SecureStore KeyValue StringArray Overwrite", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test("groupUuid valid stringArray", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("groupUuids", ["anyString"]);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("groupUuids", "[\"anyString\"]");
        })
        test("groupUuid promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("groupUuids", ["anyString"])).resolves.toBe("groupUuids")
        })
        describe("Invalid groupUuid", () => {
            test("groupUuid invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("groupUuids", "anyString")).toThrow("Unsupported type for secure store key: groupUuid")
            })
            test("groupUuid invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("groupUuids", new Date())).toThrow("Unsupported type for secure store key: groupUuids")
            })
            test("groupUuid invalid TimeArray", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("groupUuids", times)).toThrow("Unsupported type for secure store key: groupUuids")
            })
        })
    })
    describe("SecureStore KeyValue TimeArray Overwrite", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test("busy valid time", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("busy", times);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("busy", "[{\"day\":1,\"startHour\":1,\"startMinute\":1,\"endHour\":1,\"endMinute\":1}]");
        })
        test("available valid time", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("available", times);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("available", "[{\"day\":1,\"startHour\":1,\"startMinute\":1,\"endHour\":1,\"endMinute\":1}]");
        })
        test("busy promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("busy", times)).resolves.toBe("busy")
        })
        test("available promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("available", times)).resolves.toBe("available")
        })
        describe("Invalid busy", () => {
            test("busy invalid string", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("busy", "anyString")).toThrow("Unsupported type for secure store key: busy")
            })
            test("busy invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("busy", new Date())).toThrow("Unsupported type for secure store key: busy")
            })
            test("busy invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("busy", ["anyString"])).toThrow("Unsupported type for secure store key: busy")
            })
        })
        describe("Invalid available", () => {
            test("available invalid string", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("available", "anyString")).toThrow("Unsupported type for secure store key: available")
            })
            test("available invalid date", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("available", new Date())).toThrow("Unsupported type for secure store key: available")
            })
            test("available invalid Array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("available", ["anyString"])).toThrow("Unsupported type for secure store key: available")
            })
        })
    })
    describe("SecureStore KeyValue Date Overwrite", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test("birthday valid stringArray", async () => {
            await SecureStorageHandlerTestable.overwriteSecureStoreTestable("birthday", new Date("2025-06-03T10:13:22.328Z"));
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("birthday", "2025-06-03T10:13:22.328Z");
        });
        test("birthday promise return", async () => {
            await expect(SecureStorageHandlerTestable.overwriteSecureStoreTestable("birthday", new Date("2025-06-03T10:13:22.328Z"))).resolves.toBe("birthday")
        })
        describe("Invalid birthday", () => {
            test("birthday invalid string", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("birthday", "anyString")).toThrow("Unsupported type for secure store key: birthday")
            })
            test("birthday invalid array", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("birthday", ["anyString"])).toThrow("Unsupported type for secure store key: birthday")
            })
            test("birthday invalid TimeArray", async () => {
                expect(() => SecureStorageHandlerTestable.overwriteSecureStoreTestable("birthday", times)).toThrow("Unsupported type for secure store key: birthday")
            })
        })
    })
})

describe("getUserStoredInSecureStore: SecureStore Enty fetching", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test("Ensure all key iteration", async () => {
        (SecureStore.getItemAsync as jest.Mock)//
            .mockResolvedValue(null) // default case
            .mockResolvedValueOnce("anyString");
        await SecureStorageHandler.getUserStoredInSecureStore()
        for (const key of allLocalStorageKeys) {
            expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key);
        }
    })
    test("Only uuid set, icon and language as default", async () => {
        (SecureStore.getItemAsync as jest.Mock)//
            .mockResolvedValue(null) // default case
            .mockResolvedValueOnce("anyUuidString");
        await expect(SecureStorageHandler.getUserStoredInSecureStore())//
            .resolves.toEqual(
                expect.objectContaining({
                    id: "anyUuidString",
                    icon: expect.any(String),
                    language: "de"
                }));
    })
    test("All values correct and set", async () => {
        (SecureStore.getItemAsync as jest.Mock)//
            .mockResolvedValue(null) // default case
            .mockResolvedValueOnce("anyUuidString")
            .mockResolvedValueOnce(JSON.stringify(times))
            .mockResolvedValueOnce(new Date("2025-06-03T10:13:22.333Z").toISOString())
            .mockResolvedValueOnce(JSON.stringify(times))
            .mockResolvedValueOnce("anyUsernameString")
            .mockResolvedValueOnce(JSON.stringify(["groupId"]))
            .mockResolvedValueOnce("anyIconString")
            .mockResolvedValueOnce("en");
        await expect(SecureStorageHandler.getUserStoredInSecureStore())//
            .resolves.toMatchObject(
                expect.objectContaining({
                    id: "anyUuidString",
                    busy: JSON.parse(JSON.stringify(times)),
                    birthday: new Date("2025-06-03T10:13:22.333Z"),
                    available: JSON.parse(JSON.stringify(times)),
                    username: "anyUsernameString",
                    groupUuids: ["groupId"],
                    icon: "anyIconString",
                    language: "en"
                }));
    })
    describe('getUserStoredInSecureStore: Error Handling', () => {
        test("Language String wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce(new Date("2025-06-03T10:13:22.333Z").toISOString())
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce("anyUsernameString")
                .mockResolvedValueOnce(JSON.stringify(["groupId"]))
                .mockResolvedValueOnce("anyIconString")
                .mockResolvedValueOnce("anyLanguageString");
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("GroupUuid Array wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce(new Date("2025-06-03T10:13:22.333Z").toISOString())
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce("anyUsernameString")
                .mockResolvedValueOnce(JSON.stringify({ test: "1" }))
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("GroupUuid Array Content wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce(new Date("2025-06-03T10:13:22.333Z").toISOString())
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce("anyUsernameString")
                .mockResolvedValueOnce(JSON.stringify([{ test: "1" }]))
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("Busy Array wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce(new Date("2025-06-03T10:13:22.333Z").toISOString())
                .mockResolvedValueOnce(JSON.stringify("times"))
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("Busy Array Content wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce(new Date("2025-06-03T10:13:22.333Z").toISOString())
                .mockResolvedValueOnce(JSON.stringify(["times"]))
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("Birthday invalid string", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(times))
                .mockResolvedValueOnce("test")
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("Available Array wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify("times"))
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
        test("Available Array Content wrong", async () => {
            (SecureStore.getItemAsync as jest.Mock)//
                .mockResolvedValue(null) // default case
                .mockResolvedValueOnce("anyUuidString")
                .mockResolvedValueOnce(JSON.stringify(["times"]))
            await expect(SecureStorageHandler.getUserStoredInSecureStore()).resolves.toBeNull()
        })
    })
})

describe("updateSecureStore", () => {
    let userInSecureStore: ILocalUser = {
        id: "anyUuidString",
        busy: JSON.parse(JSON.stringify(times)),
        birthday: new Date("2025-06-03T10:13:22.333Z"),
        available: JSON.parse(JSON.stringify(times)),
        username: "anyUsernameString",
        groupUuids: ["groupId"],
        icon: "anyIconString",
        language: "en",
        appearance: "light"
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("Update without changes", async () => {
        let newUser: ILocalUser = {
            id: "anyUuidString",
            busy: JSON.parse(JSON.stringify(times)),
            birthday: new Date("2025-06-03T10:13:22.333Z"),
            available: JSON.parse(JSON.stringify(times)),
            username: "anyUsernameString",
            groupUuids: ["groupId"],
            icon: "anyIconString",
            language: "en",
            appearance: "light"
        }
        jest.spyOn(SecureStorageHandler, "getUserStoredInSecureStore")//
            .mockResolvedValueOnce(userInSecureStore);
        expect(SecureStorageHandler.updateSecureStore(newUser)).resolves.toMatchObject([])
    })
    test("Update every key", async () => {
        let newUser: ILocalUser = {
            id: "new",
            busy: JSON.parse(JSON.stringify(newTimes)),
            birthday: new Date("2025-05-03T10:13:22.333Z"),
            available: JSON.parse(JSON.stringify(newTimes)),
            username: "newUsername",
            groupUuids: ["newGroupId"],
            icon: "newIcon",
            language: "de",
            appearance: "light"
        }
        jest.spyOn(SecureStorageHandler, "getUserStoredInSecureStore")//
            .mockResolvedValueOnce(userInSecureStore);
        expect(SecureStorageHandler.updateSecureStore(newUser)).resolves.toMatchObject(["id", "busy", "birthday", "available", "username", "groupUuids", "icon", "language"])
    })
    test("Update: Add arrayEntries every key", async () => {
        let newUser: ILocalUser = {
            id: "anyUuidString",
            busy: JSON.parse(JSON.stringify(times.concat(newTimes))),
            available: JSON.parse(JSON.stringify(times.concat(newTimes))),
            groupUuids: ["newGroupId", "newGroupId"],
            icon: "anyIconString",
            language: "en",
            appearance: "light"
        }
        jest.spyOn(SecureStorageHandler, "getUserStoredInSecureStore")//
            .mockResolvedValueOnce(userInSecureStore);
        expect(SecureStorageHandler.updateSecureStore(newUser)).resolves.toMatchObject(["busy", "available", "groupUuids"])
    })
    afterEach(() => {
        jest.restoreAllMocks();
    });
})
