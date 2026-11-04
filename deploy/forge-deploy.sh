# Forge setup (zero-downtime static site):
#   Web directory: /dist
#   Frontend package manager: npm, build command: npm run build
#   Push to deploy: on, zero downtime: on
# Forge generates the deploy script from these settings; it runs, per release:
npm ci
npm run build
