const router = require('express').Router();
const authController = require('../controllers/auth.controllers');
const auth = require('../middlewares/auth.middleware');

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', auth, authController.changePassword);

router.get('/me', auth, authController.getMe);

module.exports = router;
