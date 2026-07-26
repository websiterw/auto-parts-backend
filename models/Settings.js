const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  telegramLink: { type: String, default: 'https://t.me/your_bot' },
  telegramGroup: { type: String, default: 'https://t.me/your_group' },
  telegramChannel: { type: String, default: 'https://t.me/your_channel' },
  minWithdrawal: { type: Number, default: 3000 },
  withdrawalFee: { type: Number, default: 20 },
  mtnAccount: { type: String, default: '0782789646' },
  mtnName: { type: String, default: 'MARIE RWAMASIRABO' },
  airtelAccount: { type: String, default: '0788123456' },
  airtelName: { type: String, default: 'AIRTEL RECEIVER' },
  updatedAt: { type: Date, default: Date.now }
});

SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);