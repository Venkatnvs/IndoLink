const createError = require('http-errors');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { sendSuccess } = require('../utils/response');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { username, email, password, first_name, last_name, role, phone_number, address } = req.body;
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) throw createError(409, 'User already exists');
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, first_name, last_name, role: role || 'BUYER', phone_number, address, password_hash });
    const tokens = {
      access: signAccessToken({ sub: user._id.toString(), role: user.role }),
      refresh: signRefreshToken({ sub: user._id.toString(), role: user.role }),
    };
    return sendSuccess(res, { user, tokens }, 201);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { username, email, identifier, password } = req.body;
    const loginIdentifier = identifier || username || email;
    if (!loginIdentifier || !password) {
      throw createError(400, 'Username or email and password are required');
    }
    const query = email ? { email } : username ? { username } : { $or: [{ username: loginIdentifier }, { email: loginIdentifier }] };
    const user = await User.findOne(query);
    if (!user) throw createError(400, 'Invalid credentials');
    const ok = await user.comparePassword(password);
    if (!ok) throw createError(400, 'Invalid credentials');
    const tokens = {
      access: signAccessToken({ sub: user._id.toString(), role: user.role }),
      refresh: signRefreshToken({ sub: user._id.toString(), role: user.role }),
    };
    return sendSuccess(res, { user, tokens });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refresh } = req.body;
    if (!refresh) throw createError(400, 'Refresh token required');
    const payload = verifyRefreshToken(refresh);
    const user = await User.findById(payload.sub);
    if (!user) throw createError(401, 'Invalid token');
    const access = signAccessToken({ sub: user._id.toString(), role: user.role });
    return sendSuccess(res, { access });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    // Stateless JWT: client should delete tokens
    return sendSuccess(res, { message: 'Logged out' });
  } catch (err) { next(err); }
}

async function profile(req, res, next) {
  try {
    return sendSuccess(res, req.user);
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.password_hash;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return sendSuccess(res, user);
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout, profile, updateProfile };


