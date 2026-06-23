# Skill: Deployer (CI/CD, Containerization, & Traefik Routing)

This skill guides an agent acting as the **Deployer**. The Deployer's role is to ensure all sub-projects are properly containerized, build and push them seamlessly via GitHub Actions, and hook them up to the Traefik reverse proxy on the production server.

---

## 🧭 Operational Checklist

When deploying a new application or modifying the infrastructure of an existing application, execute this sequence:

### 1. Dockerize the Sub-Project
Each new tool must have a `Dockerfile` in its sub-project folder. Follow the multi-stage build best practices for efficiency and security:

- **For Static Apps (e.g., Nginx)**:
  Use a simple single-stage Nginx configuration.
  ```dockerfile
  FROM nginx:alpine
  COPY . /usr/share/nginx/html
  # Clean up files not needed in production (like Dockerfile, scratch files)
  RUN rm -f /usr/share/nginx/html/Dockerfile
  ```

- **For Backend Apps (e.g., Flask/Django/Express)**:
  Use a multi-stage build to keep runtime images clean and minimal.
  ```dockerfile
  # Stage 1: Build dependencies
  FROM python:3.11-slim AS builder
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir --user -r requirements.txt

  # Stage 2: Final Image
  FROM python:3.11-slim
  WORKDIR /app
  COPY --from=builder /root/.local /root/.local
  COPY . .
  ENV PATH=/root/.local/bin:$PATH
  ENV FLASK_ENV=production

  EXPOSE 8080
  CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
  ```

---

### 2. Configure GitHub CI/CD Workflows
To automate building and pushing of multiple projects without maintaining separate pipelines, use a **GitHub Actions Matrix Strategy** inside [build-push.yml](file:///Users/bradleysandilands/Documents/coding/experimental/.github/workflows/build-push.yml).

When a new sub-project is added, update the workflow's build job strategy matrix:

```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        include:
          - name: Sparks (Creativity Tool)
            context: ./creativity_tool
            image: brad-is-love/synaptic-sparks
          - name: LingoQuest (Language Tool)
            context: ./language_tool
            image: brad-is-love/lingoquest
          # Add new apps here in the future
```

Ensure the deployment job SSHes into the DigitalOcean droplet to pull the new container version:
```yaml
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /home/deployer/server_configs
            docker compose pull sparks lingoquest <new-service-name>
            docker compose up -d --remove-orphans
```

---

### 3. Register in Traefik Route Settings
Add the new service configuration to `docker-compose.yml` in the `server_configs` repository. Ensure it defines the correct routing labels:

```yaml
  lingoquest:
    image: ghcr.io/brad-is-love/lingoquest:latest
    container_name: lingoquest
    restart: unless-stopped
    env_file:
      - .env
    labels:
      - "traefik.enable=true"
      # Secure route mapping (subdomain)
      - "traefik.http.routers.lingoquest.rule=Host(`lingoquest.${DOMAIN_NAME}`)"
      - "traefik.http.routers.lingoquest.entrypoints=websecure"
      - "traefik.http.routers.lingoquest.tls.certresolver=myresolver"
      # Specify the container port the application listens on
      - "traefik.http.services.lingoquest.loadbalancer.server.port=8080"
```

---

### 4. Manage Environment Secrets
- **Droplet configuration**: Always use `.env` files located on the server for sensitive data (API keys, DB passwords).
- Do not commit `.env` files containing actual values to Git (ensure they are in `.gitignore`).
- For local testing, mock out key values inside `server_configs/.env` and `experimental/.env`.

---

## ⚖️ Core Heuristics & Verification Guidelines

- **Dry Run Compose**: Before deploying any YAML changes, run `docker compose config` inside the configuration directory to verify the syntax of the compose files.
- **Port Mapping Verification**: Always double-check that the `loadbalancer.server.port` label matches the `EXPOSE` port of the respective service's `Dockerfile`.
- **Health Checks & Logs**: When debugging a deployment issue on the host, run `docker compose logs -f <service-name>` or check Traefik routing errors in the Traefik dashboard.
