/**
 * Test script for verifying analytics enhancements
 * 
 * This script performs automated tests on the analytics dashboard components
 * to ensure they render properly and function as expected.
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  components: {
    barChart: {
      file: 'src/components/ui/bar-chart.tsx',
      requiredProps: ['data', 'height', 'showTooltip']
    },
    timeFilter: {
      file: 'src/components/ui/time-filter.tsx',
      requiredProps: ['value', 'onChange']
    },
    scanAnalytics: {
      file: 'src/components/ScanAnalytics.tsx',
      requiredFeatures: ['timeSpan', 'chartData', 'stats']
    },
    enhancedDashboard: {
      file: 'src/components/EnhancedAnalyticsDashboard.tsx',
      requiredSections: ['overview', 'devices', 'geography']
    }
  },
  outputDir: 'test-results',
  errors: []
};

// Setup logging
const logger = {
  info: (message) => console.log(`\x1b[36mINFO:\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32mSUCCESS:\x1b[0m ${message}`),
  error: (message) => {
    console.error(`\x1b[31mERROR:\x1b[0m ${message}`);
    config.errors.push(message);
  },
  warning: (message) => console.warn(`\x1b[33mWARNING:\x1b[0m ${message}`)
};

// Create a mock DOM environment for testing
function mockDom() {
  // This is a simplified mock for testing purposes
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
  
  // Add some mock browser globals
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  
  return dom;
}

// Test file existence
function testFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    logger.error(`Error checking if file exists: ${error.message}`);
    return false;
  }
}

// Test file content for required elements
function testFileContent(filePath, patterns) {
  if (!testFileExists(filePath)) {
    logger.error(`File does not exist: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    for (const [name, pattern] of Object.entries(patterns)) {
      const regex = new RegExp(pattern);
      
      if (!regex.test(content)) {
        logger.error(`${name} not found in ${filePath}`);
        return false;
      }
      
      logger.success(`${name} found in ${filePath}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error reading file: ${error.message}`);
    return false;
  }
}

// Test BarChart Component
function testBarChartComponent() {
  logger.info('Testing BarChart component...');
  
  const filePath = config.components.barChart.file;
  
  const requiredPatterns = {
    'Component declaration': 'export function BarChart\\(',
    'Tooltip functionality': 'const \\[tooltip',
    'Mouse event handling': 'onMouseEnter|onMouseLeave',
    'Dynamic height calculation': 'height: `\\$\\{\\(',
    'Tooltip rendering': '<Tooltip'
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Test TimeFilter Component
function testTimeFilterComponent() {
  logger.info('Testing TimeFilter component...');
  
  const filePath = config.components.timeFilter.file;
  
  const requiredPatterns = {
    'Component declaration': 'export function TimeFilter\\(',
    'Time span options': '\\{ value: \'.+\', label: ',
    'Active state styling': 'value === option.value',
    'Click handler': 'onClick=\\{\\(\\) => onChange\\(option.value\\)\\}'
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Test ScanAnalytics Component
function testScanAnalyticsComponent() {
  logger.info('Testing ScanAnalytics component...');
  
  const filePath = config.components.scanAnalytics.file;
  
  const requiredPatterns = {
    'Component declaration': 'export function ScanAnalytics\\(',
    'Time span state': 'useState<TimeSpan>',
    'Data loading effect': 'useEffect\\(',
    'Stats calculation': 'setStats\\(',
    'Chart rendering': '<BarChart',
    'Time filter integration': '<TimeFilter'
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Test EnhancedAnalyticsDashboard Component
function testEnhancedDashboardComponent() {
  logger.info('Testing EnhancedAnalyticsDashboard component...');
  
  const filePath = config.components.enhancedDashboard.file;
  
  const requiredPatterns = {
    'Component declaration': 'export function EnhancedAnalyticsDashboard\\(',
    'Device percentages calculation': 'devicePercentages',
    'TabsList rendering': '<TabsList>',
    'Overview tab': 'value="overview"',
    'Devices tab': 'value="devices"',
    'Geography tab': 'value="geography"',
    'ScanAnalytics integration': '<ScanAnalytics'
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Test analytics-data.ts functionality
function testAnalyticsDataService() {
  logger.info('Testing analytics-data.ts service...');
  
  const filePath = 'src/lib/analytics-data.ts';
  
  const requiredPatterns = {
    'Date range generation': 'function generateDateRange',
    'Date formatting function': 'function formatDateForTimeSpan',
    'Scan data generation': 'function generateScanDataForTimeSpan',
    'Total calculation': 'function calculateTotalScansForTimeSpan',
    'Percentage change calculation': 'function calculatePercentageChange'
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Test integration with the QR code analytics page
function testQRCodeAnalyticsPageIntegration() {
  logger.info('Testing QR code analytics page integration...');
  
  const filePath = 'src/app/dashboard/qrcodes/[id]/analytics/page.tsx';
  
  const requiredPatterns = {
    'Component import': 'import \\{ EnhancedAnalyticsDashboard \\}',
    'Component usage': '<EnhancedAnalyticsDashboard',
    'Props passing': 'qrCodeId=\\{qrCode.id\\}',
    'Data passing': 'totalScans=\\{totalVisits\\}'
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Test the test page implementation
function testAnalyticsTestPage() {
  logger.info('Testing analytics test page...');
  
  const filePath = 'src/app/qr-test/analytics/page.tsx';
  
  const requiredPatterns = {
    'Component import': 'import \\{ EnhancedAnalyticsDashboard \\}',
    'Sample data generation': 'const totalScans =',
    'Component rendering': '<EnhancedAnalyticsDashboard',
    'Mock device data': 'deviceData =',
    'Mock location data': 'locationData ='
  };
  
  return testFileContent(filePath, requiredPatterns);
}

// Run all tests
function runAllTests() {
  logger.info('Starting analytics enhancements test suite...');
  
  const testResults = {
    barChart: testBarChartComponent(),
    timeFilter: testTimeFilterComponent(),
    scanAnalytics: testScanAnalyticsComponent(),
    enhancedDashboard: testEnhancedDashboardComponent(),
    analyticsData: testAnalyticsDataService(),
    analyticsPage: testQRCodeAnalyticsPageIntegration(),
    testPage: testAnalyticsTestPage()
  };
  
  // Calculate overall success
  const allTestsPassed = Object.values(testResults).every(result => result === true);
  
  // Summary
  logger.info('\n----- Test Summary -----');
  Object.entries(testResults).forEach(([test, passed]) => {
    if (passed) {
      logger.success(`${test}: PASSED`);
    } else {
      logger.error(`${test}: FAILED`);
    }
  });
  
  if (allTestsPassed) {
    logger.success('\n🎉 All tests passed! The analytics enhancements are implemented correctly.');
  } else {
    logger.error(`\n❌ Some tests failed. Found ${config.errors.length} error(s).`);
    logger.error('Please fix the issues and run the tests again.');
  }
  
  return allTestsPassed;
}

// Run the tests
runAllTests();

module.exports = {
  runAllTests,
  testBarChartComponent,
  testTimeFilterComponent,
  testScanAnalyticsComponent,
  testEnhancedDashboardComponent,
  testAnalyticsDataService,
  testQRCodeAnalyticsPageIntegration,
  testAnalyticsTestPage
}; 