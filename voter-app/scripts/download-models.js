import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '../public/models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

// Official Demo URL (Hosted on Github Pages, so it definitely works)
const baseUrl = 'https://justadudewhohacks.github.io/face-api.js/models';

const files = [
    'ssd_mobilenet_v1_model-weights_manifest.json',
    'ssd_mobilenet_v1_model-shard1',
    'ssd_mobilenet_v1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

async function downloadFile(file) {
    return new Promise((resolve, reject) => {
        const dest = path.join(modelsDir, file);
        const fileStream = fs.createWriteStream(dest);

        console.log(`Downloading ${file}...`);

        https.get(`${baseUrl}/${file}`, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(dest, () => { });
                reject(new Error(`Failed to download ${file}: ${response.statusCode} from ${baseUrl}/${file}`));
                return;
            }
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Success: ${file}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function main() {
    console.log('Starting model download...');
    try {
        for (const file of files) {
            await downloadFile(file);
        }
        console.log('All models downloaded successfully!');
    } catch (error) {
        console.error("FATAL ERROR:", error.message);
        process.exit(1);
    }
}

main();
