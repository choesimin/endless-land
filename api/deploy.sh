#!/bin/bash

# Endless Land - Deployment Script
# Deploy frontend and backend together

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
SAM_BUCKET_NAME=${SAM_BUCKET_NAME:-$BASE_NAME-sam-$API_STAGE}

log_info "Starting Endless Land deployment"
log_info "Project: $BASE_NAME"
log_info "Stack: $BASE_NAME"
log_info "Region: $AWS_REGION"

# Check prerequisites
log_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed."
    exit 1
fi

# Check SAM CLI
if ! command -v sam &> /dev/null; then
    log_error "AWS SAM CLI is not installed."
    log_info "Installation guide: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
fi

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

# 1. Install dependencies
log_info "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    log_info "node_modules already exists. Skipping."
fi
log_success "Dependencies installed"

# 2. TypeScript build
log_info "Building TypeScript..."
npm run build
log_success "TypeScript build complete"

# 3. SAM build
log_info "Building SAM application..."
sam build
log_success "SAM build complete"

# 4. SAM deploy
log_info "Deploying to AWS..."

# Prepare SAM deploy parameters
SAM_PARAMS="--parameter-overrides ProjectName=$BASE_NAME FrontendBucketName=$FRONTEND_BUCKET_NAME ApiStage=$API_STAGE --s3-bucket $SAM_BUCKET_NAME"

# Check if first deployment
if aws cloudformation describe-stacks --stack-name "$BASE_NAME" &> /dev/null; then
    log_info "Updating existing stack."
    sam deploy --no-confirm-changeset $SAM_PARAMS
else
    log_info "Creating new stack."
    sam deploy --guided $SAM_PARAMS
fi

log_success "AWS deployment complete"

# 5. Check deployment results
log_info "Checking deployment results..."
OUTPUTS=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs' --output table)
echo "$OUTPUTS"

# Extract important endpoints
REST_API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs[?OutputKey==`RestApiEndpoint`].OutputValue' --output text)
WS_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs[?OutputKey==`WebSocketEndpoint`].OutputValue' --output text)
FRONTEND_URL=$(aws cloudformation describe-stacks --stack-name "$BASE_NAME" --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' --output text)

# 6. Frontend deployment guide
log_info "Backend deployment complete!"
echo ""
log_info "To deploy frontend:"
echo "   cd ../web && ./deploy.sh"
echo ""
log_info "Frontend will automatically detect these API endpoints:"
echo "   REST API: $REST_API_ENDPOINT"
echo "   WebSocket: $WS_ENDPOINT"

# 7. Completion message
echo ""
log_success "Endless Land backend deployment completed!"
echo ""
echo "Key endpoints:"
echo "   REST API: $REST_API_ENDPOINT"
echo "   WebSocket: $WS_ENDPOINT"
echo "   Website: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "   1. Deploy frontend: cd ../web && ./deploy.sh"
echo "   2. Enable Claude 3.5 Sonnet model access in Amazon Bedrock"
echo "   3. Test game functionality"
echo ""
echo "Check logs:"
echo "   sam logs -n ${BASE_NAME^}ApiFunction --stack-name $BASE_NAME"
echo "   sam logs -n ${BASE_NAME^}WebSocketFunction --stack-name $BASE_NAME"
echo ""
echo "Delete stack (if needed):"
echo "   aws cloudformation delete-stack --stack-name $BASE_NAME"