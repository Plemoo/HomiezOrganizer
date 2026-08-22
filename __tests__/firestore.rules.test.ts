/** @jest-environment node */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import fetch from 'cross-fetch';
import fs from 'node:fs';
import path from 'node:path';

globalThis.fetch = fetch as typeof globalThis.fetch;

const describeWithFirestore = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;
const [firestoreHost, firestorePort] = (process.env.FIRESTORE_EMULATOR_HOST ?? '').split(':');

describeWithFirestore('Firestore security rules', () => {
  let testEnvironment: RulesTestEnvironment;

  beforeAll(async () => {
    // jest-expo replaces fetch in the test process, which breaks the rules
    // library's optional Emulator Hub discovery. The Firestore endpoint is
    // already supplied explicitly below, so hub discovery is unnecessary.
    delete process.env.FIREBASE_EMULATOR_HUB;
    testEnvironment = await initializeTestEnvironment({
      projectId: 'aktivitaeten-finder-rules-test',
      firestore: {
        host: firestoreHost,
        port: Number(firestorePort),
        rules: fs.readFileSync(path.resolve('functions/firestore.rules'), 'utf8'),
      },
    });

    await testEnvironment.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await Promise.all([
        setDoc(doc(db, 'User/owner'), { id: 'owner', groupUuids: ['group-1'] }),
        setDoc(doc(db, 'User/member'), { id: 'member', groupUuids: ['group-1'] }),
        setDoc(doc(db, 'User/outsider'), { id: 'outsider', groupUuids: [] }),
        setDoc(doc(db, 'Group/group-1'), {
          name: 'Test group',
          description: '',
          icon: '',
          ownerUuid: 'owner',
          memberUuids: ['owner', 'member'],
        }),
        setDoc(doc(db, 'Group/group-1/Activity/activity-1'), {
          name: 'Test activity',
          owningGroupId: 'group-1',
        }),
        setDoc(doc(db, 'Group/group-1/Invitation/invite-1'), {
          groupId: 'group-1',
        }),
      ]);
    });
  }, 30_000);

  afterAll(async () => {
    await testEnvironment?.cleanup();
  }, 30_000);

  it('allows profile reads only for oneself or members of a shared group', async () => {
    const memberDb = testEnvironment.authenticatedContext('member').firestore();
    const outsiderDb = testEnvironment.authenticatedContext('outsider').firestore();

    await assertSucceeds(getDoc(doc(memberDb, 'User/owner')));
    await assertSucceeds(getDoc(doc(outsiderDb, 'User/outsider')));
    await assertFails(getDoc(doc(outsiderDb, 'User/owner')));
  });

  it('allows activity reads only to members of the owning group', async () => {
    const memberDb = testEnvironment.authenticatedContext('member').firestore();
    const outsiderDb = testEnvironment.authenticatedContext('outsider').firestore();
    const activityPath = 'Group/group-1/Activity/activity-1';

    await assertSucceeds(getDoc(doc(memberDb, activityPath)));
    await assertFails(getDoc(doc(outsiderDb, activityPath)));
  });

  it('blocks direct membership updates', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore();
    const outsiderDb = testEnvironment.authenticatedContext('outsider').firestore();

    await assertFails(updateDoc(doc(ownerDb, 'Group/group-1'), {
      memberUuids: ['owner'],
    }));
    await assertFails(updateDoc(doc(outsiderDb, 'User/outsider'), {
      groupUuids: ['group-1'],
    }));
    await assertSucceeds(updateDoc(doc(outsiderDb, 'User/outsider'), {
      username: 'Updated name',
    }));
  });

  it('allows new profiles only without preassigned groups', async () => {
    const newUserDb = testEnvironment.authenticatedContext('new-user').firestore();
    const forgedUserDb = testEnvironment.authenticatedContext('forged-user').firestore();

    await assertSucceeds(setDoc(doc(newUserDb, 'User/new-user'), {
      id: 'new-user',
      username: '',
    }));
    await assertFails(setDoc(doc(forgedUserDb, 'User/forged-user'), {
      id: 'forged-user',
      groupUuids: ['group-1'],
    }));
  });

  it('blocks direct reads of invitation documents', async () => {
    const memberDb = testEnvironment.authenticatedContext('member').firestore();

    await assertFails(getDoc(doc(memberDb, 'Group/group-1/Invitation/invite-1')));
  });

  it('allows only the group owner to delete a group', async () => {
    const memberDb = testEnvironment.authenticatedContext('member').firestore();
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore();

    await assertFails(deleteDoc(doc(memberDb, 'Group/group-1')));
    await assertSucceeds(deleteDoc(doc(ownerDb, 'Group/group-1')));
  });
});
