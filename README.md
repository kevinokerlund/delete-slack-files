# [ABANDONED/DEPRECATED] Delete Slack Files
Bulk delete Slack files from your workspace.

**Disclaimer: This is NOT an official Slack package.**

## Usage

You can run this package with `npx` to avoid installing the package on your machine.

```bash
npx delete-slack-files "xoxp-api-token"
```

In order for this script to access Slack on your behalf,
you will need to provide an authentication token.

### Create an API token

SLACK NO LONGER ALLOWS LEGACY TOKENS

1. Navigate to
https://api.slack.com/custom-integrations/legacy-tokens
2. Find the workspace you want to delete files for, and click the "Create token" button.
The token generated is the one you will use in the command.

### Revoking a token

It is important to revoke legacy tokens after use.

1. Navigate to
https://api.slack.com/methods/auth.revoke/test
2. Select the workspace you created a token for, and click the "Test Method" button.
The token will be destroyed.

## Flags
`--dry` Perform a dry run
```bash
npx delete-slack-files "xoxp-auth-token" --dry
```

This flag will show you how many files there are to delete without actually deleting anything.

## FAQ

**What endpoints are hit with this script?**  
There are 3 endpoints that are used. They are as follows:
1. `/auth.test` This endpoint returns the user's ID so we can get the files that only this user has created.
2. `/files.list` This endpoint returns the list of files that only this user has created.
3. `/files.delete` This endpoint deletes a single file.

**Why does this script only delete 1 file every 1.5 seconds**  
The Slack API is rate limited even on a user basis.
Any faster than this,
and you will prevent the script from being able to finish deleting files until the cool down period has passed.
