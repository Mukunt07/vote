export const maskHash = (hash) => {
    if (!hash || hash.length < 8) return hash;
    return `${hash.substring(0, 4)}****${hash.substring(hash.length - 4)}`;
};

export const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
    });
};
