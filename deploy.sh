#!/bin/bash

# API Airforce Gateway - Deployment Script
# This script deploys the Worker and Web UI to Cloudflare

set -e

echo "=========================================="
echo "API Airforce Gateway - Deployment Script"
echo "=========================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed."
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

echo "✓ Wrangler CLI found"
echo ""

# Check if user is logged in
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare."
    echo "Please login with: wrangler login"
    exit 1
fi

echo "✓ Logged in to Cloudflare"
echo ""

# Deploy Worker
echo "=========================================="
echo "Deploying Worker..."
echo "=========================================="
wrangler deploy

echo ""
echo "✓ Worker deployed successfully"
echo ""

# Deploy Web UI to R2
echo "=========================================="
echo "Deploying Web UI to R2..."
echo "=========================================="

# Upload Web UI files
echo "Uploading index.html..."
wrangler r2 object put api-airforce-gateway/web-ui/index.html --file=web-ui/index.html

echo "Uploading CSS..."
wrangler r2 object put api-airforce-gateway/web-ui/css/styles.css --file=web-ui/css/styles.css

echo "Uploading JavaScript files..."
wrangler r2 object put api-airforce-gateway/web-ui/js/app.js --file=web-ui/js/app.js
wrangler r2 object put api-airforce-gateway/web-ui/js/pages/dashboard.js --file=web-ui/js/pages/dashboard.js
wrangler r2 object put api-airforce-gateway/web-ui/js/pages/apikeys.js --file=web-ui/js/pages/apikeys.js
wrangler r2 object put api-airforce-gateway/web-ui/js/pages/monitoring.js --file=web-ui/js/pages/monitoring.js
wrangler r2 object put api-airforce-gateway/web-ui/js/pages/logs.js --file=web-ui/js/pages/logs.js
wrangler r2 object put api-airforce-gateway/web-ui/js/pages/settings.js --file=web-ui/js/pages/settings.js

echo ""
echo "✓ Web UI deployed successfully"
echo ""

# Set up secrets (if not already set)
echo "=========================================="
echo "Setting up secrets..."
echo "=========================================="

echo "Checking for API_AIRFORCE_KEY..."
if ! wrangler secret list | grep -q "API_AIRFORCE_KEY"; then
    echo "Please enter your api.airforce API key:"
    read -s API_KEY
    wrangler secret put API_AIRFORCE_KEY <<< "$API_KEY"
    echo "✓ API_AIRFORCE_KEY set"
else
    echo "✓ API_AIRFORCE_KEY already set"
fi

echo ""
echo "Checking for ADMIN_API_KEY..."
if ! wrangler secret list | grep -q "ADMIN_API_KEY"; then
    echo "Please enter your admin API key (or press Enter to generate one):"
    read -s ADMIN_KEY
    if [ -z "$ADMIN_KEY" ]; then
        ADMIN_KEY="sk-$(openssl rand -hex 24)"
    fi
    wrangler secret put ADMIN_API_KEY <<< "$ADMIN_KEY"
    echo "✓ ADMIN_API_KEY set"
    echo ""
    echo "⚠️  IMPORTANT: Save your admin API key: $ADMIN_KEY"
else
    echo "✓ ADMIN_API_KEY already set"
fi

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Your API Gateway is now live!"
echo ""
echo "Next steps:"
echo "1. Visit your Worker URL to access the Web UI"
echo "2. Login with your admin API key"
echo "3. Create API keys for your applications"
echo ""
