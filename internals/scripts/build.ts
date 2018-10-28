import { build, CliOptions, createTargets, Platform, Configuration } from 'electron-builder';
import { exec } from 'child_process';
import * as semver from 'semver';

let buildWin: boolean, buildLinux: boolean, buildMac: boolean;
if (process.argv[2] === 'all' || process.argv.slice(2).includes('win') || (!process.argv[2] && process.platform === 'win32')) {
  buildWin = true;
}
if (process.argv[2] === 'all' || process.argv.slice(2).includes('linux') || (!process.argv[2] && process.platform === 'linux')) {
  buildLinux = true;
}
if (process.argv[2] === 'all' || process.argv.slice(2).includes('mac') || (!process.argv[2] && process.platform === 'darwin')) {
  buildMac = true;
}

function makeConfig(platform: Platform, version: semver.SemVer, snapshotNum?: number): CliOptions {
  // pacman versions may not contain dashes, so replace '-snapshot' by 'pre'
  // also remove snapshot number and put it into iteration counter
  const pkgVersion = version.format().replace(/-snapshot\.\d+$/, 'pre');
  const pkgIteration = `${snapshotNum || 1}`;

  const bintraySnapshots: Configuration['publish'] = snapshotNum ? {
    provider: 'bintray',
    repo: 'bin',
    owner: 'doccrazy',
    package: 'stash-electron-git'
  } : null;

  return {
    targets: createTargets([platform], undefined, 'x64'),
    publish: process.env.CI ? 'always' : undefined,
    config: {
      publish: snapshotNum ? null : {
        provider: 'github'
      },
      extraMetadata: {
        version: version.format()
      },
      win: {
        publish: bintraySnapshots
      },
      mac: {
        publish: bintraySnapshots
      },
      pacman: {
        fpm: [
          '--version', pkgVersion,
          '--iteration', pkgIteration
        ],
        artifactName: `\${name}-${pkgVersion}-${pkgIteration}.pkg.tar.xz`
      },
      appImage: {
        publish: bintraySnapshots
      },
      deb: {
        fpm: [
          '--version', pkgVersion,
          '--iteration', pkgIteration
        ],
        publish: {
          provider: 'bintray',
          package: snapshotNum ? 'stash-electron-git' : 'stash-electron'
        }
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
    await build(makeConfig(Platform.WINDOWS, taggedVersion, snapshotNum)).catch(printErrorAndExit);
  }
  if (buildLinux) {
    await build(makeConfig(Platform.LINUX, taggedVersion, snapshotNum)).catch(printErrorAndExit);
  }
  if (buildMac) {
    await build(makeConfig(Platform.MAC, taggedVersion, snapshotNum)).catch(printErrorAndExit);
  }
});

function printErrorAndExit(error: any) {
  console.error((error.stack || error).toString());
  process.exit(1);
}
