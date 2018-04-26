const { json, createError } = require("micro");

module.exports = router;
exports = module.exports;
exports.ended = ended;
exports.match = match;
exports.slots = slots;
exports.router = router;
exports.intent = intent;
exports.launch = launch;

const REQUEST_TYPES = {
  LAUNCH: "LaunchRequest",
  INTENT: "IntentRequest",
  SESSION_ENDED: "SessionEndedRequest"
};

function router(...fns) {
  return find(fns);
}

function find(fns) {
  return async (req, res) => {
    let i = 0;
    let response;
    const length = fns.length;
    const event = await json(req);

    do {
      response = fns[i](event);
      ++i;
    } while (!response && i < length);

    if (!response) {
      throw createError(404, "Route not found");
    }

    return response;
  };
}

function match(fn, handle) {
  return (req, res) => fn(req) && handle(req);
}

function intent(name, handler) {
  return match(matchIntent(name), handler);
}

function matchIntent(name) {
  return req =>
    req.request.type === REQUEST_TYPES.INTENT &&
    req.request.intent.name === name;
}

function launch(handler) {
  return match(matchLaunch, handler);
}

function matchLaunch(req) {
  return req.request.type === REQUEST_TYPES.LAUNCH;
}

function ended(handler) {
  return match(matchEnded, handler);
}

function matchEnded(req) {
  return req.request.type === REQUEST_TYPES.SESSION_ENDED;
}

function slots(fn) {
  return event => {
    const { slots } = event.request.intent;
    const reduced = Object.keys(slots)
      .map(key => slots[key])
      .reduce(byAuthority, {});

    return fn(event, reduced);
  };
}

function byAuthority(slots, slot) {
  const { name, value, resolutions } = slot;
  slots = {
    ...slots,
    [name]: { name, value, match: value, resolved: false }
  };

  if (!resolutions) return slots;

  const { resolutionsPerAuthority = [] } = resolutions;
  const [
    {
      values,
      status: { code }
    }
  ] = resolutionsPerAuthority;

  if (code === "ER_SUCCESS_NO_MATCH") return slots;

  const [{ value: entity }] = values;

  return {
    ...slots,
    [name]: {
      name,
      id: entity.id,
      value: entity.name,
      match: value,
      resolved: true
    }
  };
}
