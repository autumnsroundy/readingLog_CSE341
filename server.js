const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const session = require('express-session'); // NEW ADDITION
const passport = require('passport'); //  NEW ADDITION
require('dotenv').config();
require('./passportConfig'); // NEW ADDITION (created this file below)

// === Import routes ===
const bookRoutes = require('./routes/book.js');
const authRoutes = require('./routes/authRoutes'); // NEW ADDITION

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // your Vite frontend origin
  credentials: true,               // allow cookies
}));

// === Session setup (OAuth requirement) === NEW ADDITION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true only if you deploy with HTTPS
    sameSite: 'lax', // if you deploy on separate domains, change to 'none'
  },
}));

// === Passport initialization === NEW ADDITION
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// === Swagger setup FIRST before using it ===
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reading Log API',
      version: '1.0.0',
      description: 'API documentation for your Reading Log project',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to route files with Swagger comments
};

// === Generate swagger spec ===
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// === Write swagger.json file to disk automatically ===
const outputPath = path.join(__dirname, 'swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`📄 Swagger JSON generated at: ${outputPath}`);

// === Serve Swagger UI after swaggerSpec is defined === 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Connect to MongoDB ===
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// === Routes ===
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/books');
  } else {
    res.send(`
      <h2>📚 Welcome to Reading Log API</h2>
      <p><a href="/auth/google">Login with Google</a> to view your books.</p>
    `);
  }
});

app.use('/auth', authRoutes); // OAuth routes NEW ADDITION 
app.get('/whoami', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

app.use('/book', bookRoutes); // book rooutes

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
