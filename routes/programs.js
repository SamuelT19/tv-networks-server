


const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');

router.get('/', programController.getAllPrograms);
router.get('/count', programController.getProgramCount);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

module.exports = router;