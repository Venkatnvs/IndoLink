require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectToDatabase } = require('../config/db');
const User = require('../models/user.model');

async function run() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/indolink';
    await connectToDatabase(MONGO_URI);

    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      user.role = 'ADMIN';
      if (password) {
        user.password_hash = await bcrypt.hash(password, 10);
      }
      await user.save();
      // eslint-disable-next-line no-console
      console.log('Updated existing admin:', user.username);
    } else {
      const password_hash = await bcrypt.hash(password, 10);
      user = await User.create({ username, email, password_hash, role: 'ADMIN', first_name: 'Admin', last_name: 'User' });
      // eslint-disable-next-line no-console
      console.log('Created admin user:', user.username);
    }
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
}

run();


