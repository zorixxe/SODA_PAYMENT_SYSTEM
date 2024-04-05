# SodaMachine Documentation

## Overview

This document provides detailed information on the setup, configuration, and usage of the SodaMachine, a web-based application designed to facilitate the vending of sodas using NFC technology. It covers both user and admin functionalities, including system setup, daily operations, and troubleshooting.

## System Requirements

- Node.js (version 12 or newer)
- PostgreSQL (version 10 or newer)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### Setting Up the Environment

1. **Clone the Repository**

   Clone the SodaMachine project repository to your local machine using the following command:

   ```bash
   git clone https://github.com/zorixxe/SODA_PAYMENT_SYSTEM.git
   ```

2. **Install Dependencies**

   Navigate to the project directory and install the required npm packages:

   ```bash
   cd SODA_PAYMENT_SYSTEM
   npm install
   ```

3. **Database Configuration**

   - Create a PostgreSQL database for the project.
   - Update the `.env` file with your database credentials:

     ```env
     DB_USER=your_username
     DB_HOST=localhost
     DB_NAME=sodamachine
     DB_PASSWORD=your_password
     DB_PORT=5432
     ```

### Starting the Application

Run the following command in the terminal to start the SodaMachine application:

```bash
npm start
```

The application will be accessible at `http://localhost:3000`.

## Usage Guide

### User Interface

- **Login**: Users can log in by scanning their NFC tag, the field is hidden on the homepage but every second it checks it and puts in in focus to add text.
- **Viewing Credits**: Upon successful login, users can view their current credit balance and purchase history.
- **Purchasing Sodas**: Users can purchase sodas using their available credits. Each purchase will automatically deduct one credit.

### Admin Dashboard

- **Access**: The admin dashboard is accessible to users with admin privileges. Admins can log in using their NFC ID and navigate to the admin section by clicking the "Admin Function" button.
- **User Management**: Admins can add new users, modify existing user credits, and view user purchase histories.
- **Credits Management**: Admins have the ability to adjust credit balances for users, including adding or deducting credits.

## Troubleshooting

- **Login Issues**: Ensure that the NFC ID is correctly entered and that the user exists in the database.
- **Credit Discrepancies**: Verify the user's credit transactions through the admin dashboard to ensure all purchases and credits are accurately recorded.
- **Connectivity Problems**: Check the server and database logs for any errors. Ensure that the PostgreSQL service is running and accessible.



## Support

For additional support, please contact the project maintainer at [robin@tildeman.ax].

# Code Documentation

## Front-end Overview

The SodaMachine project's front-end is built using HTML, CSS, and JavaScript, providing an interactive user interface for both regular users and admins.

### HTML Structure

- `index.html`: The landing page where users can log in using their NFC ID. It contains an invisible input field that constantly regains focus to capture NFC ID input.
- `logged_in/index.html`: This page is shown to users upon successful login. It displays user credits, purchase history, and soda purchase options.
- `admin/admin.html`: Accessible only to admins, this page allows user and credit management, including adding users and adjusting credits.

### CSS Styling

- `style.css`: Defines the styling for the user interface, including layout, colors, and button styles. It ensures the interface is intuitive and responsive.

### JavaScript Functionality

- `script.js`: Contains the core JavaScript code for handling NFC ID login, maintaining session state, and interacting with the back-end server via fetch API calls.
- `admin_script.js`: Specifically handles the admin functionalities, such as displaying the user list, modifying credits, and adding new users.

## Back-end Overview

The back-end is built with Node.js and Express, providing APIs for interacting with the PostgreSQL database to manage users, credits, and purchases.

### Server Setup (`server.js`)

- Initializes the Express application, sets up middleware for body parsing (`body-parser`), CORS (`cors`), and routes for handling HTTP requests.
- Establishes a connection to the PostgreSQL database using environment variables for configuration.

### API Endpoints

- `/check-id/:nfcId`: Checks if a given NFC ID exists in the database. Used during the login process.
- `/get-credits/:nfcId`: Retrieves the credit balance for a specific NFC ID.
- `/update-credits/:nfcId`: Updates the credit balance after a soda purchase.
- `/get-user-info/:nfcId`: Fetches detailed information about a user, including name, credit balance, and admin status.
- `/add-user`: Allows admins to add new users to the system.
- `/modify-credits/:userId/:creditsToAdd`: Enables credit adjustment for users by admins.

## Database Interaction

Database operations are performed using the `pg` package for Node.js, which interacts with the PostgreSQL database. Queries are used to insert, update, retrieve, and delete data based on API requests.

### Security Considerations

- User input is sanitized to prevent SQL injection and XSS attacks.





