<div align="center">
  <!-- <img src="src/assets/logo.png" alt="tunnel_chat_logo" height="300" width="auto" /> -->
</div>
&nbsp;
<div align="center"> 
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/> 
  <img src="https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=Typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/WebSockets-010101?style=flat-square&logo=socket.io&logoColor=white"/>
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white"/>
  <img src="https://img.shields.io/badge/Styled_Components-DB7093?style=flat-square&logo=styled-components&logoColor=white"/>
</div>

# Tunnel Chat

## 📖 Description

Tunnel Chat is a secure, end-to-end encrypted messaging application designed for privacy-conscious users. The app provides real-time communication with WebSocket protocol, secure authentication, and peer-to-peer encrypted file sharing capabilities. With its clean, modern UI and robust security features, Tunnel Chat prioritizes both user experience and data privacy.

## 🚀 Getting Started

### Prerequisites

- npm (v8 or higher)
- Node.js (v18 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tunnel_chat

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application in Vite's dev server.

## 🔒 Key Features

- **Real-time Communication**: End-to-end encrypted messaging with WebSocket protocol for instant delivery
- **User Authentication**: Secure login and registration system with JWT token-based authentication
- **File Sharing**: Peer-to-peer encrypted file sharing system for securely transferring documents
- **Tunnel Visualization**: Interactive visualization of secure connection tunnels between users
- **User Discovery**: Find and connect with online users through an intuitive interface
- **Mobile Responsive**: Fully responsive design that works across devices

## 🔧 Technical Stack

### Frontend Architecture:

- **Component-Based Design**: Organized using a modular approach for maintainability and scalability
- **Animation-Rich UI**: Cyberpunk-inspired interface with subtle animations for enhanced user experience
- **Responsive Layout**: Adaptive design for all screen sizes

### Frontend Core:

- <img src="https://reactjs.org/favicon.ico" width="20" height="20" alt="React" valign="middle"> **React 18**
- <img src="https://www.typescriptlang.org/favicon-32x32.png" width="20" height="20" alt="TypeScript" valign="middle"> **TypeScript**
- <img src="https://vitejs.dev/logo.svg" width="20" height="20" alt="Vite" valign="middle"> **Vite**
- <img src="https://styled-components.com/logo.png" width="20" height="20" alt="Styled Components" valign="middle"> **Styled Components**
- <img src="https://user-images.githubusercontent.com/7850794/164965523-3eced4c4-6020-467e-acde-f11b7900ad62.png" width="20" height="20" alt="Framer Motion" valign="middle"> **Framer Motion**

### WebSocket Integration:

- **Custom WebSocket Service**: Handles real-time communication between users
- **Connection Management**: Smart reconnection and state synchronization
- **Packet Encryption**: End-to-end encryption for all transmitted data

### Animations and Visualization:

- **Canvas-Based Rendering**: Custom animations for tunnel visualization
- **Keyframe Animations**: Subtle UI motion effects using styled-components
- **Interactive Elements**: Responsive user interactions with animated feedback

## 📁 Project Structure

```
tunnel_chat/
├── node_modules/
├── public/
├── src/                   # Application source code
│   ├── assets/            # Static assets and images
│   ├── components/        # Reusable components
│   │   ├── Atoms/         # Base UI components
│   │   │   └── Button/    # Button components
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Application pages
│   │   ├── Home/          # Landing page
│   │   │   ├── LandingHome.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   └── ...
│   │   ├── Rooms/         # Chat rooms interface
│   │   └── ...
│   ├── router/            # Routing configuration
│   ├── socket/            # WebSocket services
│   │   └── websocket.ts
│   └── App.tsx            # Main application component
└── vite.config.ts         # Vite configuration
```

## 🔐 Security Features

- **End-to-End Encryption**: All messages are encrypted on the client side
- **Secure Authentication**: JWT-based authentication system
- **No Message Storage**: Messages are not stored on servers
- **P2P File Transfer**: Direct encrypted file transfers between users
- **Connection Tunnels**: Secure communication channels visualized in the UI

## 🎨 UI/UX Design

- **Cyberpunk Theme**: Dark mode with neon blue accents
- **Interactive Elements**: Animated buttons and interactive visualizations
- **Responsive Layout**: Mobile-first approach ensuring usability on all devices
- **User Presence**: Visual indicators for online users
- **Connection Visualization**: Dynamic visualization of secure tunnels between users

## 🔄 Build & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 📚 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Lint code with ESLint
npm run format      # Format code with Prettier
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/private-rooms`)
3. Commit your changes (`git commit -m 'feat: added private room functionality'`)
4. Push to the branch (`git push -u origin feature/private-rooms`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Inspired by cyberpunk aesthetics and privacy-focused communication tools
- Built with React, TypeScript, and WebSockets to create a modern, secure chat experience
- Special thanks to all contributors who helped shape this project
