import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ScanLine, AlertCircle, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { sha256 } from '../utils/crypto';

export default function FaceScan() {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { mobile } = location.state || {};
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');

    const capture = useCallback(async () => {
        setScanning(true);
        setError('');

        setTimeout(async () => {
            try {
                const imageSrc = webcamRef.current.getScreenshot();
                if (!imageSrc) throw new Error("Camera capture failed");
                const faceHash = await sha256(imageSrc);
                navigate('/vote', { state: { mobile, faceHash } });
            } catch (err) {
                console.error(err);
                setError("Face not detected. Please verify lighting and try again.");
                setScanning(false);
            }
        }, 1500);
    }, [webcamRef, navigate, mobile]);

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
                            <span className="text-xs font-mono tracking-wider">BIOMETRIC SECURE L3</span>
                        </div>
                    </motion.div>

                    {/* Scanner Frame */}
                    <div className="relative w-72 h-72">
                        {/* Brackets */}
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
                            <p className="text-slate-300 text-sm">Align your face within the frame to verify identity.</p>
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
                            disabled={scanning}
                            className={`w-full h-16 rounded-2xl font-medium text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${scanning
                                ? 'bg-emerald-500 text-white cursor-wait'
                                : 'bg-white text-slate-900 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {scanning ? (
                                <>
                                    <ScanLine className="animate-spin" /> Verifying...
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
