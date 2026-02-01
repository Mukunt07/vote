import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Guard: Requires Mobile Number to be present in state.
 * Use for: /face-scan
 */
export const RequireMobile = ({ children }) => {
    const location = useLocation();
    const { mobile } = location.state || {};

    if (!mobile) {
        // User tried to skip Mobile Entry
        console.warn("Security: Illegal navigation detected. Missing mobile number.");
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * Guard: Requires Mobile AND FaceHash (Biometric Proof).
 * Use for: /vote
 */
export const RequireBiometrics = ({ children }) => {
    const location = useLocation();
    const { mobile, faceHash } = location.state || {};

    if (!mobile || !faceHash) {
        // User tried to skip Face Scan
        console.warn("Security: Illegal navigation detected. Missing biometric proof.");
        return <Navigate to="/" replace />;
    }

    return children;
};
