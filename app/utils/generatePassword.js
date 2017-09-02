function contains(str, set, n) {
  let c = 0;
  str.split('').forEach(ch => {
    if (set.indexOf(ch) >= 0) {
      c += 1;
    }
  });
  return c >= n;
}

function containsAll(str, classSet, n) {
  return classSet.map(cls => contains(str, cls, n)).reduce((acc, v) => acc && v, true);
}

export default function generatePassword(length, classSet = ['1234567890']) {
  let result = '';
  const classes = classSet.join('');

  const minPerClass = Math.floor((length * 0.7) / classSet.length);

  // repeat until result contains all wanted character classes
  while (!containsAll(result, classSet, minPerClass)) {
    result = '';
    for (let i = 0; i < length; i += 1) {
      result += classes[Math.floor(Math.random() * classes.length)];
    }
  }
  return result;
}
