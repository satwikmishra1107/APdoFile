# APDO-FILE

## Distributed File Storage System Using Discord

APDO-FILE is an innovative file storage solution that leverages Discord as a backend storage service while maintaining file integrity and accessibility through a modern web interface.

### 🚀 Features

- **Unlimited Storage**: Store files of any size by chunking them into smaller pieces
- **Secure File Handling**: Each file chunk is hashed to ensure data integrity
- **Zero Server Storage**: Your files are distributed across Discord servers, not on our infrastructure
- **Easy Retrieval**: Download your files whenever you need them
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components

### 💻 Tech Stack

- **Frontend**: React with Vite, Tailwind CSS, shadcn/ui
- **Authentication**: Firebase for secure user login/signup
- **Backend**: Custom Node.js server for file processing
- **Storage**: Discord API for distributed file storage
- **Deployment**: AWS EC2

### 🛠️ How It Works

1. Upload any file through the intuitive UI
2. Our system breaks the file into manageable chunks
3. Each chunk is uploaded to Discord with a unique hash identifier
4. Only metadata (filename, size, hash) is stored in our database
5. When you need your file, the system retrieves and reassembles all chunks

### 🔒 Privacy & Security

Your files are securely distributed with hash verification to ensure complete data integrity. We store minimal metadata while the actual file content is fragmented across Discord's infrastructure.

### 🌐 Deployment

The entire system is deployed on AWS EC2, ensuring reliability and accessibility.

### 🚀 Getting Started

#### Prerequisites
- Node.js (v16+)
- npm or yarn
- Firebase account
- Discord bot token with proper permissions

#### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/APDO-FILE.git
cd APDO-FILE
```
2. Install dependencies
```bash
npm install
# or
yarn install
```
3. Configure environment variables
```bash
cp .env.example .env
```
Edit the .env file with your Firebase and Discord credentials.

4. Start the development server
```bash
npm run dev
# or
yarn dev
```
5. Build for production
```bash
npm run build
# or
yarn build
```

### 🔧 Configuration

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password method
3. Create a Firestore database
4. Add your Firebase configuration to `firebaseConfig.ts`:

```typescript
export const firebaseConfig = {
 apiKey: "YOUR_API_KEY",
 authDomain: "your-project.firebaseapp.com",
 projectId: "your-project-id",
 storageBucket: "your-project.appspot.com",
 messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
 appId: "YOUR_APP_ID"
};
```

Discord Bot Setup

1. Create a Discord application at Discord Developer Portal
2. Create a bot for your application and copy the token
3. Invite the bot to your server with proper permissions
4. Configure the bot token in your .env file:

```
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
```

### 🛠️ File Processing
The system processes files in the following way:

Files are chunked into smaller pieces (default 8MB per chunk)
Each chunk is assigned a unique hash using SHA-256
Chunks are uploaded to Discord with metadata
Upon retrieval, chunks are downloaded and reassembled based on the stored hashes

### 📁 Project Structure

```
APDO-FILE/
├── server/           # Backend server code
│   ├── app.js        # Main server file
│   ├── chunk.js      # File chunking logic
│   └── retrieve.js   # File retrieval logic
├── src/              # Frontend source code
│   ├── components/   # UI components
│   ├── context/      # React context providers
│   └── lib/          # Utility functions
├── .env              # Environment variables
└── README.md         # Project documentation
```

### 🧩 API Endpoints

`POST /api/upload` - Upload a file
`GET /api/files` - List all user files
`GET /api/download/:fileId` - Download a specific file
`DELETE /api/files/:fileId` - Delete a file

### 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

### 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments

Discord for providing the infrastructure that makes this possible
Firebase for authentication and database services
The shadcn/ui team for their beautiful UI components

### 📊 Performance Considerations

#### File Size Handling
- Small files (<10MB): Uploaded as a single chunk for efficiency
- Medium files (10-100MB): Split into multiple chunks, processed in parallel
- Large files (>100MB): Chunked with progress tracking and resumable uploads

#### Network Optimization
- Implements retry logic for failed chunk uploads
- Uses concurrent uploads for faster processing
- Throttles requests to avoid Discord API rate limits

### 🔐 Security Features

- Client-side encryption option for sensitive files
- Secure hash verification to prevent tampering
- OAuth 2.0 authentication flow with Firebase
- No file data stored on centralized servers

### 🖥️ Deployment Guide

#### AWS EC2 Setup
1. Launch an EC2 instance (t2.micro is sufficient for most use cases)
2. Configure security groups to allow HTTP/HTTPS traffic
3. Install Node.js and npm on the instance

```bash
sudo apt update
sudo apt install nodejs npm
```
4. Clone the repository and install dependencies
```bash
Clone the repository and install dependencies
```

5. Set up environment variables and start the application
```bash
bashCopycp .env.example .env
nano .env  # Edit environment variables
npm run build
npm start
```
6. (Optional) Set up PM2 for process management
```bash
bashCopysudo npm install -g pm2
pm2 start npm --name "apdo-file" -- start
pm2 startup
pm2 save
```
### 📱 Mobile Support
The application is fully responsive and works on:

Desktop browsers (Chrome, Firefox, Safari, Edge)
Mobile browsers (iOS Safari, Android Chrome)
Tablets and other devices

### 🗺️ Roadmap

 Desktop application using Electron
 Mobile app using React Native
 End-to-end encryption
 Multiple storage backend options (beyond Discord)
 File sharing capabilities
 Team/organization accounts

### ⚙️ Advanced Configuration
For advanced users, additional configuration options are available in config.ts:

```typescript
export const config = {
  chunkSize: 8 * 1024 * 1024, // 8MB chunks by default
  maxConcurrentUploads: 3,
  retryAttempts: 5,
  retryDelay: 2000, // ms
  hashAlgorithm: 'SHA-256',
  compressionEnabled: true,
  // Add your custom configuration here
};
```
### 📊 Analytics
Optional anonymous usage statistics can be enabled to help improve the application. No file data is ever collected, only performance metrics and feature usage patterns.

*APDO-FILE: The distributed storage solution for the modern web*
