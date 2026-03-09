#!/bin/bash

mainBranch="master"
compareBranch=$(git branch --show-current)

if [ "$mainBranch" == "$compareBranch" ]; then 
    # this is likely a merge run, use the previous commit
    # this may also not be correct (if multiple commits were pushed directly to master)
    compareBranch=$(git log --pretty=%H -2 | tail -1)
fi

rm -rf visual-diff/screenshots visual-diff/updated_shots visual-diff/baseline_shots visual-diff/diffs

# checkout the compare ref on a new branch and capture screenshots
git checkout -b compare-branch $compareBranch
npm run test:screenshots

mv visual-diff/screenshots visual-diff/updated_shots

# go the main branch and capture screenshots 
git checkout $mainBranch
git branch -D compare-branch
npm run test:screenshots

mv visual-diff/screenshots visual-diff/baseline_shots

# compare the screenshots
npm run test:compare