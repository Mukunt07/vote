import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

// Load models from public/models
// Load models from public/models
export async function loadModels() {
    try {
        await Promise.all([
            // Optimization: Use TinyFaceDetector (lighter, faster for mobile)
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log("AI Models Loaded (TinyFace Optimized)");
        return true;
    } catch (err) {
        console.error("Failed to load AI models:", err);
        return false;
    }
}

// Extract 128-d vector from an image/video element or URL
export async function getFaceDescriptor(imageOrVideo) {
    if (!imageOrVideo) return null;

    // Use TinyFaceDetector with adjusted options for mobile selfie capability
    // inputSize 224 is standard for speed/accuracy balance on mobile web
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

    const detection = await faceapi.detectSingleFace(imageOrVideo, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        return null; // No face detected
    }

    return detection.descriptor; // Float32Array(128)
}

// Compare two face vectors (Client-side)
// Returns distance (lower is better, < 0.6 is match)
export function getFaceDistance(descriptor1, descriptor2) {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
}

// Helper to convert Float32Array to Array (for Firestore storage)
export function descriptorToArray(descriptor) {
    return Array.from(descriptor);
}

// Helper to convert Array back to Float32Array
export function arrayToDescriptor(arr) {
    return new Float32Array(arr);
}
