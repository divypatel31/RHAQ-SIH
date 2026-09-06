require("dotenv").config();
const app = require("./src/app");
const startFollowupJob = require("./src/cron/followupStatusJob");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RHAQ backend running on port ${PORT}`);
  startFollowupJob();
});
