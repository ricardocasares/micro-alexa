const router = require("./router");
const { launch, popular, upcoming, ended } = require("./handlers");

module.exports = router(launch, popular, upcoming, ended);
