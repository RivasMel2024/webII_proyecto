import nodemailer from 'nodemailer';

const hasSmtpConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    console.log('[MAIL:FALLBACK]', { to, subject, text });
    return { ok: true, mode: 'console' };
  }

  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpPass = String(process.env.SMTP_PASS || '')
    .replace(/^"|"$/g, '')
    .replace(/\s+/g, '')
    .trim();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    return { ok: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error('[MAIL:ERROR]', {
      to,
      subject,
      message: error.message,
      code: error.code,
    });
    throw error;
  }
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
