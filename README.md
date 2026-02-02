# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally in VS Code

To run this project on your local desktop using Visual Studio Code, follow these steps:

1.  **Prerequisites:**
    *   Make sure you have [Node.js](https://nodejs.org/) (version 20 or later) installed.
    *   You'll need a code editor like [Visual Studio Code](https://code.visualstudio.com/).

2.  **Get the Code:**
    *   Clone your project's Git repository to your local machine.

3.  **Install Dependencies:**
    *   Open the project folder in VS Code.
    *   Open a new terminal (`View` > `Terminal`).
    *   Run the following command to install all the necessary packages:
        ```bash
        npm install
        ```

4.  **Set Up Environment Variables:**
    *   The project uses AI features that require an API key for Google's Gemini models.
    *   Create a file named `.env` in the root of your project if it doesn't exist.
    *   Add the following line to your `.env` file, replacing `"YOUR_API_KEY_HERE"` with your actual key. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
        ```
        GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```

5.  **Run the Development Servers:**
    *   This project requires two separate processes to run simultaneously in two different terminals.

    *   **Terminal 1: Run the Next.js App**
        This command starts the main web application.
        ```bash
        npm run dev
        ```
        Your application should now be running at [http://localhost:9002](http://localhost:9002).

    *   **Terminal 2: Run the Genkit AI Server**
        This command starts the local server that powers the AI features, like the crowd counter.
        ```bash
        npm run genkit:dev
        ```
        Keep this terminal running alongside the main app. The Genkit development UI will be available at [http://localhost:4000](http://localhost:4000).

That's it! You should now have the full application running on your local machine.
