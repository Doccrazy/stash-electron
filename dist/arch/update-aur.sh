#!/bin/bash
set -e

cd "$GITHUB_WORKSPACE/dist/arch"
source "$GITHUB_WORKSPACE/release/PKGINFO"

# Set up to run makepkg
wget https://www.archlinux.org/packages/core/x86_64/pacman/download/ -O pacman.pkg.tar.zst
tar -I zstd -xf pacman.pkg.tar.zst
bindir="$(pwd)/usr/bin"
export PATH="$bindir:$PATH"
export LIBRARY="$(pwd)/usr/share/makepkg"
config="$(pwd)/etc/makepkg.conf"

# Get the repo
chmod 600 "$GITHUB_WORKSPACE/dist/deploy_key"
git config --global --add core.sshCommand "sshpass -P passphrase -e ssh -o StrictHostKeyChecking=false -i $GITHUB_WORKSPACE/dist/deploy_key"
git clone ssh://aur@aur.archlinux.org/$PKG_NAME.git aur
cd aur

# Update it
PKG_HASH=$(sha256sum "$GITHUB_WORKSPACE/release/$DEB_ARTIFACT_NAME" | awk '{print $1}')
sed -i "s/pkgver=.*/pkgver=$PKG_VERSION/" PKGBUILD
sed -i "s/pkgrel=.*/pkgrel=$PKG_ITERATION/" PKGBUILD
sed -i "s/sha256sums=('.*'/sha256sums=('$PKG_HASH'/" PKGBUILD
/bin/bash "$bindir/makepkg" --config="$config" --printsrcinfo >.SRCINFO

# Commit
git add PKGBUILD .SRCINFO
git config user.email "stash-deploy@travis-ci.org"
git config user.name "stash-deploy"
git commit -m "Release $PKG_VERSION-$PKG_ITERATION"

# Deploy to AUR
#git push origin master
git status
git diff HEAD~1
