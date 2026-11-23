/**
 * HOUSE AI - Secure Initial Administrator Provisioning Script
 * Usage:
 *   node scripts/create-admin.js --name "Admin Name" --email "admin@example.com" --password "SecurePassword123"
 * Or set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD environment variables.
 */
const path = require('path');
const dotenv = require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv'));
const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const User = require(path.join(__dirname, '..', 'backend', 'models', 'User'));

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i] ? args[i].replace(/^--/, '') : '';
    const val = args[i + 1];
    if (key && val) parsed[key] = val;
  }
  return parsed;
};

const run = async () => {
  const cli = parseArgs();
  const name = cli.name || process.env.ADMIN_NAME;
  const email = cli.email || process.env.ADMIN_EMAIL;
  const password = cli.password || process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      'Usage: node scripts/create-admin.js --name "<Full Name>" --email "<Email>" --password "<Password>"'
    );
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/houseprice_ai';
  await mongoose.connect(uri);

  let user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    user.role = 'admin';
    user.name = name.trim();
    user.password = password;
    user.isActive = true;
    await user.save();
    console.log(`[HOUSE AI] Promoted and updated existing account '${user.email}' to role=admin.`);
  } else {
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      isActive: true,
    });
    console.log(`[HOUSE AI] Created new administrator account '${user.email}' (role=admin).`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[HOUSE AI] Administrator provisioning failed:', err.message);
  process.exit(1);
});
