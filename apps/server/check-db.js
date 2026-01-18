const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function checkData() {
  const session = driver.session();

  try {
    console.log('🔍 Checking Neo4j data...\n');

    // Count all nodes
    const allNodes = await session.run('MATCH (n) RETURN count(n) as count');
    console.log('Total nodes:', allNodes.records[0].get('count').toNumber());

    // Count users
    const users = await session.run('MATCH (u:User) RETURN count(u) as count');
    console.log('Users:', users.records[0].get('count').toNumber());

    // Count items
    const items = await session.run('MATCH (i:Item) RETURN count(i) as count');
    console.log('Items:', items.records[0].get('count').toNumber());

    // Get all users
    console.log('\n👥 Users:');
    const userList = await session.run('MATCH (u:User) RETURN u.name as name, u.email as email, u.role as role LIMIT 10');
    userList.records.forEach(record => {
      console.log('  -', record.get('name'), '(' + record.get('email') + ') -', record.get('role'));
    });

    // Get all items
    console.log('\n🏠 Items:');
    const itemList = await session.run('MATCH (i:Item) RETURN i.title as title, i.price as price LIMIT 10');
    itemList.records.forEach(record => {
      console.log('  -', record.get('title'), '-', record.get('price'), '€');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

checkData();
