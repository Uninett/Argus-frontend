# How to cut a new release

1.  Make sure you are on the right branch, usually master
2.  Make sure everything that needs to be committed is committed
3.  Pick a version number.
    * Bugfixes: final digit
    * New features visible to user: middle digit
    * New way to deploy: middle digit
4.  Update the version number in the file `package.json` first, easy to forget.
    It's close to the top of the file.
5.  Run `npm install` to upgrade the `package-lock.json`-file
6.  Update the changelog with `towncrier build --version yournewversionnumber`.
    Feel free to massage the generated text!
7.  Commit the changes from steps 4 to 6 in the same commit.
8.  Tag the commit made in step 7 with an annotated tag with the new version
    number.

    ```
    git tag -a -m "Mainly bugfixes" v1.5.1
    ```

    Sum up the most important changes in the release in the max. 50 characters
    long message.
9.  Push everything to github
10. Make a new release on github, this is needed for some automation that
    generates a new version in other repos.
