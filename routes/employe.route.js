const express = require('express');
const router = express.Router();
const {
  createEmploye,
  modifyEmploye,
  deleteEmploye,
  getEmployeById,
  getAllEmployes, 
  generateEmployeeReport
} = require('../controllers/employe.controller');
const upload = require('../middlewares/upload'); // Import upload middleware

router.get('/', getAllEmployes);  // GET /api/employes
router.get('/:id', getEmployeById);  // GET /api/employes/:id
router.post('/', upload.single('picture'), createEmploye);  // POST /api/employes
router.put('/:id', upload.single('picture'), modifyEmploye);  // PUT /api/employes/:id
router.delete('/:id', deleteEmploye);  // DELETE /api/employes/:id
router.get('/:id/generate-report', generateEmployeeReport);

module.exports = router;
