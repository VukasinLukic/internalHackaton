const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function createTestInteractions() {
  const session = driver.session();

  try {
    console.log('🔗 Creating test interactions and matches...\n');

    // Create interactions - Jana likes Moderna soba
    await session.run(`
      MATCH (u:User {email: 'jana.janic@test.com'})
      MATCH (i:Item {title: 'Moderna soba na Vračaru'})
      CREATE (u)-[:INTERACTED_WITH {type: 'like', createdAt: datetime()}]->(i)
    `);
    console.log('✓ Jana liked Moderna soba');

    // Milan likes Prostrana soba
    await session.run(`
      MATCH (u:User {email: 'milan.milanovic@test.com'})
      MATCH (i:Item {title: 'Prostrana soba u Dorćolu'})
      CREATE (u)-[:INTERACTED_WITH {type: 'like', createdAt: datetime()}]->(i)
    `);
    console.log('✓ Milan liked Prostrana soba');

    // Sara likes Gaming-friendly soba
    await session.run(`
      MATCH (u:User {email: 'sara.saric@test.com'})
      MATCH (i:Item {title: 'Gaming-friendly soba na NBG'})
      CREATE (u)-[:INTERACTED_WITH {type: 'super_like', createdAt: datetime()}]->(i)
    `);
    console.log('✓ Sara super-liked Gaming soba');

    // Create matches
    await session.run(`
      MATCH (seeker:User {email: 'jana.janic@test.com'})
      MATCH (provider:User {email: 'marko.petrovic@test.com'})
      MATCH (item:Item {title: 'Moderna soba na Vračaru'})
      CREATE (seeker)-[:MATCHED_WITH {
        status: 'pending',
        score: 85,
        createdAt: datetime(),
        itemId: item.id
      }]->(provider)
    `);
    console.log('✓ Match created: Jana ↔ Marko (Moderna soba)');

    await session.run(`
      MATCH (seeker:User {email: 'milan.milanovic@test.com'})
      MATCH (provider:User {email: 'ana.jovanovic@test.com'})
      MATCH (item:Item {title: 'Prostrana soba u Dorćolu'})
      CREATE (seeker)-[:MATCHED_WITH {
        status: 'accepted',
        score: 92,
        createdAt: datetime(),
        itemId: item.id
      }]->(provider)
    `);
    console.log('✓ Match created: Milan ↔ Ana (Prostrana soba) - ACCEPTED');

    await session.run(`
      MATCH (seeker:User {email: 'sara.saric@test.com'})
      MATCH (provider:User {email: 'nikola.nikolic@test.com'})
      MATCH (item:Item {title: 'Gaming-friendly soba na NBG'})
      CREATE (seeker)-[:MATCHED_WITH {
        status: 'pending',
        score: 88,
        createdAt: datetime(),
        itemId: item.id
      }]->(provider)
    `);
    console.log('✓ Match created: Sara ↔ Nikola (Gaming soba)');

    // Create provider -> item relationships
    await session.run(`
      MATCH (u:User {email: 'marko.petrovic@test.com'})
      MATCH (i:Item {title: 'Moderna soba na Vračaru'})
      CREATE (u)-[:OWNS]->(i)
    `);
    console.log('✓ Marko owns Moderna soba');

    await session.run(`
      MATCH (u:User {email: 'ana.jovanovic@test.com'})
      MATCH (i:Item {title: 'Prostrana soba u Dorćolu'})
      CREATE (u)-[:OWNS]->(i)
    `);
    console.log('✓ Ana owns Prostrana soba');

    await session.run(`
      MATCH (u:User {email: 'nikola.nikolic@test.com'})
      MATCH (i:Item {title: 'Gaming-friendly soba na NBG'})
      CREATE (u)-[:OWNS]->(i)
    `);
    console.log('✓ Nikola owns Gaming soba');

    console.log('\n✅ Test interactions and matches created!\n');

    // Show summary
    const summary = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) as relationship, count(r) as count
    `);

    console.log('📊 Relationship Summary:');
    summary.records.forEach(record => {
      console.log(`  ${record.get('relationship')}: ${record.get('count').toNumber()}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

createTestInteractions();
