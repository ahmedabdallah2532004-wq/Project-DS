const express = require('express');
const {
  createNewJob,
  runJobDirectly,
  getAllJobs,
  runPlatformJob,
  getPlatformJobStatus
} = require('../controllers/jobController');

const router = express.Router();
//كل واحد بيروح لـ Controller.
router.post('/create-job', createNewJob);
router.post('/run-job', runJobDirectly);
router.get('/jobs', getAllJobs);
router.post('/jobs/run', runPlatformJob);
router.get('/jobs/status', getPlatformJobStatus);

module.exports = router;
