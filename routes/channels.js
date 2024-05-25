const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

router.get('/', channelController.getAllChannels);
router.post('/', channelController.createChannel);
router.get('/count', channelController.getChannelCount);
router.put('/:id', channelController.updateChannel);
router.delete('/:id', channelController.deleteChannel);

module.exports = router;
