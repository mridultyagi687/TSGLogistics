# Keycloak Troubleshooting Guide

## Admin Console Access

### Credentials
- **URL**: `http://localhost:8180/admin`
- **Username**: `admin`
- **Password**: `admin`

### Common Issues

#### 1. Admin credentials not working
**Symptoms**: Cannot log in to Admin Console with admin/admin

**Solutions**:
1. **Clear browser cache and cookies** for `localhost:8180`
2. **Restart Keycloak container**:
   ```bash
   docker compose restart keycloak
   ```
3. **Check if Keycloak is healthy**:
   ```bash
   docker ps --filter "name=tsg-keycloak"
   # Should show "Up" status
   ```
4. **Verify admin user exists**:
   ```bash
   docker exec tsg-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin
   ```
   If this succeeds, the credentials are correct.

5. **Reset admin password** (if needed):
   ```bash
   docker compose stop keycloak
   docker compose rm -f keycloak
   docker compose up keycloak -d
   ```

#### 2. Keycloak container is unhealthy
**Symptoms**: Container shows "unhealthy" status

**Solutions**:
1. **Check logs**:
   ```bash
   docker logs tsg-keycloak --tail 100
   ```
2. **Wait for Keycloak to fully start** (can take 30-60 seconds)
3. **Check health endpoint**:
   ```bash
   curl http://localhost:8180/health/ready
   ```

#### 3. Application login vs Admin Console
**Important**: There are two different login systems:

- **Keycloak Admin Console** (`http://localhost:8180/admin`):
  - Username: `admin`
  - Password: `admin`
  - Used for managing Keycloak realms, users, clients

- **Application Login** (via "Sign in with Keycloak" button):
  - Username: `ops-lead`
  - Password: `ChangeMe123!`
  - Used for accessing the TSG Logistics application

#### 4. Auto-login issue
If clicking "Sign in with Keycloak" auto-logs you in without asking for credentials:

1. **Clear browser cookies** for `localhost:3000` and `localhost:8180`
2. **Use incognito/private browsing mode**
3. **Check Keycloak session**:
   - Go to `http://localhost:8180/admin`
   - Navigate to Sessions → Active Sessions
   - End any active sessions

## Application User Management

### Default Application User
- **Username**: `ops-lead`
- **Password**: `ChangeMe123!`
- **Email**: `ops-lead@tsglogistics.test`
- **Organization**: `org_demo`

### Creating New Users
1. Access Keycloak Admin Console: `http://localhost:8180/admin`
2. Select **tsg** realm (not master)
3. Go to **Users** → **Add user**
4. Fill in username, email, and set password
5. Add `orgId` attribute in the **Attributes** tab

## Port Information
- **Keycloak**: `http://localhost:8180` (mapped from container port 8080)
- **Admin Console**: `http://localhost:8180/admin`
- **Realm endpoint**: `http://localhost:8180/realms/tsg`

## Environment Variables
Keycloak admin credentials are set in `docker-compose.yml`:
```yaml
KEYCLOAK_ADMIN: admin
KEYCLOAK_ADMIN_PASSWORD: admin
```

If you change these, restart the container:
```bash
docker compose restart keycloak
```

