const { mainDb, labDb } = require("../src/config/prisma");
const bcrypt = require("bcryptjs");

const FIRST_NAMES_MALE = [
  "Abebe", "Dawit", "Chala", "Fikru", "Habtamu", "Yohannes", "Tariku", "Yared",
  "Zerihun", "Biruk", "Mulugeta", "Getachew", "Berhanu", "Fitsum", "Tewodros",
  "Eyob", "Ashenafi", "Solomon", "Tamirat", "Daniel", "Henok", "Natnael",
  "Elias", "Girma", "Kassahun", "Sisay", "Tadesse", "Wondwossen", "Kassa",
  "Mengistu", "Zewdu", "Haile", "Negash", "Desta", "Kebede", "Bekele",
  "Lemma", "Tsegaye", "Alemu", "Gebre", "Tesfaye", "Melaku", "Abdi",
  "Mohammed", "Ahmed", "Jemal", "Osman", "Muktar", "Bilal", "Ibrahim"
];

const FIRST_NAMES_FEMALE = [
  "Almaz", "Bethlehem", "Eden", "Genet", "Hiwot", "Selamawit", "Tigist", "Aster",
  "Rahel", "Meron", "Frehiwot", "Senait", "Kidist", "Meseret", "Roman",
  "Tsion", "Hanna", "Kalkidan", "Lulit", "Mahlet", "Samrawit", "Birtukan",
  "Emebet", "Worknesh", "Marta", "Belaynesh", "Helen", "Azeb", "Sara",
  "Bizunesh", "Martha", "Yenenesh", "Yeshi", "Nigist", "Aberash", "Etsegenet",
  "Tirunesh", "Lemlem", "Banchi", "Aynalem", "Fatuma", "Kedija", "Rahma",
  "Amina", "Zeyneba", "Halima", "Samira", "Leyla", "Saba", "Hirut"
];

const LAST_NAMES = [
  "Bekele", "Tadesse", "Kebede", "Alemu", "Lemma", "Mengistu", "Desta", "Haile",
  "Tefera", "Worku", "Negash", "Girma", "Gebre", "Assefa", "Tilahun", "Ayana",
  "Bikila", "Tsige", "Tolosa", "Regassa", "Habte", "Melaku", "Sahle", "Aweke",
  "Belay", "Getachew", "Zewde", "Wolde", "Fekadu", "Teshome", "Kassa", "Bogale",
  "Demissie", "Berhe", "Abraha", "Hailu", "Woldeyes", "Girmay", "Abera", "Welde"
];

const ADDRESSES = [
  "Bole, Addis Ababa", "Kazanchis, Addis Ababa", "Arat Kilo, Addis Ababa",
  "Saris, Addis Ababa", "Piassa, Addis Ababa", "Lideta, Addis Ababa",
  "CMC, Addis Ababa", "Meganagna, Addis Ababa", "Gerji, Addis Ababa",
  "Kolfe, Addis Ababa", "Hawassa", "Bahir Dar", "Adama", "Mekelle",
  "Dire Dawa", "Jimma", "Gondar", "Bishoftu", "Harar", "Dessie"
];

const BLOOD_TYPES = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const BLOOD_TYPE_WEIGHTS = ["O+", "O+", "O+", "A+", "A+", "B+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

async function seed100Donors() {
  console.log("==========================================");
  console.log("🌱 Starting 100 Donors Database Population...");
  console.log("==========================================");

  const donorPasswordHash = bcrypt.hashSync("donor123", 10);
  const stationPasswordHash = bcrypt.hashSync("station123", 10);
  const labPasswordHash = bcrypt.hashSync("lab123", 10);
  const warehousePasswordHash = bcrypt.hashSync("warehouse123", 10);
  const hospitalPasswordHash = bcrypt.hashSync("hospital123", 10);

  // 1. Ensure primary workstation accounts exist
  const station = await mainDb.user.upsert({
    where: { email: "station@bloodbank.org" },
    update: { status: "approved" },
    create: {
      email: "station@bloodbank.org",
      password_hash: stationPasswordHash,
      role: "station",
      status: "approved",
      entity_name: "Addis Ababa Central Station"
    }
  });

  const lab = await mainDb.user.upsert({
    where: { email: "lab@bloodbank.org" },
    update: { status: "approved" },
    create: {
      email: "lab@bloodbank.org",
      password_hash: labPasswordHash,
      role: "laboratory",
      status: "approved",
      entity_name: "National Blood Testing Laboratory"
    }
  });

  const warehouse = await mainDb.user.upsert({
    where: { email: "warehouse@bloodbank.org" },
    update: { status: "approved" },
    create: {
      email: "warehouse@bloodbank.org",
      password_hash: warehousePasswordHash,
      role: "warehouse",
      status: "approved",
      entity_name: "Central Regional Warehouse"
    }
  });

  const hospital = await mainDb.user.upsert({
    where: { email: "hospital@bloodbank.org" },
    update: { status: "approved" },
    create: {
      email: "hospital@bloodbank.org",
      password_hash: hospitalPasswordHash,
      role: "hospital",
      status: "approved",
      entity_name: "Tikur Anbessa Specialized Hospital"
    }
  });

  console.log("✓ Verified core workstations (Station, Lab, Warehouse, Hospital).");

  // 2. Generate and Seed 100 Donors
  const now = new Date();
  let createdCount = 0;

  for (let i = 1; i <= 100; i++) {
    const isMale = i % 2 !== 0;
    const firstName = isMale 
      ? FIRST_NAMES_MALE[(i - 1) % FIRST_NAMES_MALE.length]
      : FIRST_NAMES_FEMALE[(i - 1) % FIRST_NAMES_FEMALE.length];
    const lastName = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;

    const faydaId = `ET-FAY-${String(10000 + i).padStart(5, '0')}`;
    const phone = `0911${String(100000 + i).slice(-6)}`;
    const email = `donor${i}@bloodbank.org`;
    const address = ADDRESSES[i % ADDRESSES.length];
    const bloodType = BLOOD_TYPE_WEIGHTS[i % BLOOD_TYPE_WEIGHTS.length];

    // Birth date between 18 and 55 years old
    const birthYear = 1970 + (i % 35);
    const birthMonth = (i % 12);
    const birthDay = 1 + (i % 28);
    const dob = new Date(birthYear, birthMonth, birthDay);

    // Realistic donation history
    const totalDonations = (i % 12); // 0 to 11 donations
    const points = totalDonations * 100 + (i % 50);

    let lastDonationDate = null;
    if (totalDonations > 0) {
      // Days ago for last donation
      const daysAgo = (i % 4 === 0) ? (30 + (i % 45)) : (95 + (i % 120)); // Some eligible, some deferral
      lastDonationDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    }

    // A. Upsert User account
    const user = await mainDb.user.upsert({
      where: { email },
      update: {
        entity_name: fullName,
        status: "approved"
      },
      create: {
        email,
        password_hash: donorPasswordHash,
        role: "donor",
        status: "approved",
        entity_name: fullName
      }
    });

    // B. Upsert Donor profile
    const donor = await mainDb.donor.upsert({
      where: { fayda_id: faydaId },
      update: {
        name: fullName,
        phone,
        dob,
        gender: isMale ? "Male" : "Female",
        address,
        blood_type: bloodType,
        last_donation_date: lastDonationDate,
        health_status: "healthy",
        points,
        user_id: user.id
      },
      create: {
        fayda_id: faydaId,
        name: fullName,
        phone,
        dob,
        gender: isMale ? "Male" : "Female",
        address,
        blood_type: bloodType,
        last_donation_date: lastDonationDate,
        health_status: "healthy",
        points,
        user_id: user.id
      }
    });

    // C. If donor has past donations, create blood sample records
    if (totalDonations > 0) {
      const sampleStatus = (i % 10 === 0) ? "pending_lab" : "validated";
      const sampleId = `SMP-2025-${String(100 + i).padStart(4, '0')}`;

      await mainDb.bloodSample.upsert({
        where: { id: sampleId },
        update: {
          fayda_id: faydaId,
          blood_type: bloodType,
          status: sampleStatus,
          station_id: station.id,
          lab_id: lab.id,
          collected_at: lastDonationDate || now
        },
        create: {
          id: sampleId,
          fayda_id: faydaId,
          blood_type: bloodType,
          status: sampleStatus,
          health_notes: sampleStatus === "validated" ? "Screening verified: HIV, Hep B/C, Syphilis Negative" : null,
          station_id: station.id,
          lab_id: lab.id,
          collected_at: lastDonationDate || now
        }
      });

      // D. Seed Lab Medical Record for emergency lookups
      await labDb.labMedicalRecord.upsert({
        where: { faydaId },
        update: {
          name: fullName,
          phone,
          bloodType,
          diseases: "HIV: Negative, Syphilis: Negative, Hepatitis B: Negative",
          hemoglobin: `${(13.5 + (i % 30) / 10).toFixed(1)} g/dL`,
          platelets: `${220000 + (i % 80) * 1000} /mcL`,
          allergies: (i % 7 === 0) ? "Penicillin" : "None",
          otherNotes: "Certified regular blood donor.",
          updatedAt: new Date()
        },
        create: {
          faydaId,
          name: fullName,
          phone,
          bloodType,
          diseases: "HIV: Negative, Syphilis: Negative, Hepatitis B: Negative",
          hemoglobin: `${(13.5 + (i % 30) / 10).toFixed(1)} g/dL`,
          platelets: `${220000 + (i % 80) * 1000} /mcL`,
          allergies: (i % 7 === 0) ? "Penicillin" : "None",
          otherNotes: "Certified regular blood donor.",
          updatedAt: new Date()
        }
      });
    }

    createdCount++;
    if (createdCount % 25 === 0) {
      console.log(`✓ Seeded ${createdCount}/100 donors...`);
    }
  }

  // 3. Ensure warehouse stock has representative quantities
  for (const type of BLOOD_TYPES) {
    const qty = type === 'O+' ? 450 : type === 'A+' ? 320 : type === 'B+' ? 280 : type === 'AB+' ? 140 : type === 'O-' ? 95 : type === 'A-' ? 75 : type === 'B-' ? 60 : 45;
    await mainDb.warehouseStock.upsert({
      where: {
        warehouse_id_blood_type: {
          warehouse_id: warehouse.id,
          blood_type: type
        }
      },
      update: { quantity: qty },
      create: {
        warehouse_id: warehouse.id,
        blood_type: type,
        quantity: qty
      }
    });
  }

  console.log("==========================================");
  console.log(`🎉 SUCCESS: 100 Donors and FAYDA profiles successfully seeded!`);
  console.log("   - FAYDA IDs: ET-FAY-10001 through ET-FAY-10100");
  console.log("   - Donor Logins: donor1@bloodbank.org to donor100@bloodbank.org");
  console.log("   - Password for all donors: donor123");
  console.log("==========================================");
}

seed100Donors()
  .catch(err => {
    console.error("Seeding error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await mainDb.$disconnect();
    await labDb.$disconnect();
  });
