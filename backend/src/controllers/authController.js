import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/database.js';
import { ROLES } from '../utils/roles.js';
import { signJwt, signResetToken, verifyResetToken } from '../middleware/authJwt.js';
import { sendEmail } from '../services/mailer.js';

const PASSWORD_MIN = 8;

const buildActionEmailHtml = ({ title, intro, actionText, actionUrl, outro }) => {
  const safeTitle = String(title || '').trim();
  const safeIntro = String(intro || '').trim();
  const safeActionText = String(actionText || '').trim();
  const safeActionUrl = String(actionUrl || '').trim();
  const safeOutro = String(outro || '').trim();

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #111;">
      ${safeTitle ? `<h2 style="margin: 0 0 12px;">${safeTitle}</h2>` : ''}
      ${safeIntro ? `<p style="margin: 0 0 16px;">${safeIntro}</p>` : ''}
      <p style="margin: 0 0 16px;">
        <a href="${safeActionUrl}" style="color: #0b57d0; text-decoration: underline;">${safeActionText}</a>
      </p>
      ${safeOutro ? `<p style="margin: 0; color: #444;">${safeOutro}</p>` : ''}
    </div>
  `;
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
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows?.[0] || null;
  } finally {
    connection.release();
  }
};

const findAccountsByEmail = async (email) => {
  const correo = normalizeEmail(email);

  const connection = await pool.getConnection();
  try {
    const results = [];

    const [adminsCuponera] = await connection.query(
      'SELECT id, correo, password_hash, activo, nombres, apellidos FROM administradores_cuponx WHERE correo = ? LIMIT 1',
      [correo]
    );
    if (adminsCuponera.length) results.push({ role: ROLES.ADMIN_CUPONERA, row: adminsCuponera[0] });

    const [empresas] = await connection.query(
      'SELECT id, correo, password_hash, activo, nombre, codigo, rubro_id, porcentaje_comision FROM empresas WHERE correo = ? LIMIT 1',
      [correo]
    );
    if (empresas.length) results.push({ role: ROLES.ADMIN_EMPRESA, row: empresas[0] });

    const [empleados] = await connection.query(
      'SELECT id, empresa_id, correo, password_hash, activo, nombres, apellidos FROM administradores_empresas WHERE correo = ? LIMIT 1',
      [correo]
    );
    if (empleados.length) results.push({ role: ROLES.EMPLEADO, row: empleados[0] });

    const [clientes] = await connection.query(
      'SELECT id, correo, password_hash, activo, verificado, nombres, apellidos, dui FROM clientes WHERE correo = ? LIMIT 1',
      [correo]
    );
    if (clientes.length) results.push({ role: ROLES.CLIENTE, row: clientes[0] });

    return results;
  } finally {
    connection.release();
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

    if (row.activo === 0) {
      return res.status(403).json({ success: false, message: 'Cuenta inactiva' });
    }

    if (role === ROLES.CLIENTE && row.verificado === 0) {
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

    return res.json({
      success: true,
      token,
      user: {
        id: row.id,
        role,
        email: row.correo,
        empresaId:
          role === ROLES.EMPLEADO
            ? row.empresa_id
            : role === ROLES.ADMIN_EMPRESA
              ? row.id
              : null,
      },
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

    const connection = await pool.getConnection();
    try {
      const [exists] = await connection.query('SELECT id FROM clientes WHERE correo = ? LIMIT 1', [correo]);
      if (exists.length) {
        return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
      }

      const [result] = await connection.query(
        `INSERT INTO clientes (nombres, apellidos, telefono, correo, password_hash, direccion, dui, verificado, token_verificacion, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 1)`,
        [nombres, apellidos, telefono, correo, passwordHash, direccion, dui, tokenVerificacion]
      );

      const verifyUrl = `${process.env.APP_PUBLIC_URL || 'http://localhost:5173'}/verify?token=${tokenVerificacion}`;
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
        clienteId: result.insertId,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al registrar cliente' });
  }
};

export const verifyCliente = async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) return res.status(400).json({ success: false, message: 'Token requerido' });

    const connection = await pool.getConnection();
    try {
      // Buscar cliente por token
      const [rows] = await connection.query(
        'SELECT id, verificado FROM clientes WHERE token_verificacion = ? LIMIT 1',
        [token]
      );
      
      if (!rows.length) {
        return res.status(400).json({ success: false, message: 'Token inválido o ya utilizado' });
      }

      const cliente = rows[0];

      // Si ya está verificado, informar pero no fallar
      if (cliente.verificado === 1) {
        return res.json({ 
          success: true, 
          message: 'Tu cuenta ya estaba verificada. Puedes iniciar sesión.',
          alreadyVerified: true 
        });
      }

      // Verificar cuenta
      await connection.query(
        'UPDATE clientes SET verificado = 1, token_verificacion = NULL WHERE id = ?',
        [cliente.id]
      );
      
      return res.json({ success: true, message: 'Cuenta verificada correctamente' });
    } finally {
      connection.release();
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

    const resetUrl = `${process.env.APP_PUBLIC_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
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

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(`UPDATE ${tableInfo.table} SET password_hash = ? WHERE ${tableInfo.idCol} = ?`, [passwordHash, uid]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      return res.json({ success: true, message: 'Contraseña actualizada' });
    } finally {
      connection.release();
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
      `SELECT ${tableInfo.idCol} AS id, password_hash FROM ${tableInfo.table} WHERE ${tableInfo.idCol} = ? LIMIT 1`,
      [id]
    );

    if (!row) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(currentPassword, row.password_hash);
    if (!ok) return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const connection = await pool.getConnection();
    try {
      await connection.query(`UPDATE ${tableInfo.table} SET password_hash = ? WHERE ${tableInfo.idCol} = ?`, [passwordHash, id]);
      return res.json({ success: true, message: 'Contraseña actualizada' });
    } finally {
      connection.release();
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

    const connection = await pool.getConnection();
    try {
      const [exists] = await connection.query('SELECT id FROM administradores_cuponx WHERE correo = ? LIMIT 1', [correo]);
      if (exists.length) {
        return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
      }

      const [result] = await connection.query(
        `INSERT INTO administradores_cuponx (nombres, apellidos, correo, password_hash, activo)
         VALUES (?, ?, ?, ?, 1)`,
        [nombres, apellidos, correo, passwordHash]
      );

      // Asegurar que se confirme la transacción
      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'Administrador creado exitosamente',
        adminId: result.insertId,
        credentials: { email: correo, password }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error al crear administrador' });
  }
};
