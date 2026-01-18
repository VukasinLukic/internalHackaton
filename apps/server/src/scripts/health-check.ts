import dotenv from 'dotenv';
import path from 'path';
import { neo4jConnection } from '../infrastructure/database/neo4j/Neo4jConnection';

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkNeo4j() {
  try {
    console.log('🔍 Checking Neo4j connection...');
    await neo4jConnection.connect();

    // Test query
    const result = await neo4jConnection.executeQuery<{ count: number }>(`
      MATCH (n)
      RETURN count(n) as count
    `);

    console.log(`✅ Neo4j connected - Total nodes: ${result[0]?.count || 0}`);

    // Check users
    const users = await neo4jConnection.executeQuery<{ count: number }>(`
      MATCH (u:User)
      RETURN count(u) as count
    `);
    console.log(`   Users: ${users[0]?.count || 0}`);

    // Check items
    const items = await neo4jConnection.executeQuery<{ count: number }>(`
      MATCH (i:Item)
      RETURN count(i) as count
    `);
    console.log(`   Items: ${items[0]?.count || 0}`);

    return true;
  } catch (error: any) {
    console.error('❌ Neo4j connection failed:', error.message);
    return false;
  }
}

async function checkGemini() {
  try {
    console.log('🔍 Checking Gemini API key...');

    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️  Gemini API key not configured');
      return false;
    }

    console.log('✅ Gemini API key configured');
    return true;
  } catch (error: any) {
    console.error('❌ Gemini check failed:', error.message);
    return false;
  }
}

async function checkCloudinary() {
  try {
    console.log('🔍 Checking Cloudinary configuration...');

    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

    if (hasCloudName && hasApiKey && hasApiSecret) {
      console.log('✅ Cloudinary configured');
      return true;
    } else {
      console.log('⚠️  Cloudinary not fully configured');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Cloudinary check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('');
  console.log('🏥 ZZZimeri Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const checks = {
    neo4j: await checkNeo4j(),
    gemini: await checkGemini(),
    cloudinary: await checkCloudinary()
  };

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const allPassed = Object.values(checks).every((check) => check);

  if (allPassed) {
    console.log('✅ All checks passed!');
  } else {
    console.log('⚠️  Some checks failed. Check configuration.');
  }

  console.log('');

  await neo4jConnection.close();
  process.exit(allPassed ? 0 : 1);
}

main();
