/** Heuristic score for automated moderation flags (no ML). */
export function scoreMessageSuspicion(text: string | null | undefined): {
  score: number;
  flags: string[];
} {
  if (!text) return { score: 0, flags: [] };
  const t = text.trim();
  if (t.length < 6) return { score: 0, flags: [] };

  let score = 0;
  const flags: string[] = [];

  const urls = t.match(/https?:\/\/[^\s<>"']+/gi);
  if (urls) {
    if (urls.length >= 4) {
      flags.push('many_links');
      score += 3;
    } else if (urls.length >= 2) {
      flags.push('multiple_links');
      score += 1;
    }
  }

  const letters = t.replace(/[^A-Za-zА-Яа-яЁё]/g, '');
  if (letters.length > 24) {
    const upper = letters.replace(/[^A-ZА-ЯЁ]/g, '').length;
    const ratio = upper / letters.length;
    if (ratio > 0.72) {
      flags.push('excessive_caps');
      score += 1;
    }
  }

  const spamRes = [
    { re: /earn\s+(money|cash|\$)/i, flag: 'earn_money' },
    { re: /click\s+here|tap\s+here/i, flag: 'clickbait_cta' },
    { re: /free\s+(btc|bitcoin|crypto|eth|usdt)/i, flag: 'crypto_spam' },
    { re: /viagra|cialis|pharmacy\s+online/i, flag: 'pharma_spam' },
    { re: /send\s+(\d+|one)\s*(eth|btc|usdt)/i, flag: 'send_crypto' },
    { re: /double\s+your|guaranteed\s+profit/i, flag: 'investment_scam' },
    { re: /t\.me\/\+[A-Za-z0-9_-]{6,}/i, flag: 'telegram_invite' },
    { re: /bit\.ly\/|tinyurl\.|cutt\.ly\/|goo\.gl\//i, flag: 'url_shortener' },
    { re: /whatsapp\s*\+?\d|telegram\s*@\w{10,}/i, flag: 'contact_spam' },
  ];
  for (const { re, flag } of spamRes) {
    if (re.test(t)) {
      flags.push(flag);
      score += 2;
    }
  }

  if (/(.)\1{14,}/u.test(t)) {
    flags.push('character_flood');
    score += 1;
  }

  let pict = 0;
  for (const ch of t) {
    if (/\p{Extended_Pictographic}/u.test(ch)) pict += 1;
  }
  if (pict > 28) {
    flags.push('emoji_flood');
    score += 1;
  }

  const uniq = [...new Set(flags)];
  return { score, flags: uniq };
}

export const AUTO_REPORT_MIN_SCORE = 3;
