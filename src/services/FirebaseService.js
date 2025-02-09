import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  where,
  query,
  writeBatch,
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
  async getExportBatches(filters = {}) {
    try {
      let query = collection(db, 'exportBatches');

      if (filters.startDate) {
        query = query.where('exportDate', '>=', filters.startDate);
      }
      if (filters.endDate) {
        query = query.where('exportDate', '<=', filters.endDate);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.where('status', '==', filters.status);
      }
      if (filters.batchNumber) {
        query = query.where('batchNumber', '==', filters.batchNumber);
      }

      const snapshot = await getDocs(query);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting export batches:', error);
      throw error;
    }
  }

  async createExportBatch(batchData) {
    try {
      const docRef = await addDoc(collection(db, 'exportBatches'), {
        ...batchData,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating export batch:', error);
      throw error;
    }
  }
  async getUnassignedItems() {
    try {
      const q = query(collection(db, 'items'), where('batchId', '==', null));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting unassigned items:', error);
      throw error;
    }
  }

  async updateItemsBatchAssignment(itemIds, batchId) {
    try {
      const batch = writeBatch(db);
      itemIds.forEach((itemId) => {
        const itemRef = doc(db, 'items', itemId);
        batch.update(itemRef, { batchId });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error updating items batch assignment:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
