#!/bin/bash

BINTRAY_USER=doccrazy
PACKAGES=("bin/stash-electron-git" "deb/stash-electron-git")

for package in "${PACKAGES[@]}"; do
    URL="https://api.bintray.com/packages/$BINTRAY_USER/$package"
    versions=($(curl -fsSL -H "Content-Type: application/json" -u$BINTRAY_USER:$BT_TOKEN $URL | jq -r '.versions | .[]'))
    for version in ${versions[@]:5}; do
        echo "Deleting version: $version from $package"
        DELETE_URL="$URL/versions/$version"
        RESPONSE_CODE=$(curl -sSL -X DELETE -H "Content-Type: application/json" -u$BINTRAY_USER:$BT_TOKEN $DELETE_URL -s -w "%{http_code}" -o /dev/null);
        if [[ "${RESPONSE_CODE:0:2}" != "20" ]]; then
            echo "Unable to delete version : $v, HTTP response code: $RESPONSE_CODE"
            #exit 1
        fi
        echo "HTTP response code: $RESPONSE_CODE"
    done;
done;
