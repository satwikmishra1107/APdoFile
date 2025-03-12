import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  getDocs,
  orderBy,
  where,
  deleteDoc,
  Firestore,
  getFirestore,
} from "firebase/firestore";

interface FileMetadata {
  fileName: string;
  fileHash: string;
  size: number;
  mimetype: string;
  uploadedAt: any;
  userId: string;
}

export const saveFileMetadata = async (
  userId: string,
  fileMetadata: Omit<FileMetadata, "uploadedAt" | "userId">
) => {
  try {
    const firestore = getFirestore();
    const fileRef = doc(collection(firestore, `Users/${userId}/files`));

    await setDoc(fileRef, {
      ...fileMetadata,
      uploadedAt: serverTimestamp(),
      userId,
    });

    return fileRef.id;
  } catch (error) {
    console.error("Error saving file metadata:", error);
    throw error;
  }
};

export const fetchUserFiles = async (userId: string) => {
  try {
    const filesQuery = query(
      collection(db, "Users", userId, "files"),
      orderBy("uploadedAt", "desc")
    );

    const snapshot = await getDocs(filesQuery);

    // console.log(snapshot.docs);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      fileName: doc.data().fileName,
      fileSize: doc.data().size,
      fileHash: doc.data().fileHash,
      botToken: doc.data().botToken,
      channelId: doc.data().channelId,
      mimetype: doc.data().mimetype
    }));
  } catch (error) {
    console.error("Error fetching user files:", error);
    throw error;
  }
};

export const deleteFileMetadata = async (userId: string, fileHash: string) => {
  try {
    // Query to find the document with matching fileHash
    const filesQuery = query(
      collection(db, "Users", userId, "files"),
      where("fileHash", "==", fileHash)
    );

    const snapshot = await getDocs(filesQuery);

    if (snapshot.empty) {
      throw new Error("File not found");
    }

    // Delete the document
    const fileDoc = snapshot.docs[0];
    await deleteDoc(doc(db, "Users", userId, "files", fileDoc.id));
  } catch (error) {
    console.error("Error deleting file metadata:", error);
    throw error;
  }
};

