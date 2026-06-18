const express = require('express');
const router = express.Router();
const { getAllSubmissions, updateStatus, getStats, verifyStaffLogin } = require('../database');

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await verifyStaffLogin(username, password);

        if (user) {
            return res.json({ success: true, message: 'Login successful', role: user.role });
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /api/admin/all-submissions
router.get('/all-submissions', async (req, res) => {
    try {
        const submissions = await getAllSubmissions();
        res.json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        console.error('Error fetching all submissions:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
    }
});

// GET /api/admin/stats — submission counts per form type
router.get('/stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json({ success: true, ...stats });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// PATCH /api/admin/submissions/:table/:id/status
router.patch('/submissions/:table/:id/status', async (req, res) => {
    try {
        const { table, id } = req.params;
        const { status } = req.body;
        const validTables = ['motor_claims', 'motor_onboarding', 'motor_insurance', 'travel_insurance',
            'domestic_proposal', 'hospital_cashback', 'kyc_individual', 'kyc_corporate'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ success: false, message: 'Invalid table name' });
        }
        if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const updated = await updateStatus(table, id, status);
        if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;
