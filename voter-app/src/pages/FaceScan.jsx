import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ScanLine, AlertCircle, Shield, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import { sha256 } from '../utils/crypto';
import { loadModels, getFaceDescriptor, descriptorToArray } from '../utils/face';

export default function FaceScan() {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { mobile } = location.state || {};
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [modelLoaded, setModelLoaded] = useState(false);

    useEffect(() => {
        loadModels().then(success => {
            if (success) setModelLoaded(true);
            else setError("Failed to load AI models. Refresh page.");
        });
    }, []);

    const capture = useCallback(async () => {
        if (!modelLoaded) return;
        setScanning(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Scan animation simulation

            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) throw new Error("Camera capture failed");

            // AI Processing
            const img = new Image();
            img.src = imageSrc;
            await img.decode();

            const descriptor = await getFaceDescriptor(img);
            if (!descriptor) {
                throw new Error("No face detected! Please ensure good lighting and look at the camera.");
            }

            const faceHash = await sha256(imageSrc); // Keep hash for reference
            const faceDescriptor = descriptorToArray(descriptor); // Convert Float32 to Array

            // Pass 128-d vector to next screen
            navigate('/vote', { state: { mobile, faceHash, faceDescriptor } });
        } catch (err) {
            console.error(err);
            setError(err.message || "Face scan failed");
            setScanning(false);
        }
    }, [webcamRef, navigate, mobile, modelLoaded]);

    return (
        <Layout>
            <div className="flex-1 flex flex-col relative bg-slate-900 overflow-hidden">
                {/* Camera Layer */}
                <div className="absolute inset-0 z-0">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="w-full h-full object-cover opacity-80"
                    />
                </div>

                {/* Tech Overlay Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] [background-size:40px_40px]"></div>

                {/* UI Layer */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-12 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-emerald-400 px-4 py-2 rounded-full mx-auto w-fit border border-emerald-500/30">
                            <Shield size={16} className="animate-pulse" />
                            <span className="text-xs font-mono tracking-wider">AI BIOMETRIC: {modelLoaded ? "ACTIVE" : "LOADING..."}</span>
                        </div>
                    </motion.div>

                    {/* Scanner Frame */}
                    <div className="relative w-72 h-72">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl"></div>

                        {/* Scan Line */}
                        {scanning && (
                            <motion.div
                                className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] z-20"
                                initial={{ top: '10%' }}
                                animate={{ top: '90%' }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatType: "reverse" }}
                            />
                        )}

                        <div className="absolute inset-0 border border-emerald-500/20 rounded-xl"></div>
                    </div>

                    {/* Controls */}
                    <div className="w-full space-y-4">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                            <h3 className="text-white font-semibold text-lg mb-1">Face Verification</h3>
                            <p className="text-slate-300 text-sm">Align your face within the frame.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-rose-500/90 text-white p-3 rounded-xl text-center text-sm font-medium backdrop-blur-sm flex items-center justify-center gap-2"
                            >
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}

                        <button
                            onClick={capture}
                            disabled={scanning || !modelLoaded}
                            className={`w-full h-16 rounded-2xl font-medium text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${scanning || !modelLoaded
                                ? 'bg-emerald-500 text-white cursor-wait opacity-90'
                                : 'bg-white text-slate-900 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {scanning ? (
                                <>
                                    <ScanLine className="animate-spin" /> Analyzing Biometrics...
                                </>
                            ) : !modelLoaded ? (
                                <>
                                    <Loader className="animate-spin" /> Loading Models...
                                </>
                            ) : (
                                <>
                                    <Camera /> Capture Photo
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
