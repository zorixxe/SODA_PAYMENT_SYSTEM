document.addEventListener('DOMContentLoaded', (event) => {
    const addUserButton = document.getElementById('add-user');
    const modifyCreditsButton = document.getElementById('modify-credits');
    const exitButton = document.getElementById('exit-list');

    exitButton.style.display = 'none'; // Ensure 'X' is hidden on load

    addUserButton.addEventListener('click', () => {
        const userName = prompt('Enter the name of the new user:');
        const userId = prompt('Enter the ID of the new user:');
        if (userName && userId) {
            // Send a request to the server to add the new user
            fetch('http://localhost:3000/add-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: userId, name: userName })
            })
            .then(response => {
                if (response.ok) {
                    alert(`User ${userName} added successfully.`);
                } else {
                    alert(`Failed to add user ${userName}.`);
                }
            })
            .catch(error => {
                console.error('Error adding user:', error);
                alert('An error occurred while adding the user.');
            });
        } else {
            alert('Invalid input. Please provide both name and ID.');
        }
    });

    let userList = null; // Variable to store the user list element

    modifyCreditsButton.addEventListener('click', async () => {
        toggleUserList();
    });

    exitButton.addEventListener('click', () => {
        toggleUserList();
    });

    async function toggleUserList() {
        // Hide the buttons or show them depending on the state
        const displayStyle = userList ? 'block' : 'none';
        addUserButton.style.display = displayStyle;
        modifyCreditsButton.style.display = displayStyle;

        if (userList) {
            // If userList exists, remove it from the DOM
            userList.remove();
            userList = null;
            exitButton.style.display = 'none';
            return;
        }

        // Otherwise, create and show the user list
        const response = await fetch('http://localhost:3000/get-user-names');
        const users = await response.json();
        userList = document.createElement('ul');
        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user.name;
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => showCreditOptions(user.id, user.name));
            userList.appendChild(listItem);
        });
        document.querySelector('.admin-actions').appendChild(userList);
        exitButton.style.display = 'block';
    }

    function showCreditOptions(userId, userName) {
        // Create the scrollable list container
        const creditListContainer = document.createElement('div');
        creditListContainer.style.maxHeight = '200px';
        creditListContainer.style.overflowY = 'auto';
        creditListContainer.style.background = 'white';
        creditListContainer.style.position = 'absolute';
        creditListContainer.style.left = '50%';
        creditListContainer.style.top = '50%';
        creditListContainer.style.transform = 'translate(-50%, -50%)';
        creditListContainer.style.padding = '10px';
        creditListContainer.style.border = '1px solid black';
        creditListContainer.style.zIndex = '10';

        // Array of predefined credit amounts
        const creditOptions = [5, 10, 15, 20, 25, 30, 35, 40, 50];

        // Add each credit option as an item in the list
        creditOptions.forEach(credit => {
            const creditItem = document.createElement('div');
            creditItem.textContent = `€${credit}`;
            creditItem.style.cursor = 'pointer';
            creditItem.style.padding = '10px';
            creditItem.style.borderBottom = '1px solid #ccc';
            creditItem.addEventListener('click', () => {
                creditListContainer.remove(); // Remove list after selection
                modifyUserCredits(userId, userName, credit); // Proceed to modify credits
            });
            creditListContainer.appendChild(creditItem);
        });

        // Append the credit list to the body
        document.body.appendChild(creditListContainer);
    }

    // Function to modify user credits
    async function modifyUserCredits(userId, userName, creditsToAdd) {
        if (creditsToAdd) {
            // Send a request to the server to modify the user's credits
            fetch(`http://localhost:3000/modify-credits/${encodeURIComponent(userId)}/${creditsToAdd}`, { method: 'PUT' })
                .then(response => {
                    if (response.ok) {
                        alert(`€${creditsToAdd} successfully added to ${userName}.`);
                    } else {
                        alert(`Failed to add credits to ${userName}.`);
                    }
                })
                .catch(error => {
                    console.error('Error modifying credits:', error);
                    alert('An error occurred while modifying credits.');
                });
        } else {
            alert('Please select an amount to add credits.');
        }
    }
});
const manualLogoutButton = document.getElementById('logout-button');
if (manualLogoutButton) {
    manualLogoutButton.addEventListener('click', handleLogout);
}

function handleLogout() {
    console.log('Logging out...');
    localStorage.setItem('nfcId', ''); // Clear the NFC ID from local storage
    window.location.href = '../index.html'; // Redirect to the index page
}

