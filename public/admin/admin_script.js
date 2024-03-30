document.addEventListener('DOMContentLoaded', (event) => {
    const addUserButton = document.getElementById('add-user');
    const modifyCreditsButton = document.getElementById('modify-credits');
    const exitButton = document.getElementById('exit-list');
    exitButton.style.display = 'none';


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
        // Hide the buttons
        addUserButton.style.display = 'none';
        modifyCreditsButton.style.display = 'none';

        // If userList exists, remove it from the DOM
        if (userList) {
            userList.remove();
            userList = null; // Reset userList to null
            exitButton.style.display = 'none'; // Hide the exit button
            return; // Exit the function
        }
    
        // Fetch the list of names from the server
        const response = await fetch(`http://localhost:3000/get-user-names`);
        const users = await response.json();
    
        // Create a list in the HTML document
        userList = document.createElement('ul');
        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user.name;
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => modifyUserCredits(user.id, user.name)); // Function to modify credits
            userList.appendChild(listItem);
        });
    
        // Append this list to the DOM or use it to replace content in an existing element
        document.querySelector('.admin-actions').appendChild(userList);
        exitButton.style.display = 'block'; // Display the exit button
    });

    exitButton.addEventListener('click', () => {
        // Show the buttons again
        addUserButton.style.display = 'block';
        modifyCreditsButton.style.display = 'block';
    
        // Remove the user list
        if (userList) {
            userList.remove();
            userList = null;
            exitButton.style.display = 'none'; // Hide the exit button
        }
    });
    
    
    async function modifyUserCredits(userId, userName) {
        const creditsToAdd = prompt(`Enter the amount of credits to add to ${userName}:`);
        if (creditsToAdd && !isNaN(parseInt(creditsToAdd))) {
            // Send a request to the server to modify the user's credits
            fetch(`http://localhost:3000/modify-credits/${encodeURIComponent(userId)}/${parseInt(creditsToAdd)}`, { method: 'PUT' })
                .then(response => {
                    if (response.ok) {
                        alert(`Credits successfully added to ${userName}.`);
                    } else {
                        alert(`Failed to add credits to ${userName}.`);
                    }
                })
                .catch(error => {
                    console.error('Error modifying credits:', error);
                    alert('An error occurred while modifying credits.');
                });
        } else {
            alert('Invalid input. Please enter a valid number for credits.');
        }
    }
});
