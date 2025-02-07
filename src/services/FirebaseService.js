import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../configs/firebase';

class FirebaseService {
  /**
   *
   * @param collectionName
   * @returns {Promise<(*&{id: *})[]>}
   */
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   *
   * @param collectionName
   * @param data
   * @returns {Promise<*&{id: string}>}
   */
  async add(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   *
   * @param collectionName
   * @param docId
   * @param data
   * @returns {Promise<*&{id}>}
   */
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return {
        id: docId,
        ...data,
      };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   *
   * @param orders
   * @returns {Promise<*[]>}
   */
  async addBulkOrders(orders) {
    const batch = [];
    const existingOrders = await this.getAll('orders');
    const existingOrderIds = new Set(
      existingOrders.map((order) => order.orderId)
    );

    for (const order of orders) {
      if (!existingOrderIds.has(order.orderId)) {
        batch.push(this.add('orders', order));
        existingOrderIds.add(order.orderId);
      }
    }

    if (batch.length > 0) {
      await Promise.all(batch);
    }

    return this.getAll('orders');
  }
}

export const firebaseService = new FirebaseService();
