import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ShiftReport } from '../types/oee';

const REPORTS_PATH = 'reports';

// Real-time synchronization listener for shift reports
export function subscribeToShiftReports(
  onUpdate: (reports: ShiftReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const reportsCol = collection(db, REPORTS_PATH);

  return onSnapshot(
    reportsCol,
    (snapshot) => {
      const reportsList: ShiftReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ShiftReport;
        reportsList.push(data);
      });

      // Sort descending by date and shift (night before day of same date)
      reportsList.sort((a, b) => {
        const dateCmp = b.date.localeCompare(a.date);
        if (dateCmp !== 0) return dateCmp;
        return a.shift === 'night' ? -1 : 1;
      });

      onUpdate(reportsList);
    },
    (error) => {
      console.error('Realtime reports subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, REPORTS_PATH);
    }
  );
}

// Save a shift report to Firestore
export async function saveShiftReportToFirestore(report: ShiftReport): Promise<void> {
  const path = `${REPORTS_PATH}/${report.id}`;
  try {
    const reportRef = doc(db, REPORTS_PATH, report.id);
    await setDoc(reportRef, report, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a shift report from Firestore
export async function deleteShiftReportFromFirestore(reportId: string): Promise<void> {
  const path = `${REPORTS_PATH}/${reportId}`;
  try {
    const reportRef = doc(db, REPORTS_PATH, reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed the 20 historical reports to Firestore
export async function seedReportsToFirestore(reports: ShiftReport[]): Promise<{ count: number }> {
  let count = 0;
  for (const rep of reports) {
    try {
      await saveShiftReportToFirestore(rep);
      count++;
    } catch (err) {
      console.warn(`Failed seeding report ${rep.id}:`, err);
    }
  }
  return { count };
}
