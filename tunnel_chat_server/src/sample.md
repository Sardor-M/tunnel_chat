tunnel-chat/
├── src/
│   ├── config/
│   │   ├── app.ts                  # Express app configuration
│   │   ├── database.ts             # Database configuration (for future use)
│   │   └── websocket.ts            # WebSocket server configuration
│   ├── controllers/
│   │   ├── authController.ts       # Authentication logic
│   │   ├── chatController.ts       # Chat message handling
│   │   ├── roomController.ts       # Room management
│   │   └── fileController.ts       # File transfer handling
│   ├── middleware/
│   │   ├── auth.ts                 # Authentication middleware
│   │   ├── encryption.ts           # Encryption/decryption utilities
│   │   └── validation.ts           # Request validation
│   ├── models/
│   │   ├── user.ts                 # User model
│   │   ├── message.ts              # Message model
│   │   ├── room.ts                 # Room model
│   │   └── file.ts                 # File model
│   ├── routes/
│   │   ├── authRoutes.ts           # Auth routes
│   │   ├── chatRoutes.ts           # Chat routes
│   │   ├── roomRoutes.ts           # Room management routes
│   │   ├── fileRoutes.ts           # File transfer routes
│   │   └── onlineUsers.ts          # Online users routes (existing)
│   ├── services/
│   │   ├── authService.ts          # Auth business logic
│   │   ├── chatService.ts          # Chat business logic
│   │   ├── roomService.ts          # Room business logic
│   │   ├── fileService.ts          # File business logic
│   │   └── encryptionService.ts    # Encryption service
│   ├── types/
│   │   ├── index.ts                # Type definitions
│   │   └── websocket.ts            # WebSocket message types
│   ├── utils/
│   │   ├── encryption.ts           # Encryption utilities
│   │   ├── logger.ts               # Logging utility
│   │   └── validators.ts           # Validation helpers
│   └── index.ts                    # Main application entry point
├── uploads/                        # Directory for file uploads
├── .env                            # Environment variables
├── .gitignore                      # Git ignore file
├── package.json                    # Project dependencies
└── tsconfig.json                   # TypeScript configuration