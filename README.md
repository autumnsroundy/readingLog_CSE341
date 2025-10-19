# 📚 Reading Log API

This project is a **Node.js + Express RESTful API** that connects to **MongoDB Atlas** for managing a reading log.  
Users can perform CRUD operations on a collection of books — such as adding, viewing, updating, or deleting books — and track whether each book has been read.

---

## 🚀 Features
- Create, read, update, and delete (CRUD) books
- Uses **Mongoose** for MongoDB schema modeling
- Includes **Swagger UI** for live API documentation
- Connected to **MongoDB Atlas** cloud database
- Supports **CORS** for client-side interaction

---

## ✅ Recent Updates
- Added **input validation** using **express-validator** to ensure all required book fields are correctly formatted before saving.
- Implemented robust **error handling** across all routes to **return** helpful messages and **proper HTTP status codes (400, 404, 500).**
- **Enhanced Swagger documentation to include validation requirements and possible error responses for each route.**
- Configured **Swagger to auto-generate swagger.json on server startup** for easier sharing and version control.
- **Verified PUT and DELETE routes in MongoDB** to ensure correct database updates and deletions.

---

## 🛠️ Tech Stack
- **Node.js** / **Express.js**
- **MongoDB Atlas** + **Mongoose**
- **Swagger UI** (`swagger-ui-express`, `swagger-jsdoc`)
- **Dotenv** for environment variables
- **Nodemon** for development

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/autumnsroundy/readingLog_CSE341.git
cd reading-log-api