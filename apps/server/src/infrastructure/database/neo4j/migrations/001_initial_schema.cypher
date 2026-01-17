// ============================================
// ZZZimeri Neo4j Schema - Run in Neo4j Browser
// ============================================

// --- CONSTRAINTS (Unique IDs) ---
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT item_id IF NOT EXISTS FOR (i:Item) REQUIRE i.id IS UNIQUE;
CREATE CONSTRAINT attribute_name IF NOT EXISTS FOR (a:Attribute) REQUIRE a.name IS UNIQUE;
CREATE CONSTRAINT match_id IF NOT EXISTS FOR (m:Match) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT message_id IF NOT EXISTS FOR (msg:Message) REQUIRE msg.id IS UNIQUE;

// --- INDEXES ---
CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email);
CREATE INDEX user_clerk_id IF NOT EXISTS FOR (u:User) ON (u.clerkId);
CREATE INDEX user_role IF NOT EXISTS FOR (u:User) ON (u.role);
CREATE INDEX item_status IF NOT EXISTS FOR (i:Item) ON (i.status);
CREATE INDEX item_provider IF NOT EXISTS FOR (i:Item) ON (i.providerId);
CREATE INDEX item_city IF NOT EXISTS FOR (i:Item) ON (i.city);
CREATE INDEX item_price IF NOT EXISTS FOR (i:Item) ON (i.price);
CREATE INDEX match_status IF NOT EXISTS FOR (m:Match) ON (m.status);
CREATE INDEX message_match IF NOT EXISTS FOR (msg:Message) ON (msg.matchId);

// --- FULLTEXT SEARCH (optional) ---
CREATE FULLTEXT INDEX item_search IF NOT EXISTS FOR (i:Item) ON EACH [i.title, i.description];

// --- SAMPLE DATA (for testing) ---
// Provider user
CREATE (p:User {
  id: 'provider-1',
  email: 'marko@test.com',
  name: 'Marko Marković',
  role: 'provider',
  bio: 'Organizovan i tih cimer',
  images: ['https://example.com/marko.jpg'],
  attributes: ['organized', 'quiet', 'early-bird'],
  createdAt: datetime(),
  updatedAt: datetime()
});

// Seeker user
CREATE (s:User {
  id: 'seeker-1',
  email: 'jana@test.com',
  name: 'Jana Janić',
  role: 'seeker',
  bio: 'Studentkinja, volim red',
  images: ['https://example.com/jana.jpg'],
  attributes: ['studious', 'organized', 'introvert'],
  budgetMin: 200,
  budgetMax: 400,
  preferredCity: 'Beograd',
  searchRadius: 10,
  createdAt: datetime(),
  updatedAt: datetime()
});

// Apartment
CREATE (a:Item {
  id: 'apt-1',
  providerId: 'provider-1',
  title: 'Moderna soba na Vračaru',
  description: 'Svetla soba, internet uključen',
  price: 300,
  size: 15,
  address: 'Njegoševa 50',
  city: 'Beograd',
  lat: 44.8025,
  lng: 20.4764,
  images: ['https://example.com/apt1.jpg'],
  attributes: ['modern', 'bright', 'minimalist'],
  vibes: ['quiet', 'studious'],
  status: 'active',
  createdAt: datetime(),
  updatedAt: datetime()
});

// Create relationships
MATCH (p:User {id: 'provider-1'}), (a:Item {id: 'apt-1'})
CREATE (p)-[:OWNS]->(a);

// Create Attribute nodes
MERGE (attr1:Attribute {name: 'modern'});
MERGE (attr2:Attribute {name: 'bright'});
MERGE (attr3:Attribute {name: 'minimalist'});
MERGE (attr4:Attribute {name: 'quiet'});
MERGE (attr5:Attribute {name: 'organized'});

// Link attributes to item
MATCH (a:Item {id: 'apt-1'}), (attr:Attribute {name: 'modern'})
CREATE (a)-[:HAS_ATTRIBUTE]->(attr);
MATCH (a:Item {id: 'apt-1'}), (attr:Attribute {name: 'bright'})
CREATE (a)-[:HAS_ATTRIBUTE]->(attr);
