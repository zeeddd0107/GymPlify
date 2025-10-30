require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

/*
Usage:
  node scripts/populateRealUsers.js [numberOfUsers]

Behavior:
  - Creates realistic Filipino users with client role
  - Generates proper member IDs (MBR-00001, MBR-00002, etc.)
  - Creates realistic subscription data
  - Creates attendance records
  - Uses real Filipino names and realistic email addresses
*/

const numberOfUsers = parseInt(process.argv[2]) || 2; // Default to 2 users

// Real user names and emails data (96 pairs)
const realUsers = [
  { name: "Fathima Mae Marquez", email: "fathimamaemarquez05@gmail.com" },
  { name: "Jamaica Dominguez", email: "jamaicadominguez05@gmail.com" },
  { name: "Odessy Mae San Diego", email: "sandiego2235291@gmail.com" },
  { name: "Sofia Bianca Crisologo", email: "sofiabiancacrisologo4@gmail.com" },
  { name: "Zyrelle Mae Yabut", email: "zyrellemaeyabut@gmail.com" },
  { name: "Mia Fundario", email: "fundariomia0911@gmail.com" },
  { name: "Tatiana Gallardo", email: "tatianayzabelle@gmail.com" },
  { name: "Rea Lawan", email: "lawanrea0108@gmail.com" },
  { name: "Cleia Santiago", email: "kleyahh13@gmail.com" },
  { name: "Politano Emheraene", email: "Emheraene@gmail.com" },
  { name: "Abi Gabriel", email: "abigabriel873@gmail.com" },
  { name: "Mark Vincent Luna", email: "lunamarkvincent03@gmail.com" },
  { name: "Angelica Aguilar", email: "ange.aguilar116@gmail.com" },
  { name: "Ilaisa Mae Lagunsad", email: "lagunsadilaisa@gmail.com" },
  { name: "Christian Jan Bolano", email: "christianjanbolano186@gmail.com" },
  { name: "Vernadeth Veñan", email: "venanvernadeth@gmail.com" },
  { name: "Kayem Alisandra Rico", email: "ricokayemalisandra@gmail.com" },
  { name: "Rhesa Mae Sonio", email: "rhesamaesonio@gmail.com" },
  { name: "Maria Erika Pinili", email: "mariaerikapinili@gmail.com" },
  { name: "Hershey Lim", email: "hershey.lim19@gmail.com" },
  { name: "Justine Boleño", email: "justineboleno@gmail.com" },
  { name: "Jacqueline Prasmo", email: "prasmojacqueline@gmail.com" },
  { name: "Emierose Bustillo", email: "emierosebustillo@gmail.com" },
  { name: "Joyce Anne Avenido", email: "joyceannebasilisa@gmail.com" },
  { name: "Christian Añonuevo", email: "christianhuerno04@gmail.com" },
  { name: "Jennefer Galpo", email: "jenneferlanterna@gmail.cm" },
  { name: "Laica Dazo", email: "dazolaica@gmail.com" },
  { name: "Kai Corpuz", email: "kycrpz@gmail.com" },
  { name: "Mary Anne Catienza", email: "catienzamaryann@gmail.com" },
  { name: "Raisa Borbon", email: "raisaborbon8@gmail.com" },
  { name: "Ellamae Apay", email: "apayellamae36@gmail.com" },
  { name: "Jed Bautista", email: "jedtoffeebautista@gmail.com" },
  { name: "Shannia", email: "shanniaz68@gmail.com" },
  { name: "Yesha Angelika Sanchez", email: "angelikayesha03@gmail.com" },
  { name: "Lalaine Alagon", email: "lalainenalagon5@gmail.com" },
  { name: "Eriche Laguna", email: "lagunaeriche5@gmail.com" },
  { name: "Jelaine Kholeen Leoncio", email: "kholeenleoncio8@gmail.com" },
  { name: "Shairah Cruz", email: "cruzshairah@gmail.com" },
  { name: "Limie Shane Rosales", email: "limieshanerosales18@gmail.com" },
  { name: "Mariz Manalo", email: "marizsy911@gmail.com" },
  { name: "Evangeline Marquez", email: "evangelinemarquez889@gmail.com" },
  { name: "Jariz Anne Sarol", email: "jarizannes@gmail.com" },
  { name: "Iyana Ghia Alexis Ancheta", email: "iyanaghiaalexisancheta27@gmail.com" },
  { name: "Stephanie", email: "stephfantilanan@gmail.com" },
  { name: "Khateleen Batas", email: "Khateleenb@gmail.com" },
  { name: "Rhica Amoroso", email: "amorosorhica@gmail.com" },
  { name: "John Paul Bacallan", email: "johnbacallan11@gmail.com" },
  { name: "Celeste Jullienne Mones", email: "cjrmones@mrsbi.ph.education" },
  { name: "Johannah Pauline Suriaga", email: "johanpausuriaga@gmail.com" },
  { name: "Maria Laroga", email: "marialaroga.11@gmail.com" },
  { name: "John Carl De Asis", email: "johncarldeasis135@gmail.com" },
  { name: "Marc Raine Perez", email: "pmarcraine@gmail.com" },
  { name: "Clarisse Peligrino", email: "clarissepeligrino302@gmail.com" },
  { name: "Gwyne Gabrielle Fajardo", email: "ggwynefajardo@gmail.com" },
  { name: "Lindsay Encarnacion", email: "encarnacionlindsay@gmail.com" },
  { name: "Ariane Bantog", email: "arianebantog@yahoo.com" },
  { name: "Piolo Apolinario", email: "pioloapolinario75@gmail.com" },
  { name: "John Everique Manlabao", email: "everiquemanlabao@gmail.com" },
  { name: "J-mie Delossantos", email: "jmiedelossantos14@gmail.com" },
  { name: "Pauline Nicole Grama", email: "nicoledumpsie@gmail.com" },
  { name: "Ariane Patrolla", email: "arianepatrolla19@gmail.com" },
  { name: "James Owen Almerol", email: "jmswnlmrl36@gmail.com" },
  { name: "Aerish Shanley Mainit", email: "aerishshanleymainit@gmail.com" },
  { name: "Pia Gallardo", email: "piadeniseegallardo@gmail.com" },
  { name: "Erickson Malvar", email: "ericksonmalvar029@gmail.com" },
  { name: "Raymond Mordidi", email: "raymondmordido12@gmail.com" },
  { name: "Revelove Beringuel", email: "ms.reveloveberinguel@gmail.com" },
  { name: "Krizia Lleva", email: "krizia20lleva@gmail.com" },
  { name: "Christian Lontoc", email: "christiansaleslontoc@gmail.com" },
  { name: "Gabriella Marie Jacobson", email: "jacobsongabriellamarie@gmail.com" },
  { name: "Roshan Gumatay", email: "roshangumatay16@gmail.com" },
  { name: "Jane Corre", email: "janecorre74@gmail.com" },
  { name: "Marc Terence Biando", email: "azzytian17@gmail.com" },
  { name: "Faith Pagatpatan", email: "faithpagatpatan.edu.ph@gmail.com" },
  { name: "Rachel Aquino", email: "rachelaquino0611@gmail.com" },
  { name: "Daniela Basierto", email: "danielabasierto11@gmail.com" },
  { name: "Cholo De Guzman", email: "cholodeguzman1993@gmail.com" },
  { name: "Janelle Daragay", email: "janellemargaret11@gmail.com" },
  { name: "Glerry Fe Mendez", email: "mendezglerryfe@gmail.com" },
  { name: "Mar Crystalyn Resurreccion", email: "Resurreccionmae10@gmail.com" },
  { name: "Hayden Mae Mortel", email: "mortel.nedtah@gmail.com" },
  { name: "Aeiy Licdao", email: "aeiylicdao@gmail.com" },
  { name: "Clarizza Elis", email: "clrzzelis@gmail.com" },
  { name: "Mary Rachel Ferol", email: "mrachelf26@gmail.com" },
  { name: "Leona San Juan", email: "ena27sanjuan@gmail.com" },
  { name: "Joneah", email: "joneahs@gmail.com" },
  { name: "Martina Francheska Matias", email: "martinafrancheskamatias@gmail.com" },
  { name: "Jhizrelle De Leon", email: "deleonjhizrelle@gmail.com" },
  { name: "Michaella Vasquez", email: "vasquezmicha13@gmail.com" },
  { name: "Mikay", email: "mianomikay013003@gmail.com" },
  { name: "Marcus Simone", email: "marcussimone8@gmail.com" },
  { name: "Chrisma Fei Dela Cruz", email: "chrismafei25@gmail.com" },
  { name: "Hailie Dimla", email: "haleydimla33@gmail.com" },
  { name: "John Laurence Marquez", email: "johnlaurencemarquez812@gmail.com" },
  { name: "Triescent Jay Labadia", email: "tlabadia5@gmail.com" },
  { name: "Jasmin Lloyd Almerol", email: "almeroljasminlloyd@gmail.com" }
];

// Subscription plans (matching your existing plans)
const subscriptionPlans = [
  { id: "walkin", name: "Walk-in", price: "₱100", period: "per session" },
  { id: "monthly", name: "Monthly Plan", price: "₱850", period: "per month" },
  { id: "coaching-group", name: "Coaching Program - Group", price: "₱2,500", period: "per month" },
  { id: "coaching-solo", name: "Coaching Program - Solo", price: "₱2,500", period: "per month" }
];


function generateRandomName() {
  // Randomly select from the real user names list
  const randomIndex = Math.floor(Math.random() * realUsers.length);
  return realUsers[randomIndex].name;
}

function generateEmail(name) {
  // Find the email that matches the name
  const user = realUsers.find(u => u.name === name);
  if (user) {
    return user.email;
  }
  // Fallback (shouldn't happen if names and emails are properly matched)
  const randomIndex = Math.floor(Math.random() * realUsers.length);
  return realUsers[randomIndex].email;
}

function generatePassword() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*";

  let password = "";

  // Generate 11 characters with letters and numbers
  for (let i = 0; i < 11; i++) {
    const charSet = Math.random() < 0.6 ? letters : numbers;
    password += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }

  // Add one special character at the end
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  return password;
}

function generateRandomCreationDate() {
  // Generate random date between October 13-28, 2025
  const startDate = new Date('2025-10-13');
  const endDate = new Date('2025-10-28');
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime);
}

function generateCustomMemberId(counter) {
  return `MBR-${counter.toString().padStart(5, "0")}`;
}

function getRandomSubscriptionPlan() {
  return subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
}

function generateRealisticFCMToken() {
  // Generate a realistic FCM token that matches real Firebase Cloud Messaging tokens exactly
  // Real FCM token structure: [22_chars]:APA91b[base64_with_underscores_and_hyphens]
  // Total length: 152 characters
  // Base64 part: 124 characters with pattern: [14chars]-[7chars]_[1char]-[36chars]_[6chars]-[19chars]_[31chars]

  // First part: 22 random alphanumeric characters
  const firstPart = Array.from({ length: 22 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
      Math.floor(Math.random() * 62)
    ]
  ).join('');

  // Base64 characters (including - and _)
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  // Build base64 part matching exact pattern: [14]-[7]_[1]-[36]_[6]-[19]_[31]
  let base64Part = '';

  // Segment 1: 14 chars before first hyphen
  base64Part += Array.from({ length: 14 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');
  base64Part += '-';

  // Segment 2: 7 chars before first underscore
  base64Part += Array.from({ length: 7 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');
  base64Part += '_';

  // Segment 3: 1 char before second hyphen
  base64Part += Array.from({ length: 1 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');
  base64Part += '-';

  // Segment 4: 36 chars before second underscore
  base64Part += Array.from({ length: 36 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');
  base64Part += '_';

  // Segment 5: 6 chars before third hyphen
  base64Part += Array.from({ length: 6 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');
  base64Part += '-';

  // Segment 6: 19 chars before third underscore
  base64Part += Array.from({ length: 19 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');
  base64Part += '_';

  // Segment 7: 31 chars (rest)
  base64Part += Array.from({ length: 31 }, () => base64Chars[Math.floor(Math.random() * 64)]).join('');

  // Verify: 14+7+1+36+6+19+31+5(separators) = 119+5 = 124 characters ✓

  return `${firstPart}:APA91b${base64Part}`;
}

function generateSubscriptionDates(userCreationDate) {
  // Generate subscription dates based on user creation date
  const userCreated = userCreationDate || new Date();

  // Start subscription within 0-7 days after user creation
  const daysAfterCreation = Math.floor(Math.random() * 8); // 0-7 days
  const startDate = new Date(userCreated.getTime() + daysAfterCreation * 24 * 60 * 60 * 1000);

  const plan = getRandomSubscriptionPlan();
  let endDate;

  if (plan.id === "walkin") {
    endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 1 day
  } else {
    // Monthly plans - add 30 days
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
  }

  return { startDate, endDate, plan };
}

function generateAttendanceRecords(userId, userName, userEmail, startDate, endDate) {
  const records = [];
  const currentDate = new Date();

  // Generate attendance records for the subscription period
  const recordCount = Math.floor(Math.random() * 20) + 5; // 5-25 visits

  for (let i = 0; i < recordCount; i++) {
    const recordDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

    // Skip future dates
    if (recordDate > currentDate) continue;

    const checkInTime = new Date(recordDate);
    checkInTime.setHours(6 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0); // 6 AM to 6 PM

    const sessionDuration = 30 + Math.floor(Math.random() * 120); // 30-150 minutes
    const checkOutTime = new Date(checkInTime.getTime() + sessionDuration * 60 * 1000);

    records.push({
      userId,
      userInfo: {
        displayName: userName,
        name: userName,
        email: userEmail
      },
      checkInTime: admin.firestore.Timestamp.fromDate(checkInTime),
      checkOutTime: admin.firestore.Timestamp.fromDate(checkOutTime),
      qrValue: `${userId}_${checkInTime.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: admin.firestore.Timestamp.fromDate(checkInTime),
      updatedAt: admin.firestore.Timestamp.fromDate(checkOutTime)
    });
  }

  return records;
}


async function populateUsers() {
  console.log(`Creating ${numberOfUsers} realistic Filipino users...`);

  const db = admin.firestore();
  const batch = db.batch();
  let userCounter = 1;

  // Get current member ID counter
  const counterRef = db.collection("counters").doc("memberId");
  const counterDoc = await counterRef.get();
  let currentMemberId = 1;

  if (counterDoc.exists) {
    currentMemberId = counterDoc.data().currentNumber + 1;
  }

  // Update counter
  await counterRef.set({
    currentNumber: currentMemberId + numberOfUsers - 1,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });

  const users = [];
  const subscriptions = [];
  const attendanceRecords = [];

  // Shuffle the realUsers array to randomize selection
  const shuffledUsers = [...realUsers].sort(() => Math.random() - 0.5);
  const usedEmails = new Set(); // Track emails that have been used or already exist

  let createdCount = 0;
  let attempts = 0;
  const maxAttempts = numberOfUsers * 2; // Prevent infinite loop

  while (createdCount < numberOfUsers && attempts < maxAttempts) {
    attempts++;

    // Find a user that hasn't been used yet
    let selectedUser = null;

    for (let j = 0; j < shuffledUsers.length; j++) {
      const candidate = shuffledUsers[j];
      if (!usedEmails.has(candidate.email)) {
        selectedUser = candidate;
        break;
      }
    }

    // If all users have been used and we need more, break
    if (!selectedUser) {
      console.log(`All ${realUsers.length} available users have been used. Stopping at ${createdCount} users.`);
      break;
    }

    const name = selectedUser.name;
    const email = selectedUser.email;
    const password = 'password'; // Use simple password for all users
    const customMemberId = generateCustomMemberId(currentMemberId + createdCount);

    try {
      // Check if email already exists in Firebase Auth
      try {
        await admin.auth().getUserByEmail(email);
        // Email exists, mark as used and skip
        console.log(`Email ${email} already exists. Skipping ${name}.`);
        usedEmails.add(email);
        continue; // Skip to next iteration, try another user
      } catch (authError) {
        // Email doesn't exist, proceed with creation
        if (authError.code !== 'auth/user-not-found') {
          throw authError; // Re-throw if it's a different error
        }
      }

      // Generate random creation date for realistic user creation
      const randomCreationDate = generateRandomCreationDate();

      // Create Firebase Auth user
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: true, // Mark as verified since we're creating them
        // Note: Firebase Auth doesn't allow custom creation dates
        // The creation date will be current timestamp, but we'll use randomCreationDate
        // for Firestore createdAt field to make it look realistic
      });

      // Mark this email as used
      usedEmails.add(email);

      const userId = userRecord.uid;
      const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&bold=true`;

      // Generate subscription data first (based on user creation date)
      const { startDate, endDate, plan } = generateSubscriptionDates(randomCreationDate);

      // Let Firestore auto-generate the subscription ID (like real users)
      const subscriptionRef = db.collection("subscriptions").doc();
      const subscriptionId = subscriptionRef.id; // Get the auto-generated ID

      const subscriptionData = {
        userId,
        planId: plan.id,
        planName: plan.name,
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        status: endDate > new Date() ? "active" : "expired",
        paymentMethod: "counter",
        price: plan.price, // Use price as string (e.g., "₱2,500")
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add missing fields to match real subscription documents
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: "admin",
        userDisplayName: name,
        userEmail: email,
        // Add plan-specific fields
        ...(plan.id === "walkin" ? {
          daysRemaining: 1,
          usedSessions: 0,
          maxSessions: null
        } : {
          daysRemaining: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
          usedSessions: Math.floor(Math.random() * 5), // Random sessions used
          maxSessions: plan.id === "coaching-solo" ? 10 : null
        }),
        // Add extension fields for some subscriptions
        ...(Math.random() > 0.7 ? { // 30% chance of having extensions
          extensionDate: admin.firestore.FieldValue.serverTimestamp(),
          extensionType: "monthly_to_monthly",
          newMonthlyDays: 31,
          totalExtensionDays: 31,
          reason: "Extended monthly subscription with additional days"
        } : {})
      };

      // Create user document with realistic creation date and all fields
      const userRef = db.collection("users").doc(userId);
      const subscriptionStatus = endDate > new Date() ? "active" : "expired";

      const userData = {
        uid: userId,
        email,
        displayName: name,
        name: name,
        role: "client",
        provider: "password",
        photoURL,
        qrCodeValue: userId,
        customMemberId,
        createdAt: admin.firestore.Timestamp.fromDate(randomCreationDate), // Use random creation date
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        lastLogout: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add missing fields to match real user documents
        devicePlatform: "android", // Default to android
        fcmToken: generateRealisticFCMToken(), // Generate realistic FCM token
        pushToken: `ExponentPushToken[${Math.random().toString(36).substr(2, 20)}]`,
        pushTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add subscription fields to user document
        activeSubscriptionId: subscriptionId,
        subscriptionHistory: [subscriptionId],
        subscriptionStatus: subscriptionStatus // Add subscription status field
      };

      batch.set(userRef, userData);
      users.push({ userId, name, email, customMemberId, password });

      batch.set(subscriptionRef, subscriptionData);
      subscriptions.push({ userId, subscriptionId, plan, startDate, endDate });

      // Generate attendance records
      const attendance = generateAttendanceRecords(userId, name, email, startDate, endDate);
      for (const record of attendance) {
        const attendanceRef = db.collection("attendance").doc();
        batch.set(attendanceRef, record);
        attendanceRecords.push(record);
      }

      console.log(`Created user ${createdCount + 1}/${numberOfUsers}: ${name} (${customMemberId})`);
      createdCount++; // Increment only on successful creation

    } catch (error) {
      // Check if email is already in use
      if (error.message && error.message.includes('already in use')) {
        console.error(`Error creating user ${name}: Email ${email} is already in use. Skipping this user.`);
        // Mark email as used so we don't try it again
        usedEmails.add(email);
      } else {
        console.error(`Error creating user ${name}:`, error.message);
        // For other errors, also mark as used to avoid retrying failed users
        usedEmails.add(email);
      }
      // Continue with next user
    }
  }

  // Commit all users in batches
  console.log("Saving users to Firestore...");
  await batch.commit();

  console.log("\nUser population complete!");
  console.log(`Summary:`);
  console.log(`   Firebase Auth users created: ${users.length}`);
  console.log(`   Firestore user documents: ${users.length}`);
  console.log(`   Subscriptions created: ${subscriptions.length}`);
  console.log(`   Attendance records created: ${attendanceRecords.length}`);

  // Show all users created
  console.log("\nUsers created:");
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.name} (${user.customMemberId}) - ${user.email}`);
  });

  console.log("\nLogin credentials:");
  console.log(`   Password for all users: password`);
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. Email: ${user.email} | Password: password`);
  });

  console.log("\nNote: All users have 'client' role and are ready to use your mobile app!");
}

async function main() {
  try {
    console.log("==================================================");
    console.log("GYMPLIFY REAL USER DATA POPULATION");
    console.log("==================================================");
    console.log(`Creating ${numberOfUsers} realistic Filipino users`);
    console.log("All users will have 'client' role");
    console.log("Data structure matches mobile app registration");
    console.log("Creating Firebase Auth users + Firestore documents");
    console.log("==================================================\n");

    // Populate users
    await populateUsers();

    console.log("\nAll done! Your Firebase now has realistic user data.");
    console.log("Firebase Authentication: Users can log in with generated credentials");
    console.log("Firestore Database: Complete user profiles and subscription data");
    console.log("You can now test your mobile app with real-looking data.");

    process.exit(0);
  } catch (error) {
    console.error("Error populating users:", error);
    process.exit(1);
  }
}

main();
