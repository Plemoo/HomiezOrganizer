import { planActivityDeletion, planGroupDeletion } from "@/functions/src/accountDeletion";

describe("account deletion plans", () => {
  test("transfers an owned group to a remaining member", () => {
    expect(planGroupDeletion({ memberUuids: ["deleted", "remaining"], ownerUuid: "deleted" }, "deleted"))
      .toEqual({ deleteGroup: false, memberUuids: ["remaining"], ownerUuid: "remaining" });
  });

  test("deletes a group without remaining members", () => {
    expect(planGroupDeletion({ memberUuids: ["deleted"], ownerUuid: "deleted" }, "deleted"))
      .toEqual({ deleteGroup: true });
  });

  test("deletes activities created by the account", () => {
    expect(planActivityDeletion({ createdBy: "deleted" }, "deleted")).toBeNull();
  });

  test("removes the account from every participation field", () => {
    const activity = {
      createdBy: "someone-else",
      declinedUserUuids: ["deleted", "remaining"],
      memberUuids: ["deleted", "remaining"],
      timeSlotsPerUserUuid: [
        { userUuid: ["deleted"], slots: { start: 1, end: 2 } },
        { userUuid: ["deleted", "remaining"], slots: { start: 3, end: 4 } },
      ],
    };

    expect(planActivityDeletion(activity, "deleted")).toEqual({
      declinedUserUuids: ["remaining"],
      memberUuids: ["remaining"],
      timeSlotsPerUserUuid: [
        { userUuid: ["remaining"], slots: { start: 3, end: 4 } },
      ],
    });
  });
});
