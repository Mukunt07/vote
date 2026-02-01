import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../node_modules/@vladmandic/face-api/model');
const destDir = path.resolve(__dirname, '../public/models');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// We only need specific models
const modelsToCopy = [
    'ssd_mobilenetv1_model',
    'face_landmark_68_model',
    'face_recognition_model',
    'tiny_face_detector_model'
];

async function copyModels() {
    if (!fs.existsSync(srcDir)) {
        console.error("Source directory not found:", srcDir);
        process.exit(1);
    }

    const files = fs.readdirSync(srcDir);
    let count = 0;

    for (const file of files) {
        // Copy if it matches our needed models (weights or manifest)
        const isMatch = modelsToCopy.some(model => file.startsWith(model));
        if (isMatch) {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            console.log(`Copied: ${file}`);
            count++;
        }
    }
    console.log(`Successfully copied ${count} model files.`);
}

copyModels();
