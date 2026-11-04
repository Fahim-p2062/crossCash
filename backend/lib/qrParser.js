/**
 * CrossCash — Bangla QR / EMVCo Merchant-Presented QR Parser
 *
 * Parses EMV TLV (Tag-Length-Value) encoded QR payloads as per:
 *   - EMVCo Merchant-Presented QR Specification v1.1
 *   - Bangladesh Bank Bangla QR National Profile
 *
 * Format: each field is 2-digit tag + 2-digit length + value
 * Example: "000201" → tag=00, len=02, value="01"
 */

/**
 * Parse a raw EMV QR string into a flat key-value map.
 * @param {string} raw - Raw QR text from camera scan.
 * @returns {{ tags: Record<string, string>, raw: string }}
 */
function parseEMV(raw) {
  const tags = {};
  let i = 0;
  const str = raw.trim();

  while (i < str.length) {
    if (i + 4 > str.length) break;
    const tag = str.substring(i, i + 2);
    const len = parseInt(str.substring(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > str.length) break;
    const value = str.substring(i + 4, i + 4 + len);
    tags[tag] = value;
    i += 4 + len;
  }

  return { tags, raw };
}

/**
 * EMV Tag definitions (Bangla QR / EMVCo MP QR)
 */
const EMV_TAGS = {
  '00': 'payloadFormatIndicator',   // Must be "01"
  '01': 'pointOfInitiationMethod',  // "11"=static, "12"=dynamic
  '26': 'merchantAccountInfo',      // Sub-TLV: acquirer/provider info
  '52': 'merchantCategoryCode',     // ISO 18245 MCC
  '53': 'transactionCurrency',      // ISO 4217: "050" = BDT
  '54': 'transactionAmount',        // Absent in static QR
  '58': 'countryCode',              // ISO 3166-1 alpha-2: "BD"
  '59': 'merchantName',
  '60': 'merchantCity',
  '61': 'postalCode',
  '62': 'additionalDataFieldTemplate',
  '63': 'crc',
};

/**
 * Parse merchant account info sub-TLV (tag 26).
 * Sub-tags: "00"=globalUniqueId, "01"=merchantId, "02"=acquirerCode, etc.
 */
function parseMerchantAccountInfo(raw) {
  const { tags } = parseEMV(raw);
  return {
    globalUniqueId: tags['00'] || null,
    merchantId: tags['01'] || null,
    acquirerCode: tags['02'] || null,
    provider: inferProvider(tags['00'] || tags['02'] || ''),
  };
}

/**
 * Infer the payment provider from the global unique ID or acquirer code.
 */
function inferProvider(identifier) {
  const id = identifier.toLowerCase();
  if (id.includes('bkash') || id.includes('01939')) return 'bKash';
  if (id.includes('nagad') || id.includes('nagad.com.bd')) return 'Nagad';
  if (id.includes('rocket') || id.includes('dbbl')) return 'Rocket';
  if (id.includes('bank') || id.includes('bd.gov')) return 'Bank';
  return 'Unknown';
}

/**
 * High-level parse: returns a structured merchant payment object.
 * @param {string} rawQR - Raw QR string.
 * @returns {{
 *   isValid: boolean,
 *   isDynamic: boolean,
 *   merchantName: string | null,
 *   merchantCity: string | null,
 *   merchantCategoryCode: string | null,
 *   transactionCurrency: string,
 *   transactionAmount: number | null,
 *   countryCode: string,
 *   merchantAccountInfo: object | null,
 *   crc: string | null,
 *   raw: string
 * }}
 */
function parseBanglaQR(rawQR) {
  const { tags } = parseEMV(rawQR);

  // Validate payload format indicator
  const pfi = tags['00'];
  if (pfi !== '01') {
    return { isValid: false, error: 'Not a valid EMV QR payload (format indicator mismatch)', raw: rawQR };
  }

  const pointOfInitiation = tags['01'];
  const isDynamic = pointOfInitiation === '12';

  const merchantAccountRaw = tags['26'];
  const merchantAccountInfo = merchantAccountRaw
    ? parseMerchantAccountInfo(merchantAccountRaw)
    : null;

  const amountRaw = tags['54'];
  const transactionAmount = amountRaw ? parseFloat(amountRaw) : null;

  return {
    isValid: true,
    isDynamic,
    merchantName: tags['59'] || null,
    merchantCity: tags['60'] || null,
    merchantCategoryCode: tags['52'] || null,
    transactionCurrency: tags['53'] === '050' ? 'BDT' : (tags['53'] || 'BDT'),
    transactionAmount,
    countryCode: tags['58'] || 'BD',
    merchantAccountInfo,
    crc: tags['63'] || null,
    raw: rawQR,
  };
}

/**
 * Generate a sample static Bangla QR payload (for demo/testing).
 * Based on EMVCo MP QR format with Bangladesh Bank national profile.
 */
function generateSampleQR(options = {}) {
  const {
    merchantName = 'Demo Shop BD',
    merchantCity = 'Dhaka',
    merchantId = 'MERCH001',
    amount = null,
    mcc = '5411',
  } = options;

  const globalId = 'com.banglaQR.www';
  const accountInfoValue = buildTLV('00', globalId) + buildTLV('01', merchantId);
  const accountInfo = buildTLV('26', accountInfoValue);

  let payload = '';
  payload += buildTLV('00', '01');                    // Payload format indicator
  payload += buildTLV('01', amount ? '12' : '11');    // Static/Dynamic
  payload += accountInfo;                             // Merchant account info
  payload += buildTLV('52', mcc);                     // MCC
  payload += buildTLV('53', '050');                   // BDT currency
  if (amount !== null) payload += buildTLV('54', String(amount.toFixed(2)));
  payload += buildTLV('58', 'BD');                    // Country code
  payload += buildTLV('59', merchantName.substring(0, 25));
  payload += buildTLV('60', merchantCity.substring(0, 15));
  payload += '6304';                                  // CRC placeholder (4 chars appended)

  // Simple CRC16-CCITT (0xFFFF initial, 0x1021 poly)
  const crcVal = crc16(payload).toString(16).toUpperCase().padStart(4, '0');
  return payload + crcVal;
}

function buildTLV(tag, value) {
  const len = String(value.length).padStart(2, '0');
  return tag + len + value;
}

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
    }
  }
  return crc & 0xFFFF;
}

module.exports = { parseBanglaQR, generateSampleQR, parseEMV };

