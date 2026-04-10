import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/database.js';
import { ROLES } from '../utils/roles.js';
import { signJwt, signResetToken, verifyResetToken } from '../middleware/authJwt.js';
import { sendEmail } from '../services/mailer.js';

const PASSWORD_MIN = 8;

const buildEmailShell = ({ bodyHtml }) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <tr>
          <td style="background:#c1121f;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:0.5px;">CuponX</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Tu plataforma de cupones y descuentos</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px;">${bodyHtml}</td>
        </tr>

        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">Este correo fue enviado automáticamente por CuponX. No respondas a este mensaje.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const buildActionEmailHtml = ({ title, intro, actionText, actionUrl, outro }) => {
  const safeTitle = String(title || '').trim();
  const safeIntro = String(intro || '').trim();
  const safeActionText = String(actionText || '').trim();
  const safeActionUrl = String(actionUrl || '').trim();
  const safeOutro = String(outro || '').trim();

  return buildEmailShell({
    bodyHtml: `
      <h2 style="margin:0 0 6px;color:#003049;font-size:20px;">${safeTitle}</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.6;">
        ${safeIntro}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0dede;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <tr style="background:#fff8f8;">
          <td style="padding:18px 20px;">
            <p style="margin:0 0 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Acción requerida</p>
            <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#003049;">${safeActionText}</p>
            <p style="margin:0 0 18px;font-size:13px;color:#666;line-height:1.6;">Haz clic en el botón para continuar con el proceso.</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${safeActionUrl}" style="display:inline-block;background:#c1121f;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.2px;">${safeActionText}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${safeOutro ? `<div style="background:#f0f8ff;border-left:4px solid #003049;border-radius:4px;padding:14px 16px;"><p style="margin:0;font-size:13px;color:#333;line-height:1.6;">${safeOutro}</p></div>` : ''}
    `,
  });
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const assertPassword = (password) => {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    const err = new Error(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`);
    err.status = 400;
    throw err;
  }
};

const queryOne = async (sql, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

const getPublicAppUrl = (req) => {
  const configuredUrl = String(process.env.APP_PUBLIC_URL || '').trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const origin = String(req?.headers?.origin || '').trim();
  if (origin) return origin.replace(/\/$/, '');

  const referer = String(req?.headers?.referer || '').trim();
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return referer.replace(/\/$/, '');
    }
  }

  return 'http://localhost:5173';
};

const findAccountsByEmail = async (email) => {
  const correo = normalizeEmail(email);

  const client = await pool.connect();
  try {
    const results = [];

    const adminsCuponera = await client.query(
      'SELECT id, correo, password_hash, activo, nombres, apellidos FROM administradores_cuponx WHERE correo = $1 LIMIT 1',
      [correo]
    );
    if (adminsCuponera.rows.length) results.push({ role: ROLES.ADMIN_CUPONERA, row: adminsCuponera.rows[0] });

    const empresas = await client.query(
      'SELECT id, correo, password_hash, activo, nombre, codigo, rubro_id, porcentaje_comision FROM empresas WHERE correo = $1 LIMIT 1',
      [correo]
    );
    if (empresas.rows.length) results.push({ role: ROLES.ADMIN_EMPRESA, row: empresas.rows[0] });

    const empleados = await client.query(
      'SELECT id, empresa_id, correo, password_hash, activo, nombres, apellidos FROM administradores_empresas WHERE correo = $1 LIMIT 1',
      [correo]
    );
    if (empleados.rows.length) results.push({ role: ROLES.EMPLEADO, row: empleados.rows[0] });

    const clientes = await client.query(
      'SELECT id, correo, password_hash, activo, verificado, nombres, apellidos, dui, telefono, direccion FROM clientes WHERE correo = $1 LIMIT 1',
      [correo]
    );
    if (clientes.rows.length) results.push({ role: ROLES.CLIENTE, row: clientes.rows[0] });

    return results;
  } finally {
    client.release();
  }
};

const getTableByRole = (role) => {
  switch (role) {
    case ROLES.ADMIN_CUPONERA:
      return { table: 'administradores_cuponx', idCol: 'id', emailCol: 'correo' };
    case ROLES.ADMIN_EMPRESA:
      return { table: 'empresas', idCol: 'id', emailCol: 'correo' };
    case ROLES.EMPLEADO:
      return { table: 'administradores_empresas', idCol: 'id', emailCol: 'correo' };
    case ROLES.CLIENTE:
      return { table: 'clientes', idCol: 'id', emailCol: 'correo' };
    default:
      return null;
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    const accounts = await findAccountsByEmail(email);
    if (!accounts.length) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (accounts.length > 1) {
      return res.status(409).json({
        success: false,
        message: 'El correo está asociado a múltiples cuentas. Define un correo único por tipo de usuario.',
        accounts: accounts.map((a) => a.role),
      });
    }

    const { role, row } = accounts[0];

    if (row.activo === false) {
      return res.status(403).json({ success: false, message: 'Cuenta inactiva' });
    }

    if (role === ROLES.CLIENTE && row.verificado === false) {
      return res.status(403).json({ success: false, message: 'Cuenta no verificada' });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = signJwt({
      uid: row.id,
      role,
      email: row.correo,
      empresaId:
        role === ROLES.EMPLEADO
          ? row.empresa_id
          : role === ROLES.ADMIN_EMPRESA
            ? row.id
            : null,
    });

    // Construir objeto de usuario con todos los datos disponibles
    const userData = {
      id: row.id,
      role,
      email: row.correo,
      empresaId:
        role === ROLES.EMPLEADO
          ? row.empresa_id
          : role === ROLES.ADMIN_EMPRESA
            ? row.id
            : null,
    };

    // Agregar campos específicos según el tipo de usuario
    if (role === ROLES.CLIENTE) {
      userData.nombres = row.nombres;
      userData.apellidos = row.apellidos;
      userData.dui = row.dui;
      userData.telefono = row.telefono;
      userData.direccion = row.direccion;
      userData.verificado = row.verificado;
    } else if (role === ROLES.ADMIN_CUPONERA || role === ROLES.EMPLEADO) {
      userData.nombres = row.nombres;
      userData.apellidos = row.apellidos;
    } else if (role === ROLES.ADMIN_EMPRESA) {
      userData.nombre = row.nombre;
      userData.codigo = row.codigo;
      userData.rubro_id = row.rubro_id;
      userData.porcentaje_comision = row.porcentaje_comision;
    }

    return res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al iniciar sesión' });
  }
};

export const registerCliente = async (req, res) => {
  try {
    const nombres = String(req.body.nombres || '').trim();
    const apellidos = String(req.body.apellidos || '').trim();
    const telefono = String(req.body.telefono || '').trim();
    const correo = normalizeEmail(req.body.correo || req.body.email);
    const direccion = String(req.body.direccion || '').trim();
    const pais = String(req.body.pais || '').trim();
    const dui = String(req.body.dui || '').trim();
    const password = String(req.body.password || '').trim();

    if (!nombres || !apellidos || !telefono || !correo || !direccion || !dui || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    assertPassword(password);

    // Hasheo de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Generación de token de verificación para ser enviado al cliente y pueda verificar su cuenta
    const tokenVerificacion = crypto.randomBytes(32).toString('hex');

    const client = await pool.connect();
    try {
      const exists = await client.query('SELECT id FROM clientes WHERE correo = $1 LIMIT 1', [correo]);
      if (exists.rows.length) {
        return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
      }

      const result = await client.query(
        `INSERT INTO clientes (nombres, apellidos, telefono, correo, password_hash, direccion, pais, dui, verificado, token_verificacion, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, $9, TRUE) RETURNING id`,
        [nombres, apellidos, telefono, correo, passwordHash, direccion, pais, dui, tokenVerificacion]
      );

      const verifyUrl = `${getPublicAppUrl(req)}/verify?token=${tokenVerificacion}`;
      await sendEmail({
        to: correo,
        subject: 'Verifica tu cuenta - CuponX',
        text: `Haz clic en el siguiente enlace para verificar tu cuenta: ${verifyUrl}`,
        html: buildActionEmailHtml({
          title: 'Verificación de cuenta',
          intro: 'Haz clic en el siguiente enlace para verificar tu cuenta:',
          actionText: 'Verificar cuenta',
          actionUrl: verifyUrl,
          outro: 'Si tú no solicitaste esta cuenta, puedes ignorar este correo.',
        }),
      });

      return res.status(201).json({
        success: true,
        message: 'Cliente registrado. Revisa tu correo para verificar la cuenta.',
        clienteId: result.rows[0].id,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al registrar cliente' });
  }
};

export const verifyCliente = async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) return res.status(400).json({ success: false, message: 'Token requerido' });

    const client = await pool.connect();
    try {
      // Buscar cliente por token
      const rows = await client.query(
        'SELECT id, verificado FROM clientes WHERE token_verificacion = $1 LIMIT 1',
        [token]
      );
      
      if (!rows.rows.length) {
        return res.status(400).json({ success: false, message: 'Token inválido o ya utilizado' });
      }

      const cliente = rows.rows[0];

      // Si ya está verificado, informar pero no fallar
      if (cliente.verificado === true) {
        return res.json({ 
          success: true, 
          message: 'Tu cuenta ya estaba verificada. Puedes iniciar sesión.',
          alreadyVerified: true 
        });
      }

      // Verificar cuenta
      await client.query(
        'UPDATE clientes SET verificado = TRUE, token_verificacion = NULL WHERE id = $1',
        [cliente.id]
      );
      
      return res.json({ success: true, message: 'Cuenta verificada correctamente' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en verifyCliente:', error);
    return res.status(500).json({ success: false, message: 'Error al verificar cuenta' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || req.body.correo);
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    const accounts = await findAccountsByEmail(email);

    // Responder siempre OK para no filtrar existencia de cuentas
    if (!accounts.length) {
      return res.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación.' });
    }

    if (accounts.length > 1) {
      return res.status(409).json({
        success: false,
        message: 'El correo está asociado a múltiples cuentas. Define un correo único por tipo de usuario.',
        accounts: accounts.map((a) => a.role),
      });
    }

    const { role, row } = accounts[0];
    const resetToken = signResetToken({ uid: row.id, role, email: row.correo });

    const resetUrl = `${getPublicAppUrl(req)}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: row.correo,
      subject: 'Recuperación de contraseña - CuponX',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña (válido 15 min): ${resetUrl}`,
      html: buildActionEmailHtml({
        title: 'Recuperación de contraseña',
        intro: 'Haz clic en el siguiente enlace para restablecer tu contraseña:',
        actionText: 'Restablecer contraseña',
        actionUrl: resetUrl,
        outro: 'Este enlace expira en 15 minutos. Si tú no lo solicitaste, ignora este correo.',
      }),
    });

    return res.json({
      success: true,
      message: 'Si el correo existe, se enviará un enlace de recuperación.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al solicitar recuperación' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || '').trim();
    const newPassword = String(req.body.newPassword || req.body.password || '').trim();
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token y nueva contraseña son requeridos' });
    }

    assertPassword(newPassword);

    const payload = verifyResetToken(token);
    const role = payload.role;
    const uid = Number(payload.uid);

    const tableInfo = getTableByRole(role);
    if (!tableInfo) return res.status(400).json({ success: false, message: 'Rol inválido' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const client = await pool.connect();
    try {
      const result = await client.query(`UPDATE ${tableInfo.table} SET password_hash = $1 WHERE ${tableInfo.idCol} = $2`, [passwordHash, uid]);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      return res.json({ success: true, message: 'Contraseña actualizada' });
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al restablecer contraseña' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id, role } = req.user || {};
    const currentPassword = String(req.body.currentPassword || '').trim();
    const newPassword = String(req.body.newPassword || '').trim();

    if (!id || !role) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Contraseña actual y nueva son requeridas' });
    }

    assertPassword(newPassword);

    const tableInfo = getTableByRole(role);
    if (!tableInfo) return res.status(400).json({ success: false, message: 'Rol inválido' });

    const row = await queryOne(
      `SELECT ${tableInfo.idCol} AS id, password_hash FROM ${tableInfo.table} WHERE ${tableInfo.idCol} = $1 LIMIT 1`,
      [id]
    );

    if (!row) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(currentPassword, row.password_hash);
    if (!ok) return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const client = await pool.connect();
    try {
      await client.query(`UPDATE ${tableInfo.table} SET password_hash = $1 WHERE ${tableInfo.idCol} = $2`, [passwordHash, id]);
      return res.json({ success: true, message: 'Contraseña actualizada' });
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al cambiar contraseña' });
  }
};

// Endpoint temporal para crear administradores desde Postman
export const registerAdmin = async (req, res) => {
  try {
    const nombres = String(req.body.nombres || '').trim();
    const apellidos = String(req.body.apellidos || '').trim();
    const correo = normalizeEmail(req.body.correo || req.body.email);
    const password = String(req.body.password || '').trim();

    if (!nombres || !apellidos || !correo || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    assertPassword(password);

    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      const exists = await client.query('SELECT id FROM administradores_cuponx WHERE correo = $1 LIMIT 1', [correo]);
      if (exists.rows.length) {
        return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
      }

      const result = await client.query(
        `INSERT INTO administradores_cuponx (nombres, apellidos, correo, password_hash, activo)
         VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
        [nombres, apellidos, correo, passwordHash]
      );

      return res.status(201).json({
        success: true,
        message: 'Administrador creado exitosamente',
        adminId: result.rows[0].id,
        credentials: { email: correo, password }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al crear administrador' });
  }
};