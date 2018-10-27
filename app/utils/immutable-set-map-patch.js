var Set = require('immutable').Set;

// fixes https://github.com/facebook/immutable-js/issues/1604
Set.prototype.map = function(mapper, context) {
  return updateSet(this, this._map.mapEntries(e => { var v = mapper(e[0], e[1], this); return [v, v]; }, context));
};

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map
    ? set
    : newMap.size === 0
      ? set.__empty()
      : set.__make(newMap);
}
