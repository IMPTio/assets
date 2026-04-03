/**
 * IMPT Google Ads — Search Term Cleaner (Negative Keyword Bot)
 *
 * Purpose: Automatically finds irrelevant search terms burning budget
 *          and adds them as negative keywords. Runs daily.
 *          This is one of the highest-ROI scripts you can run.
 *
 * HOW TO USE:
 * 1. Google Ads → Tools → Scripts → + New Script
 * 2. Paste this file
 * 3. Set frequency: Daily
 * 4. Authorise and run
 *
 * WHAT IT DOES:
 * - Scans all search terms from the last 30 days
 * - Finds terms with 5+ clicks and 0 conversions that cost more than €3
 * - Adds them as exact match negatives at campaign level
 * - Emails you a report of what was blocked
 */

var COST_THRESHOLD      = 3.00;   // EUR — add as negative if spent this with 0 conversions
var MIN_CLICKS          = 5;      // Minimum clicks before we act
var CAMPAIGN_LABEL      = 'IMPT';
var REPORT_EMAIL        = 'your@email.com'; // Replace with your email
var LOOKBACK_DAYS       = 30;

// Terms to NEVER add as negatives (your core keywords)
var WHITELIST = [
  'impt', 'eco hotel', 'sustainable hotel', 'carbon neutral hotel',
  'green hotel', 'carbon offset hotel', 'book hotel', 'hotel booking',
  'eco friendly hotel', 'ethical hotel', 'responsible travel'
];

function main() {
  var dateRange = getLookbackDateRange(LOOKBACK_DAYS);
  var wastedTerms = findWastedSearchTerms(dateRange);
  var added = addNegativeKeywords(wastedTerms);
  sendReport(added, wastedTerms.length);
}

function findWastedSearchTerms(dateRange) {
  var report = AdsApp.report(
    'SELECT Query, Clicks, Cost, Conversions, CampaignName, AdGroupName ' +
    'FROM SEARCH_QUERY_PERFORMANCE_REPORT ' +
    'WHERE LabelNames CONTAINS_ANY ["' + CAMPAIGN_LABEL + '"] ' +
    'AND Conversions = 0 ' +
    'AND Clicks >= ' + MIN_CLICKS + ' ' +
    'AND Cost >= ' + COST_THRESHOLD + ' ' +
    'DURING ' + dateRange
  );

  var wastedTerms = [];
  var rows = report.rows();

  while (rows.hasNext()) {
    var row = rows.next();
    var query = row['Query'].toLowerCase();

    // Skip if whitelisted
    var isWhitelisted = false;
    for (var i = 0; i < WHITELIST.length; i++) {
      if (query.indexOf(WHITELIST[i]) !== -1) {
        isWhitelisted = true;
        break;
      }
    }

    if (!isWhitelisted) {
      wastedTerms.push({
        query:        row['Query'],
        clicks:       parseInt(row['Clicks']),
        cost:         parseFloat(row['Cost']),
        conversions:  0,
        campaign:     row['CampaignName'],
        adGroup:      row['AdGroupName']
      });
    }
  }

  // Sort by cost descending (biggest waste first)
  wastedTerms.sort(function(a, b) { return b.cost - a.cost; });

  Logger.log('Found ' + wastedTerms.length + ' wasted search terms.');
  return wastedTerms;
}

function addNegativeKeywords(wastedTerms) {
  var addedCount = 0;
  var addedTerms = [];

  wastedTerms.forEach(function(term) {
    try {
      var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + term.campaign + '"')
        .get();

      if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        // Add as exact match negative at campaign level
        campaign.createNegativeKeyword('[' + term.query + ']');
        Logger.log('Added negative: [' + term.query + '] to ' + term.campaign +
          ' (saved €' + term.cost.toFixed(2) + ')');
        addedCount++;
        addedTerms.push(term);
      }
    } catch(e) {
      Logger.log('Could not add negative for "' + term.query + '": ' + e);
    }
  });

  Logger.log('Total negatives added: ' + addedCount);
  return addedTerms;
}

function sendReport(addedTerms, totalFound) {
  if (addedTerms.length === 0) {
    Logger.log('No negative keywords added today — campaigns are clean.');
    return;
  }

  var totalSaved = addedTerms.reduce(function(sum, t) { return sum + t.cost; }, 0);
  var subject = 'IMPT Ads — ' + addedTerms.length + ' Wasted Terms Blocked | €' + totalSaved.toFixed(2) + ' Saved';

  var body = '<h2>IMPT — Negative Keyword Report</h2>';
  body += '<p>Found <strong>' + totalFound + '</strong> wasted search terms. Added <strong>' + addedTerms.length + '</strong> as negatives.</p>';
  body += '<p><strong>Estimated budget saved going forward: €' + totalSaved.toFixed(2) + '/month</strong></p>';

  body += '<table border="1" cellpadding="6" style="border-collapse:collapse;">';
  body += '<tr style="background:#ea4335;color:white;"><th>Search Term</th><th>Clicks</th><th>Cost Wasted</th><th>Campaign</th></tr>';

  addedTerms.forEach(function(term) {
    body += '<tr>';
    body += '<td>[' + term.query + ']</td>';
    body += '<td>' + term.clicks + '</td>';
    body += '<td style="color:red;">€' + term.cost.toFixed(2) + '</td>';
    body += '<td>' + term.campaign + '</td>';
    body += '</tr>';
  });

  body += '</table>';
  body += '<p style="color:#999;font-size:12px;">IMPT Ads Auto-Bot — running daily</p>';

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
