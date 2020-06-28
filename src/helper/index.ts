// https://github.com/CSFrequency/react-firebase-hooks/blob/master/firestore/helpers/index.ts
import { firestore } from "firebase";

export const snapshotToData = (
  snapshot: firestore.DocumentSnapshot,
  idField?: string
) => {
  if (!snapshot.exists) {
    return undefined;
  }

  return {
    ...snapshot.data(),
    ...(idField ? { [idField]: snapshot.id } : null),
  };
};
