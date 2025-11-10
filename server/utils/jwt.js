import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY = '1h';

export function signJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: DEFAULT_EXPIRY, ...options });
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
  try {
    const decoded = jwt.verify(token, secret);
    // Add id property if it doesn't exist, for consistent API
    if (!decoded.id) {
      decoded.id = decoded.sub || decoded.googleId || decoded._id;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false // set true behind HTTPS in prod
  });
}

export function clearAuthCookie(res) {
  res.clearCookie('auth_token');
}