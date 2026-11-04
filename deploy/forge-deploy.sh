# Forge deploy script – paste into Site → Deployments → Deploy Script.
cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH

npm ci
npm run build
