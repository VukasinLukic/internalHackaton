import dotenv from 'dotenv';
import path from 'path';
import { neo4jConnection } from '../infrastructure/database/neo4j/Neo4jConnection';
import { container } from '../container/Container';

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface SeedUser {
  email: string;
  name: string;
  role: 'provider' | 'seeker';
  bio: string;
  images: string[];
  attributes: string[];
  preferences?: any;
}

interface SeedItem {
  providerId: string;
  title: string;
  description: string;
  price: number;
  size: number;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  images: string[];
  attributes: string[];
  vibes: string[];
}

const seedUsers: SeedUser[] = [
  // Providers (landlords/roommates)
  {
    email: 'marko.petrovic@test.com',
    name: 'Marko Petrović',
    role: 'provider',
    bio: 'Organizovan i tih cimer, volim red i čistoću',
    images: ['https://i.pravatar.cc/300?img=12'],
    attributes: ['organized', 'quiet', 'early-bird', 'clean']
  },
  {
    email: 'ana.jovanovic@test.com',
    name: 'Ana Jovanović',
    role: 'provider',
    bio: 'Student medicine, studiozna ali volim i da se zabavim vikendom',
    images: ['https://i.pravatar.cc/300?img=5'],
    attributes: ['studious', 'social', 'party-friendly', 'ambivert']
  },
  {
    email: 'nikola.nikolic@test.com',
    name: 'Nikola Nikolić',
    role: 'provider',
    bio: 'Freelance developer, radim od kuće, imam mačku',
    images: ['https://i.pravatar.cc/300?img=33'],
    attributes: ['introvert', 'pet-lover', 'gamer', 'night-owl']
  },

  // Seekers (looking for apartments)
  {
    email: 'jana.janic@test.com',
    name: 'Jana Janić',
    role: 'seeker',
    bio: 'Studentkinja arhitekture, volim red i svetle prostore',
    images: ['https://i.pravatar.cc/300?img=1'],
    attributes: ['studious', 'organized', 'introvert', 'early-bird'],
    preferences: {
      budget: { min: 200, max: 400 },
      location: { city: 'Beograd', radius: 10, lat: 44.7866, lng: 20.4489 },
      lifestyle: {
        smoker: false,
        pets: true,
        earlyBird: true,
        cleanliness: 5
      },
      moveInDate: '2024-03-01'
    }
  },
  {
    email: 'milan.milanovic@test.com',
    name: 'Milan Milanović',
    role: 'seeker',
    bio: 'Radim u startupu, aktivan, volim druženje',
    images: ['https://i.pravatar.cc/300?img=13'],
    attributes: ['social', 'extrovert', 'fitness', 'party-animal'],
    preferences: {
      budget: { min: 250, max: 500 },
      location: { city: 'Beograd', radius: 15, lat: 44.8125, lng: 20.4612 },
      lifestyle: {
        smoker: false,
        pets: false,
        earlyBird: false,
        cleanliness: 3
      },
      moveInDate: '2024-04-01'
    }
  },
  {
    email: 'sara.saric@test.com',
    name: 'Sara Sarić',
    role: 'seeker',
    bio: 'Grafički dizajner, kreativna osoba, volim umetnost i kafu',
    images: ['https://i.pravatar.cc/300?img=9'],
    attributes: ['artistic', 'introvert', 'chill', 'coffee-lover'],
    preferences: {
      budget: { min: 200, max: 450 },
      location: { city: 'Beograd', radius: 12, lat: 44.8176, lng: 20.4633 },
      lifestyle: {
        smoker: false,
        pets: true,
        earlyBird: false,
        cleanliness: 4
      },
      moveInDate: '2024-05-01'
    }
  }
];

const seedItems: SeedItem[] = [
  {
    providerId: 'marko.petrovic@test.com', // Will be replaced with actual ID
    title: 'Moderna soba na Vračaru',
    description: 'Svetla soba u trosobnom stanu, internet uključen, blizu fakulteta',
    price: 300,
    size: 15,
    location: {
      address: 'Njegoševa 50',
      city: 'Beograd',
      lat: 44.8025,
      lng: 20.4764
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800'
    ],
    attributes: ['modern', 'bright', 'minimalist', 'clean'],
    vibes: ['quiet', 'studious', 'organized']
  },
  {
    providerId: 'ana.jovanovic@test.com',
    title: 'Prostrana soba u Dorćolu',
    description: 'Dve sobe u centru grada, blizu kafića i restorana',
    price: 350,
    size: 18,
    location: {
      address: 'Kralja Petra 24',
      city: 'Beograd',
      lat: 44.8186,
      lng: 20.4582
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800'
    ],
    attributes: ['spacious', 'modern', 'cozy', 'bright'],
    vibes: ['social', 'party-friendly', 'chill']
  },
  {
    providerId: 'nikola.nikolic@test.com',
    title: 'Gaming-friendly soba na NBG',
    description: 'Soba sa gaming setupom, brz internet, tiho okruženje',
    price: 280,
    size: 14,
    location: {
      address: 'Bulevar kralja Aleksandra 120',
      city: 'Beograd',
      lat: 44.7866,
      lng: 20.4956
    },
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=800'
    ],
    attributes: ['modern', 'gaming-setup', 'quiet', 'dark'],
    vibes: ['quiet', 'gamer', 'night-owl']
  }
];

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  await neo4jConnection.executeWrite(`
    MATCH (n)
    DETACH DELETE n
  `);

  console.log('✅ Database cleared');
}

async function createConstraints() {
  console.log('🔧 Creating constraints...');

  const constraints = [
    'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
    'CREATE CONSTRAINT item_id IF NOT EXISTS FOR (i:Item) REQUIRE i.id IS UNIQUE',
    'CREATE CONSTRAINT interaction_id IF NOT EXISTS FOR (int:Interaction) REQUIRE int.id IS UNIQUE',
    'CREATE CONSTRAINT match_id IF NOT EXISTS FOR (m:Match) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT message_id IF NOT EXISTS FOR (msg:Message) REQUIRE msg.id IS UNIQUE',
    'CREATE CONSTRAINT attribute_name IF NOT EXISTS FOR (a:Attribute) REQUIRE a.name IS UNIQUE'
  ];

  for (const constraint of constraints) {
    try {
      await neo4jConnection.executeWrite(constraint);
    } catch (error: any) {
      // Constraint might already exist, ignore
      if (!error.message.includes('already exists')) {
        console.error(`Error creating constraint: ${error.message}`);
      }
    }
  }

  console.log('✅ Constraints created');
}

async function createIndexes() {
  console.log('📊 Creating indexes...');

  const indexes = [
    'CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email)',
    'CREATE INDEX user_role IF NOT EXISTS FOR (u:User) ON (u.role)',
    'CREATE INDEX item_status IF NOT EXISTS FOR (i:Item) ON (i.status)',
    'CREATE INDEX item_city IF NOT EXISTS FOR (i:Item) ON (i.city)',
    'CREATE INDEX item_price IF NOT EXISTS FOR (i:Item) ON (i.price)'
  ];

  for (const index of indexes) {
    try {
      await neo4jConnection.executeWrite(index);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.error(`Error creating index: ${error.message}`);
      }
    }
  }

  console.log('✅ Indexes created');
}

async function seedData() {
  console.log('🌱 Seeding data...');

  // Initialize container
  await container.initialize();

  const userIdMap = new Map<string, string>();

  // Create users
  console.log('👥 Creating users...');
  for (const userData of seedUsers) {
    const user = await container.userRepository.create({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      bio: userData.bio,
      images: userData.images,
      attributes: userData.attributes,
      clerkId: `seed_${userData.email}`, // Dummy clerk ID for seed data
      createdAt: new Date(),
      updatedAt: new Date()
    });

    userIdMap.set(userData.email, user.id);

    // Update preferences for seekers
    if (userData.preferences && userData.role === 'seeker') {
      await container.userRepository.updatePreferences(user.id, userData.preferences);
    }

    console.log(`  ✓ Created user: ${user.name} (${user.role})`);
  }

  // Create items
  console.log('🏠 Creating items...');
  for (const itemData of seedItems) {
    const providerId = userIdMap.get(itemData.providerId);
    if (!providerId) {
      console.error(`  ✗ Provider not found: ${itemData.providerId}`);
      continue;
    }

    const item = await container.itemRepository.create({
      providerId,
      title: itemData.title,
      description: itemData.description,
      price: itemData.price,
      size: itemData.size,
      location: itemData.location,
      images: itemData.images,
      attributes: itemData.attributes,
      vibes: itemData.vibes,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`  ✓ Created item: ${item.title}`);
  }

  console.log('✅ Data seeded successfully');
}

async function main() {
  try {
    console.log('');
    console.log('🚀 ZZZimeri Database Seeding');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Connect to Neo4j
    await neo4jConnection.connect();

    // Clear existing data
    await clearDatabase();

    // Create constraints and indexes
    await createConstraints();
    await createIndexes();

    // Seed data
    await seedData();

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seeding completed successfully!');
    console.log('');

    await neo4jConnection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await neo4jConnection.close();
    process.exit(1);
  }
}

main();
