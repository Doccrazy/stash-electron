const { build, CliOptions, createTargets, Platform } = require('electron-builder');
const { exec } = require('child_process');
const semver = require('semver');

let buildWin, buildLinux;
if (['win', 'all'].includes(process.argv[2]) || (process.argv[2] === 'dev' && process.platform === 'win32')) {
  buildWin = true;
}
if (['linux', 'all'].includes(process.argv[2]) || (process.argv[2] === 'dev' && process.platform === 'linux')) {
  buildLinux = true;
}

function makeConfig(platform, version, snapshotNum) {
  // pacman versions may not contain dashes, so replace '-snapshot' by 'pre'
  // also remove snapshot number and put it into iteration counter
  const pkgVersion = version.format().replace(/-snapshot\.\d+$/, 'pre');
  const pkgIteration = `${snapshotNum || 1}`;

  return {
    targets: createTargets([platform], undefined, 'x64'),
    publish: 'always',
    config: {
      publish: {
        provider: 'generic',
        url: process.env.PUBLISH_URL || '__url__'
      },
      extraMetadata: {
        version: version.format()
      },
      pacman: {
        fpm: [
          '--version', pkgVersion,
          '--iteration', pkgIteration
        ],
        artifactName: `\${name}-${pkgVersion}-${pkgIteration}.pkg.tar.xz`
      }
    }
  };
}

// tags must always begin with 'v' and may contain an optional commit index + build hash
const DESCRIBE_PATTERN = /v([^-]+)(?:-(\d+)-\w+)?/;

exec('git describe --tags', async (error, stdout, stderr) => {
  const m = DESCRIBE_PATTERN.exec(stdout);
  if (!m) {
    console.log(`Invalid output '${stdout}' from 'git describe --tags'`);
    return;
  }
  const taggedVersion = semver.parse(m[1].trim());
  if (!taggedVersion) {
    console.log(`Invalid tagged version '${m[1]}' rejected by semver`);
    return;
  }
  const commitIdx = m[2];
  const snapshotNum = commitIdx ? parseInt(commitIdx, 10) : undefined;

  // if not on a tagged commit, we are building a snapshot version
  // use next patch version, add 'snapshot' + number of commits since the last tag to identify build
  if (snapshotNum) {
    taggedVersion.patch++;
    taggedVersion.prerelease = ['snapshot', `${snapshotNum}`];
  }

  if (buildWin) {
    await build(makeConfig(Platform.WINDOWS, taggedVersion, snapshotNum));
  }
  if (buildLinux) {
    await build(makeConfig(Platform.LINUX, taggedVersion, snapshotNum));
  }
});
