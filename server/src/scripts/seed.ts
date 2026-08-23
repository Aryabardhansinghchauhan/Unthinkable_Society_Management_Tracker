import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Complaint } from '../models/Complaint';
import { ComplaintHistory } from '../models/ComplaintHistory';
import { ComplaintAttachment } from '../models/ComplaintAttachment';
import { MaintenanceStaff } from '../models/MaintenanceStaff';
import { Notice } from '../models/Notice';
import { Notification } from '../models/Notification';
import { Settings } from '../models/Settings';
import { Counter } from '../models/Counter';
import {
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  ATTACHMENT_TYPES,
  NOTIFICATION_TYPES,
  USER_ROLES,
} from '../config/constants';

export const seedDatabase = async () => {
  console.log('🌱 Starting FixFlow Database Seeding...');

  // Clear existing collections
  await User.deleteMany({});
  await Complaint.deleteMany({});
  await ComplaintHistory.deleteMany({});
  await ComplaintAttachment.deleteMany({});
  await MaintenanceStaff.deleteMany({});
  await Notice.deleteMany({});
  await Notification.deleteMany({});
  await Settings.deleteMany({});
  await Counter.deleteMany({});

  // Reset Counter for publicIds (matching the 11 seeded demo complaints FF-1001 through FF-1011)
  await Counter.create({ name: 'complaint', value: 1011 });

  // 1. Create Default Settings
  const settings = await Settings.create({
    overdueThresholdHours: 24,
    defaultSlaByPriority: {
      LOW: 48,
      MEDIUM: 24,
      HIGH: 6,
    },
    societyName: 'Greenfield Heights Cooperative Housing Society',
    timezone: 'Asia/Kolkata',
  });

  // 2. Hash default password
  const defaultPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 3. Create Users
  const admin = await User.create({
    name: 'Sanjay Verma (Estate Manager)',
    email: 'admin@example.com',
    phone: '+91 98200 00001',
    passwordHash,
    role: USER_ROLES.ADMIN,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const resident1 = await User.create({
    name: 'Aarav Patel',
    email: 'resident@example.com',
    phone: '+91 98200 11111',
    passwordHash,
    role: USER_ROLES.RESIDENT,
    flatNumber: 'B-204',
    building: 'Tower B',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  });

  const resident2 = await User.create({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98200 22222',
    passwordHash,
    role: USER_ROLES.RESIDENT,
    flatNumber: 'B-304',
    building: 'Tower B',
  });

  const resident3 = await User.create({
    name: 'Rohan Gupta',
    email: 'rohan.gupta@example.com',
    phone: '+91 98200 33333',
    passwordHash,
    role: USER_ROLES.RESIDENT,
    flatNumber: 'B-404',
    building: 'Tower B',
  });

  const resident4 = await User.create({
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '+91 98200 44444',
    passwordHash,
    role: USER_ROLES.RESIDENT,
    flatNumber: 'A-501',
    building: 'Tower A',
  });

  const resident5 = await User.create({
    name: 'Ananya Sen',
    email: 'ananya.sen@example.com',
    phone: '+91 98200 55555',
    passwordHash,
    role: USER_ROLES.RESIDENT,
    flatNumber: 'C-102',
    building: 'Tower C',
  });

  const resident6 = await User.create({
    name: 'Neha Reddy',
    email: 'neha.reddy@example.com',
    phone: '+91 98200 66666',
    passwordHash,
    role: USER_ROLES.RESIDENT,
    flatNumber: 'A-103',
    building: 'Tower A',
  });

  // 4. Create Maintenance Staff
  const staffPlumber = await MaintenanceStaff.create({
    name: 'Rajesh Sharma',
    specialization: 'Plumbing & Drainage',
    phone: '+91 98201 12345',
    active: true,
  });

  const staffElectrician = await MaintenanceStaff.create({
    name: 'Amit Patel',
    specialization: 'Electrical & Power Systems',
    phone: '+91 98202 23456',
    active: true,
  });

  const staffLiftTech = await MaintenanceStaff.create({
    name: 'Suresh Kumar',
    specialization: 'Elevator / Lift Specialist',
    phone: '+91 98203 34567',
    active: true,
  });

  const staffCleaning = await MaintenanceStaff.create({
    name: 'Sunita Devi',
    specialization: 'Housekeeping & Sanitation',
    phone: '+91 98204 45678',
    active: true,
  });

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);

  // 5. Create Headline Demo Complaint (FF-1001)
  // Story: Water leaking from ceiling in master bedroom (Flat B-204) - Resolved, ready for resident confirmation
  const headlineComplaint = await Complaint.create({
    publicId: 'FF-1001',
    resident: resident1._id,
    category: 'Plumbing',
    title: 'Water leaking from ceiling in master bedroom',
    description: 'Active seepage spreading near the light fixture from the upper flat bathroom. Water is dripping continuously into a bucket.',
    status: COMPLAINT_STATUS.RESOLVED,
    priority: COMPLAINT_PRIORITY.HIGH,
    suggestedPriority: COMPLAINT_PRIORITY.HIGH,
    prioritySuggestionReason: 'Active water leakage or flooding can cause rapid structural and property damage.',
    assignedTo: staffPlumber._id,
    dueAt: hoursAgo(18),
    firstResponseAt: hoursAgo(23),
    resolvedAt: hoursAgo(2),
    createdAt: hoursAgo(24),
  });

  // Attachments for headline demo complaint
  await ComplaintAttachment.create({
    complaint: headlineComplaint._id,
    type: ATTACHMENT_TYPES.BEFORE,
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    filename: 'ceiling_leak_before.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 512,
    createdBy: resident1._id,
    createdAt: hoursAgo(24),
  });

  await ComplaintAttachment.create({
    complaint: headlineComplaint._id,
    type: ATTACHMENT_TYPES.RESOLUTION,
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
    filename: 'ceiling_leak_fixed_after.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 640,
    createdBy: admin._id,
    createdAt: hoursAgo(2),
  });

  // Full history timeline for headline complaint
  await ComplaintHistory.create([
    {
      complaint: headlineComplaint._id,
      actor: resident1._id,
      eventType: 'CREATED',
      oldStatus: undefined,
      newStatus: COMPLAINT_STATUS.OPEN,
      note: 'Maintenance request created by resident with photos.',
      createdAt: hoursAgo(24),
    },
    {
      complaint: headlineComplaint._id,
      actor: admin._id,
      eventType: 'ASSIGNED',
      note: 'Assigned to Rajesh Sharma (Plumbing & Drainage). SLA set to 6 hours (High Priority).',
      metadata: { staffName: 'Rajesh Sharma', priority: 'HIGH' },
      createdAt: hoursAgo(23),
    },
    {
      complaint: headlineComplaint._id,
      actor: admin._id,
      eventType: 'STATUS_CHANGED',
      oldStatus: COMPLAINT_STATUS.OPEN,
      newStatus: COMPLAINT_STATUS.IN_PROGRESS,
      note: 'Technician on site inspecting upper flat (B-304) plumbing trap.',
      createdAt: hoursAgo(20),
    },
    {
      complaint: headlineComplaint._id,
      actor: admin._id,
      eventType: 'STATUS_CHANGED',
      oldStatus: COMPLAINT_STATUS.IN_PROGRESS,
      newStatus: COMPLAINT_STATUS.RESOLVED,
      note: 'Replaced broken waste trap in upper unit and sealed ceiling joint. Leak stopped.',
      createdAt: hoursAgo(2),
    },
  ]);

  // Initial notification for resident1 to confirm resolution
  await Notification.create({
    user: resident1._id,
    type: NOTIFICATION_TYPES.RESOLUTION_CONFIRM,
    title: 'Looks like this is fixed 🎉',
    body: 'The maintenance team marked "Water leaking from ceiling" (FF-1001) as resolved. Was this actually fixed?',
    relatedComplaint: headlineComplaint._id,
    createdAt: hoursAgo(2),
  });

  // 6. Create Overdue Complaint (FF-1002)
  // Tower A Lift breakdown past due date
  const overdueComplaint = await Complaint.create({
    publicId: 'FF-1002',
    resident: resident4._id,
    category: 'Lift',
    title: 'Passenger Lift #2 stuck between 4th and 5th floors',
    description: 'Lift #2 stopped with an audible screech and doors will not open on 5th floor landing. Needs emergency technician.',
    status: COMPLAINT_STATUS.OPEN,
    priority: COMPLAINT_PRIORITY.HIGH,
    suggestedPriority: COMPLAINT_PRIORITY.HIGH,
    prioritySuggestionReason: 'Lift entrapment or malfunction involves immediate resident safety.',
    dueAt: hoursAgo(4), // Overdue!
    createdAt: hoursAgo(10),
  });

  await ComplaintHistory.create({
    complaint: overdueComplaint._id,
    actor: resident4._id,
    eventType: 'CREATED',
    oldStatus: undefined,
    newStatus: COMPLAINT_STATUS.OPEN,
    note: 'Urgent lift safety complaint logged by resident.',
    createdAt: hoursAgo(10),
  });

  // 7. Create Reopened Complaint (FF-1003)
  const reopenedComplaint = await Complaint.create({
    publicId: 'FF-1003',
    resident: resident5._id,
    category: 'Electrical',
    title: 'Corridor lighting flickering continuously',
    description: '3rd-floor hallway light fixtures hum loudly and flicker on and off intermittently.',
    status: COMPLAINT_STATUS.REOPENED,
    priority: COMPLAINT_PRIORITY.MEDIUM,
    assignedTo: staffElectrician._id,
    dueAt: hoursFromNow(12),
    firstResponseAt: hoursAgo(30),
    resolvedAt: hoursAgo(12),
    reopenedAt: hoursAgo(3),
    createdAt: hoursAgo(36),
  });

  await ComplaintHistory.create([
    {
      complaint: reopenedComplaint._id,
      actor: resident5._id,
      eventType: 'CREATED',
      newStatus: COMPLAINT_STATUS.OPEN,
      note: 'Complaint registered.',
      createdAt: hoursAgo(36),
    },
    {
      complaint: reopenedComplaint._id,
      actor: admin._id,
      eventType: 'STATUS_CHANGED',
      oldStatus: COMPLAINT_STATUS.OPEN,
      newStatus: COMPLAINT_STATUS.IN_PROGRESS,
      note: 'Electrician inspected fixture and replaced starter bulb.',
      createdAt: hoursAgo(28),
    },
    {
      complaint: reopenedComplaint._id,
      actor: admin._id,
      eventType: 'STATUS_CHANGED',
      oldStatus: COMPLAINT_STATUS.IN_PROGRESS,
      newStatus: COMPLAINT_STATUS.RESOLVED,
      note: 'Bulb replaced, marked resolved.',
      createdAt: hoursAgo(12),
    },
    {
      complaint: reopenedComplaint._id,
      actor: resident5._id,
      eventType: 'REOPENED',
      oldStatus: COMPLAINT_STATUS.RESOLVED,
      newStatus: COMPLAINT_STATUS.REOPENED,
      note: 'Light still buzzes loudly and completely turned off again after 10 minutes. The ballast unit seems faulty.',
      createdAt: hoursAgo(3),
    },
  ]);

  // 8. Create Recurring Pattern Cluster (Tower B - Plumbing Cluster)
  const recurringCases = [
    {
      publicId: 'FF-1004',
      resident: resident2._id, // Flat B-304
      title: 'Kitchen drainage pipe backflow',
      description: 'Dirty water coming back up through kitchen sink drain during morning hours.',
      status: COMPLAINT_STATUS.IN_PROGRESS,
      priority: COMPLAINT_PRIORITY.HIGH,
      assignedTo: staffPlumber._id,
      createdAt: hoursAgo(48),
      dueAt: hoursFromNow(6),
    },
    {
      publicId: 'FF-1005',
      resident: resident3._id, // Flat B-404
      title: 'Low water pressure in bathroom line',
      description: 'Very weak water flow from hot water inlet in common bathroom since Tuesday.',
      status: COMPLAINT_STATUS.OPEN,
      priority: COMPLAINT_PRIORITY.MEDIUM,
      createdAt: hoursAgo(16),
      dueAt: hoursFromNow(8),
    },
    {
      publicId: 'FF-1006',
      resident: resident1._id, // Flat B-204
      title: 'Balcony drainage blocked during wash',
      description: 'Water standing on balcony floor due to clogged drain spout.',
      status: COMPLAINT_STATUS.RESOLVED,
      priority: COMPLAINT_PRIORITY.LOW,
      assignedTo: staffPlumber._id,
      resolvedAt: hoursAgo(10),
      createdAt: hoursAgo(72),
      dueAt: hoursAgo(24),
    },
    {
      publicId: 'FF-1007',
      resident: resident2._id, // Flat B-304
      title: 'Riser pipe joint sweating and dripping',
      description: 'Visible moisture and continuous dripping from the vertical pipe shaft in duct.',
      status: COMPLAINT_STATUS.OPEN,
      priority: COMPLAINT_PRIORITY.HIGH,
      createdAt: hoursAgo(8),
      dueAt: hoursFromNow(4),
    },
  ];

  for (const cData of recurringCases) {
    const c = await Complaint.create({
      ...cData,
      category: 'Plumbing',
      suggestedPriority: cData.priority,
    });
    await ComplaintHistory.create({
      complaint: c._id,
      actor: cData.resident,
      eventType: 'CREATED',
      newStatus: cData.status,
      note: `Initial complaint logged: "${cData.title}"`,
      createdAt: cData.createdAt,
    });
  }

  // 9. Additional realistic complaints for analytics diversity
  const extraComplaints = [
    {
      publicId: 'FF-1008',
      resident: resident6._id, // Flat A-103
      category: 'Security',
      title: 'Basement parking boom barrier not reading RFID tag',
      description: 'RFID scanner at Entry Gate B fails to recognize tag on windshield.',
      status: COMPLAINT_STATUS.IN_PROGRESS,
      priority: COMPLAINT_PRIORITY.MEDIUM,
      assignedTo: staffElectrician._id,
      createdAt: hoursAgo(14),
      dueAt: hoursFromNow(10),
    },
    {
      publicId: 'FF-1009',
      resident: resident5._id, // Flat C-102
      category: 'Cleaning',
      title: 'Garbage chute area needs deep disinfection',
      description: 'Foul odor emanating from floor garbage chute room on 1st floor.',
      status: COMPLAINT_STATUS.RESOLVED,
      priority: COMPLAINT_PRIORITY.LOW,
      assignedTo: staffCleaning._id,
      resolvedAt: hoursAgo(20),
      createdAt: hoursAgo(40),
      dueAt: hoursAgo(16),
    },
    {
      publicId: 'FF-1010',
      resident: resident4._id, // Flat A-501
      category: 'Common Area',
      title: 'Gym treadmill belt slipping under load',
      description: 'Treadmill #1 in clubhouse slips when running above 8 km/h.',
      status: COMPLAINT_STATUS.OPEN,
      priority: COMPLAINT_PRIORITY.LOW,
      createdAt: hoursAgo(30),
      dueAt: hoursFromNow(18),
    },
    {
      publicId: 'FF-1011',
      resident: resident6._id, // Flat A-103
      category: 'Parking',
      title: 'Unauthorized vehicle parked in allotted slot A-103',
      description: 'Visitor car MH-02-CD-4512 parked in reserved resident slot without permit.',
      status: COMPLAINT_STATUS.RESOLVED,
      priority: COMPLAINT_PRIORITY.MEDIUM,
      resolvedAt: hoursAgo(4),
      createdAt: hoursAgo(12),
      dueAt: hoursFromNow(12),
    },
  ];

  for (const cData of extraComplaints) {
    const c = await Complaint.create({
      ...cData,
      suggestedPriority: cData.priority,
    });
    await ComplaintHistory.create({
      complaint: c._id,
      actor: cData.resident,
      eventType: 'CREATED',
      newStatus: cData.status,
      note: 'Logged by resident.',
      createdAt: cData.createdAt,
    });
  }

  // 10. Create Society Notices
  await Notice.create([
    {
      title: 'Water Tank Cleaning & Pressure Testing Schedule',
      body: 'Underground and overhead water tanks for Towers A, B, and C will undergo annual chemical disinfection and structural pressure testing this Saturday (10:00 AM - 4:00 PM). Water supply will be regulated during this window.',
      isImportant: true,
      author: admin._id,
      publishedAt: hoursAgo(12),
    },
    {
      title: 'Elevator Modernization & AMC Audit in Tower A',
      body: 'Schindler engineering team will be conducting a comprehensive vibration analysis and motor check on Tower A passenger elevators on Thursday.',
      isImportant: false,
      author: admin._id,
      publishedAt: hoursAgo(48),
    },
    {
      title: 'Clubhouse & Gymnasium Maintenance Timings',
      body: 'The society gym floor is being treated with anti-slip protective coating. Reopening scheduled for Monday 6:00 AM.',
      isImportant: false,
      author: admin._id,
      publishedAt: hoursAgo(96),
    },
  ]);

  console.log('✅ FixFlow Database Seeded Successfully!');
  console.log('\n--- Demo Accounts Created ---');
  console.log('🔑 Resident Demo: resident@example.com / password123 (Flat B-204, Tower B)');
  console.log('🔑 Admin Demo:    admin@example.com / password123 (Society Estate Manager)');
  console.log('------------------------------\n');
};

// If run directly via CLI
if (require.main === module) {
  connectDB()
    .then(seedDatabase)
    .then(() => disconnectDB())
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
