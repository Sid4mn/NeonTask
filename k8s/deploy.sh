#!/bin/bash

# NeonTask Kubernetes Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production apply

set -e

ENVIRONMENT=${1:-staging}
ACTION=${2:-apply}
NAMESPACE="neontask"

echo "🚀 NeonTask Kubernetes Deployment"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo "Namespace: $NAMESPACE"
echo "----------------------------------------"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    log_success "kubectl is available"
}

# Function to check cluster connectivity
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        log_info "Make sure your kubeconfig is set up correctly"
        exit 1
    fi
    log_success "Connected to Kubernetes cluster"
}

# Function to build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t neontask-backend:latest ./backend
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t neontask-frontend:latest ./frontend
    
    log_success "Docker images built successfully"
}

# Function to apply Kubernetes manifests
apply_manifests() {
    log_info "Applying Kubernetes manifests..."
    
    # Apply in order of dependencies
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmaps.yaml
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/services.yaml
    kubectl apply -f k8s/hpa.yaml
    kubectl apply -f k8s/policies.yaml
    
    if [ "$ENVIRONMENT" = "production" ]; then
        kubectl apply -f k8s/ingress.yaml
        log_info "Applied production ingress configuration"
    fi
    
    log_success "All manifests applied successfully"
}

# Function to delete Kubernetes resources
delete_manifests() {
    log_warning "Deleting Kubernetes resources..."
    
    kubectl delete -f k8s/ --ignore-not-found=true
    
    log_success "All resources deleted"
}

# Function to check deployment status
check_status() {
    log_info "Checking deployment status..."
    
    echo ""
    echo "📊 Namespace Status:"
    kubectl get namespace $NAMESPACE -o wide
    
    echo ""
    echo "🚀 Deployments:"
    kubectl get deployments -n $NAMESPACE -o wide
    
    echo ""
    echo "📦 Pods:"
    kubectl get pods -n $NAMESPACE -o wide
    
    echo ""
    echo "🌐 Services:"
    kubectl get services -n $NAMESPACE -o wide
    
    echo ""
    echo "📈 HPA Status:"
    kubectl get hpa -n $NAMESPACE -o wide
    
    if kubectl get ingress -n $NAMESPACE &> /dev/null; then
        echo ""
        echo "🔗 Ingress:"
        kubectl get ingress -n $NAMESPACE -o wide
    fi
}

# Function to show logs
show_logs() {
    log_info "Recent logs from backend pods:"
    kubectl logs -n $NAMESPACE -l app=neontask-backend --tail=50
    
    echo ""
    log_info "Recent logs from frontend pods:"
    kubectl logs -n $NAMESPACE -l app=neontask-frontend --tail=50
}

# Function to port forward for local testing
port_forward() {
    log_info "Setting up port forwarding for local testing..."
    log_info "Frontend will be available at: http://localhost:8080"
    log_info "Backend will be available at: http://localhost:8081"
    log_warning "Press Ctrl+C to stop port forwarding"
    
    kubectl port-forward -n $NAMESPACE service/neontask-frontend-service 8080:80 &
    PF_FRONTEND_PID=$!
    
    kubectl port-forward -n $NAMESPACE service/neontask-backend-service 8081:8001 &
    PF_BACKEND_PID=$!
    
    # Wait for user interrupt
    trap "kill $PF_FRONTEND_PID $PF_BACKEND_PID 2>/dev/null; exit 0" INT
    wait
}

# Main execution
main() {
    check_kubectl
    check_cluster
    
    case $ACTION in
        "apply")
            build_images
            apply_manifests
            check_status
            ;;
        "delete")
            delete_manifests
            ;;
        "status")
            check_status
            ;;
        "logs")
            show_logs
            ;;
        "port-forward")
            port_forward
            ;;
        "redeploy")
            log_info "Redeploying application..."
            build_images
            kubectl rollout restart deployment/neontask-backend -n $NAMESPACE
            kubectl rollout restart deployment/neontask-frontend -n $NAMESPACE
            kubectl rollout status deployment/neontask-backend -n $NAMESPACE
            kubectl rollout status deployment/neontask-frontend -n $NAMESPACE
            check_status
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo ""
            echo "Actions:"
            echo "  apply       - Build images and deploy to Kubernetes"
            echo "  delete      - Delete all Kubernetes resources"
            echo "  status      - Show deployment status"
            echo "  logs        - Show recent logs from pods"
            echo "  port-forward - Set up port forwarding for local testing"
            echo "  redeploy    - Rebuild images and restart deployments"
            echo ""
            echo "Environments:"
            echo "  staging     - Staging environment (default)"
            echo "  production  - Production environment with ingress"
            exit 1
            ;;
    esac
}

main "$@"
