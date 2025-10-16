const express = require('express');
const router = express.Router();
const Book = require('../models/book.js');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API for managing books in your reading log
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Returns all books
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               authorFirstName:
 *                 type: string
 *               authorLastName:
 *                 type: string
 *               genre:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               pages:
 *                 type: integer
 *               readStatus:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Book added successfully
 */

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book found
 *       404:
 *         description: Book not found
 *   put:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Book updated successfully
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 */

// GET all books from list
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Get one book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - add a new book
router.post('/', async (req, res) => {
  try {
    const { title, authorFirstName, authorLastName, genre, publishedDate, pages, readStatus } = req.body;
    //ensure all fields are provided
    if (!title || !authorFirstName || !authorLastName || !genre || !publishedDate || !pages ) {
      return res.status(400).json({message: 'All fields are required'});
    }
    const newBook = new Book({title, authorFirstName, authorLastName, genre, publishedDate, pages, readStatus});
    const savedBook = await newBook.save();
    //return new book by ID
    res.status(201).json({ 
      id: savedBook._id,
      title: savedBook.title,
      authorFirstName: savedBook.authorFirstName,
      authorLastName: savedBook.authorLastName,
      genre: savedBook.genre,
      publishedDate: savedBook.publishedDate,
      pages: savedBook.pages,
      readStatus: savedBook.readStatus
    });
  } catch (err) {
    res.status(500).json({message: err.message });
  }
});

// PUT - update a book - such as the readStatus (completed or not)
router.put('/:id', async (req, res) => {
  try {
    // Update only the fields provided in req.body
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(updatedBook);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//DELETE a book
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if(!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

module.exports = router;
