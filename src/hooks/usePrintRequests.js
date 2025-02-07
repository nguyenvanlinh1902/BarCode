import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../configs/firebase';
import { firebaseService } from '../services/FirebaseService';

/**
 *
 * @param userRole
 * @param handlePrintAndUpdateStatus
 */
export const usePrintRequests = (userRole, handlePrintAndUpdateStatus) => {
  useEffect(() => {
    if (userRole === 'ADMIN') {
      const q = query(collection(db, 'printRequests'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const request = { id: change.doc.id, ...change.doc.data() };
            if (!request.printed) {
              await handlePrintAndUpdateStatus(request.orderId);
              await firebaseService.update('printRequests', request.id, {
                createdAt: new Date().toISOString(),
                printed: true,
              });
            }
          }
        }
      });

      return () => unsubscribe();
    }
  }, [userRole, handlePrintAndUpdateStatus]);
};
