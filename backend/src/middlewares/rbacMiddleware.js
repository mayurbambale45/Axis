module.exports = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ message: "Access Denied: No role assigned." });
    }

    if (!requiredRoles.includes(req.userRole)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission for this route." });
    }

    next();
  };
};
