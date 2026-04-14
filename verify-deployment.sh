#!/bin/bash
# Task Management System - Pre-Deployment Verification Script
# Run this to verify everything is ready for deployment

set -e  # Exit on error

echo "================================"
echo "Pre-Deployment Verification"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    exit 1
  fi
}

warning() {
  echo -e "${YELLOW}⚠ Warning: $1${NC}"
}

# Check 1: Backend directory exists
echo "1. Checking project structure..."
if [ -d "Backend" ]; then
  echo -e "${GREEN}✓ Backend directory found${NC}"
else
  echo -e "${RED}✗ Backend directory not found${NC}"
  exit 1
fi

if [ -d "Frontend" ]; then
  echo -e "${GREEN}✓ Frontend directory found${NC}"
else
  echo -e "${RED}✗ Frontend directory not found${NC}"
  exit 1
fi

# Check 2: Configuration files exist
echo ""
echo "2. Checking configuration files..."
if [ -f "Backend/render.yaml" ]; then
  echo -e "${GREEN}✓ Backend/render.yaml exists${NC}"
else
  echo -e "${RED}✗ Backend/render.yaml not found${NC}"
  exit 1
fi

if [ -f "Backend/server.js" ]; then
  echo -e "${GREEN}✓ Backend/server.js exists${NC}"
else
  echo -e "${RED}✗ Backend/server.js not found${NC}"
  exit 1
fi

if [ -f "Frontend/vite.config.ts" ]; then
  echo -e "${GREEN}✓ Frontend/vite.config.ts exists${NC}"
else
  echo -e "${RED}✗ Frontend/vite.config.ts not found${NC}"
  exit 1
fi

# Check 3: Environment files
echo ""
echo "3. Checking environment files..."
if [ -f "Backend/.env" ]; then
  echo -e "${GREEN}✓ Backend/.env exists${NC}"
else
  warning "Backend/.env not found - create from .env.example"
fi

if [ -f "Frontend/.env" ]; then
  echo -e "${GREEN}✓ Frontend/.env exists${NC}"
else
  warning "Frontend/.env not found - create from .env.example"
fi

if [ -f "Frontend/.env.production" ]; then
  echo -e "${GREEN}✓ Frontend/.env.production exists${NC}"
else
  warning "Frontend/.env.production not found - you'll need this for Vercel"
fi

# Check 4: package.json files
echo ""
echo "4. Checking package.json files..."
if [ -f "Backend/package.json" ]; then
  echo -e "${GREEN}✓ Backend/package.json exists${NC}"
  if grep -q '"start".*"node server.js"' Backend/package.json; then
    echo -e "${GREEN}  ✓ start script configured${NC}"
  else
    echo -e "${RED}  ✗ start script not found in Backend/package.json${NC}"
  fi
else
  echo -e "${RED}✗ Backend/package.json not found${NC}"
  exit 1
fi

if [ -f "Frontend/package.json" ]; then
  echo -e "${GREEN}✓ Frontend/package.json exists${NC}"
  if grep -q '"build"' Frontend/package.json; then
    echo -e "${GREEN}  ✓ build script configured${NC}"
  else
    echo -e "${RED}  ✗ build script not found in Frontend/package.json${NC}"
  fi
else
  echo -e "${RED}✗ Frontend/package.json not found${NC}"
  exit 1
fi

# Check 5: Documentation
echo ""
echo "5. Checking documentation..."
docs=("DEPLOYMENT_GUIDE.md" "DEPLOYMENT_READY.md" "API_ENDPOINTS.md" "TESTING_GUIDE.md")
for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✓ $doc exists${NC}"
  else
    echo -e "${RED}✗ $doc not found${NC}"
  fi
done

# Check 6: Git setup
echo ""
echo "6. Checking git setup..."
if [ -f ".gitignore" ]; then
  echo -e "${GREEN}✓ .gitignore exists${NC}"
  if grep -q "\.env" .gitignore; then
    echo -e "${GREEN}  ✓ .env files are ignored${NC}"
  else
    warning ".env files might not be excluded from git"
  fi
else
  warning ".gitignore not found"
fi

# Check 7: Try to detect backend dependencies
echo ""
echo "7. Checking backend dependencies..."
if grep -q '"express"' Backend/package.json; then
  echo -e "${GREEN}✓ Express found in dependencies${NC}"
fi
if grep -q '"mongoose"' Backend/package.json; then
  echo -e "${GREEN}✓ Mongoose found in dependencies${NC}"
fi
if grep -q '"jsonwebtoken"' Backend/package.json; then
  echo -e "${GREEN}✓ JWT found in dependencies${NC}"
fi
if grep -q '"cors"' Backend/package.json; then
  echo -e "${GREEN}✓ CORS found in dependencies${NC}"
fi

# Check 8: Try to detect frontend dependencies
echo ""
echo "8. Checking frontend dependencies..."
if grep -q '"react"' Frontend/package.json; then
  echo -e "${GREEN}✓ React found in dependencies${NC}"
fi
if grep -q '"vite"' Frontend/package.json; then
  echo -e "${GREEN}✓ Vite found in dependencies${NC}"
fi
if grep -q '"axios"' Frontend/package.json; then
  echo -e "${GREEN}✓ Axios found in dependencies${NC}"
fi
if grep -q '"react-router"' Frontend/package.json; then
  echo -e "${GREEN}✓ React Router found in dependencies${NC}"
fi

# Check 9: API routes configured
echo ""
echo "9. Checking API routes..."
if grep -q "'/api/auth'" Backend/server.js; then
  echo -e "${GREEN}✓ Auth routes configured${NC}"
fi
if grep -q "'/api/projects'" Backend/server.js; then
  echo -e "${GREEN}✓ Projects routes configured${NC}"
fi
if grep -q "'/api/tasks'" Backend/server.js; then
  echo -e "${GREEN}✓ Tasks routes configured${NC}"
fi

# Check 10: Environment variables in render.yaml
echo ""
echo "10. Checking Render configuration..."
if grep -q "NODE_ENV" Backend/render.yaml; then
  echo -e "${GREEN}✓ NODE_ENV in render.yaml${NC}"
fi
if grep -q "MONGODB_URI" Backend/render.yaml; then
  echo -e "${GREEN}✓ MONGODB_URI in render.yaml${NC}"
fi
if grep -q "JWT_" Backend/render.yaml; then
  echo -e "${GREEN}✓ JWT secrets in render.yaml${NC}"
fi

# Summary
echo ""
echo "================================"
echo "Verification Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT_READY.md"
echo "2. Follow DEPLOYMENT_GUIDE.md to deploy"
echo "3. Use TESTING_GUIDE.md to test endpoints"
echo ""
echo "Key items to verify manually:"
echo "- [ ] Backend/.env has database URI"
echo "- [ ] Backend/.env has strong JWT secrets (32+ chars)"
echo "- [ ] Frontend/.env.production has correct API URL"
echo "- [ ] All .env files are in .gitignore"
echo "- [ ] Run 'npm run build' locally to test builds"
echo ""
