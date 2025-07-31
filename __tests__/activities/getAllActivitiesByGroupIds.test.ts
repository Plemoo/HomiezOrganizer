import { FirebaseExchange } from "@/assets/ts/firebaseExchange";

// Mock __DEV__ constant
// Mock @react-native-firebase/app
jest.mock('@react-native-firebase/app', () => {
  return {
    // exportiere default und app()
    default: {
      // wenn Du firebase.app() verwendest:
      app: () => ({}),
    },
    // Named-Export app()
    app: () => ({}),
  };
});

// Mock @react-native-firebase/auth
jest.mock('@react-native-firebase/auth', () => ({
  // exportiere genau die Funktionen, die Du nutzt
  onAuthStateChanged: jest.fn(() => () => {}),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'test' } })),
}));

// Mock @react-native-firebase/firestore
jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock("@react-native-firebase/functions", () => ({
  httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: {} }))),
}));

jest.mock("react-native-device-info", () => ({
    getUniqueId: jest.fn(() => "mocked-device-id"),
    getSystemName: jest.fn(() => "mocked-system-name"),
    getVersion: jest.fn(() => "mocked-version"),
    // Add other methods you use as needed
}));

describe("getAllActivitiesByGroupIds", () => {
    const mockGroupDocs = [
        { exists: () => true },
        { exists: () => false },
        { exists: () => true }
    ];
    const parsedGroups = [
        { id: "group1", name: "Group 1" },
        null,
        { id: "group2", name: "Group 2" }
    ];
    const mockActivityDocsArray = [
        {
            docs: [
                { id: "a1" },
                { id: "a2" }
            ]
        },
        {
            docs: [
                { id: "b1" }
            ]
        }
    ];
    const parsedActivities = [
        [{ id: "a1", name: "Activity 1" }, { id: "a2", name: "Activity 2" }],
        [{ id: "b1", name: "Activity 3" }]
    ];


    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(FirebaseExchange, "getFirebaseDocumentArray").mockResolvedValue(mockGroupDocs as any);
        jest.spyOn(require("@/assets/ts/parsing"), "parseFirebaseGroup")
            .mockImplementation((doc: any) => {
                if (doc === mockGroupDocs[0]) return parsedGroups[0];
                if (doc === mockGroupDocs[2]) return parsedGroups[2];
                return null;
            });
        jest.spyOn(FirebaseExchange, "getAllDocumentsOfCollection")
            .mockImplementation((_type, groupId, _collection) => {
                if (groupId === "group1") return Promise.resolve(mockActivityDocsArray[0]);
                if (groupId === "group2") return Promise.resolve(mockActivityDocsArray[1]);
                return Promise.resolve({ docs: [] } as any);
            });
        jest.spyOn(require("@/assets/ts/parsing"), "parseFirebaseActivity")
            .mockImplementation((doc: any) => {
                if (doc.id === "a1") return parsedActivities[0][0];
                if (doc.id === "a2") return parsedActivities[0][1];
                if (doc.id === "b1") return parsedActivities[1][0];
                return null;
            });
    });



    it("should fetch groups and their activities, filtering out non-existing and null groups/activities", async () => {
        const groupIds = ["group1", "groupX", "group2"];
        const result = await require("@/assets/ts/componentFunctions/activities").getAllActivitiesByGroupIds(groupIds);

        expect(FirebaseExchange.getFirebaseDocumentArray).toHaveBeenCalledWith(groupIds, "Group");
        expect(result).toEqual([
            {
                group: parsedGroups[0],
                activities: parsedActivities[0]
            },
            {
                group: parsedGroups[2],
                activities: parsedActivities[1]
            }
        ]);
    });

    it("should return empty array if no groups exist", async () => {
        (FirebaseExchange.getFirebaseDocumentArray as jest.Mock).mockResolvedValue([
            { exists: () => false },
            { exists: () => false }
        ]);
        const result = await require("@/assets/ts/componentFunctions/activities").getAllActivitiesByGroupIds(["g1", "g2"]);
        expect(result).toEqual([]);
    });

    it("should handle when activities are all null", async () => {
        jest.spyOn(require("@/assets/ts/parsing"), "parseFirebaseActivity").mockReturnValue(null);
        const result = await require("@/assets/ts/componentFunctions/activities").getAllActivitiesByGroupIds(["group1", "group2"]);
        expect(result).toEqual([
            { group: parsedGroups[0], activities: [] },
            { group: parsedGroups[2], activities: [] }
        ]);
    });
});