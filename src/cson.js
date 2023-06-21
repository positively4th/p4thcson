const cson = {};

function quid() {
  return String(Math.random()) + "@" + String(Math.random());
}

let currentId = 0;
const idKey = quid();

function isString(thing) {
  return typeof thing === "string";
}

function isObject(thing) {
  return typeof thing === "object" && thing !== null && !Array.isArray(thing);
}

function isArray(thing) {
  return Array.isArray(thing);
}

function getId(taintedObjects, obj) {
  if (obj[idKey] === undefined) {
    const p0 = obj.__proto__;
    const p = {
      [idKey]: currentId++,
      __proto__: p0,
    };
    obj.__proto__ = p;
    taintedObjects.push(obj);
  }

  return obj[idKey];
}

function removeId(taintedObjects, obj) {
  const p = obj.__proto__;
  if (p[idKey] === undefined) {
    return;
  }
  obj.__proto__ = obj.__proto__.__proto__;
}

cson.asJSON = function (thing) {
  const taintedObjects = [];
  const id = getId.bind(null, taintedObjects);
  const remId = removeId.bind(null, taintedObjects);

  function helper(thing, refMarker, flatMap) {
    if (isObject(thing)) {
      const flatKey = String(id(thing));
      if (flatMap[flatKey] === undefined) {
        const keyVals = [];
        flatMap[flatKey] = keyVals;
        for (const key in thing) {
          if (!thing.hasOwnProperty(key)) {
            continue;
          }
          const val = thing[key];
          const [refVal, _] = helper(val, refMarker, flatMap);
          keyVals.push([key, refVal]);
        }
      }
      return [[refMarker, flatKey]].concat([flatMap]);
    }

    if (!isString(thing) && isArray(thing)) {
      return [
        thing.map((thingee) => helper(thingee, refMarker, flatMap)[0]),
        flatMap,
      ];
    }
    return [thing, flatMap];
  }

  const refMarker = String(quid());
  try {
    return JSON.stringify([refMarker].concat(helper(thing, refMarker, {})));
  } finally {
    taintedObjects.forEach(remId);
  }
};

cson.asCirular = function (circular) {
  function helper(thing, refMarker, flatMap) {
    if (isArray(thing) && thing.length === 2 && thing[0] === refMarker) {
      const flatKey = thing[1];
      const keyVals = flatMap[flatKey];
      if (!isObject(keyVals)) {
        const d = {};
        flatMap[flatKey] = d;
        for (const i in keyVals) {
          const keyVal = keyVals[i];
          d[keyVal[0]] = helper(keyVal[1], refMarker, flatMap);
        }
      }

      return flatMap[flatKey];
    }

    if (isArray(thing)) {
      return thing.map((val) => helper(val, refMarker, flatMap));
    }

    return thing;
  }

  const [refMarker, thing, flatMap] = circular;

  return helper(thing, refMarker, flatMap);
};

cson.fromJSON = function (jsonStr, { isJSON = true } = {}) {
  return cson.asCirular(isJSON ? JSON.parse(jsonStr) : jsonStr);
};

cson.getId = getId;

export default cson;
