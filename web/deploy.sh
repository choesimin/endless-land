#!/bin/bash

# Endless Land Frontend - Deployment Script
# Deploy frontend to S3 static website

set -e  # Exit script on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
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

# Load environment variables
if [ -f "../.env" ]; then
    log_info "Loading environment variables from ../.env"
    export $(grep -v '^#' ../.env | xargs)
else
    log_warning "../.env file not found. Using default values."
fi

# Set default values if not provided
BASE_NAME=${BASE_NAME:-endlessland}
API_STAGE=${API_STAGE:-dev}
AWS_REGION=${AWS_REGION:-us-east-1}
FRONTEND_BUCKET_NAME=${FRONTEND_BUCKET_NAME:-$BASE_NAME-web-$API_STAGE}

log_info "Starting Endless Land frontend deployment"
log_info "Project: $BASE_NAME"
log_info "Bucket: $FRONTEND_BUCKET_NAME"
log_info "Region: $AWS_REGION"

# Check prerequisites
log_info "Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS credentials are not configured."
    log_info "Setup: aws configure"
    exit 1
fi

log_success "All prerequisites are met."

# Check if bucket exists
log_info "Checking S3 bucket..."
if ! aws s3 ls "s3://$FRONTEND_BUCKET_NAME" &> /dev/null; then
    log_error "S3 bucket '$FRONTEND_BUCKET_NAME' does not exist."
    log_info "Deploy backend first: cd ../api && ./deploy.sh"
    exit 1
fi

log_success "S3 bucket found."

# Get current API endpoints from CloudFormation stack
log_info "Getting API endpoints from CloudFormation..."

if aws cloudformation describe-stacks --stack-name "$BASE_NAME" &> /dev/null; then
    REST_API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs[?OutputKey==`RestApiEndpoint`].OutputValue' --output text)
    WS_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs[?OutputKey==`WebSocketEndpoint`].OutputValue' --output text)
    FRONTEND_URL=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' --output text)
    
    log_info "Found API endpoints:"
    log_info "  REST API: $REST_API_ENDPOINT"
    log_info "  WebSocket: $WS_ENDPOINT"
    log_info "  Frontend URL: $FRONTEND_URL"
else
    log_warning "CloudFormation stack '$BASE_NAME' not found."
    log_warning "API endpoints will need to be configured manually."
fi

# Configuration update guide
if [ -n "$REST_API_ENDPOINT" ] && [ -n "$WS_ENDPOINT" ]; then
    log_warning "Update API endpoints in index.html? (y/N)"
    read -r update_response
    
    if [[ "$update_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Please update the following lines in index.html:"
        echo ""
        echo "this.API_BASE_URL = '$REST_API_ENDPOINT';"
        echo "this.WS_URL = '$WS_ENDPOINT';"
        echo ""
        log_warning "Press Enter after updating the file..."
        read -r
    fi
else
    log_info "Manual configuration needed in index.html:"
    echo "  this.API_BASE_URL = 'https://your-api-gateway-url';"
    echo "  this.WS_URL = 'wss://your-websocket-url';"
fi

# Upload frontend
log_info "Uploading frontend to S3..."

# Upload web content
aws s3 sync . "s3://$FRONTEND_BUCKET_NAME" --delete --exclude "deploy.sh"

log_success "Frontend upload complete"

# Completion message
echo ""
log_success "Endless Land frontend deployment completed!"
echo ""

if [ -n "$FRONTEND_URL" ]; then
    echo "Website URL: $FRONTEND_URL"
else
    echo "Website URL: http://$FRONTEND_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
fi

echo ""
echo "Next steps:"
echo "   1. Test game functionality"
echo "   2. Verify API integration"
echo "   3. Check browser console for errors"
echo ""