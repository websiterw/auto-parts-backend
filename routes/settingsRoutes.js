const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Public endpoint – no auth needed, used by recharge page
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({
      mtnAccount: settings.mtnAccount || '0792702997',
      mtnName: settings.mtnName || 'ARSENE BAYIRINGIRE',
      airtelAccount: settings.airtelAccount || '0737217328',
      airtelName: settings.airtelName || 'Arsene BAYIRINGIRE'
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;