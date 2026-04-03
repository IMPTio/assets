/**
 * IMPT Google Ads — Performance Max Monitor & Controller
 *
 * Purpose: Monitors PMax campaign performance and automatically
 *          adjusts budget split between PMax and Search based on results.
 *          Also flags underperforming asset groups for review.
 *
 * HOW TO USE:
 * 1. Google Ads → Tools → Scripts → + New Script
 * 2. Paste this file
 * 3. Update PMAX_CAMPAIGN_NAME and SEARCH_CAMPAIGN_NAMES
 * 4. Set frequency: Daily
 * 5. Authorise and run
 */

var PMAX_CAMPAIGN_NAME   = 'IMPT - Performance Max';
var SEARCH_CAMPAIGN_NAMES = [
  'IMPT - Brand',
  'IMPT - Carbon Offset Booking',
  'IMPT - Hotel Booking Generic',
  'IMPT - Competitor Conquest'
];
var REMARKETING_CAMPAIGN  = 'IMPT - Remarketing';
var YOUTUBE_CAMPAIGN      = 'IMPT - YouTube';

var TOTAL_DAILY_BUDGET    = 500.00;  // EUR
var TARGET_ROAS           = 4.0;     // 400% — €4 revenue per €1 spent
var TARGET_CPA            = 10.00;   // EUR per booking
var MIN_ROAS_THRESHOLD    = 2.0;     // Below this = reduce PMax budget
var REPORT_EMAIL          = 'your@email.com'; // Replace with your email

function main() {
  var report = getPerformanceReport();
  adjustBudgets(report);
  sendAlerts(report);
  Logger.log(JSON.stringify(report, null, 2));
}

function getPerformanceReport() {
  var tz = AdsApp.currentAccount().getTimeZone();
  var last7 = getLookbackDateRange(7);
  var yesterday = getYesterdayRange();

  var report = {
    date: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'),
    campaigns: {},
    totalSpend: 0,
    totalConversions: 0,
    totalConversionValue: 0,
    alerts: []
  };

  var allCampaigns = [PMAX_CAMPAIGN_NAME, REMARKETING_CAMPAIGN, YOUTUBE_CAMPAIGN]
    .concat(SEARCH_CAMPAIGN_NAMES);

  allCampaigns.forEach(function(campaignName) {
    var data = getCampaignStats(campaignName, last7);
    report.campaigns[campaignName] = data;
    report.totalSpend          += data.cost;
    report.totalConversions    += data.conversions;
    report.totalConversionValue += data.conversionValue;
  });

  report.overallROAS = report.totalSpend > 0
    ? (report.totalConversionValue / report.totalSpend).toFixed(2)
    : 0;
  report.overallCPA = report.totalConversions > 0
    ? (report.totalSpend / report.totalConversions).toFixed(2)
    : 'N/A';

  return report;
}

function getCampaignStats(campaignName, dateRange) {
  var stats = {cost: 0, clicks: 0, impressions: 0, conversions: 0, conversionValue: 0, roas: 0, cpa: 0};

  try {
    var iterator = AdsApp.campaigns()
      .withCondition('Name = "' + campaignName + '"')
      .forDateRange(dateRange)
      .get();

    if (iterator.hasNext()) {
      var campaign = iterator.next();
      var s = campaign.getStatsFor(dateRange);
      stats.cost            = s.getCost();
      stats.clicks          = s.getClicks();
      stats.impressions     = s.getImpressions();
      stats.conversions     = s.getConversions();
      stats.conversionValue = s.getConversionValue();
      stats.roas            = stats.cost > 0 ? stats.conversionValue / stats.cost : 0;
      stats.cpa             = stats.conversions > 0 ? stats.cost / stats.conversions : 0;
    }
  } catch(e) {
    Logger.log('Error fetching stats for ' + campaignName + ': ' + e);
  }

  return stats;
}

function adjustBudgets(report) {
  var pmaxData = report.campaigns[PMAX_CAMPAIGN_NAME];

  if (!pmaxData || pmaxData.conversions < 5) {
    Logger.log('PMax: Not enough data yet to adjust budgets. Need 5+ conversions.');
    return;
  }

  var pmaxROAS = pmaxData.roas;
  Logger.log('PMax ROAS (7 day): ' + pmaxROAS.toFixed(2) + 'x vs target ' + TARGET_ROAS + 'x');

  if (pmaxROAS < MIN_ROAS_THRESHOLD) {
    // PMax underperforming — shift budget to Search
    Logger.log('PMax ROAS below threshold. Reducing PMax budget, boosting Search.');
    setCampaignBudget(PMAX_CAMPAIGN_NAME, 80);   // Drop from 150 to 80
    setCampaignBudget('IMPT - Carbon Offset Booking', 130); // Boost Search
    report.alerts.push('WARNING: PMax ROAS is ' + pmaxROAS.toFixed(2) + 'x — below ' + MIN_ROAS_THRESHOLD + 'x minimum. Budget shifted to Search campaigns.');
  } else if (pmaxROAS > TARGET_ROAS * 1.5) {
    // PMax crushing it — give it more budget
    Logger.log('PMax ROAS excellent. Increasing PMax budget.');
    setCampaignBudget(PMAX_CAMPAIGN_NAME, 200);  // Boost from 150 to 200
    report.alerts.push('GREAT: PMax ROAS is ' + pmaxROAS.toFixed(2) + 'x — budget increased to €200/day.');
  } else {
    Logger.log('PMax performing within target range. No budget changes needed.');
  }
}

function setCampaignBudget(campaignName, dailyBudget) {
  var iterator = AdsApp.campaigns()
    .withCondition('Name = "' + campaignName + '"')
    .get();

  if (iterator.hasNext()) {
    var campaign = iterator.next();
    campaign.getBudget().setAmount(dailyBudget);
    Logger.log('Set budget for "' + campaignName + '" to €' + dailyBudget + '/day');
  }
}

function sendAlerts(report) {
  if (report.alerts.length === 0 && parseFloat(report.overallROAS) >= TARGET_ROAS) {
    Logger.log('All systems normal. No alerts.');
    return;
  }

  var subject = 'IMPT Ads Alert — ' + report.date;
  var body = '<h2>IMPT Google Ads — Performance Alert</h2>';
  body += '<p><strong>Overall ROAS (7 day):</strong> ' + report.overallROAS + 'x</p>';
  body += '<p><strong>Overall CPA:</strong> €' + report.overallCPA + '</p>';
  body += '<p><strong>Total Spend (7 day):</strong> €' + report.totalSpend.toFixed(2) + '</p>';
  body += '<p><strong>Total Conversions:</strong> ' + report.totalConversions + '</p>';

  if (report.alerts.length > 0) {
    body += '<h3>Alerts</h3><ul>';
    report.alerts.forEach(function(alert) {
      body += '<li>' + alert + '</li>';
    });
    body += '</ul>';
  }

  body += '<h3>Campaign Breakdown</h3>';
  body += '<table border="1" cellpadding="6" style="border-collapse:collapse;">';
  body += '<tr style="background:#1a73e8;color:white;"><th>Campaign</th><th>Spend</th><th>Clicks</th><th>Conv</th><th>ROAS</th><th>CPA</th></tr>';

  Object.keys(report.campaigns).forEach(function(name) {
    var c = report.campaigns[name];
    var roasColor = c.roas < MIN_ROAS_THRESHOLD ? 'red' : c.roas > TARGET_ROAS ? 'green' : 'orange';
    body += '<tr>';
    body += '<td>' + name + '</td>';
    body += '<td>€' + c.cost.toFixed(2) + '</td>';
    body += '<td>' + c.clicks + '</td>';
    body += '<td>' + c.conversions + '</td>';
    body += '<td style="color:' + roasColor + ';">' + c.roas.toFixed(2) + 'x</td>';
    body += '<td>€' + c.cpa.toFixed(2) + '</td>';
    body += '</tr>';
  });

  body += '</table>';

  MailApp.sendEmail(REPORT_EMAIL, subject, '', {htmlBody: body});
}

function getLookbackDateRange(days) {
  var end = new Date();
  end.setDate(end.getDate() - 1);
  var start = new Date();
  start.setDate(start.getDate() - days);
  var tz = AdsApp.currentAccount().getTimeZone();
  return Utilities.formatDate(start, tz, 'yyyyMMdd') +
    ',' + Utilities.formatDate(end, tz, 'yyyyMMdd');
}

function getYesterdayRange() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  var s = Utilities.formatDate(d, AdsApp.currentAccount().getTimeZone(), 'yyyyMMdd');
  return s + ',' + s;
}
