


document.addEventListener('DOMContentLoaded', () => {
    let logoutTimer; // Variable to store the logout timer

    // Function to reset the logout timer
    function resetLogoutTimer() {
        clearTimeout(logoutTimer); // Clear the previous timer
        logoutTimer = setTimeout(() => {
            handleLogout(); // Logout the user after 2 minutes of inactivity
        }, 2 * 60 * 1000); // 2 minutes in milliseconds
    }

    const nfcInput = document.getElementById('nfc-input');
    if (nfcInput) {
        setInterval(() => {
            nfcInput.focus();
        }, 1000);

        nfcInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                var nfcId = this.value.trim();
                console.log("NFC ID: " + nfcId);
                fetch(`http://localhost:3000/check-id/${encodeURIComponent(nfcId)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.exists) {
                            console.log('ID exists. Access granted.');
                            localStorage.setItem('nfcId', nfcId);
                            window.location.href = './logged_in/index.html';
                        } else {
                            alert('ID does not exist. Access denied.');
                        }
                        this.value = ''; // Clear the input
                    })
                    .catch(error => {
                        console.error('Error verifying NFC ID:', error);
                        this.value = ''; // Clear the input
                    });
                event.preventDefault();
            }
        });
    }

    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.addEventListener('click', async () => {
            console.log(`${button.id} was clicked`);
            const nfcId = localStorage.getItem('nfcId');
            if (nfcId) {
                try {
                    // Fetch user's credits from the database
                    const response = await fetch(`http://localhost:3000/get-credits/${encodeURIComponent(nfcId)}`);
                    const data = await response.json();
                    const userCredits = data.credits;
                    if (userCredits > 0) {
                        // If user has enough credits, subtract one
                        const updatedCredits = userCredits - 1;
                        // Update the user's credits in the database
                        const updateResponse = await fetch(`http://localhost:3000/update-credits/${encodeURIComponent(nfcId)}/${updatedCredits}`, { method: 'PUT' });
                        if (updateResponse.ok) {
                            console.log('Credits updated successfully.');
                            /* REEEEEEEEEEE WANT SODA REEEEEEEEEEE BIRA REEEEEEEEEEE BÄRS */
                            handleLogout();
                        } else {
                            console.error('Failed to update credits.');
                        }
                    } else {
                        alert('Insufficient credits. Please recharge your account.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                console.error('NFC ID not found.');
            }
        });
    });

    const manualLogoutButton = document.getElementById('logout-button');
    if (manualLogoutButton) {
        manualLogoutButton.addEventListener('click', handleLogout);
    }

    // Get the scanned NFC ID from localStorage
    const scannedNfcId = localStorage.getItem('nfcId');
    // Check if the scanned NFC ID is valid before calling displayUserCredits
    if (scannedNfcId) {
        displayUserInfo(scannedNfcId);
        resetLogoutTimer();
    }
});
async function displayUserInfo(nfcId) {
    try {
        const response = await fetch(`http://localhost:3000/get-user-info/${encodeURIComponent(nfcId)}`);
        const data = await response.json();
        const credits = data.credits;
        const name = data.name;
        const creditsDisplay = document.getElementById('user-credits');
        const nameDisplay = document.getElementById('user-name');
        creditsDisplay.textContent = `Credits: ${credits}`;
        nameDisplay.textContent = `Name: ${name}`;
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

function handleLogout() {
    console.log('Logging out...');
    localStorage.setItem('nfcId', '');
    // Redirect to the index.html page
    window.location.href = '../index.html';
}
