import * as firebase from '@firebase/testing';
import {
  COLLECTIONS,
  documentPath,
  generateId,
  generateMockDocument,
  generateUserId,
} from './helpers/constants';
import {afterEach, beforeEach, describe, test} from '@jest/globals';
import {
  Firestore,
  getAdminApp,
  getAppNoAuth,
  setup,
  teardown
} from './helpers/firestore-helpers';

interface Product {
  name: string;
  url: string;
  price: number;
}

describe('product.create', () => {
  const COLLECTION = COLLECTIONS.PRODUCTS;
  const DOC_ID = generateId();
  const USER_ID = generateUserId();
  const mockProduct: Product  = { name: 'time shoes', url: 'https://dlskfds.dsjfksd.dskfdlsf.dk', price:22 };
  let db: Firestore;
  afterEach(() => {
    teardown();
  });

  beforeEach(async () => {
    db = await setup(USER_ID, {
      [documentPath(COLLECTIONS.USERS, USER_ID)]: generateMockDocument(),
    });
    const adminDb = getAdminApp();
    await adminDb
      .collection(COLLECTIONS.ROLES)
      .doc(USER_ID)
      .set({ name: 'admin' });
  });

  test('Cannot created Product if you are not logged in', async () => {
    const appNoAuth = getAppNoAuth();
    const document = appNoAuth.collection(COLLECTION).doc(DOC_ID);
    await firebase.assertFails(
      document.set(mockProduct)
    );
  });

  test('Cannot created Product if you are logged in, but not admin', async () => {
    const adminDb = getAdminApp();
    await adminDb
      .collection(COLLECTIONS.ROLES)
      .doc(USER_ID)
      .set({ name: 'user' });
    const document = db.collection(COLLECTION).doc(DOC_ID);
    await firebase.assertFails(
      document.set(mockProduct)
    );
  });

  test('Can create Product if you are an admin', async () => {
    const document = db.collection(COLLECTION).doc(DOC_ID);
    await firebase.assertSucceeds(
      document.set(mockProduct)
    );
  });

  test('Cannot created Product with no name or a name with less then 3 chars', async () => {
    const document = db.collection(COLLECTION).doc(DOC_ID);
    // no name
    await firebase.assertFails(
      document.set({url: 'https://dlskfds.dsjfksd.dskfdlsf.dk', price:22}));
    //Fails with 3 letters
    await firebase.assertFails(
      document.set({name: 'abc', url: 'https://dlskfds.dsjfksd.dskfdlsf.dk', price:22}));
    //Passes with 4 letters
    await firebase.assertSucceeds(
      document.set({name: 'abcd', url: 'https://dlskfds.dsjfksd.dskfdlsf.dk', price:22}));
    //Passes with 12 letters
    await firebase.assertSucceeds(
      document.set({name: 'abcdewrqwerewrewrew', url: 'https://dlskfds.dsjfksd.dskfdlsf.dk', price:22}));
  });

  test('Cannot created Product with url of 12 or less chars', async () => {
    const document = db.collection(COLLECTION).doc(DOC_ID);
    //Fails with no url
    await firebase.assertFails(
      document.set({name: 'abc', price:22}));
    //Fails with 12 letters
    await firebase.assertFails(
      document.set({name: 'abc', url: 'https://dlsk', price:22}));
    //Passes with 13 letters
    await firebase.assertSucceeds(
      document.set({name: 'abcd', url: 'https://dlskq', price:22}));
  });

  test('Cannot created Product with no price or a price less then zero', async () => {
    const document = db.collection(COLLECTION).doc(DOC_ID);
    //Fails with no price
    await firebase.assertFails(
      document.set({name: 'abc', url: 'https://dlskq'}));
    //Fails with no price
    await firebase.assertFails(
      document.set({name: 'abc', url: 'https://dlskq', price: 0}));
    //Passes price above 0
    await firebase.assertSucceeds(
      document.set({name: 'abcd', url: 'https://dlskq', price: 0.0001}));
  });
});
