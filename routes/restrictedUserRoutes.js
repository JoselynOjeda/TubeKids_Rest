const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const restrictedUserController = require('../controllers/restrictedUserController');

router.post('/', auth, restrictedUserController.addRestrictedUser);
router.put('/:id', auth, restrictedUserController.updateRestrictedUser);
router.delete('/:id', auth, restrictedUserController.deleteRestrictedUser);

module.exports = router;