# TaskWallet

TaskWallet is a comprehensive React Native (Expo) mobile application with a Node.js backend designed to help you manage your tasks and track your personal finances (incomes and expenses) seamlessly.

## 🚀 Features

- **Task Management**: Create, update, and manage your daily tasks.
- **Finance Tracking**: Easily track your daily expenses and incomes.
- **Secure Authentication**: User authentication using JWT and secure password hashing.
- **AI Integration**: Powered by OpenAI for smart features.
- **Modern UI**: Built with React Native and styled using NativeWind (TailwindCSS) for a beautiful, responsive user interface.

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (TailwindCSS)
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage
- **Network Requests**: Axios

### Backend (API)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MySQL (via `mysql2`)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Email Services**: Nodemailer
- **AI Integration**: OpenAI API

## 📂 Project Structure

```text
task-wallet-mobile-app/
├── frontend/      # React Native Expo App
│   ├── src/       # Source code (components, screens, navigation)
│   ├── assets/    # Images, icons, and fonts
│   ├── app.json   # Expo configuration
│   └── package.json
└── backend/       # Node.js Express API
    ├── controllers/
    ├── routes/
    ├── middlewares/
    ├── database/
    ├── utils/
    ├── index.js   # Server entry point
    └── package.json
```

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [MySQL](https://www.mysql.com/) installed and running
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (optional, can use `npx expo`)

### 1. Clone the Repository
```bash
git clone https://github.com/Sami-Sial/task-wallet-mobile-app.git
cd task-wallet-mobile-app
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your environment variables (e.g., Database credentials, JWT Secret, OpenAI API Key). Example:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=taskwallet
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the backend server:
   ```bash
   node index.js
   ```
   *(Server runs on `http://localhost:5000` by default)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder (if you use one to point to the backend API).
4. Start the Expo app:
   ```bash
   npm start
   ```
   *(You can press `a` to run on Android emulator, `i` for iOS simulator, or scan the QR code with the Expo Go app on your physical device)*

## 📄 License
This project is licensed under the ISC License.
