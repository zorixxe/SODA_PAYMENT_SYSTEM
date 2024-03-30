// logged.js

document.addEventListener('DOMContentLoaded', async () => {
    // Check if 'nfcId' exists in local storage
    const storedNfcId = localStorage.getItem('nfcId');
    if (!storedNfcId) {
        // If 'nfcId' does not exist in local storage, redirect to index.html
        window.location.href = '../index.html';
        return; // Prevent further execution
    }

    try {
        // Check if 'nfcId' exists in the database
        const response = await fetch(`http://localhost:3000/check-id/${encodeURIComponent(storedNfcId)}`);
        const data = await response.json();
        if (!data.exists) {
            // If 'nfcId' does not exist in the database, redirect to index.html
            window.location.href = '../index.html';
            return; // Prevent further execution
        }
    } catch (error) {
        console.error('Error checking NFC ID:', error);
        // Handle error if necessary
    }

    // Continue with normal operations
});
