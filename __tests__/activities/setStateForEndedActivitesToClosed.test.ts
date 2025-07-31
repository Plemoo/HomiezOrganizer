import { IActivity } from "@/assets/interfaces/ActivityInterface";
import { setStateForEndedActivitesToClosed } from "@/assets/ts/componentFunctions/activities";
import { FirebaseExchange } from "@/assets/ts/firebaseExchange";

jest.mock("../../assets/ts/firebaseExchange", () => ({
    FirebaseExchange: {
        updateFirestoreValueOfKey: jest.fn(),
    },
}));

describe("setStateForEndedActivitesToClosed", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Date, "now").mockReturnValue(new Date("2024-06-01T12:00:00Z").getTime());
    });


    it("should update state to 'closed' for ended scheduled activities", () => {
        const activities: IActivity[] = [
            {
                id: "1",
                state: "scheduled",
                time: {
                    start: new Date("2024-05-01T10:00:00Z"),
                    end: new Date("2024-05-01T11:00:00Z"),
                },
                owningGroupId: "group1",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
            {
                id: "2",
                state: "scheduled",
                time: {
                    start: new Date("2024-06-01T10:00:00Z"),
                    end: new Date("2024-06-01T13:00:00Z"),
                },
                owningGroupId: "group2",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
            {
                id: "3",
                state: "closed",
                time: {
                    start: new Date("2024-05-01T10:00:00Z"),
                    end: new Date("2024-05-01T11:00:00Z"),
                },
                owningGroupId: "group3",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
            {
                id: "4",
                state: "scheduled",
                time: null as any,
                owningGroupId: "group4",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
        ]

        setStateForEndedActivitesToClosed(activities);

        expect(FirebaseExchange.updateFirestoreValueOfKey).toHaveBeenCalledTimes(1);
        expect(FirebaseExchange.updateFirestoreValueOfKey).toHaveBeenCalledWith(
            "1",
            "Group",
            "state",
            "closed",
            "group1",
            "Activity"
        );
    });

    it("should not update state for activities that are not ended or not scheduled", () => {
        const activities: IActivity[] = [
            {
                id: "5",
                state: "scheduled",
                time: {
                    start: new Date("2024-06-01T10:00:00Z"),
                    end: new Date("2024-06-01T13:00:00Z"),
                },
                owningGroupId: "group5",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
            {
                id: "6",
                state: "closed",
                time: {
                    start: new Date("2024-05-01T10:00:00Z"),
                    end: new Date("2024-05-01T11:00:00Z"),
                },
                owningGroupId: "group6",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
            {
                id: "7",
                state: "scheduled",
                time: null as any,
                owningGroupId: "group7",
                timeSlotsPerUserUuid: [],
                createdBy: "user1",
                declinedUserUuids: [],
                description: "Test activity",
                destination: "Test destination",
                duration: { minutes: 60 },
                minParticipants: 1,
                name: "Test Activity",
            },
        ];

        setStateForEndedActivitesToClosed(activities);

        expect(FirebaseExchange.updateFirestoreValueOfKey).not.toHaveBeenCalled();
    });
});

