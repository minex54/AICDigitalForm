const express = require('express');
const router = express.Router();
const { saveSubmission, getSubmissions, updateStatus } = require('../database');

// POST /api/motor-onboarding — submit a motor onboarding form
router.post('/', async (req, res) => {
    try {
        const formData = req.body;
        if (!formData || Object.keys(formData).length === 0) {
            return res.status(400).json({ success: false, message: 'No form data provided' });
        }
        const referenceNumber = await saveSubmission('motor_onboarding', 'MO', formData);
        console.log(`✅ Motor Onboarding submitted: ${referenceNumber}`);
        res.status(201).json({ success: true, referenceNumber, message: 'Onboarding form submitted successfully' });
    } catch (err) {
        console.error('Error saving motor onboarding:', err);
        res.status(500).json({ success: false, message: 'Failed to save onboarding data' });
    }
});

// GET /api/motor-onboarding — list all
router.get('/', async (req, res) => {
    try {
        const submissions = await getSubmissions('motor_onboarding');
        res.json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
    }
});

// PATCH /api/motor-onboarding/:id/status — update status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const updated = await updateStatus('motor_onboarding', req.params.id, status);
        if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;
