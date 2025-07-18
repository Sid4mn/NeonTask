#!/bin/bash

# Simple Docker management script I made while learning Docker
# Usage: ./docker-manage.sh [environment] [action]

ENVIRONMENT=${1:-development}
ACTION=${2:-up}

# Just some colors to make output prettier
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    echo_success "Docker is running"
}

# Build images
build_images() {
    echo_info "Building images for $ENVIRONMENT..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    echo_success "Images built!"
}

# Start services
start_services() {
    echo_info "Starting services in $ENVIRONMENT mode..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    echo_success "Services started!"
    show_status
}

# Stop services
stop_services() {
    echo_info "Stopping services..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    echo_success "Services stopped"
}

# Show what's running
show_status() {
    echo_info "What's running:"
    docker-compose ps
    
    echo ""
    echo_info "Container status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Show logs
show_logs() {
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Clean up everything
cleanup() {
    echo_info "Cleaning up Docker stuff..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down -v
    else
        docker-compose down -v
    fi
    
    docker system prune -f
    echo_success "Cleanup done!"
}

# Main script
main() {
    echo "My Docker Script for NeonTask"
    echo "Environment: $ENVIRONMENT"
    echo "Action: $ACTION"
    echo "=================================="
    
    check_docker
    
    case $ACTION in
        "up"|"start")
            start_services
            ;;
        "down"|"stop")
            stop_services
            ;;
        "build")
            build_images
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo ""
            echo "Environments:"
            echo "  development  - For coding (default)"
            echo "  production   - For deployment"
            echo ""
            echo "Actions:"
            echo "  up/start     - Start everything"
            echo "  down/stop    - Stop everything"
            echo "  build        - Build Docker images"
            echo "  logs         - Show logs"
            echo "  status       - Show what's running"
            echo "  cleanup      - Clean up Docker stuff"
            echo ""
            echo "Examples:"
            echo "  $0 development up"
            echo "  $0 production build"
            exit 1
            ;;
    esac
}

main "$@"
