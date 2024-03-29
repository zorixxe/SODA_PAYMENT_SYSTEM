document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('add-user').addEventListener('click', () => {
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

    document.getElementById('modify-credits').addEventListener('click', () => {
        // Open modify credits dialog or page
        const userName = prompt('Enter the name of the user:');
        if (userName) {
            const creditsToAdd = prompt(`Enter the amount of credits to add to ${userName}:`);
            if (creditsToAdd && !isNaN(parseInt(creditsToAdd))) {
                // Send a request to the server to modify the user's credits
                fetch(`http://localhost:3000/modify-credits/${encodeURIComponent(userName)}/${parseInt(creditsToAdd)}`, { method: 'PUT' })
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

    // Continue with event listeners for other buttons
});
