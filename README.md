# Inclusive Learning AI Platform

> **An AI-powered lesson planning assistant for Thai educators**  
> Developed by Prof. Dr. Jaitip Na Songkhla and Thitanat Na Songkhla  
> Chulalongkorn University, Faculty of Education

![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.13-47a248?style=flat-square&logo=mongodb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai)

---

## 📖 Overview

The **Inclusive Learning AI Platform** leverages advanced artificial intelligence to help Thai K-12 educators create comprehensive, inclusive lesson plans that align with Thailand's national curriculum standards. The platform implements Universal Design for Learning (UDL) principles to ensure every lesson accommodates students with diverse learning needs.

### Key Features

✅ **Automated Lesson Planning** - Generate complete lesson plans in minutes  
✅ **Curriculum Alignment** - Automatically matched to Thai national standards (มาตรฐาน, ตัวชี้วัด)  
✅ **Inclusive Design** - Built-in adaptations for ADHD, autism, and other learning differences  
✅ **AI-Powered Research** - Web search for best teaching practices and UDL strategies  
✅ **Multi-Step Workflow** - Progressive generation across curriculum, objectives, content, and assessment  
✅ **DOCX Export** - Download editable Word documents ready for classroom use

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- **Option 1:** Docker & Docker Compose (recommended)
- **Option 2:** MongoDB instance (local or Atlas)
- OpenAI API key
- Pinecone account (for vector search)
- SerpAPI key (optional, for web search)

### Option 1: Docker Setup (Recommended)

The fastest way to get started. Docker Compose will automatically set up MongoDB and the application.

```bash
# Clone the repository
git clone <repository-url>
cd inclusive-learning-ai

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your API keys:
# - OPENAI_API_KEY (required)
# - PINECONE_API_KEY (required)
# - JWT_SECRET (required)
# - SERPER_API_KEY (optional)
# - MONGO_ROOT_PASSWORD (optional, default: inclusive_admin_2026)

# Start MongoDB with Docker Compose
docker-compose up -d mongodb

# Verify MongoDB is running
docker ps
docker logs inclusive-learning-mongodb

# Install dependencies
npm install

# Run development server
npm run dev
```

The MongoDB container will:
- Run on `localhost:27017`
- Create the `inclusive` database automatically
- Set up all necessary indexes
- Persist data in Docker volumes

**Connection String:** Already configured in `.env.example`
```env
MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin
```

### Option 2: Manual Installation (MongoDB Atlas or Local)

```bash
# Clone the repository
git clone <repository-url>
cd inclusive-learning-ai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys:
# - MONGO_URI (your MongoDB Atlas connection string or local MongoDB)
# - OPENAI_API_KEY
# - PINECONE_API_KEY
# - JWT_SECRET
# - SERPER_API_KEY (optional)

# Run development server
npm run dev
```

### Access the Application

Open [http://localhost:3005](http://localhost:3005) to view the application.

---

## 🐳 Docker Commands

### MongoDB Container Management

```bash
# Start MongoDB container
docker-compose up -d mongodb

# Stop MongoDB container
docker-compose stop mongodb

# View MongoDB logs
docker logs inclusive-learning-mongodb

# Access MongoDB shell
docker exec -it inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin

# Restart MongoDB
docker-compose restart mongodb

# Remove MongoDB container and volumes (⚠️ deletes all data)
docker-compose down -v
```

### Data Management

```bash
# Backup MongoDB data
docker exec inclusive-learning-mongodb mongodump -u admin -p inclusive_admin_2026 --authenticationDatabase admin --out /data/backup
docker cp inclusive-learning-mongodb:/data/backup ./backup

# Restore MongoDB data
docker cp ./backup inclusive-learning-mongodb:/data/backup
docker exec inclusive-learning-mongodb mongorestore -u admin -p inclusive_admin_2026 --authenticationDatabase admin /data/backup

# View collections
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "show collections"
```

### Optional: Run Full Stack in Docker

To run both the app and MongoDB in Docker:

```bash
# Uncomment the 'app' service in docker-compose.yml

# Build and start all services
docker-compose up -d

# View logs for all services
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 📦 Migration from MongoDB Atlas to Docker

If you have existing data in MongoDB Atlas:

### Step 1: Export Data from Atlas

```bash
# Install MongoDB tools (if not already installed)
# macOS:
brew install mongodb/brew/mongodb-database-tools

# Export from Atlas
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/inclusive" --out=./atlas-backup
```

### Step 2: Start Docker MongoDB

```bash
# Start MongoDB container
docker-compose up -d mongodb

# Wait for initialization (check logs)
docker logs -f inclusive-learning-mongodb
```

### Step 3: Import Data to Docker

```bash
# Import data
mongorestore --uri="mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin" ./atlas-backup/inclusive

# Verify import
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "db.users.countDocuments()"
```

### Step 4: Update Environment

```bash
# Update .env.local
MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin

# Restart application
npm run dev
```

---

## 🏗️ Technology Stack

### Frontend
- **Next.js 15.1.7** - React framework with App Router
- **React 19** - UI component library
- **TypeScript** - Type-safe development
- **Material-UI** - Component library
- **Tailwind CSS** - Utility-first styling

### Backend & AI
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - User and session storage
- **Mongoose** - MongoDB ODM
- **LangChain** - AI orchestration
- **OpenAI GPT-4** - Language model
- **Pinecone** - Vector database for curriculum search
- **SerpAPI** - Web search integration

### Document Generation
- **Puppeteer** - PDF generation
- **docxtemplater** - Word document creation
- **pdf-lib** - PDF manipulation

---

## 📚 Documentation

- **[PLATFORM_PROPOSAL.md](./PLATFORM_PROPOSAL.md)** - Comprehensive platform overview, architecture, database schema, and user flow
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference guide with key features and technical summary
- **[docs/](./docs/)** - Additional technical documentation

---

## 🎯 How It Works

### User Journey

1. **Login/Register** - Secure authentication with JWT
2. **Session Management** - Create new or load existing lesson plans
3. **Step 0: Basic Configuration**
   - Input: Subject, topic, grade level, student composition, study period
   - Output: Curriculum standards and learning objectives
4. **Step 1: Detailed Planning**
   - Input: Review and approve Step 0 outputs
   - Output: Learning content, lesson activities (with UDL), and assessment methods
5. **Review & Feedback** - Evaluate AI-generated content and provide ratings
6. **Document Export** - Download formatted DOCX file

### AI Pipeline

```
User Input → Pinecone Vector Search (curriculum standards)
           → Search Agent (web research for UDL strategies)
           → GPT-4 Generation (structured JSON output)
           → Validation & Storage (MongoDB)
           → User Display
```

---

## 📁 Project Structure

```
inclusive-learning-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── chat/           # AI chat endpoints
│   │   │   ├── session/        # Session management
│   │   │   ├── generate/       # Document generation
│   │   │   └── feedback/       # User feedback
│   │   ├── page.tsx            # Landing page
│   │   ├── session/            # Main application page
│   │   └── admin-dashboard/    # Admin panel
│   ├── components/             # React components
│   │   ├── ConfigModal.tsx     # Multi-step configuration modal
│   │   ├── LoginModal.tsx      # Authentication modal
│   │   └── ...
│   ├── lib/                    # Core libraries
│   │   ├── searchAgent.ts      # Web search and research
│   │   ├── optimizedPipeline.ts # Main AI pipeline
│   │   ├── promptTemplates.ts  # GPT-4 prompts
│   │   └── db.ts               # Database connection
│   ├── models/                 # Database models
│   │   ├── user.ts             # User schema
│   │   └── session.ts          # Session schema
│   └── utils/                  # Utility functions
├── public/                     # Static assets
├── docs/                       # Documentation
├── .env.example                # Environment template
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema

### MongoDB Collections

**users**
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  firstName: string,
  lastName: string
}
```

**sessions**
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionName: string,
  configStep: number (0 or 1),
  configFields: {
    subject, lessonTopic, level,
    numStudents, studentType[], studyPeriod
  },
  configResponse: {
    curriculum, objectives, content,
    lessonPlan, evaluation
  },
  docxBuffer: Buffer,
  reflection: { ... }
}
```

### Pinecone Vector Index

**curriculum-standards** - 1536-dimensional embeddings of Thai curriculum standards

---

## 🔐 Security

- **Authentication**: JWT tokens with 7-day expiry
- **Password Hashing**: Bcrypt with salt rounds
- **API Protection**: Token validation on all protected routes
- **Session Isolation**: Users can only access their own sessions
- **Environment Variables**: Secure storage of API keys

---

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🌐 Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables Required

```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX=curriculum-standards
JWT_SECRET=...
SERPER_API_KEY=...
NODE_ENV=production
```

---

## 🤝 Contributing

This project is developed for educational research purposes. For collaboration inquiries, please contact:

- **Prof. Dr. Jaitip Na Songkhla** - jaitip.n@chula.ac.th
- **Thitanat Na Songkhla** - Developer

---

## 📝 License

Copyright © 2025 Chulalongkorn University. All rights reserved.

This platform is developed for educational purposes. Commercial use requires permission.

---

## 🙏 Acknowledgments

- Thai educators for beta testing and feedback
- Chulalongkorn University for research support
- Thailand's Ministry of Education for curriculum standards
- OpenAI, Pinecone, and the open-source community

---

## 📞 Support

For technical issues or questions:
- **Documentation**: See `PLATFORM_PROPOSAL.md` for detailed information
- **Email**: jaitip.n@chula.ac.th

---

**Made with ❤️ for Thai educators and students**

*Empowering inclusive education through AI*
