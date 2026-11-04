/**
 * CrossCash — Bangla QR / EMVCo Merchant-Presented QR Parser (Frontend)
 *
 * Fast client-side decoding according to Bangladesh Bank Bangla QR profile.
 */

export interface ParsedBanglaQR {
  isValid: boolean;
  isDynamic: boolean;
  merchantName: string;
  merchantCity: string;
  merchantCategoryCode: string | null;
  currency: string;
  amount: number | null;
  countryCode: string;
  provider: string;
  merchantId: string | null;
  error?: string;
}

export function parseEMV(raw: string): Record<string, string> {
  const tags: Record<string, string> = {};
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

  return tags;
}

function inferProvider(identifier: string): string {
  const id = identifier.toLowerCase();
  if (id.includes('bkash') || id.includes('01939')) return 'bKash';
  if (id.includes('nagad') || id.includes('nagad.com.bd')) return 'Nagad';
  if (id.includes('rocket') || id.includes('dbbl')) return 'Rocket';
  if (id.includes('bank') || id.includes('bd.gov')) return 'Bank';
  return 'Merchant';
}

export function parseBanglaQR(rawQR: string): ParsedBanglaQR {
  const tags = parseEMV(rawQR);

  const pfi = tags['00'];
  if (pfi !== '01') {
    return {
      isValid: false,
      isDynamic: false,
      merchantName: '',
      merchantCity: '',
      merchantCategoryCode: null,
      currency: 'BDT',
      amount: null,
      countryCode: 'BD',
      provider: 'Unknown',
      merchantId: null,
      error: 'Not a valid Bangla QR code (mismatched format indicator).',
    };
  }

  const pointOfInitiation = tags['01'];
  const isDynamic = pointOfInitiation === '12';

  // Sub-tags in Tag 26
  let merchantId: string | null = null;
  let provider = 'Merchant';
  if (tags['26']) {
    const subTags = parseEMV(tags['26']);
    merchantId = subTags['01'] || null;
    provider = inferProvider(subTags['00'] || subTags['02'] || '');
  }

  const amountRaw = tags['54'];
  const transactionAmount = amountRaw ? parseFloat(amountRaw) : null;

  return {
    isValid: true,
    isDynamic,
    merchantName: tags['59'] || 'Verified Merchant',
    merchantCity: tags['60'] || 'Dhaka',
    merchantCategoryCode: tags['52'] || null,
    currency: tags['53'] === '050' ? 'BDT' : (tags['53'] || 'BDT'),
    amount: transactionAmount,
    countryCode: tags['58'] || 'BD',
    provider,
    merchantId,
  };
}

export const SAMPLE_BANGLA_QR = {
  dynamic: '00020101021226310016com.banglaQR.www0107FOOD0025204541153030505406850.005802BD5917BDFood Restaurant6010Chittagong6304DE32',
  static: '00020101021126310016com.banglaQR.www0107DEMO0015204541153030505802BD5919CrossCash Demo Shop6005Dhaka63047F27',
};
