# Flashcard App (Backend)

This is the backend part of a **MERN stack** flashcard application. It provides the API for managing users and flashcards, and implements the **Leitner System** for spaced repetition. The backend is built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

---

## Features

1. **User Authentication**:
   - User registration and login using **JWT (JSON Web Tokens)**.
   - Protected routes for authenticated users.

2. **Flashcard Management**:
   - Create, read, update, and delete flashcards.
   - Flashcards are associated with the logged-in user.

3. **Leitner System**:
   - Flashcards start in **Box 1**.
   - If answered correctly, they move to the next box.
   - If answered incorrectly, they go back to **Box 1**.
   - Higher boxes have longer review intervals.

4. **Spaced Repetition**:
   - Flashcards are fetched based on their **next review date**.
   - Progress tracking for flashcards due for review.

---

## Technologies Used

- **Backend**:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT (JSON Web Tokens) for authentication
  - Bcrypt for password hashing

- **Frontend**:
  - React
  - React Router
  - Axios
  - Tailwind CSS

---

## Setup Instructions

### Prerequisites

1. **Node.js** and **npm** installed on your machine.
2. **MongoDB** installed and running locally or a connection string for a remote MongoDB instance.

### Steps to Run the Backend

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the root of the `backend` folder.
   - Add the following variables:
     ```plaintext
     MONGO_URI=mongodb://localhost:27017/flashcards
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     ```
     Replace `mongodb://localhost:27017/flashcards` with your MongoDB connection string and `your_jwt_secret_key` with a secure secret key.

4. **Start the server**:
   ```bash
   node server.js
   ```

5. **Test the API**:
   - Use tools like **Postman** or **cURL** to test the API endpoints.
   - The server will be running at `http://localhost:5000`.

---

## API Endpoints

### Authentication

- **POST /register**:
  - Register a new user.
  - Request Body:
    ```json
    {
      "username": "user123",
      "password": "password123"
    }
    ```

- **POST /login**:
  - Log in an existing user.
  - Request Body:
    ```json
    {
      "username": "user123",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "token": "jwt_token_here"
    }
    ```

### Flashcards

- **GET /flashcards**:
  - Fetch all flashcards for the logged-in user.
  - Requires authentication (JWT token in headers).

- **POST /flashcards**:
  - Add a new flashcard.
  - Request Body:
    ```json
    {
      "question": "What is React?",
      "answer": "A JavaScript library for building user interfaces."
    }
    ```
  - Requires authentication.

- **PUT /flashcards/:id**:
  - Update a flashcard (e.g., move to the next box).
  - Request Body:
    ```json
    {
      "correct": true
    }
    ```
  - Requires authentication.

- **DELETE /flashcards/:id**:
  - Delete a flashcard.
  - Requires authentication.

---

## Models

1. **User**:
   - `username`: String (unique, required)
   - `password`: String (required)

2. **Flashcard**:
   - `question`: String (required)
   - `answer`: String (required)
   - `box`: Number (default: 1)
   - `nextReviewDate`: Date (default: current date)
   - `user`: ObjectId (reference to the User model)

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

---

## Acknowledgments

- Inspired by the **Leitner System** for spaced repetition.
- Built with **Node.js**, **Express**, and **MongoDB**.

---