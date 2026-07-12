require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assetflow';
    await mongoose.connect(MONGO_URI);
    
    const adminEmail = 'admin@assetflow.com';
    let admin = await User.findOne({ email: adminEmail });
    
    const passwordHash = await bcrypt.hash('Admin123!', 12);

    if (!admin) {
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        role: 'Admin',
        passwordHash
      });
      await admin.save({ validateBeforeSave: false });
      console.log('✅ Admin user created: admin@assetflow.com / Admin123!');
    } else {
      admin.role = 'Admin';
      admin.passwordHash = passwordHash;
      await admin.save({ validateBeforeSave: false });
      console.log('✅ Admin user updated/exists: admin@assetflow.com / Admin123!');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedAdmin();
