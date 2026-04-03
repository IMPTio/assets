/**
 * IMPT Google Ads — Keyword Bid Optimizer Script
 *
 * Purpose: Automatically raises bids on converting keywords,
 *          lowers bids on wasted spend keywords.
 *          Keeps cost per conversion low.
 *
 * HOW TO USE:
 * 1. In Google Ads → Tools → Scripts → + New Script
 * 2. Paste this entire file
 * 3. Adjust TARGET_CPA to your desired cost per conversion in EUR
 * 4. Set frequency to "Daily"
 * 5. Authorise and run
 *
 * IMPORTANT: Run this only after you have at least 2 weeks of data.
 */

var TARGET_CPA        = 5.00;   // EUR — your target cost per hotel booking conversion
var MAX_BID           = 2.50;   // EUR — never bid more than this per click
var MIN_BID           = 0.10;   // EUR — never bid less than this
var LOOKBACK_DAYS     = 14;     // Days of data to analyse
var MIN_CLICKS        = 10;     // Ignore keywords with fewer clicks (not enough data)
var CAMPAIGN_LABEL    = 'IMPT'; // Label on your IMPT campaigns

function main() {
  var dateRange = getLookbackDateRange(LOOKBACK_DAYS);
  Logger.log('Analysing keyword performance: ' + dateRange);

  var report = AdsApp.report(
    'SELECT AdGroupName, Criteria, Clicks, Conversions, Cost, CpcBid, AverageCpc ' +
    'FROM KEYWORDS_PERFORMANCE_REPORT ' +
    'WHERE LabelNames CONTAINS_ANY ["' + CAMPAIGN_LABEL + '"] ' +
    'AND Status = ENABLED ' +
    'AND AdGroupStatus = ENABLED ' +
    'AND CampaignStatus = ENABLED ' +
    'DURING ' + dateRange
  );

  var rows = report.rows();
  var adjusted = 0;
  var paused = 0;

  while (rows.hasNext()) {
    var row = rows.next();
    var clicks      = parseInt(row['Clicks']);
    var conversions = parseFloat(row['Conversions']);
    var cost        = parseFloat(row['Cost']);
    var currentBid  = parseFloat(row['CpcBid']);
    var keyword     = row['Criteria'];
    var adGroup     = row['AdGroupName'];

    if (clicks < MIN_CLICKS) {
      Logger.log('Skipping (low data): [' + keyword + '] — ' + clicks + ' clicks');
      continue;
    }

    var actualCpa = conversions > 0 ? cost / conversions : Infinity;

    Logger.log('[' + keyword + '] Clicks: ' + clicks +
      ' | Conv: ' + conversions +
      ' | Cost: €' + cost.toFixed(2) +
      ' | CPA: €' + (actualCpa === Infinity ? '∞' : actualCpa.toFixed(2)) +
      ' | Bid: €' + currentBid.toFixed(2));

    var newBid = currentBid;

    if (conversions === 0 && cost > TARGET_CPA * 2) {
      // Spending 2x target with zero conversions — cut bid by 30%
      newBid = Math.max(currentBid * 0.70, MIN_BID);
      Logger.log('  → Reducing bid (no conversions, high spend): €' + newBid.toFixed(2));
    } else if (actualCpa < TARGET_CPA * 0.7) {
      // CPA is 30%+ below target — room to increase bid and get more volume
      newBid = Math.min(currentBid * 1.20, MAX_BID);
      Logger.log('  → Increasing bid (CPA well below target): €' + newBid.toFixed(2));
    } else if (actualCpa > TARGET_CPA * 1.5) {
      // CPA is 50%+ above target — reduce bid
      newBid = Math.max(currentBid * 0.85, MIN_BID);
      Logger.log('  → Reducing bid (CPA too high): €' + newBid.toFixed(2));
    } else {
      Logger.log('  → Bid unchanged (within target range)');
    }

    if (newBid !== currentBid) {
      setKeywordBid(keyword, adGroup, newBid);
      adjusted++;
    }
  }

  Logger.log('---');
  Logger.log('Bids adjusted: ' + adjusted);
}

function setKeywordBid(keywordText, adGroupName, newBid) {
  var kwIterator = AdsApp.keywords()
    .withCondition('Text = "' + keywordText + '"')
    .withCondition('AdGroupName = "' + adGroupName + '"')
    .withCondition('Status = ENABLED')
    .get();

  while (kwIterator.hasNext()) {
    var kw = kwIterator.next();
    kw.bidding().setCpc(newBid);
  }
}

function getLookbackDateRange(days) {
  var end = new Date();
  var start = new Date();
  start.setDate(start.getDate() - days);
  var tz = AdsApp.currentAccount().getTimeZone();
  return Utilities.formatDate(start, tz, 'yyyyMMdd') +
    ',' +
    Utilities.formatDate(end, tz, 'yyyyMMdd');
}
