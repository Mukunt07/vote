import { writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { sha256 } from '../utils/crypto';
import { getFaceDistance, arrayToDescriptor } from '../utils/face';

export async function castVote(voteData) {
    const { mobile, faceHash, faceDescriptor, candidateId, candidateName, party } = voteData;

    if (!mobile || !faceHash || !candidateId) {
        throw new Error("Missing vote data");
    }

    // 1. Hash the mobile number (Privacy Lock)
    const mobileHash = await sha256(mobile);

    // 2. CHECK FOR DUPLICATE BIOMETRICS (Client-Side AI Check)
    // Download existing face vectors. In production, this moves to server.
    if (faceDescriptor) {
        const querySnapshot = await getDocs(collection(db, "biometric_registry"));
        const currentDescriptor = arrayToDescriptor(faceDescriptor);

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            if (data.vector) {
                const storedDescriptor = arrayToDescriptor(data.vector);
                const distance = getFaceDistance(currentDescriptor, storedDescriptor);

                // Distance < 0.6 is usually considered a match for dlib models
                if (distance < 0.5) {
                    throw new Error("Biometric Duplicate: You have already voted!");
                }
            }
        }
    }

    // 3. Prepare the batch
    const batch = writeBatch(db);

    // Vote Document
    const voteRef = doc(collection(db, "votes"));
    batch.set(voteRef, {
        candidateId,
        candidateName,
        party,
        timestamp: new Date().toISOString(),
        faceHash,
        mobileHash,
        deviceInfo: navigator.userAgent
    });

    // Mobile Lock
    const mobileRef = doc(db, "mobile_registry", mobileHash);
    batch.set(mobileRef, {
        timestamp: new Date().toISOString()
    });

    // Face Hash Lock (Legacy support + exact match lock)
    const faceRef = doc(db, "face_registry", faceHash);
    batch.set(faceRef, {
        timestamp: new Date().toISOString()
    });

    // Biometric Vector Storage (For AI Check)
    if (faceDescriptor) {
        // Use auto-ID for biometrics, or link to voteID
        const bioRef = doc(collection(db, "biometric_registry"));
        batch.set(bioRef, {
            vector: faceDescriptor, // Store 128 numbers
            timestamp: new Date().toISOString()
        });
    }

    // 4. Commit
    await batch.commit();
    return voteRef.id;
}
