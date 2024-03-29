// Assuming script.js is included after the body content

function handleLogout() {
    console.log('Logging out...');
    // Redirect to the index.html page
    window.location.href = '../index.html';
}

// Only attach this event listener on the logged-out page
// where the nfc-input element exists
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

// Attach click event listeners to option buttons
// and manual logout button for both logged-in and logged-out pages
document.addEventListener('DOMContentLoaded', () => {
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
});
