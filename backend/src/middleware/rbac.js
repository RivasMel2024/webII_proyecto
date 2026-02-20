// Middleware de autorizacion, protegge las rutas segun el rol del usuario

// Requiere que el usuario tenga uno de los roles especificados
export const requireRole = (...roles) => {
  const allowed = new Set(roles);
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!allowed.has(role)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    return next();
  };
};

// Requiere que el usuario sea el mismo cliente o tenga uno de los roles especificados
export const requireSelfClienteOrRole = ({ param = 'clienteId', rolesAllowed = [] } = {}) => {
  const allowed = new Set(rolesAllowed);
  return (req, res, next) => {
    const { role, id } = req.user || {};
    if (!role || !id) return res.status(401).json({ success: false, message: 'No autenticado' });

    const targetId = Number(req.params[param]);
    if (!targetId) return res.status(400).json({ success: false, message: 'ID inválido' });

    if (role === 'CLIENTE' && id === targetId) return next();
    if (allowed.has(role)) return next();

    return res.status(403).json({ success: false, message: 'No autorizado' });
  };
};
