import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../configs/firebase';

/**
 * Firebase Service class for handling CRUD operations
 */
class FirebaseService {
  /**
   * Get all documents from a collection
   * @param {string} collectionName - Name of the collection
   * @returns {Promise<Array>} Array of documents
   */
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Get documents by field value
   * @param {string} collectionName - Name of the collection
   * @param {string} field - Field name to query
   * @param {any} value - Value to match
   * @returns {Promise<Array>} Array of matching documents
   */
  async getByField(collectionName, field, value) {
    try {
      const q = query(
        collection(db, collectionName),
        where(field, '==', value)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  /**
   * Add a new document to a collection
   * @param {string} collectionName - Name of the collection
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Added document with ID
   */
  async add(collectionName, data) {
    try {
      const timestamp = new Date().toISOString();
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      return {
        id: docRef.id,
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Document ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated document
   */
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      const timestamp = new Date().toISOString();

      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp,
      });

      return {
        id,
        ...data,
        updatedAt: timestamp,
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document by ID
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Document ID
   * @returns {Promise<void>}
   */
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Batch add multiple documents
   * @param {string} collectionName - Name of the collection
   * @param {Array} dataArray - Array of documents to add
   * @returns {Promise<Array>} Array of added documents with IDs
   */
  async batchAdd(collectionName, dataArray) {
    try {
      const timestamp = new Date().toISOString();
      const addedDocs = await Promise.all(
        dataArray.map((data) =>
          this.add(collectionName, {
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp,
          })
        )
      );
      return addedDocs;
    } catch (error) {
      console.error('Error in batch add:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
