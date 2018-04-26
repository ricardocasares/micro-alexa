const { ask } = require("alexa-response");
const { intent, slots } = require("../router");

module.exports = intent("popular", _ => ask("Popular speakers"));
