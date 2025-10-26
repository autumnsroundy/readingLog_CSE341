const express = require('express');
const passport = require('passport');
const router = express.Router();

// Step 1: Start Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Google redirects here
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    successRedirect: '/auth/success',
  })
);
// verify google profile /session
router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      message: 'You are logged in!',
      user: req.user, // this comes from your Passport session
    });
  }
  res.status(401).json({ message: 'Not logged in' });
});

// Auto redirect after login - display of id for book retreival
router.get('/success', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;

    //HTML response
    res.send(`
      <h2>📚 Welcome, ${user.displayName}!</h2>
      <p>Google Login Success!</p>
      <p><strong>User ID:</strong> ${user._id}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <hr>
      <p><a href="/book">📚 View Your Book List</a></p>
      <p><a href="/api-docs" target="_blank">🧭 Open API Docs (Swagger)</a></p>
      <p><a href="/auth/logout">🚪 Logout</a></p>
    `);
  } else {
    res.redirect('/auth/failure');
  }
});

router.get('/failure', (req, res) => {
  res.send('❌ Google login failed.');
});

router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.send('Error logging out.');
    res.send('👋 Logged out successfully.');
  });
});

module.exports = router;
