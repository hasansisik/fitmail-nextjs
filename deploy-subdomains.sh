#!/bin/bash

# Fitmail Subdomain Deployment Script
echo "🚀 Starting Fitmail subdomain deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Please log in to Vercel first:"
    echo "vercel login"
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your Vercel project dashboard"
echo "2. Navigate to Settings > Domains"
echo "3. Add the following domains:"
echo "   - account.fitmail-nextjs.vercel.app"
echo "   - panel.fitmail-nextjs.vercel.app"
echo ""
echo "🧪 Test the subdomains:"
echo "   - https://account.fitmail-nextjs.vercel.app"
echo "   - https://panel.fitmail-nextjs.vercel.app"
echo ""
echo "📚 For more details, see SUBDOMAIN_SETUP.md"
