# Inclusive Learning AI Platform - Quick Reference

## 🎯 What is This Platform?

An **AI-powered lesson planning assistant** that helps Thai educators create comprehensive, inclusive lesson plans aligned with national curriculum standards.

---

## 🔑 Key Capabilities

### 1. **Automated Lesson Plan Generation**
- Input: Subject, topic, grade level, student composition, study period
- Output: Complete lesson plan with curriculum standards, objectives, activities, and assessments

### 2. **Inclusive Education Support**
- Automatically adapts lessons for diverse student needs
- Supports: ADHD, Autism, Learning disabilities, General students
- Implements Universal Design for Learning (UDL) principles

### 3. **Curriculum Alignment**
- Links to Thai national standards (มาตรฐาน)
- Generates interim indicators (ตัวชี้วัดระหว่างทาง)
- Ensures educational compliance

### 4. **AI-Enhanced Research**
- Searches web for best teaching practices
- Finds UDL strategies and inclusive methods
- Provides evidence-based recommendations

---

## 🛠️ Tech Stack Summary

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Material-UI |
| **Backend** | Next.js API Routes, MongoDB, Mongoose |
| **AI/ML** | OpenAI GPT-4, LangChain, Pinecone (Vector DB) |
| **Search** | SerpAPI for web research |
| **Documents** | Puppeteer, docxtemplater, pdf-lib |
| **Security** | JWT, bcrypt |

---

## 📊 System Flow

```
1. User Login/Register
   ↓
2. Create/Select Session
   ↓
3. STEP 0: Configure Basics
   - Subject, Topic, Level
   - Student composition
   - Study period
   ↓
4. AI Generates:
   - Curriculum standards
   - Learning objectives
   ↓
5. STEP 1: Detailed Planning
   ↓
6. AI Generates:
   - Learning content
   - Lesson activities (with UDL)
   - Assessment methods
   ↓
7. Review & Provide Feedback
   ↓
8. Download DOCX Document
```

---

## 🗄️ Database Structure

### MongoDB Collections

**users**
- email, password (hashed), firstName, lastName

**sessions**
- userId, sessionName, configStep
- configFields (all user inputs)
- configResponse (AI outputs)
- docxBuffer (final document)
- reflection (post-lesson notes)

### Pinecone Vector Index

**curriculum-standards**
- Embeddings of Thai curriculum standards
- Enables semantic search for relevant standards

---

## 🔐 Security Features

- **Authentication**: JWT tokens (7-day expiry)
- **Password Security**: Bcrypt hashing
- **Authorization**: User-specific session access
- **API Protection**: Token validation on all routes
- **Environment Variables**: Secure key storage

---

## 🌟 Unique Features

### 1. **Multi-Step Generation**
Progressive lesson plan creation across 2 main steps

### 2. **Intelligent Search Agent**
Automated web research for teaching strategies

### 3. **Vector Database Retrieval**
Fast, semantic curriculum standard matching

### 4. **Adaptive Content**
AI adjusts complexity based on grade and student composition

### 5. **Session Management**
Save, resume, and manage multiple lesson plans

---

## 📈 User Journey

| Stage | User Action | System Response |
|-------|-------------|-----------------|
| **Authentication** | Login/Register | JWT token, session selection |
| **Configuration** | Input lesson details | Store in session |
| **Generation** | Submit for AI processing | GPT-4 generates content |
| **Review** | Evaluate AI output | Display formatted results |
| **Refinement** | Modify and regenerate | Updated AI output |
| **Export** | Approve final version | DOCX document creation |
| **Download** | Save to computer | Editable Word file |

---

## 🚀 Deployment

**Recommended Stack:**
- **Frontend/API**: Vercel (auto-scaling)
- **Database**: MongoDB Atlas (AWS Singapore)
- **Vector DB**: Pinecone (managed service)
- **Monitoring**: Vercel Analytics

**Environment Requirements:**
- Node.js 20+
- MongoDB 6.13+
- OpenAI API key
- Pinecone account
- SerpAPI key (optional, for web search)

---

## 📞 Quick Start

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add: MONGODB_URI, OPENAI_API_KEY, PINECONE_API_KEY, JWT_SECRET

# Run development server
npm run dev

# Access at http://localhost:3005
```

---

## 🎓 Target Users

- **Primary**: K-12 teachers in Thailand
- **Secondary**: Special education teachers, curriculum developers
- **Beneficiaries**: Students with diverse learning needs

---

## 📚 AI Model Usage

### Curriculum & Objectives (Step 0)
- **Model**: GPT-4
- **Task**: Generate standards-aligned curriculum and objectives
- **Input**: Subject, topic, level + retrieved curriculum standards
- **Output**: Structured JSON with Thai text

### Content & Activities (Step 1)
- **Model**: GPT-4 + Web Search
- **Task**: Create detailed lesson plan with UDL strategies
- **Input**: All Step 0 data + web research results
- **Output**: Nested JSON with activities, timing, adaptations

---

## 🔄 Data Flow

```
User Input 
  → Next.js API Route
    → Authentication Middleware
      → LangChain Pipeline
        → Pinecone Retrieval (curriculum standards)
        → Search Agent (web research)
        → GPT-4 Generation
          → JSON Response
            → Validation
              → MongoDB Storage
                → User Display
```

For final document:
```
Session Data
  → Document Generator (docxtemplater)
    → DOCX Buffer
      → MongoDB Storage
        → Download to User
```

---

## 🎯 Success Metrics

- **Sessions Created**: Total lesson plans generated
- **User Retention**: % returning within 30 days
- **Download Rate**: % of sessions resulting in downloads
- **Response Time**: < 30s for full generation
- **User Satisfaction**: Average rating per section

---

## 📋 File Structure

```
inclusive-learning-ai/
├── src/
│   ├── app/              # Next.js pages & API routes
│   │   ├── api/          # Backend endpoints
│   │   ├── page.tsx      # Landing page
│   │   ├── session/      # Main app page
│   │   └── admin-dashboard/
│   ├── components/       # React components
│   ├── lib/              # AI pipeline & utilities
│   │   ├── searchAgent.ts
│   │   ├── optimizedPipeline.ts
│   │   └── promptTemplates.ts
│   ├── models/           # Database models
│   └── utils/            # Helper functions
├── public/               # Static assets
├── package.json
└── .env                  # Environment variables
```

---

## 🛡️ Best Practices

### For Users
1. Start with clear, specific lesson topics
2. Accurately represent student composition
3. Review and refine AI outputs
4. Download and edit in Word for final touches
5. Provide feedback for continuous improvement

### For Developers
1. Never expose API keys client-side
2. Validate all user inputs
3. Handle AI errors gracefully
4. Monitor token usage
5. Implement rate limiting for production

---

## 🌐 Platform Access

- **Development**: http://localhost:3005
- **Production**: [To be deployed on custom domain]

---

## 📖 Documentation

- **Full Proposal**: See `PLATFORM_PROPOSAL.md`
- **API Documentation**: (To be created)
- **User Guide**: (To be created)

---

**Developed by Prof. Dr. Jaitip Na Songkhla & Thitanat Na Songkhla**  
**Chulalongkorn University, Faculty of Education**

*Version: 1.0 | Last Updated: January 2025*
