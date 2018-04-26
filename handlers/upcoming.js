const { ask } = require("alexa-response");
const { intent } = require("../router");

module.exports = intent("upcoming", e => ask("Upcoming events"));
