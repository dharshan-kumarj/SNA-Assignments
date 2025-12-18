# PRODUCTION GUIDE

This guide outlines the steps required to deploy the "SecureApp" to your production environment (Lab Server).

## 1. Domain Setup
You are required to set up a subdomain for the application.
1.  **Access DNS Settings**: Log in to your domain provider's control panel.
2.  **Create 'A' Record**:
    *   **Host**: `app` (or your chosen subdomain name, e.g., `app.yourdomain.com`).
    *   **Value**: `<LAB_SERVER_IP_ADDRESS>` (Replace with the actual IP of the lab server).
    *   **TTL**: 3600 (or default).
3.  **Verify**: Wait for propagation and ping `app.yourdomain.com` to ensure it points to the lab server.

## 2. Server Configuration (Apache/Production)
On the production server, ensure Docker is installed.
1.  **Clone Repository**:
    ```bash
    git clone <your-gitlab-repo-url>
    cd Assignment-3
    ```
2.  **Environment Variables**:
    Create a `.env` file for production secrets (DB passwords, API keys).
    ```env
    MONGO_USER=admin
    MONGO_PASS=SecureProductionPassword123!
    RABBITMQ_PASS=AnotherSecurePassword!
    ```

3.  **Build & Run**:
    ```bash
    docker-compose -f docker/docker-compose.yml up -d --build
    ```

4.  **Reverse Proxy (Optional but Recommended)**:
    If the lab server runs a main Apache instance, configure a VirtualHost to proxy traffic to the Docker container port (8080).
    ```apache
    <VirtualHost *:80>
        ServerName app.yourdomain.com
        ProxyPreserveHost On
        ProxyPass / http://localhost:8080/
        ProxyPassReverse / http://localhost:8080/
    </VirtualHost>
    ```

## 3. CI/CD Deployment
The project includes a `.gitlab-ci.yml` file.
1.  **Runners**: Ensure a GitLab Runner is active on the deployment server or use a shared runner that can SSH into the server.
2.  **Variables**: Add necessary SSH keys or deployment credentials in GitLab CI/CD Variables.

## 4. Maintenance
*   **Logs**: Check generic logs via `docker logs <container_id>`.
*   **Cron Jobs**: Daily maintenance runs automatically at midnight inside the container. Check `/var/log/cron_app.log` inside the container for details.
