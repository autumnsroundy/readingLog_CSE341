const express = require('express');
const router = express.Router();
const Book = require('../models/book.js');
const ensureAuth = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API for managing books in your reading log
 */

/**
 * @swagger
 * /book:
 *   get:
 *     summary: Get all books belonging to the logged-in user
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns all books for the logged-in user
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add a new book for the logged-in user
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
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
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /book/{id}:
 *   get:
 *     summary: Get a single book by ID (only if owned by the logged-in user)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book found
 *       400:
 *         description: Invalid book ID
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Book not found or unauthorized
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a book by ID (only if owned by the logged-in user)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
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
 *       400:
 *         description: Invalid input or book ID
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Book not found or unauthorized
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a book by ID (only if owned by the logged-in user)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       400:
 *         description: Invalid book ID
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Book not found or unauthorized
 *       500:
 *         description: Server error
 */

// === GET all books belonging to logged-in user ===
router.get('/', ensureAuth, async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user._id });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving books', error: err.message });
  }
});

// === GET one book by ID ===
router.get(
  '/:id',
  ensureAuth,
  param('id').isMongoId().withMessage('Invalid book ID format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const book = await Book.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!book)
        return res.status(404).json({ message: 'Book not found or unauthorized' });

      res.status(200).json(book);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving book', error: err.message });
    }
  }
);

// === POST add new book ===
router.post(
  '/',
  ensureAuth,
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('authorFirstName').isString().notEmpty().withMessage('Author first name is required'),
    body('authorLastName').isString().notEmpty().withMessage('Author last name is required'),
    body('genre').isString().notEmpty().withMessage('Genre is required'),
    body('publishedDate').isString().notEmpty().withMessage('Published date is required'),
    body('pages').isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
    body('readStatus').optional().isBoolean().withMessage('Read status must be true or false'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const newBook = new Book({
        ...req.body,
        userId: req.user._id, // securely set from session, not client
      });

      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
    } catch (err) {
      res.status(500).json({ message: 'Error adding book', error: err.message });
    }
  }
);

// === PUT update book ===
router.put(
  '/:id',
  ensureAuth,
  [
    param('id').isMongoId().withMessage('Invalid book ID format'),
    body().custom(value => {
      if (Object.keys(value).length === 0)
        throw new Error('Request body cannot be empty');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const updatedBook = await Book.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedBook)
        return res.status(404).json({ message: 'Book not found or unauthorized' });

      res.status(200).json(updatedBook);
    } catch (err) {
      res.status(500).json({ message: 'Error updating book', error: err.message });
    }
  }
);

// === DELETE book ===
router.delete(
  '/:id',
  ensureAuth,
  param('id').isMongoId().withMessage('Invalid book ID format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const deletedBook = await Book.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!deletedBook)
        return res.status(404).json({ message: 'Book not found or unauthorized' });

      res.status(200).json({ message: 'Book successfully deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting book', error: err.message });
    }
  }
);

module.exports = router;
