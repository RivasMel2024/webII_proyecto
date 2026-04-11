const GMAIL_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

const hasGmailOAuthConfig = () => Boolean(
  process.env.GMAIL_CLIENT_ID &&
  process.env.GMAIL_CLIENT_SECRET &&
  process.env.GMAIL_REFRESH_TOKEN
);

const parseMailbox = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return null;

  const match = value.match(/^(.*)<([^>]+)>$/);
  if (!match) return { email: value };

  const name = match[1].trim().replace(/^"|"$/g, '');
  const email = match[2].trim();
  return name ? { name, email } : { email };
};


const resolveGmailFrom = () => {
  return parseMailbox(process.env.GMAIL_FROM || process.env.MAIL_FROM);
};

const normalizeRecipients = (to) => {
  if (!to) return [];

  const rawList = Array.isArray(to) ? to : [to];
  const normalized = [];

  rawList.forEach((entry) => {
    if (!entry) return;
    if (typeof entry === 'string') {
      entry
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
        .forEach((email) => {
          const mailbox = parseMailbox(email);
          if (mailbox?.email) normalized.push(mailbox);
        });
      return;
    }
    if (typeof entry === 'object') {
      const email = String(entry.email || '').trim();
      const name = String(entry.name || '').trim();
      if (email) {
        normalized.push(name ? { email, name } : { email });
      }
      return;
    }
    normalized.push({ email: String(entry).trim() });
  });

  return normalized;
};

const encodeBase64Url = (input) => {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const needsMimeEncoding = (value) => /[^\x00-\x7F]/.test(value);

const encodeMimeWord = (value) => {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
};

const formatDisplayName = (name) => {
  const cleanName = String(name || '').trim().replace(/\r?\n/g, ' ');
  if (!cleanName) return '';
  return needsMimeEncoding(cleanName) ? encodeMimeWord(cleanName) : cleanName.replace(/"/g, '\\"');
};

const formatMailbox = (mailbox) => {
  if (!mailbox) return '';
  const displayName = mailbox.name ? formatDisplayName(mailbox.name) : '';
  return displayName ? `${displayName} <${mailbox.email}>` : mailbox.email;
};

const buildGmailRawMessage = ({ from, to, subject, text, html }) => {
  const safeSubject = String(subject || '').replace(/\r?\n/g, ' ').trim();
  const subjectHeader = needsMimeEncoding(safeSubject) ? encodeMimeWord(safeSubject) : safeSubject;
  const toHeader = to.map(formatMailbox).filter(Boolean).join(', ');
  const headers = [
    `From: ${formatMailbox(from)}`,
    `To: ${toHeader}`,
    `Subject: ${subjectHeader}`,
    'MIME-Version: 1.0',
  ];

  const safeText = text ? String(text) : '';
  const safeHtml = html ? String(html) : '';

  if (safeHtml && safeText) {
    const boundary = `----=_CuponX_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    return [
      ...headers,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      safeText,
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      safeHtml,
      `--${boundary}--`,
      '',
    ].join('\r\n');
  }

  if (safeHtml) {
    headers.push('Content-Type: text/html; charset="UTF-8"');
    headers.push('Content-Transfer-Encoding: 7bit');
    return [...headers, '', safeHtml].join('\r\n');
  }

  headers.push('Content-Type: text/plain; charset="UTF-8"');
  headers.push('Content-Transfer-Encoding: 7bit');
  return [...headers, '', safeText].join('\r\n');
};

const getGmailAccessToken = async () => {
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    client_secret: process.env.GMAIL_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GMAIL_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const responseText = await response.text();
  let responseJson = null;
  if (responseText) {
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = null;
    }
  }

  if (!response.ok) {
    const apiMessage = responseJson?.error_description || responseJson?.error || responseText;
    throw new Error(`Gmail OAuth error (${response.status}): ${apiMessage || response.statusText}`);
  }

  if (!responseJson?.access_token) {
    throw new Error('No se recibió access_token de Gmail OAuth.');
  }

  return responseJson.access_token;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  // Prioridad: Gmail OAuth (API) > Fallback

  if (hasGmailOAuthConfig()) {
    try {
      const from = resolveGmailFrom();
      if (!from?.email) {
        throw new Error('Configura GMAIL_FROM o MAIL_FROM con el correo remitente.');
      }

      const recipients = normalizeRecipients(to);
      if (!recipients.length) {
        throw new Error('Destinatario de correo requerido.');
      }

      const rawMessage = buildGmailRawMessage({
        from,
        to: recipients,
        subject,
        text,
        html,
      });

      const accessToken = await getGmailAccessToken();
      const response = await fetch(GMAIL_SEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodeBase64Url(rawMessage) }),
      });

      const responseText = await response.text();
      let responseJson = null;
      if (responseText) {
        try {
          responseJson = JSON.parse(responseText);
        } catch {
          responseJson = null;
        }
      }

      if (!response.ok) {
        const apiMessage = responseJson?.error?.message || responseJson?.message || responseText;
        throw new Error(`Gmail API error (${response.status}): ${apiMessage || response.statusText}`);
      }

      const messageId = responseJson?.id;
      console.log('[MAIL:GMAIL]', { to, subject, messageId });
      return { ok: true, mode: 'gmail', messageId };
    } catch (error) {
      console.error('[MAIL:GMAIL:ERROR]', {
        to,
        subject,
        message: error.message,
      });
      throw error;
    }
  }

  // Fallback: consola
  console.log('[MAIL:FALLBACK]', { to, subject, text });
  return { ok: true, mode: 'console' };
};

/**
 * Genera el HTML del correo de confirmación de compra del carrito completo.
 * @param {{
 *   clienteNombre: string,
 *   totalPagado: number,
 *   items: Array<{
 *     empresaNombre: string,
 *     ofertaTitulo: string,
 *     ofertaDescripcion: string,
 *     precioPagado: number,
 *     fechaLimite: string,
 *     codigos: string[]
 *   }>
 * }} data
 */
export const buildCompraEmail = (data) => {
  const { clienteNombre, totalPagado, items } = data;

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  let codigoCounter = 0;

  const itemsHtml = items.map((item) => {
    const codigosRows = item.codigos.map((codigo) => {
      codigoCounter += 1;
      return `
        <tr>
          <td style="padding:9px 12px;border-bottom:1px solid #f5eded;color:#666;">#${codigoCounter}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #f5eded;">
            <span style="font-family:monospace;font-size:14px;font-weight:700;color:#c1121f;letter-spacing:1px;">${codigo}</span>
          </td>
          <td style="padding:9px 12px;border-bottom:1px solid #f5eded;color:#555;">$${Number(item.precioPagado).toFixed(2)}</td>
        </tr>`;
    }).join('');

    return `
      <!-- Bloque por oferta -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0dede;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <tr style="background:#fff8f8;">
          <td style="padding:14px 16px;">
            <p style="margin:0 0 2px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">${item.empresaNombre}</p>
            <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#003049;">${item.ofertaTitulo}</p>
            ${item.ofertaDescripcion ? `<p style="margin:0 0 6px;font-size:13px;color:#666;">${item.ofertaDescripcion}</p>` : ''}
            <p style="margin:0;font-size:12px;color:#888;">Vence: ${fmtDate(item.fechaLimite)} &nbsp;·&nbsp; $${Number(item.precioPagado).toFixed(2)} c/u</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="background:#c1121f;">
                  <th style="padding:8px 12px;color:#fff;font-size:11px;text-align:left;font-weight:600;">#</th>
                  <th style="padding:8px 12px;color:#fff;font-size:11px;text-align:left;font-weight:600;">Código</th>
                  <th style="padding:8px 12px;color:#fff;font-size:11px;text-align:left;font-weight:600;">Valor</th>
                </tr>
              </thead>
              <tbody>${codigosRows}</tbody>
            </table>
          </td>
        </tr>
      </table>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#c1121f;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:0.5px;">CuponX</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Tu plataforma de cupones y descuentos</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 6px;color:#003049;font-size:20px;">¡Compra confirmada! 🎉</h2>
            <p style="margin:0 0 24px;color:#666;font-size:14px;">
              Hola <strong>${clienteNombre || 'cliente'}</strong>, tu compra fue procesada exitosamente.
            </p>

            ${itemsHtml}

            <!-- Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#003049;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:rgba(255,255,255,0.8);font-size:14px;">Total pagado</td>
                      <td align="right" style="color:#fff;font-size:20px;font-weight:700;">$${Number(totalPagado).toFixed(2)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Instrucciones -->
            <div style="background:#f0f8ff;border-left:4px solid #003049;border-radius:4px;padding:14px 16px;">
              <p style="margin:0;font-size:13px;color:#333;">
                <strong>¿Cómo usar tus cupones?</strong><br>
                Presenta el código o el QR disponible en <em>Mis Cupones</em> al momento de visitar la tienda.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              Este correo fue enviado automáticamente por CuponX. No respondas a este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const totalCodigos = items.reduce((acc, i) => acc + i.codigos.length, 0);
  const text = [
    `CuponX - Confirmación de compra`,
    ``,
    `Hola ${clienteNombre},`,
    ``,
    `Tu compra fue confirmada. Detalle:`,
    ``,
    ...items.flatMap((item, idx) => [
      `${idx + 1}. ${item.empresaNombre} — ${item.ofertaTitulo}`,
      `   Precio: $${Number(item.precioPagado).toFixed(2)} c/u | Vence: ${fmtDate(item.fechaLimite)}`,
      `   Códigos: ${item.codigos.join(', ')}`,
      ``,
    ]),
    `Total: $${Number(totalPagado).toFixed(2)} (${totalCodigos} cupón${totalCodigos !== 1 ? 'es' : ''})`,
    ``,
    `Gracias por usar CuponX.`,
  ].join('\n');

  return { html, text };
};
