/**
 * Analytics Dashboard Component Test Script
 * 
 * This script tests:
 * 1. Proper rendering of the Analytics Dashboard component
 * 2. Tab navigation functionality with React event handlers
 * 3. Content switching between standard analytics and Swiss engagement view
 * 
 * To run this test:
 * - Execute from the browser console on the homepage
 * - Ensure the page is correctly loading all components
 */

// Utility function to log with styling
const log = (message, type = 'info') => {
  const styles = {
    info: 'color: #3b82f6; font-weight: bold;',
    success: 'color: #10b981; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    warning: 'color: #f59e0b; font-weight: bold;',
    header: 'color: #8b5cf6; font-weight: bold; font-size: 14px;'
  };
  
  console.log(`%c${message}`, styles[type] || styles.info);
};

// Test dashboard component existence
const testDashboardExists = () => {
  log('TESTING DASHBOARD COMPONENT EXISTENCE', 'header');
  
  // Find the analytics dashboard container
  const dashboardContainer = document.querySelector('.analytics-section .bg-white.border.rounded-lg.shadow-sm');
  if (!dashboardContainer) {
    log('Analytics Dashboard container not found', 'error');
    return false;
  }
  
  log('Analytics Dashboard container found', 'success');
  
  // Check if dashboard title exists
  const dashboardTitle = dashboardContainer.querySelector('h2');
  if (!dashboardTitle || !dashboardTitle.textContent.includes('Analytics Dashboard')) {
    log('Dashboard title not found or incorrect', 'error');
    return false;
  }
  
  log(`Dashboard title found: "${dashboardTitle.textContent}"`, 'success');
  
  return true;
};

// Test navigation tabs existence and accessibility
const testNavigationTabs = () => {
  log('TESTING NAVIGATION TABS', 'header');
  
  // Find the tab buttons
  const tabButtons = document.querySelectorAll('[role="tab"]');
  if (!tabButtons || tabButtons.length < 2) {
    log('Navigation tabs not found or insufficient number', 'error');
    return false;
  }
  
  log(`Found ${tabButtons.length} navigation tabs`, 'success');
  
  // Check tab labels
  const standardTab = Array.from(tabButtons).find(tab => 
    tab.textContent.includes('Analytics Overview') || 
    tab.getAttribute('value') === 'standard'
  );
  
  const swissTab = Array.from(tabButtons).find(tab => 
    tab.textContent.includes('Swiss Engagement') || 
    tab.getAttribute('value') === 'swiss'
  );
  
  if (!standardTab) {
    log('Standard analytics tab not found', 'error');
    return false;
  }
  
  if (!swissTab) {
    log('Swiss engagement tab not found', 'error');
    return false;
  }
  
  log('Both navigation tabs found with correct labels', 'success');
  
  // Check tab accessibility
  const hasTabRole = standardTab.getAttribute('role') === 'tab' && swissTab.getAttribute('role') === 'tab';
  const hasAriaSelected = standardTab.hasAttribute('aria-selected') && swissTab.hasAttribute('aria-selected');
  
  if (!hasTabRole) {
    log('Tabs missing proper role="tab" attribute', 'warning');
  }
  
  if (!hasAriaSelected) {
    log('Tabs missing aria-selected attribute', 'warning');
  }
  
  return true;
};

// Test tab navigation functionality
const testTabNavigation = async () => {
  log('TESTING TAB NAVIGATION FUNCTIONALITY', 'header');
  
  // Find the tab buttons
  const tabButtons = document.querySelectorAll('[role="tab"]');
  if (tabButtons.length < 2) return false;
  
  const standardTab = Array.from(tabButtons).find(tab => 
    tab.textContent.includes('Analytics Overview') || 
    tab.getAttribute('value') === 'standard'
  );
  
  const swissTab = Array.from(tabButtons).find(tab => 
    tab.textContent.includes('Swiss Engagement') || 
    tab.getAttribute('value') === 'swiss'
  );
  
  if (!standardTab || !swissTab) return false;
  
  // Initial state check (standard view should be active by default)
  const initialActiveTab = document.querySelector('[role="tab"][aria-selected="true"]');
  const isStandardInitiallyActive = initialActiveTab && (
    initialActiveTab.textContent.includes('Analytics Overview') || 
    initialActiveTab.getAttribute('value') === 'standard'
  );
  
  log(`Standard view initially active: ${isStandardInitiallyActive ? 'YES' : 'NO'}`, 
    isStandardInitiallyActive ? 'success' : 'warning');
  
  // Check initial content visibility
  const standardContent = document.querySelector('.analytics-section .space-y-6');
  const hasInitialScanActivity = standardContent && 
    standardContent.querySelector('h3') && 
    standardContent.querySelector('h3').textContent.includes('Scan Activity');
  
  log(`Standard view content visible: ${hasInitialScanActivity ? 'YES' : 'NO'}`, 
    hasInitialScanActivity ? 'success' : 'error');
  
  // Click Swiss tab
  log('Clicking Swiss Engagement tab...', 'info');
  swissTab.click();
  
  // Allow time for state update
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if Swiss tab is now active
  const newActiveTab = document.querySelector('[role="tab"][aria-selected="true"]');
  const isSwissActive = newActiveTab && (
    newActiveTab.textContent.includes('Swiss Engagement') || 
    newActiveTab.getAttribute('value') === 'swiss'
  );
  
  log(`Swiss view active after click: ${isSwissActive ? 'YES' : 'NO'}`, 
    isSwissActive ? 'success' : 'error');
  
  // Check for Swiss content
  const swissContent = document.querySelector('.analytics-section .space-y-6');
  const hasEngagementMetrics = swissContent && 
    swissContent.querySelector('h3') && 
    swissContent.querySelector('h3').textContent.includes('Engagement Metrics');
  
  log(`Swiss view content visible: ${hasEngagementMetrics ? 'YES' : 'NO'}`, 
    hasEngagementMetrics ? 'success' : 'error');
  
  // Click back to standard tab
  log('Clicking back to Analytics Overview tab...', 'info');
  standardTab.click();
  
  // Allow time for state update
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if standard tab is active again
  const finalActiveTab = document.querySelector('[role="tab"][aria-selected="true"]');
  const isStandardActive = finalActiveTab && (
    finalActiveTab.textContent.includes('Analytics Overview') || 
    finalActiveTab.getAttribute('value') === 'standard'
  );
  
  log(`Standard view active again: ${isStandardActive ? 'YES' : 'NO'}`, 
    isStandardActive ? 'success' : 'error');
  
  // Check if standard content is visible again
  const finalContent = document.querySelector('.analytics-section .space-y-6');
  const hasScanActivity = finalContent && 
    finalContent.querySelector('h3') && 
    finalContent.querySelector('h3').textContent.includes('Scan Activity');
  
  log(`Standard view content visible again: ${hasScanActivity ? 'YES' : 'NO'}`, 
    hasScanActivity ? 'success' : 'error');
  
  return isSwissActive && hasEngagementMetrics && isStandardActive && hasScanActivity;
};

// Test chart rendering
const testChartRendering = () => {
  log('TESTING CHART RENDERING', 'header');
  
  // Check for Recharts components
  const chartContainers = document.querySelectorAll('.recharts-responsive-container');
  if (!chartContainers || chartContainers.length === 0) {
    log('No chart containers found', 'error');
    return false;
  }
  
  log(`Found ${chartContainers.length} chart container(s)`, 'success');
  
  // Check for chart elements (lines, axes, etc.)
  const chartElements = document.querySelectorAll('.recharts-layer');
  if (!chartElements || chartElements.length === 0) {
    log('No chart elements found within containers', 'error');
    return false;
  }
  
  log(`Found ${chartElements.length} chart elements`, 'success');
  
  // Check for axis labels
  const axisLabels = document.querySelectorAll('.recharts-cartesian-axis-tick-value');
  if (!axisLabels || axisLabels.length === 0) {
    log('No axis labels found', 'warning');
  } else {
    log(`Found ${axisLabels.length} axis labels`, 'success');
  }
  
  return chartContainers.length > 0 && chartElements.length > 0;
};

// Main test function
const runTests = async () => {
  log('STARTING ANALYTICS DASHBOARD TESTS', 'header');
  
  const dashboardExistsTest = testDashboardExists();
  log(`Dashboard existence test: ${dashboardExistsTest ? 'PASSED' : 'FAILED'}`, 
    dashboardExistsTest ? 'success' : 'error');
  
  if (!dashboardExistsTest) {
    log('Cannot continue testing without dashboard component', 'error');
    return false;
  }
  
  const navigationTabsTest = testNavigationTabs();
  log(`Navigation tabs test: ${navigationTabsTest ? 'PASSED' : 'FAILED'}`, 
    navigationTabsTest ? 'success' : 'error');
  
  const tabNavigationTest = await testTabNavigation();
  log(`Tab navigation functionality test: ${tabNavigationTest ? 'PASSED' : 'FAILED'}`, 
    tabNavigationTest ? 'success' : 'error');
  
  const chartRenderingTest = testChartRendering();
  log(`Chart rendering test: ${chartRenderingTest ? 'PASSED' : 'FAILED'}`, 
    chartRenderingTest ? 'success' : 'error');
  
  const allPassed = dashboardExistsTest && navigationTabsTest && tabNavigationTest && chartRenderingTest;
  
  log('=============================================', 'header');
  log(`OVERALL TEST RESULT: ${allPassed ? 'PASSED' : 'FAILED'}`, allPassed ? 'success' : 'error');
  log('=============================================', 'header');
  
  return allPassed;
};

// Execute tests
runTests().then(result => {
  console.log(`Test completed with result: ${result ? 'Success' : 'Failure'}`);
}); 