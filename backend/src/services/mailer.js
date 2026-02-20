import nodemailer from 'nodemailer';

const hasSmtpConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    // Fallo seguro: si no hay configuración SMTP, logueamos el email en consola
    console.log('[MAIL:FALLBACK]', { to, subject, text });
    return { ok: true, mode: 'console' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return { ok: true, mode: 'smtp', messageId: info.messageId };
};
