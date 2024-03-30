document.addEventListener('DOMContentLoaded', () => {
    let logoutTimer;

    function resetLogoutTimer() {
        clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
            handleLogout();
        }, 2 * 60 * 1000);
    }

    const nfcInput = document.getElementById('nfc-input');
    if (nfcInput) {
        setInterval(() => {
            nfcInput.focus();
        }, 1000);

        nfcInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                const nfcId = nfcInput.value.trim();
                try {
                    const response = await fetch(`http://localhost:3000/check-id/${encodeURIComponent(nfcId)}`);
                    const data = await response.json();
                    if (data.exists) {
                        console.log('ID exists. Access granted.');
                        localStorage.setItem('nfcId', nfcId);
                        window.location.href = './logged_in/index.html';
                    } else {
                        alert('ID does not exist. Access denied.');
                    }
                    nfcInput.value = '';
                } catch (error) {
                    console.error('Error verifying NFC ID:', error);
                    nfcInput.value = '';
                }
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
                    // Fetch the user's credits
                    const creditsResponse = await fetch(`http://localhost:3000/get-credits/${encodeURIComponent(nfcId)}`);
                    const creditsData = await creditsResponse.json();
                    const userCredits = creditsData.credits;
    
                    // Check if the user has enough credits
                    if (userCredits > 0) {
                        // Update the credits and cans
                        const updateResponse = await fetch(`http://localhost:3000/update-credits/${encodeURIComponent(nfcId)}`, { method: 'PUT' });
                        if (updateResponse.ok) {
                            console.log('Credits updated successfully.');
                            handleLogout(); // Ensure this function is defined to handle the logout process
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

    const scannedNfcId = localStorage.getItem('nfcId');
    if (scannedNfcId) {
        displayUserInfo(scannedNfcId);
        resetLogoutTimer();
    }
});

async function displayUserInfo(nfcId) {
    try {
        const response = await fetch(`http://localhost:3000/get-user-info/${encodeURIComponent(nfcId)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        const credits = data.credits;
        const cans = data.cans; // Add this line to retrieve the cans
        const name = data.name;
        const creditsDisplay = document.getElementById('user-credits');
        const cansDisplay = document.getElementById('user-cans'); // Make sure you have an element with this ID in your HTML
        const nameDisplay = document.getElementById('user-name');
        
        creditsDisplay.textContent = `Credits: ${credits}`;
        cansDisplay.textContent = `Cans bought: ${cans}`; // Update this line to display the cans
        nameDisplay.textContent = `Name: ${name}`;
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}


function handleLogout() {
    console.log('Logging out...');
    localStorage.setItem('nfcId', '');
    window.location.href = '../index.html';
}
