const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import routes
const bookRoutes = require('./routes/book.js');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Swagger setup FIRST before using it
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

// Generate swagger spec
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write swagger.json file to disk automatically
const outputPath = path.join(__dirname, 'swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`📄 Swagger JSON generated at: ${outputPath}`);

// Serve Swagger UI after swaggerSpec is defined
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('📚 Reading Log API is running!');
});

// Use book routes
app.use('/books', bookRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
