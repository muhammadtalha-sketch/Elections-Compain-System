import { getStorage } from "firebase/storage";
import app from "./firebase";

const storage = getStorage(app);

export default storage;

// FUTURE IMPLEMENTATION — File uploads (member photos, import files)
// export async function uploadFile(path: string, file: File) {
//   const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
//   const fileRef = ref(storage, path);
//   const task = uploadBytesResumable(fileRef, file);
//   return task;
// }
