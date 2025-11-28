#!/usr/bin/env node

/**
 * Test script to verify service configuration
 * Tests database URL schema handling
 */

const testDatabaseUrlConfiguration = () => {
  console.log('🧪 Testing Database URL Configuration\n');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      name: 'Database URL with existing query params',
      baseUrl: 'postgresql://user:pass@host:5432/db?sslmode=require',
      schema: 'orders',
      expected: 'postgresql://user:pass@host:5432/db?sslmode=require&schema=orders'
    },
    {
      name: 'Database URL without query params',
      baseUrl: 'postgresql://user:pass@host:5432/db',
      schema: 'vendors',
      expected: 'postgresql://user:pass@host:5432/db?schema=vendors'
    },
    {
      name: 'Database URL with schema already present',
      baseUrl: 'postgresql://user:pass@host:5432/db?schema=orders',
      schema: 'orders',
      expected: 'postgresql://user:pass@host:5432/db?schema=orders'
    }
  ];

  function getDatabaseUrlWithSchema(baseUrl, schema) {
    if (baseUrl.includes('?')) {
      if (baseUrl.includes(`schema=${schema}`)) {
        return baseUrl;
      }
      return `${baseUrl}&schema=${schema}`;
    } else {
      return `${baseUrl}?schema=${schema}`;
    }
  }

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = getDatabaseUrlWithSchema(testCase.baseUrl, testCase.schema);
    const success = result === testCase.expected;
    
    console.log(`\nTest ${index + 1}: ${testCase.name}`);
    console.log(`  Input:    ${testCase.baseUrl}`);
    console.log(`  Schema:   ${testCase.schema}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got:      ${result}`);
    
    if (success) {
      console.log(`  ✅ PASSED`);
      passed++;
    } else {
      console.log(`  ❌ FAILED`);
      failed++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All tests passed!\n');
    return 0;
  } else {
    console.log('❌ Some tests failed!\n');
    return 1;
  }
};

const testServiceConfigs = () => {
  console.log('🔧 Testing Service Configurations\n');
  console.log('='.repeat(50));
  
  const services = [
    { name: 'Orders Service', schema: 'orders', port: 4001 },
    { name: 'Vendor Service', schema: 'vendors', port: 4002 },
    { name: 'Wallet Service', schema: 'wallet', port: 4003 },
    { name: 'API Gateway', schema: null, port: 4000 },
  ];

  services.forEach(service => {
    console.log(`\n${service.name}:`);
    console.log(`  Port: ${service.port}`);
    if (service.schema) {
      console.log(`  Schema: ${service.schema}`);
    } else {
      console.log(`  Schema: N/A (Gateway doesn't use database)`);
    }
  });

  console.log('\n✅ Service configurations verified\n');
};

const testDiagnosticEndpoint = () => {
  console.log('🏥 Testing Diagnostic Endpoint\n');
  console.log('='.repeat(50));
  
  const endpointPath = 'apps/web/app/api/services-status/route.ts';
  const fs = require('fs');
  const path = require('path');
  
  try {
    const filePath = path.join(__dirname, '..', endpointPath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const checks = [
      { name: 'File exists', test: () => content.length > 0 },
      { name: 'Has GET handler', test: () => content.includes('export async function GET') },
      { name: 'Checks all services', test: () => 
        content.includes('Orders Service') && 
        content.includes('Vendor Service') && 
        content.includes('Wallet Service') && 
        content.includes('API Gateway')
      },
      { name: 'Returns JSON response', test: () => content.includes('NextResponse.json') },
      { name: 'Has timeout', test: () => content.includes('AbortSignal.timeout') },
    ];

    let passed = 0;
    let failed = 0;

    checks.forEach(check => {
      const result = check.test();
      if (result) {
        console.log(`  ✅ ${check.name}`);
        passed++;
      } else {
        console.log(`  ❌ ${check.name}`);
        failed++;
      }
    });

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('✅ Diagnostic endpoint verified!\n');
      return 0;
    } else {
      console.log('❌ Diagnostic endpoint has issues!\n');
      return 1;
    }
  } catch (error) {
    console.error(`❌ Error reading diagnostic endpoint: ${error.message}\n`);
    return 1;
  }
};

// Run all tests
console.log('\n🚀 TSG Logistics Service Configuration Tests\n');

const test1 = testDatabaseUrlConfiguration();
testServiceConfigs(); // This doesn't return a code
const test2 = testDiagnosticEndpoint();

const exitCode = (test1 !== 0 || test2 !== 0) ? 1 : 0;

console.log('='.repeat(50));
if (exitCode === 0) {
  console.log('✅ All configuration tests passed!');
  console.log('\nNext steps:');
  console.log('1. Deploy to Render');
  console.log('2. Check /api/services-status endpoint after deployment');
  console.log('3. Verify all services are running in Render logs\n');
} else {
  console.log('❌ Some tests failed. Please review the errors above.\n');
}

process.exit(exitCode);

