const Company = require('../models/Company.model');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage }).single('logo');

exports.createOrUpdateCompany = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    const { name, address, additionalInfo } = req.body;
    const logo = req.file ? req.file.filename : null;

    try {
      let company = await Company.findOne();
      if (company) {
        // Update existing company
        company.name = name;
        company.address = address;
        company.additionalInfo = additionalInfo;
        if (logo) {
          company.logo = logo;
        }
      } else {
        // Create new company
        company = new Company({ name, address, additionalInfo, logo });
      }

      await company.save();
      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
