const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRE } = require("../constants/constants");
const userDAL = require("../dal/userDAL");

const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });

const register = async ({ fullName, email, password, role = "student" }) => {
  const exists = await userDAL.findByEmail(email);
  if (exists)
    throw Object.assign(new Error("Email already registered"), {
      statusCode: 409,
    });

  const hashed = await bcrypt.hash(password, 12);
  const id = await userDAL.createUser({
    full_name: fullName,
    email,
    password: hashed,
    role,
  });

  const user = await userDAL.findById(id);
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await userDAL.findByEmail(email);
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

const getProfile = (userId) => userDAL.findById(userId);

const updateProfile = async (userId, data) => {
  const allowed = {};
  if (data.fullName) allowed.full_name = data.fullName;
  if (data.avatar) allowed.avatar = data.avatar;
  if (data.password) {
    allowed.password = await bcrypt.hash(data.password, 12);
  }
  await userDAL.updateUser(userId, allowed);
  return userDAL.findById(userId);
};

module.exports = { register, login, getProfile, updateProfile };
