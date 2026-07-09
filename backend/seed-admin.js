/**
 * One-time script to create the first Admin account.
 * Admins can't self-register through the API (see auth/dto/register.dto.ts),
 * so run this once after connecting your database:
 *
 *   node seed-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ADMIN_NAME = 'EventX Admin';
const ADMIN_EMAIL = 'admin@eventx.com';
const ADMIN_PASSWORD = 'admin123'; // change this after first login

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const User = mongoose.model('User', userSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    avatar: '',
    phone: '',
  });

  console.log('Admin created:');
  console.log('Email:', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  process.exit(0);
}

seed();
