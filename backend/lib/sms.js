/**
 * CrossCash — SMS & Telecom Gateway Adapter
 *
 * Supports:
 * 1. Bangladeshi SMS Gateways (Greenweb BD, SSL Wireless, Reve, BDWebs)
 * 2. Twilio Global SMS
 * 3. Interactive Development / Presentation Mode (Server logs + Demo toast payload)
 */

const https = require('https');

/**
 * Send an SMS message to a Bangladeshi phone number.
 * @param {string} phone - 11-digit Bangladeshi mobile number (e.g. "01812345678")
 * @param {string} message - Text message content
 * @returns {Promise<{ success: boolean, gateway: string, preview?: string }>}
 */
async function sendSMS(phone, message) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('880') 
    ? `+${cleanPhone}` 
    : `+880${cleanPhone.replace(/^0/, '')}`;

  const greenwebToken = process.env.GREENWEB_SMS_TOKEN;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  // 1. Greenweb BD SMS Gateway
  if (greenwebToken) {
    try {
      const postData = new URLSearchParams({
        token: greenwebToken,
        to: cleanPhone,
        message: message
      }).toString();

      await new Promise((resolve, reject) => {
        const req = https.request('https://api.greenweb.com.bd/api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log(`[SMS GATEWAY - Greenweb] Sent to ${cleanPhone}: "${message}"`);
      return { success: true, gateway: 'greenweb' };
    } catch (err) {
      console.warn(`[SMS Gateway Error] Greenweb failed: ${err.message}`);
    }
  }

  // 2. Twilio Gateway
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const postData = new URLSearchParams({
        To: internationalPhone,
        From: twilioFrom,
        Body: message
      }).toString();

      await new Promise((resolve, reject) => {
        const req = https.request(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log(`[SMS GATEWAY - Twilio] Sent to ${internationalPhone}: "${message}"`);
      return { success: true, gateway: 'twilio' };
    } catch (err) {
      console.warn(`[SMS Gateway Error] Twilio failed: ${err.message}`);
    }
  }

  // 3. Fallback: Interactive Presentation / Simulation Mode
  console.log('---------------------------------------------------------');
  console.log(`[SMS GATEWAY - SIMULATION]`);
  console.log(`To: ${internationalPhone} (${cleanPhone})`);
  console.log(`Content: ${message}`);
  console.log('---------------------------------------------------------');

  return {
    success: true,
    gateway: 'simulation',
    preview: message
  };
}

module.exports = { sendSMS };
