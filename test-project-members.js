// Test script for project members API
import axios from 'axios';

const baseURL = 'http://localhost:15155';
const testProjectId = '4bcf84c6-983f-469a-9b39-29f653293645';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testProjectMembersAPI() {
  log.info(`Testing /api/projects/${testProjectId}/members endpoint...`);
  
  try {
    const response = await api.get(`/api/projects/${testProjectId}/members`);
    
    log.success('Project Members API - Status: ' + response.status);
    log.info('Response: ' + JSON.stringify(response.data, null, 2));
    
    // Check expected response structure
    if (Array.isArray(response.data)) {
      log.success(`Found ${response.data.length} project members`);
      
      response.data.forEach((member, index) => {
        log.info(`Member ${index + 1}:`);
        log.info(`  - User ID: ${member.userId}`);
        log.info(`  - Username: ${member.username}`);
        log.info(`  - Role: ${member.role}`);
        log.info(`  - Status: ${member.memberStatus}`);
        log.info(`  - Joined: ${member.joinedAt}`);
      });
    } else {
      log.warning('Response is not an array');
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      log.warning('API requires authentication - this is normal');
      log.info('Error details: ' + error.response.data?.message);
    } else {
      log.error('Project Members API failed:');
      console.log('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }
  }
}

async function runTests() {
  console.log('🧪 Running Project Members API Test...\n');
  
  await testProjectMembersAPI();
  console.log('');
  
  log.info('Test completed!');
  log.info('Note: If you get 401 error, that\'s expected - the API requires authentication');
}

runTests().catch(console.error);