document.addEventListener('DOMContentLoaded', (event) => {
    const buttons = document.querySelectorAll('.option-button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            console.log(`${this.id} was clicked`);
            // You can add more actions here, like making a request to your backend
        });
    });
});
