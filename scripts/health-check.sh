#!/bin/bash
# Health Check Script for Prompt Collection Website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URLs (can be overridden by environment variables)
BACKEND_URL=${BACKEND_URL:-"http://localhost:8080"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}

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

# Test backend health
test_backend() {
    print_status "Testing backend health at $BACKEND_URL..."
    
    # Test root endpoint
    if curl -s -f "$BACKEND_URL/" > /dev/null; then
        print_success "✓ Backend root endpoint is responsive"
    else
        print_error "✗ Backend root endpoint failed"
        return 1
    fi
    
    # Test health endpoint
    if curl -s -f "$BACKEND_URL/health" > /dev/null; then
        print_success "✓ Backend health endpoint is responsive"
    else
        print_error "✗ Backend health endpoint failed"
        return 1
    fi
    
    # Test API documentation
    if curl -s -f "$BACKEND_URL/api" > /dev/null; then
        print_success "✓ API documentation is accessible"
    else
        print_warning "⚠ API documentation endpoint failed (non-critical)"
    fi
    
    return 0
}

# Test frontend health
test_frontend() {
    print_status "Testing frontend health at $FRONTEND_URL..."
    
    if curl -s -f "$FRONTEND_URL/" > /dev/null; then
        print_success "✓ Frontend is responsive"
        return 0
    else
        print_error "✗ Frontend failed to respond"
        return 1
    fi
}

# Test database connectivity (if backend is responsive)
test_database() {
    print_status "Testing database connectivity..."
    
    # Try to fetch users endpoint (should return 401 without auth, but confirms DB connection)
    response=$(curl -s -w "%{http_code}" "$BACKEND_URL/api/auth/me" -o /dev/null)
    
    if [ "$response" = "401" ] || [ "$response" = "200" ]; then
        print_success "✓ Database connection is working"
        return 0
    else
        print_error "✗ Database connection failed (HTTP $response)"
        return 1
    fi
}

# Main execution
main() {
    echo "🔍 Starting health check..."
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo ""
    
    backend_healthy=false
    frontend_healthy=false
    database_healthy=false
    
    # Test backend
    if test_backend; then
        backend_healthy=true
        
        # Test database if backend is healthy
        if test_database; then
            database_healthy=true
        fi
    fi
    
    echo ""
    
    # Test frontend
    if test_frontend; then
        frontend_healthy=true
    fi
    
    echo ""
    echo "📊 Health Check Summary:"
    echo "========================"
    
    if [ "$backend_healthy" = true ]; then
        print_success "Backend: Healthy"
    else
        print_error "Backend: Unhealthy"
    fi
    
    if [ "$database_healthy" = true ]; then
        print_success "Database: Healthy"
    else
        print_error "Database: Unhealthy"
    fi
    
    if [ "$frontend_healthy" = true ]; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Unhealthy"
    fi
    
    echo ""
    
    # Overall status
    if [ "$backend_healthy" = true ] && [ "$frontend_healthy" = true ] && [ "$database_healthy" = true ]; then
        print_success "🎉 All services are healthy!"
        exit 0
    else
        print_error "❌ Some services are unhealthy"
        exit 1
    fi
}

# Run health check
main "$@"