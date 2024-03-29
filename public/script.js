


document.addEventListener('DOMContentLoaded', () => {
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
        button.addEventListener('click', () => {
            console.log(`${button.id} was clicked`);
            // On the logged-in page, clicking an option logs you out
            handleLogout();
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
        creditsDisplay.textContent = `Credits: ${credits} `;
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
