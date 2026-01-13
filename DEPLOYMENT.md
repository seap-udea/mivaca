# Deployment Guide - Render with Docker

## Prerequisites
- Docker installed locally (for testing)
- Render account
- Git repository connected to Render

## Docker Configuration

### Files Created
1. **Dockerfile** - Multi-stage build optimized for Next.js production
2. **.dockerignore** - Excludes unnecessary files from Docker build context
3. **next.config.ts** - Updated with `output: 'standalone'` for Docker optimization

### Port Configuration
- **Port**: 3000 (configured in Dockerfile)
- **Hostname**: 0.0.0.0 (to accept connections from any interface)

## Build Process

The Dockerfile uses a multi-stage build:

1. **deps stage**: Installs dependencies
2. **builder stage**: Builds the Next.js application
3. **runner stage**: Creates minimal production image

## Testing Locally

Before deploying to Render, test the Docker build locally:

```bash
# Build the Docker image
docker build -t mivaca .

# Run the container
docker run -p 3000:3000 mivaca

# Test in browser
open http://localhost:3000
```

## Deploying to Render

### Step 1: Connect Repository
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `seap-udea/mivaca`

### Step 2: Configure Service
- **Name**: mivaca (or your preferred name)
- **Environment**: Docker
- **Region**: Choose closest to your users
- **Branch**: main
- **Root Directory**: (leave empty, root is fine)

### Step 3: Docker Settings
- **Dockerfile Path**: `Dockerfile` (default)
- **Docker Context**: `.` (default)

### Step 4: Environment Variables
No environment variables are required for this application (uses in-memory store).

### Step 5: Advanced Settings
- **Port**: 3000 (should be auto-detected from Dockerfile)
- **Build Command**: (leave empty, Docker handles this)
- **Start Command**: (leave empty, Docker CMD handles this)

### Step 6: Deploy
Click "Create Web Service" and Render will:
1. Clone your repository
2. Build the Docker image
3. Start the container
4. Provide a public URL

## Verification Checklist

- [x] Dockerfile created with multi-stage build
- [x] Port 3000 configured
- [x] Hostname set to 0.0.0.0
- [x] Standalone output enabled in next.config.ts
- [x] .dockerignore created to optimize build
- [x] Public folder copied correctly
- [x] Non-root user configured for security
- [x] Production environment variables set

## Notes

- The application uses an in-memory store, so data will reset on container restart
- For production, consider adding a database (PostgreSQL, MongoDB, etc.)
- Real-time updates use polling (every 2 seconds)
- No authentication is implemented (MVP version)

## Troubleshooting

### Build Fails
- Check Docker logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure next.config.ts has `output: 'standalone'`

### Container Won't Start
- Verify port 3000 is exposed
- Check Render logs for errors
- Ensure HOSTNAME is set to 0.0.0.0

### Application Not Accessible
- Verify Render service is running
- Check public URL is correct
- Ensure port mapping is correct (3000:3000)

