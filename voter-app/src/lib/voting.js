import { writeBatch, doc, collection, getDocs, getDoc } from 'firebase/firestore';
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

    console.time("VoteProcessing");

    // OPTIMIZATION: Check Mobile Registry FIRST (O(1) cost)
    // Fail fast if this mobile number has already voted.
    const mobileCheckRef = doc(db, "mobile_registry", mobileHash);
    const mobileSnap = await getDoc(mobileCheckRef); // Use getDoc, not getDocs
    if (mobileSnap.exists()) {
        console.timeEnd("VoteProcessing");
        throw new Error("Already Voted: This mobile number has already cast a vote.");
    }

    // 2. CHECK FOR DUPLICATE BIOMETRICS (Client-Side AI Check)
    // Download existing face vectors. 
    console.time("BiometricFetch");
    if (faceDescriptor) {
        const querySnapshot = await getDocs(collection(db, "biometric_registry"));
        console.timeEnd("BiometricFetch");

        console.time("BiometricCalc");
        const currentDescriptor = arrayToDescriptor(faceDescriptor);
        let matchFound = false;

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            if (data.vector) {
                const storedDescriptor = arrayToDescriptor(data.vector);
                const distance = getFaceDistance(currentDescriptor, storedDescriptor);

                // Distance < 0.5 is a match
                if (distance < 0.5) {
                    matchFound = true;
                    break;
                }
            }
        }
        console.timeEnd("BiometricCalc");

        if (matchFound) {
            console.timeEnd("VoteProcessing");
            throw new Error("Biometric Duplicate: You have already voted!");
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
