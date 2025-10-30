const admin = require('firebase-admin');
const serviceAccount = require('./gymplify-554c8-firebase-adminsdk-8u5q1-e06819b72d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkNotifications() {
  console.log(' Checking notifications for admin user...\n');

  // Get admin user
  const adminSnapshot = await db.collection('users').where('role', '==', 'admin').get();
  
  if (adminSnapshot.empty) {
    console.log(' No admin users found!');
    return;
  }

  console.log(` Found ${adminSnapshot.size} admin user(s):\n`);
  
  adminSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Admin ID: ${doc.id}`);
    console.log(`Name: ${data.displayName || data.name || 'N/A'}`);
    console.log(`Email: ${data.email || 'N/A'}`);
    console.log('---');
  });

  // Get notifications for admin
  const adminId = adminSnapshot.docs[0].id;
  console.log(`\n Checking notifications for admin: ${adminId}\n`);

  const notificationsSnapshot = await db
    .collection('notifications')
    .where('userId', '==', adminId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  if (notificationsSnapshot.empty) {
    console.log(' No notifications found for admin!');
  } else {
    console.log(` Found ${notificationsSnapshot.size} notification(s):\n`);
    
    notificationsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${data.title}`);
      console.log(`Message: ${data.message}`);
      console.log(`Type: ${data.type}`);
      console.log(`Read: ${data.read}`);
      console.log(`Created: ${data.createdAt?.toDate?.() || 'N/A'}`);
      console.log('---\n');
    });
  }

  // Check pending subscriptions
  console.log('\n Checking pending subscriptions...\n');
  
  const pendingSnapshot = await db
    .collection('pendingSubscriptions')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  if (pendingSnapshot.empty) {
    console.log(' No pending subscriptions found!');
  } else {
    console.log(` Found ${pendingSnapshot.size} pending subscription(s):\n`);
    
    pendingSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`User: ${data.userDisplayName}`);
      console.log(`Plan: ${data.planName}`);
      console.log(`Status: ${data.status}`);
      console.log(`Paid: ${data.isPaid}`);
      console.log(`Created: ${data.createdAt?.toDate?.() || 'N/A'}`);
      console.log('---\n');
    });
  }

  process.exit(0);
}

checkNotifications().catch(console.error);

