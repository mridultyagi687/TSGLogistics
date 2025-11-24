# Docker Installation Guide - macOS

This guide provides step-by-step instructions to manually install Docker and all required components for TSG Logistics.

---

## Part 1: Install Docker Desktop

### Step 1: Download Docker Desktop
1. Go to: https://www.docker.com/products/docker-desktop
2. Click **"Download for Mac"**
3. Choose the correct version:
   - **Apple Silicon (M1/M2/M3)**: Download "Mac with Apple chip"
   - **Intel Mac**: Download "Mac with Intel chip"

### Step 2: Install Docker Desktop
1. Open the downloaded `.dmg` file
2. Drag **Docker.app** to your **Applications** folder
3. Open **Applications** folder and double-click **Docker.app**
4. You may see a security prompt - click **"Open"**
5. Enter your Mac password when prompted

### Step 3: Start Docker Desktop
1. Docker Desktop will appear in your menu bar (whale icon)
2. Wait for Docker to fully start (whale icon should be stable, not animating)
3. You'll see "Docker Desktop is running" when ready

### Step 4: Verify Docker Installation
Open Terminal and run:
```bash
docker --version
```
Expected output: `Docker version XX.X.X` or similar

```bash
docker info
```
Should show Docker system information (not an error)

---

## Part 2: Install Docker Compose

Docker Desktop includes Docker Compose V2, but if you need the standalone version:

### Option A: Using Homebrew (Recommended)
```bash
brew install docker-compose
```

### Option B: Manual Installation
1. Check latest version: https://github.com/docker/compose/releases
2. Download for macOS:
```bash
# For Apple Silicon (M1/M2/M3)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-darwin-arm64" -o /usr/local/bin/docker-compose

# For Intel Mac
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-darwin-x86_64" -o /usr/local/bin/docker-compose
```

3. Make it executable:
```bash
sudo chmod +x /usr/local/bin/docker-compose
```

4. Verify installation:
```bash
docker-compose --version
# or
docker compose version
```

---

## Part 3: Configure Docker (if needed)

### If Docker Compose plugin not found:
Create or edit `~/.docker/config.json`:
```bash
mkdir -p ~/.docker
cat > ~/.docker/config.json << EOF
{
  "cliPluginsExtraDirs": [
    "/usr/local/lib/docker/cli-plugins"
  ]
}
EOF
```

---

## Part 4: Verify Everything Works

### Test Docker
```bash
# Check Docker version
docker --version

# Check Docker daemon is running
docker info

# Test running a container
docker run hello-world
```

### Test Docker Compose
```bash
# Check Compose version
docker compose version
# or
docker-compose --version
```

---

## Part 5: Start Docker Services for TSG Logistics

Once Docker Desktop is running:

1. **Navigate to project directory:**
   ```bash
   cd /Users/mridul/Documents/TSGLogistics
   ```

2. **Start infrastructure services:**
   ```bash
   docker compose up -d postgres redis keycloak zookeeper kafka
   ```

3. **Verify services are running:**
   ```bash
   docker ps
   ```
   You should see containers: `tsg-postgres`, `tsg-redis`, `tsg-keycloak`, `tsg-zookeeper`, `tsg-kafka`

4. **Check service logs (if needed):**
   ```bash
   docker logs tsg-postgres
   docker logs tsg-redis
   docker logs tsg-keycloak
   ```

---

## Troubleshooting

### Issue: "Cannot connect to the Docker daemon"
**Solution:**
- Make sure Docker Desktop is running (check menu bar for whale icon)
- Restart Docker Desktop: Quit and reopen the application
- Check if Docker is running: `docker info`

### Issue: "Permission denied" errors
**Solution:**
- Add your user to docker group (usually not needed on macOS)
- Make sure you're using `sudo` for installation commands only
- Docker Desktop should handle permissions automatically

### Issue: Docker Desktop won't start
**Solutions:**
1. Check system requirements:
   - macOS 10.15 or newer
   - At least 4GB RAM
   - VirtualBox prior to version 4.3.30 must NOT be installed
2. Reset Docker Desktop:
   - Click Docker icon in menu bar
   - Go to **Troubleshoot** → **Reset to factory defaults**
3. Check for conflicting software:
   - Uninstall old Docker Toolbox if present
   - Remove VirtualBox if causing conflicts

### Issue: Port already in use
**Solution:**
```bash
# Find what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8180  # Keycloak

# Kill the process
kill -9 <PID>
```

### Issue: "docker compose" command not found
**Solutions:**
1. Use `docker-compose` (with hyphen) instead
2. Make sure Docker Desktop is fully started
3. Restart your terminal after installing Docker Desktop
4. Check if Docker Compose plugin is installed:
   ```bash
   docker compose version
   ```

---

## System Requirements

- **macOS**: 10.15 (Catalina) or newer
- **RAM**: Minimum 4GB (8GB+ recommended)
- **Disk Space**: At least 10GB free
- **Processor**: Apple Silicon (M1/M2/M3) or Intel

---

## Additional Resources

- Docker Desktop Documentation: https://docs.docker.com/desktop/
- Docker Compose Documentation: https://docs.docker.com/compose/
- Docker Desktop for Mac: https://docs.docker.com/desktop/install/mac-install/

---

## Quick Reference Commands

```bash
# Start Docker Desktop (from Applications)
open -a Docker

# Check Docker status
docker info

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# View container logs
docker logs <container-name>

# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

