import { getFirestore } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

export default db;

// Collection name constants — single source of truth
export const COLLECTIONS = {
  MEMBERS: "members",
  USERS: "users",
  ACTIVITY_LOGS: "activityLogs",
} as const;
