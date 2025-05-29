# SecurePass - Password Manager

A secure, modern password manager built with Next.js 14, TypeScript, and MongoDB. SecurePass helps users store and manage their passwords safely with end-to-end encryption and a user-friendly interface.

## Features

### Security
- 🔒 End-to-end encryption for all stored passwords
- 🔐 Master password protection
- 🛡️ Secure password viewing with timeout
- 🔑 Password masking and secure display
- 🔒 Protected API endpoints

### User Interface
- 🌓 Dark/Light theme support
- 🎨 Modern glass-effect design
- 📱 Fully responsive layout
- 🔍 Real-time password search
- ⚡ Fast and intuitive navigation

### Password Management
- ➕ Add new passwords
- 👁️ View passwords securely
- 🗑️ Delete passwords
- 🔍 Search passwords
- 🔄 Auto-refresh password list

### User Account
- 👤 User profile management
- 🔐 Secure authentication
- 📅 Last login tracking
- 🚪 Secure logout
- ⚠️ Account deletion with confirmation

## Tech Stack

- **Frontend:**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - React Icons
  - Framer Motion
  - Sonner (Toast notifications)

- **Backend:**
  - Next.js API Routes
  - MongoDB
  - JWT Authentication
  - Bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shamanth74/Lockify-.git
   cd securepass
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
securepass/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard page
│   ├── login/        # Login page
│   ├── register/     # Registration page
│   └── how-its-safe/ # Security information page
├── components/       # Reusable components
├── lib/             # Utility functions
├── models/          # Database models
└── public/          # Static assets
```

## Security Features

- **Password Encryption:**
  - All passwords are encrypted using the master password
  - Passwords are never stored in plain text
  - Decryption only happens client-side

- **Authentication:**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - Protected API routes

- **Data Protection:**
  - Master password verification for sensitive operations
  - Temporary password viewing with auto-masking
  - Secure session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database
- All the open-source libraries used in this project

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/securepass](https://github.com/yourusername/securepass)
