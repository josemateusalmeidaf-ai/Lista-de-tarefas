# TaskMaster - Premium To-Do List System

A modern, functional, and responsive To-Do List system completely built with Node.js, Express, SQLite, and Vanilla JS + CSS. 

## Features

- **Full CRUD operations**: Add, List, Mark as Completed/Pending, and Delete tasks.
- **SQLite Database**: Tasks are saved persistently overriding sessions. The database is automatically created on standard startup.
- **Premium UI**: Uses custom fonts, glassmorphism, subtle micro-animations, and a sleek dark theme to wow users.
- **Dynamic Updates**: Application interacts with backend API to dynamically alter the DOM without relying on complete page reloads.
- **Task Filtering**: View all, pending or completed tasks easily.
- **Task Counter**: Dynamically counts the pending tasks in real time.

## Project Structure

\`\`\`
PROJETO DE ISSAC/
├── database.sqlite       # Auto-generated SQLite database file
├── server.js             # Node.js Express backend & API
├── package.json          # Project dependencies (express, sqlite3, cors)
├── public/               # Frontend assets
│   ├── index.html        # Main application structure
│   ├── style.css         # Modern styling and animations
│   └── script.js         # API integration & UI logic
└── README.md             # Project documentation
\`\`\`

## Database Structure

The \`tasks\` table inside \`database.sqlite\` is structured as follows:
- **id**: INTEGER, Primary Key, Auto-increment
- **task**: TEXT, Not Null (the task content)
- **status**: TEXT, Default 'pending' (can be 'pending' or 'completed')

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- An internet connection for downloading Google Fonts and FontAwesome icons (for UI elements).

### Instructions

1. **Install Dependencies** (if not already installed):
   Navigate to the project directory in your terminal and run:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the Backend Server**:
   From the project directory, run:
   \`\`\`bash
   node server.js
   \`\`\`

   This will start the server on \`http://localhost:3000\`.
   *Note: Upon successful start, the SQLite database (\`database.sqlite\`) is automatically created and initialized along with the \`tasks\` table.*

3. **Access the Application**:
   Open a browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

4. **Enjoy managing your daily goals!**
