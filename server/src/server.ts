import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initEmailTransporter } from './services/emailService';
import { User } from './models/User';
import { seedDatabase } from './scripts/seed';

const startServer = async () => {
  try {
    await connectDB();
    await initEmailTransporter();

    // Auto-seed database if empty (ensures admin/resident demo accounts always exist)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ No users detected in database. Auto-seeding realistic demo dataset...');
      await seedDatabase();
    }

    app.listen(env.PORT, () => {
      console.log(`\n=============================================`);
      console.log(`🚀 FIXFLOW Backend Running on Port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Base API: http://localhost:${env.PORT}/api`);
      console.log(`🔑 Admin Login:    admin@example.com / password123`);
      console.log(`🔑 Resident Login: resident@example.com / password123`);
      console.log(`=============================================\n`);
    });
  } catch (error) {
    console.error('Failed to start FixFlow server:', error);
    process.exit(1);
  }
};

startServer();
