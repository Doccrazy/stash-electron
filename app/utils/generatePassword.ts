function contains(str: string, set: string, n: number) {
  let c = 0;
  str.split('').forEach((ch) => {
    if (set.includes(ch)) {
      c += 1;
    }
  });
  return c >= n;
}

function containsAll(str: string, classSet: string[], n: number) {
  return classSet.map((cls) => contains(str, cls, n)).reduce((acc, v) => acc && v, true);
}

export default function generatePassword(length: number, classSet: string[] = ['1234567890']) {
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
