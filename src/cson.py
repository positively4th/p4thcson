from uuid import uuid4
import json


class cson:

    @classmethod
    def asUncircular(cls, thing) -> tuple:

        def helper(thing, refMarker, flatMap):
            if isinstance(thing, dict):
                flatKey = str(id(thing))
                if not flatKey in flatMap:
                    keyVals = []
                    flatMap[flatKey] = keyVals
                    for key, val in thing.items():
                        refVal, _ = helper(val, refMarker, flatMap=flatMap)
                        keyVals.append((key, refVal))
                return (refMarker, flatKey), flatMap

            if not isinstance(thing, str):
                try:
                    return [helper(thingee, refMarker, flatMap)[0] for thingee in thing], flatMap
                except TypeError:
                    pass

            return thing, flatMap

        refMarker = '#!:'  # str(uuid4())

        return tuple((refMarker,)) + helper(thing, refMarker, {})

    @classmethod
    def asJSON(cls, thing) -> str:
        return json.dumps(cls.asUncircular(thing))

    @classmethod
    def asCircular(cls, thing, refMarker, flatMap):

        if isinstance(thing, (tuple, list)) \
                and len(thing) == 2 \
                and thing[0] == refMarker:
            flatKey = thing[1]
            # print(flatMap)
            keyVals = flatMap[flatKey]
            if not isinstance(keyVals, dict):
                d = {}
                flatMap[flatKey] = d
                for keyVal in keyVals:
                    d[keyVal[0]] = cls.asCircular(
                        keyVal[1], refMarker, flatMap)
            return flatMap[flatKey]

        if not isinstance(thing, str):
            try:
                return [cls.asCircular(thingee, refMarker, flatMap) for thingee in thing]
            except TypeError:
                pass

        return thing

    @classmethod
    def fromJSON(cls, jsonee: str):

        refMarker, thing, flatMap = json.loads(jsonee)

        return cls.asCircular(thing, refMarker, flatMap)
