## Instant User Session
Thanks for doing this user session with me! We're going to start with a little
message board app and extend it. Let's get started!

## Quick Start

1. Press the button below to clone this repository and deploy it to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnezaj%2Finstant-us-eph)

Walk through the deployment process and you should see the message board app
live!

2. Make a new app on Instant
The first thing you'll notice in the live app is that we need to update the `APP_ID`. Let's go to the Instant dashboard
and create a new app. [Instant Dashboard](https://instantdb.com/dash)

3. Update your repo with the new `APP_ID`
Let's clone our repository to our local machine, install the dependencies
update the `APP_ID`, verify that the app is working locally, and then deploy it to Vercel!

```bash
git clone <YOUR_REPO_NAME> instant-user-session
cd instant-user-session
npm i
npm run dev
```

Update the `APP_ID` in `app/page.tsx` and hit save. If all looks goo let's deploy it to Vercel!

```bash
git add .
git commit -m "Update APP_ID"
git push origin main
```

Huzzah! You've got the app up and running. Now let's start adding some features!
