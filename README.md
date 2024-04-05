# SodaMachine Project

## Description

SodaMachine is a web-based application designed to streamline the process of vending sodas using NFC technology. The project includes a front-end interface where users can input their NFC ID to access their account, view their credit balance, purchase sodas, and more. It features an admin dashboard for managing users and credits. This project utilizes HTML, CSS, JavaScript for the front-end, and Node.js with Express for the back-end. A PostgreSQL database is used for storing user data.

## Features

- NFC ID login system
- Real-time credit balance updates
- Soda purchase functionality
- Admin dashboard for user and credit management
- Responsive design for various devices

## Getting Started

### Prerequisites

Before running the SodaMachine project, ensure you have the following installed:

- Node.js
- npm (Node Package Manager)
- PostgreSQL

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/zorixxe/SODA_PAYMENT_SYSTEM.git
   ```

2. Navigate to the cloned repository:

   ```bash
   cd SODA_PAYMENT_SYSTEM
   ```

3. Install the required npm packages:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and update it with your PostgreSQL database credentials:

   ```env
   DB_USER=your_username
   DB_HOST=localhost
   DB_NAME=sodamachine
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

5. Start the application:

   ```bash
   npm start
   ```

## Usage

After starting the application, visit `http://localhost:3000` in your web browser to interact with the SodaMachine. Use your NFC ID to log in and navigate through the application.

## Contributing

We welcome contributions to the SodaMachine project. If you have suggestions to improve this project, feel free to fork the repo and create a pull request or open an issue with the tag "enhancement". Please follow the "code of conduct" in your interactions with the project.

## License

Distributed under the MIT License. See `LICENSE` for more information.
