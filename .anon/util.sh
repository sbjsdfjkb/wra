#!/usr/bin/env sh

DATE="2000-01-01T00:00:00 +0000"
MESSAGE="Anonimization by vsosh rules"

git filter-branch -f \
  --env-filter "
 export GIT_AUTHOR_NAME='vsosh participant'
    export GIT_AUTHOR_EMAIL='anonimization@vsosh.ru'
    export GIT_COMMITTER_NAME='vsosh participant'
    export GIT_COMMITTER_EMAIL='anonimization@vsosh.ru'
    export GIT_AUTHOR_DATE='$DATE'
    export GIT_COMMITTER_DATE='$DATE'
  " \
  --msg-filter "printf '%s' '$MESSAGE'" \
  -- --all

rm -rf .git/refs/original/
