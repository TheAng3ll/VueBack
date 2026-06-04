import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const registrarUsuario = async ({ username, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO usuarios (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

export const iniciarSesion = async ({ email, password }) => {
  const emailnorm = email?.trim()?.toLowerCase();
  const user = await query(
    'SELECT id, username, email, password_hash FROM usuarios WHERE email = $1',
    [emailnorm]
  );
  if (!user.rows[0]) {
    throw new Error('Usuario o contraseña incorrecta');
  }
  const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash);
  if (!isPasswordValid) {
    throw new Error('Contraseña incorrecta');

  }
  const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } };
};

export const verificarToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

export const obtenerUsuarioInfo = async (id) => {
  if (!id) {
    throw new Error('ID de usuario no válido');
  }

  const user = await query(
    'SELECT id, username, email, biografia, created_at FROM usuarios WHERE id = $1',
    [id],
  );

  if (!user.rows[0]) {
    throw new Error('Usuario no encontrado');
  }

  return user.rows[0];
};

export const actualizarUsuario = async ({ id, username, email, biografia }) => {
  if (!id) {
    throw new Error('ID de usuario no válido');
  }

  const usernameNorm = username?.trim();
  const emailNorm = email?.trim()?.toLowerCase();
  const bioNorm = biografia?.trim() ?? '';

  if (!usernameNorm || !emailNorm) {
    throw new Error('Nombre de usuario y correo son obligatorios');
  }

  try {
    const user = await query(
      `UPDATE usuarios
       SET username = $1, email = $2, biografia = $3
       WHERE id = $4
       RETURNING id, username, email, biografia, created_at`,
      [usernameNorm, emailNorm, bioNorm, id],
    );

    if (!user.rows[0]) {
      throw new Error('Usuario no encontrado');
    }

    return user.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('El correo o nombre de usuario ya está en uso');
    }
    throw err;
  }
};