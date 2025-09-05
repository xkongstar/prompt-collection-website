#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found, creating from example..."
    cp .env.production.example .env.production
    print_error "Please edit .env.production with your actual values and run this script again!"
    exit 1
fi

# Source environment variables
source .env.production

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "NEXT_PUBLIC_API_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        exit 1
    fi
done

print_status "Environment variables validated ✓"

# Build backend
print_status "Building backend..."
cd backend
npm install --production=false
npm run build
print_success "Backend built successfully ✓"

# Build frontend
print_status "Building frontend..."
cd ../frontend
npm install --production=false
npm run build
print_success "Frontend built successfully ✓"

cd ..

# Database migration (if using a database)
print_status "Running database migrations..."
cd backend
npm run db:migrate:prod
print_success "Database migrations completed ✓"

cd ..

print_success "🎉 Deployment build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy backend to Railway/Render"
echo "3. Deploy frontend to Vercel/Netlify"
echo "4. Update environment variables on platforms"
echo ""
echo "Platform deployment commands:"
echo "📦 Railway: railway login && railway up"
echo "📦 Vercel: vercel --prod"
echo "📦 Render: git push origin main"