const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String },
  authorFirstName: { type: String },
  authorLastName: { type: String },
  genre: { type: String },
  publishedDate: { type: Date },
  pages: { type: Number },
  readStatus: {type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // tie to logged-in user for specific booklist
});

module.exports = mongoose.model('Book', bookSchema);
