# Chat Backend Assessment

A real-time chat backend built with Node.js, Express, TypeScript, Socket.IO, and MySQL (Prisma ORM).

## Features
- User registration and login (JWT authentication, bcrypt password hashing)
- Create, join, and list chat rooms (public/private)
- Real-time messaging with Socket.IO
- Message persistence in MySQL
- User presence (online/offline)
- Rate limiting and security best practices
- Dockerized MySQL for easy setup

## Tech Stack
- Node.js, Express, TypeScript
- Prisma ORM, MySQL
- Socket.IO
- Docker (for database)

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



### 3. Start MySQL with Docker
```bash
docker-compose up -d
```

### 4. Run database migrations
```bash
npx prisma migrate dev --name init
```

### 5. Start the development server
```bash
npm run dev
```

## API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- More endpoints coming soon...

## Scripts
- `npm run dev` — Start server with hot reload
- `npm run build` — Compile TypeScript
- `npm start` — Run compiled server

## License
MIT
