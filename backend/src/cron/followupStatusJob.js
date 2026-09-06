const cron = require("node-cron");
const { flagStaleReferrals } = require("../controllers/referralController");
const { recomputeFollowupStatuses } = require("../controllers/highRiskController");

const runSweep = async () => {
  console.log("⏳ Running referral / high-risk follow-up sweeper...");
  try {
    await flagStaleReferrals(72); // referrals stuck >72h → 'missed'
    await recomputeFollowupStatuses(); // due/overdue/missed recalculated from next_due_date
    console.log("✅ Referral & follow-up statuses refreshed.");
  } catch (error) {
    console.error("❌ Error in follow-up sweeper:", error);
  }
};

function startFollowupJob() {
  runSweep(); // run once on boot
  cron.schedule("0 */6 * * *", runSweep); // then every 6 hours
}

module.exports = startFollowupJob;
