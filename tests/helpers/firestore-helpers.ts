import * as firebase from '@firebase/testing';

export type Firestore = firebase.firestore.Firestore;
const projectIdBase = `firestore-emulator-${Date.now()}`;

function getProjectId() {
  return `${projectIdBase}`;
}

export function getAdminApp(): Firestore {
  const adminApp = firebase.initializeAdminApp({
    projectId: getProjectId(),
  });

  return (adminApp.firestore() as any) as Firestore;
}

export function getAuthedApp(userUid?: string): Firestore {
  const app = firebase.initializeTestApp({
    auth: userUid ? { uid: userUid } : undefined,
    projectId: getProjectId(),
  });

  return (app.firestore() as any) as Firestore;
}

export function getAppNoAuth(): Firestore {
  const app = firebase.initializeTestApp({
    projectId: getProjectId(),
  });

  return (app.firestore() as any) as Firestore;
}

export async function setup(
  userUid?: string,
  data: any = {}
): Promise<Firestore> {
  const db = getAuthedApp(userUid);

  if (!data || !Object.keys(data).length) {
    return db;
  }
  const adminDb = getAdminApp();
  const batch = adminDb.batch();

  Object.entries(data).forEach(([key, value]) => {
    batch.set(adminDb.doc(key),value as any);
  });
  await batch.commit();
  return db;
}

export async function teardown() {
  return Promise.all(firebase.apps().map(app => app.delete()));
}
