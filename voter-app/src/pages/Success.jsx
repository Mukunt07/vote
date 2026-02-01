import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function Success() {
    return (
        <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 text-center text-white">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="bg-white text-emerald-500 rounded-full p-6 mb-6 shadow-2xl"
            >
                <CheckCircle size={64} strokeWidth={3} />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-4"
            >
                Voted!
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-emerald-100 text-lg max-w-xs"
            >
                Your vote has been securely recorded on the blockchain ledger.
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 opacity-50 text-emerald-200 text-sm"
            >
                You can now close this window.
            </motion.div>
        </div>
    );
}
