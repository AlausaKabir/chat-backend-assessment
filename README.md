# Chat Backend Assessment

A real-time chat backend built with Node.js, Express, TypeScript, Socket.IO, and MySQL (Prisma ORM).

## Features
- ✅ User registration and login (JWT authentication, bcrypt password hashing)
- ✅ Create, join, and list chat rooms (public/private with invite codes)
- ✅ Real-time messaging with Socket.IO
- ✅ Message persistence in MySQL database
- ✅ User presence tracking (online/offline)
- ✅ Rate limiting (max 5 messages per 10 seconds)
- ✅ Typing indicators
- ✅ Security best practices and input validation
- ✅ Dockerized MySQL for easy setup

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcrypt
- **Infrastructure**: Docker (for database)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/AlausaKabir/chat-backend-assessment.git
cd chat-backend-assessment
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the environment example file and configure your settings:
```bash
cp .env.example .env
```

### 4. Start MySQL with Docker
```bash
docker-compose up -d
```

### 5. Run database migrations
```bash
npx prisma migrate dev --name init
```

### 6. Start the development server
```bash
npm run dev
```

The server will be running at `http://localhost:4000`

## Production Build

To build and run the production version:

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com", 
    "password": "securepassword"
  }
  ```

- `POST /api/auth/login` — Login and receive JWT token
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### Rooms
- `GET /api/rooms` — List all public rooms (requires auth)
- `POST /api/rooms` — Create a new room (requires auth)
  ```json
  {
    "name": "My Chat Room",
    "description": "A place to chat",
    "isPrivate": false
  }
  ```
- `POST /api/rooms/join` — Join a room with invite code (requires auth)
  ```json
  {
    "inviteCode": "ABCD123456"
  }
  ```

### Messages  
- `GET /api/messages/:roomId` — Get messages for a room (requires auth)

## Socket.IO Events

### Client → Server Events

#### Authentication
Connect with JWT token as query parameter:
```
ws://localhost:4000?token=your_jwt_token
```

#### Join Room
```javascript
socket.emit('join_room', { roomId: 1 });
```

#### Send Message
```javascript
socket.emit('message', {
  roomId: 1,
  content: "Hello everyone!"
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing', { roomId: 1, isTyping: true });

// Stop typing  
socket.emit('typing', { roomId: 1, isTyping: false });
```

### Server → Client Events

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // data contains: id, content, senderId, roomId, createdAt, sender, room
});
```

#### User Joined
```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data);
  // data contains: userId, username, roomId
});
```

#### Typing Status
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
  // data contains: userId, username, roomId, isTyping
});
```

#### Rate Limit Exceeded
```javascript
socket.on('rate_limit_exceeded', (data) => {
  console.log('Rate limited:', data);
  // data contains: message, resetTime, remaining
});
```

## Rate Limiting

The system implements message rate limiting:
- **Limit**: 5 messages per 10-second window
- **Scope**: Per user across all rooms
- **Response**: Friendly error message with reset time

## Scripts
- `npm run dev` — Start development server with hot reload
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run compiled production server

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="mysql://root:password@localhost:3306/chat_db"
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
BCRYPT_SALT_ROUNDS=12
INVITE_CODE_LENGTH=10
MESSAGE_LIMIT_PER_WINDOW=5
MESSAGE_LIMIT_WINDOW_MS=10000
```

## Testing with Postman

### REST API Testing
1. Register a user: `POST http://localhost:4000/api/auth/register`
2. Login: `POST http://localhost:4000/api/auth/login` 
3. Copy the JWT token from login response
4. Use token in Authorization header: `Bearer your_jwt_token`

### Socket.IO Testing  
1. Use Postman's WebSocket feature
2. Connect to: `ws://localhost:4000/socket.io/?EIO=4&transport=websocket&token=your_jwt_token`
3. Send events in the correct Socket.IO format

## Architecture

The project follows clean architecture principles:

```
src/
├── config/          # Configuration management
├── controllers/     # HTTP request handlers  
├── middlewares/     # Express middlewares
├── models/          # Data models and types
├── repositories/    # Database access layer
├── routes/          # API route definitions
├── services/        # Business logic layer
├── sockets/         # Socket.IO event handlers
└── utils/           # Utility functions
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation and sanitization
- ✅ Rate limiting for message spam prevention
- ✅ CORS configuration
- ✅ Environment variable validation
- ✅ SQL injection protection (Prisma ORM)

## License
MIT
