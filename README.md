<div align="center">
 </div>
&nbsp;
<div align="center">
 <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/>
 <img src="https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=Typescript&logoColor=white"/>
 <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/>
 <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white"/>
 <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>
 <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white"/>
 <img src="https://img.shields.io/badge/WebSockets-010101?style=flat-square&logo=socket.io&logoColor=white"/>
 <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black"/>
</div>

# Tunnel Chat

## 📖 About

**Tunnel Chat** is a secure, end-to-end encrypted messaging application designed for privacy-conscious users. Built as a monorepo with a React frontend and Express backend, the app provides real-time communication via WebSockets, secure authentication, file sharing capabilities, and room-based discussions. With its clean, modern UI and robust security features, Tunnel Chat prioritizes both user experience and data privacy.

## 🚀 Getting Started

### Prerequisites

- pnpm (v8 or higher)
- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Redis (v6 or higher)

### Installation

```bash
# clone the repo
git clone [https://github.com/your-username/tunnel_chat](https://github.com/your-username/tunnel_chat)

# install dependencies
pnpm install
```

🔑 **Set Environment Configuration**:

To function properly, you need to configure environment variables for both the frontend and backend applications:

- Frontend Config:

  - Copy `web/frontend/.env.example` to `web/frontend/.env.dev`
  - Fill in your Firebase credentials and Google OAuth client ID

- Backend Config:

  - Copy `web/server/.env.example` to `web/server/.env`
  - Configure your database connection, Redis settings, JWT secret, and OAuth credentials


🔒 **Key Features**:

- `Real-time Communication`: End-to-end encrypted messaging with WebSocket protocol for instant delivery
- `Room-Based Chat`: Create, join, and manage chat rooms with multiple participants
- `User Authentication`: Secure login and registration system with JWT tokens and OAuth 2.0 (Google) integration
- `File Sharing`: Upload, download, and manage files with metadata support
- `Online User Tracking`: Real-time status updates of connected users
- `Message History`: Retrieve and display previous messages in chat rooms
- `Mobile Responsive`: Fully responsive design that works across devices

🔧 **Technical Stack**:

**Monorepo Architecture**:

- `pnpm Workspaces`: Manages shared packages between frontend and backend
- `Shared Types`: Common type definitions used across the application
- `Standardized Configs`: Shared ESLint and TypeScript configurations

**Frontend**:

- <img src="https://reactjs.org/favicon.ico" width="20" height="20" alt="React" valign="middle"> React 18
- <img src="https://www.typescriptlang.org/favicon-32x32.png" width="20" height="20" alt="TypeScript" valign="middle"> TypeScript
- <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" width="20" height="20" alt="Ant Design" valign="middle"> Ant Design
- <img src="https://vitejs.dev/logo.svg" width="20" height="20" alt="Vite" valign="middle"> Vite
- <img src="https://styled-components.com/logo.png" width="20" height="20" alt="Styled Components" valign="middle"> Styled Components
- <img src="https://user-images.githubusercontent.com/7850794/164965523-3eced4c4-6020-467e-acde-f11b7900ad62.png" width="20" height="20" alt="Framer Motion" valign="middle"> Framer Motion
- <img src="https://oauth.net/images/oauth-logo-square.png" width="20" height="20" alt="OAuth" valign="middle"> React OAuth/Google
- <img src="https://reactrouter.com/favicon.ico" width="20" height="20" alt="React Router" valign="middle"> React Router DOM

**Backend**:

- <img src="https://expressjs.com/images/favicon.png" width="20" height="20" alt="Express" valign="middle"> Express.js
- <img src="https://www.typescriptlang.org/favicon-32x32.png" width="20" height="20" alt="TypeScript" valign="middle"> TypeScript
- <img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="20" height="20" alt="PostgreSQL" valign="middle"> PostgreSQL
- <img src="https://pbs.twimg.com/media/F7V2rLQWUAAgaLh?format=jpg&name=360x360" width="20" height="20" alt="Drizzle" valign="middle"> Drizzle ORM
- <img src="https://redis.io/favicon.png" width="20" height="20" alt="Redis" valign="middle"> Redis
- <img src="https://cdn.worldvectorlogo.com/logos/passport.svg" width="20" height="20" alt="Passport" valign="middle"> Passport & OAuth 2.0
- <img src="https://socket.io/images/favicon.png" width="20" height="20" alt="WebSocket" valign="middle"> WebSockets
- <img src="https://jwt.io/img/favicon/favicon-16x16.png" width="20" height="20" alt="JWT" valign="middle"> JWT: for authentication

📁 **Project Structure**:
```
tunnel_chat/                   
├── web/                      
│   ├── frontend/              
│   │   ├── public/            
│   │   ├── src/               
│   │   │   ├── assets/        
│   │   │   ├── components/    # Atomic Design Components
│   │   │   ├── config/        # Firebase Configs
│   │   │   ├── context/       # React context providers
│   │   │   ├── layout/        # Layout components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   ├── socket/        # WebSocket client
│   │   │   ├── types/         
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── App.tsx        
│   │   │   └── main.tsx       
│   │   ├── .env.example       
│   │   ├── package.json       
│   │   └── vite.config.ts     
│   │
│   └── server/                
│       ├── drizzle/           # Drizzle ORM migrations
│       ├── logs/              
│       ├── src/               
│       │   ├── api/           # API routes by feature
│       │   ├── auth/          # Authentication logic
│       │   ├── config/        # Redis Configs
│       │   ├── controllers/   # Request handlers
│       │   ├── db/            # Database models & configuration
│       │   ├── middleware/    # Express middleware
│       │   ├── services/      # Business logic
│       │   ├── socket/        # WebSocket server
│       │   ├── types/         
│       │   └── app.ts         
│       ├── uploads/           
│       ├── .env.example       
│       ├── drizzle.config.ts  
│       └── package.json       
│
├── packages/                  
│   ├── common/                # Shared types and utilities
│   │   ├── dist/              # Compiled output
│   │   ├── src/               # Source code
│   │   │   ├── types/         # Shared type definitions
│   │   │   └── utils/         # Shared utility functions
│   │   └── package.json       
│   │
│   ├── eslint-config/         # Shared ESLint configs
│   │   ├── .eslintrc.json     # ESLint rules
|   |   └── package.json 
│   │
│   └── typescript-config/     # Shared TS configs
│       ├── base.json          # Base TS configs
│       ├── node.json          # Node-specific configs
│       └── package.json 
│
├── scripts/                   
│   └── banner.js             
│
├── .gitignore                 
├── package.json               # Root package with workspace config
├── pnpm-workspace.yaml        # PNPM workspace definition
└── README.md                  
```
🔐 **Security Features**:

- End-to-End Encryption: Messages are encrypted on the client side
- JWT Authentication: Secure token-based authentication system
- OAuth Integration: Support for Google OAuth 2.0 authentication
- Rate Limiting: Protection against brute force attacks
- Secure File Handling: Controlled file uploads with validation

## API Endpoints

- Base path: `/api`

**Auth**
- `POST /oauth/google` - Authenticate with Google OAuth
- `GET /user/profile` - Get authenticated user profile

**Rooms**
- `GET /rooms` - Get list of available chat rooms
- `POST /rooms` - Create a new chat room
- `POST /rooms/join` - Join an existing room
- `POST /rooms/leave` - Leave a room
- `GET /rooms/:roomId/members` - Get members of a room
- `GET /chat/:roomId/history` - Get message history for a room

**Users**
- `GET /users/online` - Get list of online users

**Files**
- `POST /files/upload` - Upload a file
- `GET /files/:fileId` - Download a file
- `GET /files/:fileId/metadata` - Get file metadata
- `DELETE /files/:fileId` - Delete a file

📚 **Available Scripts**:

```bash
# start dev servers (frontend and server)
pnpm dev

# start frontend only
pnpm dev:frontend

# start server only
pnpm dev:server

# generate db migrations
pnpm db:generate

# apply migrations to db
pnpm db:push

# lint code
pnpm lint

# format code
pnpm format
```

📝 **License**:

This project is licensed under the MIT License - see the LICENSE file for details.
