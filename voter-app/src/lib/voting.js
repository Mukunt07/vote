import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { sha256 } from '../utils/crypto';

export async function castVote(voteData) {
    const { mobile, faceHash, candidateId, candidateName, party } = voteData;

    if (!mobile || !faceHash || !candidateId) {
        throw new Error("Missing vote data");
    }

    // 1. Hash the mobile number for privacy/registry key
    const mobileHash = await sha256(mobile);

    // 2. Prepare the batch
    const batch = writeBatch(db);

    // Ref: Vote Document (Auto-ID)
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

    // Ref: Face Registry Lock (Key = Hash)
    const faceRef = doc(db, "face_registry", faceHash);
    batch.set(faceRef, {
        timestamp: new Date().toISOString()
    });

    // Ref: Mobile Registry Lock (Key = Hash)
    const mobileRef = doc(db, "mobile_registry", mobileHash);
    batch.set(mobileRef, {
        timestamp: new Date().toISOString()
    });

    // 3. Commit Batch
    // Rules enforce uniqueness on registries.
    await batch.commit();
    return voteRef.id;
}
