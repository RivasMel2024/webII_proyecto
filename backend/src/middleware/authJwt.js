import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    const err = new Error('JWT_SECRET no está configurado');
    err.status = 500;
    throw err;
  }

  return 'dev_jwt_secret_change_me';
};

export const verifyJwt = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const role = payload?.role;
    const userId = payload?.uid;

    if (!role || !userId) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    req.user = {
      id: Number(userId),
      role,
      email: payload.email,
      empresaId: payload.empresaId ? Number(payload.empresaId) : null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export const signJwt = ({ uid, role, email, empresaId }) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(
    {
      uid,
      role,
      email,
      ...(empresaId ? { empresaId } : {}),
    },
    getJwtSecret(),
    { expiresIn }
  );
};

const getResetSecret = () => {
  const secret = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    const err = new Error('RESET_TOKEN_SECRET/JWT_SECRET no está configurado');
    err.status = 500;
    throw err;
  }

  return 'dev_reset_secret_change_me';
};

export const signResetToken = ({ uid, role, email }) => {
  return jwt.sign(
    { uid, role, email, purpose: 'reset' },
    getResetSecret(),
    { expiresIn: '15m' }
  );
};

export const verifyResetToken = (token) => {
  const payload = jwt.verify(token, getResetSecret());
  if (payload?.purpose !== 'reset') {
    const err = new Error('Token de reset inválido');
    err.status = 400;
    throw err;
  }
  return payload;
};
