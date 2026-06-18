const express = require('express');
const router = express.Router();
const { saveSubmission, getSubmissions, updateStatus } = require('../database');

// POST /api/motor-claims — submit a motor claim
router.post('/', async (req, res) => {
    try {
        const formData = req.body;
        if (!formData || Object.keys(formData).length === 0) {
            return res.status(400).json({ success: false, message: 'No form data provided' });
        }
        const claimNumber = await saveSubmission('motor_claims', 'MC', formData);
        console.log(`✅ Motor Claim submitted: ${claimNumber}`);
        res.status(201).json({ success: true, claimNumber, message: 'Claim submitted successfully' });
    } catch (err) {
        console.error('Error saving motor claim:', err);
        res.status(500).json({ success: false, message: 'Failed to save claim' });
    }
});

// GET /api/motor-claims — list all motor claims
router.get('/', async (req, res) => {
    try {
        const submissions = await getSubmissions('motor_claims');
        res.json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch claims' });
    }
});

// PATCH /api/motor-claims/:id/status — update status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const updated = await updateStatus('motor_claims', req.params.id, status);
        if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;
