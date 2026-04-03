/**
 * IMPT Google Ads — Budget Guard Script
 *
 * Purpose: Pauses all campaigns if daily spend hits the limit.
 * Runs every hour via Google Ads Scripts scheduler.
 *
 * HOW TO USE:
 * 1. In Google Ads → Tools → Scripts → + New Script
 * 2. Paste this entire file
 * 3. Set DAILY_BUDGET_LIMIT to your max daily spend in EUR
 * 4. Set frequency to "Every hour"
 * 5. Authorise and run
 */

var DAILY_BUDGET_LIMIT = 30.00;   // EUR — change this to your actual daily limit
var ALERT_THRESHOLD    = 0.80;    // Pause at 80% of budget
var CAMPAIGN_LABEL     = 'IMPT';  // Label applied to your IMPT campaigns in Google Ads

function main() {
  var today = new Date();
  var dateString = Utilities.formatDate(today, AdsApp.currentAccount().getTimeZone(), 'yyyyMMdd');

  var totalSpend = 0;
  var report = AdsApp.report(
    'SELECT CampaignName, Cost ' +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE LabelNames CONTAINS_ANY ["' + CAMPAIGN_LABEL + '"] ' +
    'DURING ' + dateString + ',' + dateString
  );

  var rows = report.rows();
  while (rows.hasNext()) {
    var row = rows.next();
    totalSpend += parseFloat(row['Cost']);
  }

  Logger.log('IMPT total spend today: €' + totalSpend.toFixed(2));
  Logger.log('Daily limit: €' + DAILY_BUDGET_LIMIT);

  var spendRatio = totalSpend / DAILY_BUDGET_LIMIT;

  if (spendRatio >= ALERT_THRESHOLD) {
    Logger.log('WARNING: ' + (spendRatio * 100).toFixed(0) + '% of daily budget used. Pausing campaigns.');
    pauseIMPTCampaigns();
  } else {
    Logger.log('Budget OK: ' + (spendRatio * 100).toFixed(0) + '% used. Campaigns running.');
    enableIMPTCampaigns();
  }
}

function pauseIMPTCampaigns() {
  var campaignIterator = AdsApp.campaigns()
    .withCondition('LabelNames CONTAINS_ANY ["' + CAMPAIGN_LABEL + '"]')
    .withCondition('Status = ENABLED')
    .get();

  var count = 0;
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    campaign.pause();
    Logger.log('Paused: ' + campaign.getName());
    count++;
  }
  Logger.log('Paused ' + count + ' campaign(s).');
}

function enableIMPTCampaigns() {
  // Re-enable campaigns paused by this script at start of new day
  var today = new Date();
  var hour = today.getHours();

  // Only re-enable at start of day (midnight to 1am)
  if (hour === 0) {
    var campaignIterator = AdsApp.campaigns()
      .withCondition('LabelNames CONTAINS_ANY ["' + CAMPAIGN_LABEL + '"]')
      .withCondition('Status = PAUSED')
      .get();

    var count = 0;
    while (campaignIterator.hasNext()) {
      var campaign = campaignIterator.next();
      campaign.enable();
      Logger.log('Re-enabled: ' + campaign.getName());
      count++;
    }
    Logger.log('Re-enabled ' + count + ' campaign(s) for new day.');
  }
}
