const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Static Files (serve DigitalForms HTML files) ─────────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ── Admin Dashboard ───────────────────────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/motor-claims', require('./routes/motorClaims'));
app.use('/api/motor-onboarding', require('./routes/motorOnboarding'));
app.use('/api/motor-insurance', require('./routes/motorInsurance'));
app.use('/api/travel-insurance', require('./routes/travelInsurance'));
app.use('/api/domestic-proposal', require('./routes/domesticProposal'));
app.use('/api/hospital-cashback', require('./routes/hospitalCashback'));
app.use('/api/kyc-individual', require('./routes/kycIndividual'));
app.use('/api/kyc-corporate', require('./routes/kycCorporate'));
app.use('/api/admin', require('./routes/admin'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'DigitalForms API', version: '1.0.0' });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  Alliance Insurance – DigitalForms Server  ║');
    console.log(`║  Running on port: ${PORT}                      ║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
});
