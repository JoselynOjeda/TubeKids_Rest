const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/verify/:token', userController.verifyEmail);
router.post('/verify-sms', userController.verifySmsCode);
router.put('/complete-profile', userController.completeGoogleProfile);
router.get("/me", userController.getMe);
router.post('/resend-code', userController.resendCode);





module.exports = router;