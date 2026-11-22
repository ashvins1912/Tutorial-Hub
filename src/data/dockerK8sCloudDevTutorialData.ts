export type CloudDevTrackId = 'docker' | 'kubernetes' | 'aws-dev' | 'gcp-dev';
export type CloudDevLevel = 'Basics' | 'Core Workflow' | 'Production';

export interface CloudDevChapter {
  id: string;
  track: CloudDevTrackId;
  number: number;
  level: CloudDevLevel;
  title: string;
  tagline: string;
  readTime: string;
  plainEnglish: string;
  architectureFlow: string[];
  codeTitle: string;
  codeLanguage: string;
  codeSnippet: string;
  cliCheatsheet: { command: string; purpose: string }[];
  productionChecklist: string[];
  commonFailure: {
    symptom: string;
    rootCause: string;
    fix: string;
  };
  quickCheck: {
    question: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
  };
}

export interface AwsGcpDeveloperMapping {
  id: string;
  task: string;
  category: 'Compute' | 'Storage & DB' | 'Messaging' | 'Identity & Secrets' | 'CI/CD & Ops';
  awsService: string;
  gcpService: string;
  whenToPick: string;
  awsCode: string;
  gcpCode: string;
}

export interface DockerBuildProfile {
  id: 'naive' | 'multistage-py' | 'multistage-java';
  label: string;
  imageSizeMb: number;
  buildTimeCacheHitSec: number;
  cveCount: number;
  runsAsRoot: boolean;
  layers: { name: string; sizeMb: number; cached: boolean; note: string }[];
  dockerfile: string;
}

export const DOCKER_BUILD_PROFILES: DockerBuildProfile[] = [
  {
    id: 'naive',
    label: 'Naive Single-Stage (Anti-Pattern)',
    imageSizeMb: 980,
    buildTimeCacheHitSec: 84,
    cveCount: 47,
    runsAsRoot: true,
    layers: [
      { name: 'FROM python:3.13 (Full Debian + gcc + git)', sizeMb: 620, cached: true, note: 'Ships compilers & shells attackers can abuse' },
      { name: 'COPY . . (BEFORE pip install!)', sizeMb: 45, cached: false, note: 'Editing 1 line of code invalidates ALL dependency caches!' },
      { name: 'RUN pip install -r requirements.txt', sizeMb: 315, cached: false, note: 'Re-downloads every package on every single commit' },
    ],
    dockerfile: `# ANTI-PATTERN: Huge image, root user, broken layer cache
FROM python:3.13
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]`,
  },
  {
    id: 'multistage-py',
    label: 'Production Python 3.13 Multi-Stage Slim',
    imageSizeMb: 74,
    buildTimeCacheHitSec: 4,
    cveCount: 2,
    runsAsRoot: false,
    layers: [
      { name: 'FROM python:3.13-slim (Runtime only)', sizeMb: 44, cached: true, note: 'Minimal Debian runtime without compilers' },
      { name: 'COPY --from=builder /venv /venv (Cached Deps)', sizeMb: 26, cached: true, note: 'Reused in 0ms unless pyproject.toml/uv.lock changes' },
      { name: 'COPY src/ + USER appuser (Non-root)', sizeMb: 4, cached: false, note: 'Fast 4-second incremental rebuild & least-privilege UID' },
    ],
    dockerfile: `# Stage 1: Build wheels / virtualenv with uv
FROM python:3.13-slim AS builder
WORKDIR /build
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

# Stage 2: Minimal non-root runtime
FROM python:3.13-slim AS runtime
RUN useradd --create-home --uid 10001 appuser
WORKDIR /app
COPY --from=builder /build/.venv /app/.venv
COPY --chown=appuser:appuser src/ ./src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  },
  {
    id: 'multistage-java',
    label: 'Production Java 21 Multi-Stage Distroless',
    imageSizeMb: 88,
    buildTimeCacheHitSec: 6,
    cveCount: 0,
    runsAsRoot: false,
    layers: [
      { name: 'FROM gcr.io/distroless/java21-debian12:nonroot', sizeMb: 68, cached: true, note: 'No bash, no curl, no apt — dramatically smaller attack surface' },
      { name: 'COPY --from=builder extracted/dependencies/', sizeMb: 18, cached: true, note: 'Spring Boot layered JAR keeps third-party JARs cached' },
      { name: 'COPY --from=builder extracted/application/', sizeMb: 2, cached: false, note: 'Only your compiled .class files rebuild on code change' },
    ],
    dockerfile: `# Stage 1: Build with Maven & extract Spring Boot layers
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /workspace
COPY pom.xml .
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw package -DskipTests && java -Djarmode=layertools -jar target/app.jar extract

# Stage 2: Distroless non-root runtime (Zero shell, Zero OS bloat)
FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=builder /workspace/dependencies/ ./
COPY --from=builder /workspace/spring-boot-loader/ ./
COPY --from=builder /workspace/application/ ./
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-XX:+UseZGC", "-XX:+ZGenerational", "org.springframework.boot.loader.launch.JarLauncher"]`,
  },
];

export const CLOUD_DEV_CHAPTERS: CloudDevChapter[] = [
  /* ============================== DOCKER (4) ============================== */
  {
    id: 'docker-01-internals',
    track: 'docker',
    number: 1,
    level: 'Basics',
    title: 'Containers vs. VMs, Namespaces, Cgroups & Image Layers',
    tagline: 'Demystify what a Docker container actually is inside the Linux kernel.',
    readTime: '6 min',
    plainEnglish:
      'A container is NOT a mini virtual machine—it is a normal Linux process isolated by kernel Namespaces (so it sees its own PID tree, filesystem, and network interface) and constrained by Cgroups (hard CPU and RAM ceilings). Because it shares the host OS kernel, containers start in milliseconds instead of minutes.',
    architectureFlow: [
      'Dockerfile (Blueprint)',
      'Immutable Read-Only Layers (OverlayFS)',
      'OCI Image Registry (ECR / Artifact Registry)',
      'Thin Writable Container Layer + Namespaces/Cgroups',
    ],
    codeTitle: 'Inspecting Container Isolation & Resource Ceilings',
    codeLanguage: 'bash',
    codeSnippet: `# Run an isolated container with strict memory & CPU cgroup limits
docker run -d --name api-demo \\
  --memory="512m" --cpus="1.0" \\
  --read-only --tmpfs /tmp \\
  -p 8080:8080 \\
  my-org/orders-api:1.4.2

# Inspect image layer sizes (largest layers first)
docker history --human --no-trunc my-org/orders-api:1.4.2

# Live CPU, memory, and network cgroup stats
docker stats --no-stream api-demo`,
    cliCheatsheet: [
      { command: 'docker build -t app:v1 .', purpose: 'Build an OCI image from the local Dockerfile' },
      { command: 'docker ps -a', purpose: 'List running and exited containers with exit codes' },
      { command: 'docker logs -f --tail 100 <id>', purpose: 'Stream stdout/stderr logs in real time' },
      { command: 'docker exec -it <id> sh', purpose: 'Attach an interactive shell inside a running container' },
    ],
    productionChecklist: [
      'Never run containers as root (UID 0); always declare a dedicated `USER` in the Dockerfile.',
      'Always include a `.dockerignore` excluding `.git`, `node_modules`, `.venv`, `target/`, and `.env` files.',
      'Pin base image digests or minor tags (`python:3.13.2-slim`), never floating `:latest` in production.',
    ],
    commonFailure: {
      symptom: 'Container exits immediately with Exit Code 137 (`OOMKilled`).',
      rootCause: 'The process allocated more memory than its cgroup `--memory` limit, causing the Linux OOM killer to send SIGKILL.',
      fix: 'Profile heap usage (e.g., set JVM `-XX:MaxRAMPercentage=75.0` or stream files in Python) and right-size memory limits.',
    },
    quickCheck: {
      question: 'Why do Docker containers start in ~100ms while Virtual Machines take 20–60 seconds?',
      options: [
        { id: 'a', text: 'Containers skip running application code' },
        { id: 'b', text: 'Containers share the host Linux kernel via namespaces and cgroups instead of booting a full guest OS kernel' },
        { id: 'c', text: 'Docker stores containers inside CPU L1 cache' },
      ],
      correctId: 'b',
      explanation:
        'Containers isolate a standard host process using kernel namespaces and cgroups—there is no hypervisor or guest OS boot sequence.',
    },
  },
  {
    id: 'docker-02-multistage-compose',
    track: 'docker',
    number: 2,
    level: 'Core Workflow',
    title: 'Multi-Stage Dockerfiles & Local Microservices with Compose',
    tagline: 'Ship 80MB distroless images and boot your entire API + Postgres + Redis stack with one command.',
    readTime: '8 min',
    plainEnglish:
      'Multi-stage builds separate your heavy build environment (compilers, Maven, Poetry/uv) from a razor-thin runtime stage that copies ONLY the compiled artifact. Docker Compose wires your app, database, and cache onto a private DNS bridge network so your app connects via `postgres:5432` instead of `localhost`.',
    architectureFlow: [
      'Developer `docker compose up`',
      'Private Bridge DNS (`api` -> `db:5432`, `redis:6379`)',
      'Named Volume (`pgdata` survives restarts)',
      'Healthcheck Gate (`service_healthy`)',
    ],
    codeTitle: 'Production-Style docker-compose.yml (API + Postgres + Redis)',
    codeLanguage: 'yaml',
    codeSnippet: `services:
  api:
    build:
      context: .
      target: runtime
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://app:devpass@db:5432/orders
      REDIS_URL: redis://cache:6379/0
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: orders
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d orders"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

volumes:
  pgdata:`,
    cliCheatsheet: [
      { command: 'docker compose up --build -d', purpose: 'Rebuild images and start all services in background' },
      { command: 'docker compose logs -f api', purpose: 'Tail logs for just the API container' },
      { command: 'docker compose down -v', purpose: 'Stop containers and wipe named volumes for a clean slate' },
      { command: 'docker system prune -af', purpose: 'Reclaim disk space from unused build cache and dangling images' },
    ],
    productionChecklist: [
      'Copy dependency manifests (`pom.xml`, `pyproject.toml`) BEFORE `COPY src/` to maximize BuildKit cache hits.',
      'Use named volumes for database state—container filesystems are ephemeral and vanish on `docker rm`.',
      'Use `depends_on: condition: service_healthy` so your API waits until Postgres actually accepts TCP queries.',
    ],
    commonFailure: {
      symptom: '`Connection refused` when the API tries to reach `localhost:5432` inside Docker Compose.',
      rootCause: 'Inside a container, `localhost` refers to that container’s own network namespace, not the Postgres container.',
      fix: 'Connect using the Compose service name (`db:5432` or `cache:6379`) resolved automatically by Docker’s embedded DNS.',
    },
    quickCheck: {
      question: 'Why should `COPY requirements.txt .` and `RUN pip install` appear BEFORE `COPY src/ ./src/` in a Dockerfile?',
      options: [
        { id: 'a', text: 'Docker refuses to run pip after copying Python files' },
        { id: 'b', text: 'Docker caches layers top-down; keeping stable dependency files above frequently edited source code skips reinstalling packages on every code edit' },
        { id: 'c', text: 'It reduces the runtime RAM limit automatically' },
      ],
      correctId: 'b',
      explanation:
        'Once any layer changes, Docker invalidates all subsequent layers. Placing rarely changing manifests first gives near-instant cached rebuilds.',
    },
  },
  {
    id: 'docker-03-security-supply-chain',
    track: 'docker',
    number: 3,
    level: 'Production',
    title: 'Container Security, BuildKit Secrets & Vulnerability Scanning',
    tagline: 'Zero leaked credentials in image history, non-root execution, and automated CVE gates.',
    readTime: '6 min',
    plainEnglish:
      'Anything written in a Dockerfile layer—even if deleted in the next `RUN rm` command—stays forever inside the earlier read-only image layer! Use BuildKit `--mount=type=secret` for private package registries and scan every image with Trivy before pushing.',
    architectureFlow: [
      'BuildKit `--mount=type=secret` (Never Baked Into Layer)',
      'Distroless / Wolfi Base + Non-Root UID',
      'Trivy CVE & SBOM Scan Gate',
      'Cosign Cryptographic Signature -> Registry',
    ],
    codeTitle: 'Safe BuildKit Secret Mount + Trivy Security Gate',
    codeLanguage: 'bash',
    codeSnippet: `# Inside Dockerfile: Mount private pip/npm token ONLY during the build command
# RUN --mount=type=secret,id=pip_conf,target=/etc/pip.conf pip install -r requirements.txt

# Build passing secret safely (never persisted in image layers!)
DOCKER_BUILDKIT=1 docker build \\
  --secret id=pip_conf,src=$HOME/.config/pip/pip.conf \\
  -t my-org/orders-api:1.4.2 .

# Fail CI if any HIGH or CRITICAL OS/library vulnerability exists
trivy image --exit-code 1 --severity HIGH,CRITICAL my-org/orders-api:1.4.2`,
    cliCheatsheet: [
      { command: 'trivy image <image:tag>', purpose: 'Scan OS packages and Python/Java deps for CVEs' },
      { command: 'docker inspect <image> --format "{{.Config.User}}"', purpose: 'Verify image runs as non-root user' },
      { command: 'docker sbom <image>', purpose: 'Generate Software Bill of Materials (SPDX/CycloneDX)' },
    ],
    productionChecklist: [
      'Never pass passwords or tokens via `ARG` or `ENV`—they are visible in plaintext via `docker history`.',
      'Drop all Linux capabilities (`--cap-drop=ALL`) and mount the root filesystem read-only where possible.',
      'Handle `SIGTERM` gracefully (use exec-form `CMD ["uvicorn", ...]` instead of shell-form `CMD uvicorn ...` so PID 1 receives signals!).',
    ],
    commonFailure: {
      symptom: 'Container takes 10 seconds to stop and drops in-flight HTTP requests during deploys.',
      rootCause: 'Shell-form `CMD java -jar app.jar` runs `/bin/sh` as PID 1, which does NOT forward `SIGTERM` to your app, forcing a hard `SIGKILL` after 10s.',
      fix: 'Always use JSON exec-form `ENTRYPOINT ["java", "-jar", "app.jar"]` so your app is PID 1 and drains requests cleanly on `SIGTERM`.',
    },
    quickCheck: {
      question: 'If you `COPY .env .` in layer 3 and `RUN rm .env` in layer 4 of a Dockerfile, is `.env` gone from the image?',
      options: [
        { id: 'a', text: 'Yes, layer 4 completely erases it' },
        { id: 'b', text: 'No! Image layers are immutable—anyone can extract `.env` directly from layer 3' },
        { id: 'c', text: 'Only if you run `docker push` twice' },
      ],
      correctId: 'b',
      explanation:
        'OverlayFS deletion only writes a whiteout marker in layer 4. The original secret bytes remain intact inside layer 3.',
    },
  },

  /* ============================ KUBERNETES (4) ============================ */
  {
    id: 'k8s-01-architecture-workloads',
    track: 'kubernetes',
    number: 1,
    level: 'Basics',
    title: 'Kubernetes Architecture, Pods, Deployments & Health Probes',
    tagline: 'Master the declarative reconciliation loop that self-heals crashed containers automatically.',
    readTime: '8 min',
    plainEnglish:
      'Kubernetes is a continuous thermostat for your infrastructure. You declare your desired state in YAML ("Keep 3 healthy replicas of `orders-api:1.4.2` running"), and controllers constantly compare actual state against desired state—restarting crashed pods, replacing dead nodes, and rolling out zero-downtime updates.',
    architectureFlow: [
      'kubectl apply -> API Server -> etcd (Desired State)',
      'Deployment Controller -> ReplicaSet -> Scheduler',
      'Worker Node kubelet pulls OCI Image -> Starts Pod',
      'Startup / Readiness / Liveness Probes verify health',
    ],
    codeTitle: 'Production Kubernetes Deployment with Probes & Resource Budgets',
    codeLanguage: 'yaml',
    codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: orders-api
  template:
    metadata:
      labels:
        app: orders-api
    spec:
      containers:
        - name: api
          image: us-docker.pkg.dev/my-proj/apps/orders-api:1.4.2
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              memory: "512Mi"
          readinessProbe:
            httpGet: { path: /health/ready, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health/live, port: 8080 }
            initialDelaySeconds: 15
            periodSeconds: 10`,
    cliCheatsheet: [
      { command: 'kubectl get pods -o wide', purpose: 'Check pod phase, restart counts, IP, and node placement' },
      { command: 'kubectl describe pod <name>', purpose: 'Read scheduling events, OOMKills, and probe failure reasons' },
      { command: 'kubectl logs <pod> --previous', purpose: 'Inspect crash stack trace from the container BEFORE restart' },
      { command: 'kubectl rollout undo deployment/orders-api', purpose: 'Instantly roll back a broken release to previous ReplicaSet' },
    ],
    productionChecklist: [
      'Separate `/health/live` (is process deadlocked?) from `/health/ready` (can it serve traffic?)—never check external DB inside livenessProbe or a DB blip will reboot your entire fleet!',
      'Set `maxUnavailable: 0, maxSurge: 1` for zero-downtime rolling updates.',
      'Always define CPU/memory `requests` so the scheduler packs pods accurately and HPA can calculate utilization.',
    ],
    commonFailure: {
      symptom: 'Pod stuck in `CrashLoopBackOff` with Exit Code 1 or 137.',
      rootCause: 'Application crashes on startup (missing env var, bad DB URL) or exceeds `limits.memory`.',
      fix: 'Run `kubectl logs <pod> --previous` and `kubectl describe pod <pod>` to see the exact exit code and stack trace.',
    },
    quickCheck: {
      question: 'What happens if a pod fails its `readinessProbe` vs. failing its `livenessProbe`?',
      options: [
        { id: 'a', text: 'Both immediately delete and recreate the pod' },
        { id: 'b', text: 'Failed readiness removes the pod IP from Service load-balancing (no traffic sent); failed liveness kills and restarts the container' },
        { id: 'c', text: 'Readiness is only checked once at boot; liveness never restarts containers' },
      ],
      correctId: 'b',
      explanation:
        'Readiness controls traffic routing (Service Endpoints), whereas liveness triggers kubelet to restart a wedged container.',
    },
  },
  {
    id: 'k8s-02-networking-services-ingress',
    track: 'kubernetes',
    number: 2,
    level: 'Core Workflow',
    title: 'Services, CoreDNS, Ingress & Gateway API Networking',
    tagline: 'How traffic reaches ephemeral Pod IPs reliably inside and outside the cluster.',
    readTime: '7 min',
    plainEnglish:
      'Pod IP addresses are temporary—every time a pod restarts, it gets a brand-new IP. A Kubernetes `Service` provides a permanent virtual IP and internal DNS name (`orders-api.prod.svc.cluster.local`) that automatically tracks healthy pod IPs matching its label selector. An `Ingress` (or modern `Gateway API`) terminates HTTPS at the edge and routes host/paths to internal Services.',
    architectureFlow: [
      'Internet HTTPS -> Cloud LB / Ingress Controller',
      'TLS Termination + Path Routing (`/api/orders`)',
      'ClusterIP Service (Stable Virtual IP + CoreDNS)',
      'Ready Pod Endpoints (Balanced by kube-proxy / eBPF Cilium)',
    ],
    codeTitle: 'ClusterIP Service + HTTPS Ingress Routing',
    codeLanguage: 'yaml',
    codeSnippet: `apiVersion: v1
kind: Service
metadata:
  name: orders-api
spec:
  type: ClusterIP
  selector:
    app: orders-api
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: public-api-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts: [api.example.com]
      secretName: api-tls-cert
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api/v1/orders
            pathType: Prefix
            backend:
              service:
                name: orders-api
                port:
                  number: 80`,
    cliCheatsheet: [
      { command: 'kubectl get endpoints orders-api', purpose: 'Verify which Ready Pod IPs are currently registered behind the Service' },
      { command: 'kubectl port-forward svc/orders-api 8080:80', purpose: 'Tunnel a cluster-internal Service safely to your laptop for debugging' },
      { command: 'kubectl get ingress -A', purpose: 'Inspect external load balancer IPs and host/path routes' },
    ],
    productionChecklist: [
      'Use `ClusterIP` for internal microservices—only expose your API Gateway/Ingress publicly.',
      'Check `kubectl get endpoints <svc>` first whenever seeing 503 Service Unavailable (an empty endpoints list means selector labels or readiness probes failed!).',
      'Enforce `NetworkPolicy` to deny lateral pod-to-pod traffic except explicitly whitelisted services.',
    ],
    commonFailure: {
      symptom: 'Ingress returns `503 Service Temporarily Unavailable` even though pods show `Running`.',
      rootCause: 'Either the Service `selector` label has a typo, or pods are `0/1 Ready` because `readinessProbe` is failing.',
      fix: 'Run `kubectl get endpoints <svc>` and compare `kubectl get pods --show-labels`.',
    },
    quickCheck: {
      question: 'You have 3 Running pods for `orders-api`, yet `kubectl get endpoints orders-api` shows `<none>`. What is the most likely cause?',
      options: [
        { id: 'a', text: 'The pods have mismatched labels vs the Service selector, OR their readinessProbe is failing' },
        { id: 'b', text: 'Kubernetes only supports 1 pod per Service' },
        { id: 'c', text: 'ClusterIP cannot route HTTP traffic' },
      ],
      correctId: 'a',
      explanation:
        'A Service only populates Endpoints for pods that BOTH match its `spec.selector` labels AND pass their `readinessProbe`.',
    },
  },
  {
    id: 'k8s-03-config-secrets-autoscaling',
    track: 'kubernetes',
    number: 3,
    level: 'Production',
    title: 'ConfigMaps, External Secrets, HPA Autoscaling & PDBs',
    tagline: 'Keep secrets out of Git, autoscale on live traffic, and guarantee zero downtime during node upgrades.',
    readTime: '7 min',
    plainEnglish:
      'Keep non-sensitive config in `ConfigMaps`, pull sensitive credentials dynamically from AWS Secrets Manager or GCP Secret Manager via External Secrets Operator, autoscale pods horizontally with `HorizontalPodAutoscaler` (HPA), and add a `PodDisruptionBudget` (PDB) so cluster upgrades never drain all your replicas at once.',
    architectureFlow: [
      'Metrics Server / Prometheus -> HPA Controller',
      'Desired Replicas = ceil(current * (metric / target))',
      'PodDisruptionBudget ensures minAvailable >= 2 during node drains',
      'External Secrets syncs KMS-encrypted creds into Pod memory',
    ],
    codeTitle: 'HorizontalPodAutoscaler + PodDisruptionBudget',
    codeLanguage: 'yaml',
    codeSnippet: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orders-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orders-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 65
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: orders-api-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: orders-api`,
    cliCheatsheet: [
      { command: 'kubectl get hpa -w', purpose: 'Watch live CPU/memory utilization and replica scaling decisions' },
      { command: 'kubectl top pods', purpose: 'Check real-time CPU millicores and RAM MiB per pod' },
      { command: 'kubectl diff -f k8s/', purpose: 'Preview exact cluster changes before applying manifests' },
    ],
    productionChecklist: [
      'Remember: Kubernetes `Secret` YAML is only base64-encoded, NOT encrypted in Git—always use External Secrets Operator + Cloud KMS.',
      'Pair HPA with Cluster Autoscaler (or Karpenter on EKS / GKE Autopilot) so new worker nodes provision when pods become `Pending`.',
      'Always add a `PodDisruptionBudget` (`minAvailable: 2` or `maxUnavailable: 1`) for every stateless production API.',
    ],
    commonFailure: {
      symptom: 'HPA shows `<unknown>/65%` and refuses to scale pods during a traffic spike.',
      rootCause: 'The Deployment container spec is missing `resources.requests.cpu`, or `metrics-server` is not installed.',
      fix: 'Declare explicit `resources.requests.cpu` on every container in the Pod template.',
    },
    quickCheck: {
      question: 'Why does HPA require `resources.requests.cpu` on your containers?',
      options: [
        { id: 'a', text: 'Because HPA computes utilization % as `(actual CPU usage / requested CPU) * 100`' },
        { id: 'b', text: 'Because Kubernetes blocks pods without CPU limits from booting' },
        { id: 'c', text: 'Because PDB cannot select pods without CPU requests' },
      ],
      correctId: 'a',
      explanation:
        'Without a denominator (`requests.cpu`), HPA cannot compute percentage utilization and displays `<unknown>`.',
    },
  },

  /* ========================== AWS FOR DEVELOPERS (4) ========================== */
  {
    id: 'aws-01-iam-compute',
    track: 'aws-dev',
    number: 1,
    level: 'Basics',
    title: 'AWS IAM Least Privilege & Compute Selection (Lambda, Fargate, EKS)',
    tagline: 'Eliminate long-lived access keys and pick the right AWS runtime for every workload.',
    readTime: '8 min',
    plainEnglish:
      'Every API call in AWS is authenticated and authorized by IAM. Never embed `AWS_ACCESS_KEY_ID` inside code or containers—attach an IAM Role to your Lambda/ECS Task/EKS Pod (via IRSA / Pod Identity) so AWS rotates short-lived STS tokens automatically. Pick Lambda for spiky event handlers, ECS Fargate for zero-ops containers, and EKS when you need the full Kubernetes ecosystem.',
    architectureFlow: [
      'Workload Identity (IAM Role / OIDC -> STS Short-Lived Token)',
      'ALB / API Gateway (TLS + Routing)',
      'Compute: Lambda (Event) | ECS Fargate (Containers) | EKS (K8s)',
      'Scoped Policy grants exact `s3:PutObject` / `sqs:SendMessage`',
    ],
    codeTitle: 'Least-Privilege IAM Policy + ECS Fargate / Lambda Execution Pattern',
    codeLanguage: 'json',
    codeSnippet: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowOrderReceiptsBucketOnly",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::prod-order-receipts-us-east-1/receipts/*"
    },
    {
      "Sid": "AllowSendOrderEventsQueueOnly",
      "Effect": "Allow",
      "Action": ["sqs:SendMessage"],
      "Resource": "arn:aws:sqs:us-east-1:123456789012:orders-created-queue"
    }
  ]
}`,
    cliCheatsheet: [
      { command: 'aws sts get-caller-identity', purpose: 'Verify which AWS account and IAM role your CLI is currently using' },
      { command: 'aws ecs list-tasks --cluster prod', purpose: 'List running ECS Fargate tasks in a cluster' },
      { command: 'aws logs tail /aws/lambda/orders-fn --follow', purpose: 'Stream live CloudWatch logs from a Lambda function' },
    ],
    productionChecklist: [
      'Use GitHub Actions OIDC (`aws-actions/configure-aws-credentials`) instead of static IAM user keys in CI/CD.',
      'Scope IAM `Resource` ARNs to exact buckets/queues/tables—never `"Action": "*", "Resource": "*"` in prod.',
      'Enable Lambda SnapStart (Java 21) or Provisioned Concurrency when cold-start p99 latency matters.',
    ],
    commonFailure: {
      symptom: 'Application throws `AccessDeniedException` on S3/DynamoDB even though policy allows it.',
      rootCause: 'An explicit `Deny` in an SCP/bucket policy, missing KMS `kms:Decrypt` permission for encrypted objects, or wrong IAM role attached to the ECS task (Execution Role vs Task Role!).',
      fix: 'Remember: ECS `executionRoleArn` pulls the Docker image/logs; `taskRoleArn` is what your Python/Java application code uses at runtime.',
    },
    quickCheck: {
      question: 'On AWS ECS Fargate, what is the difference between the Task Execution Role and the Task Role?',
      options: [
        { id: 'a', text: 'They are identical aliases' },
        { id: 'b', text: 'Task Execution Role lets the ECS agent pull ECR images and push logs; Task Role grants permissions to your running app code (S3, SQS, DynamoDB)' },
        { id: 'c', text: 'Task Role is only for Windows containers' },
      ],
      correctId: 'b',
      explanation:
        'A classic AWS developer bug is putting S3/DynamoDB permissions on the Execution Role instead of the Task Role.',
    },
  },
  {
    id: 'aws-02-s3-dynamodb-rds',
    track: 'aws-dev',
    number: 2,
    level: 'Core Workflow',
    title: 'AWS Storage & Databases: S3 Presigned URLs, DynamoDB & RDS Aurora',
    tagline: 'Offload large file uploads directly to S3 and pick relational Aurora vs. single-digit-ms DynamoDB.',
    readTime: '8 min',
    plainEnglish:
      'Never proxy 50 MB user uploads through your backend API—generate a short-lived S3 Presigned URL so browsers upload straight to S3 while your server stays lightweight. Use RDS Aurora PostgreSQL for rich SQL joins & ACID transactions; use DynamoDB when you need predictable < 5ms key-value/document scale at massive throughput.',
    architectureFlow: [
      'Client requests upload slot -> API authorizes JWT',
      'API generates 5-min S3 Presigned PUT URL (`boto3` / AWS SDK v2)',
      'Client uploads directly to S3 -> S3 Event triggers async Lambda/SQS',
      'Metadata saved in RDS Aurora Postgres or DynamoDB',
    ],
    codeTitle: 'Python (boto3) S3 Presigned URL & DynamoDB Conditional Put',
    codeLanguage: 'python',
    codeSnippet: `import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")
ddb = boto3.resource("dynamodb").Table("Orders")

def create_upload_url(bucket: str, object_key: str) -> str:
    # Browser uploads directly to S3 — zero backend bandwidth bottleneck!
    return s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": object_key, "ContentType": "image/jpeg"},
        ExpiresIn=300,
    )

def create_order_idempotent(order_id: str, user_id: str, total_cents: int) -> bool:
    try:
        ddb.put_item(
            Item={"PK": f"USER#{user_id}", "SK": f"ORDER#{order_id}", "total": total_cents},
            ConditionExpression="attribute_not_exists(PK)",  # Atomic idempotency guard!
        )
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False  # Duplicate retry safely ignored
        raise`,
    cliCheatsheet: [
      { command: 'aws s3 ls s3://my-bucket/prefix/ --human-readable', purpose: 'Inspect objects and sizes in an S3 prefix' },
      { command: 'aws dynamodb query --table-name Orders --key-condition-expression "PK = :u"', purpose: 'Run an indexed O(1) partition query (avoid Scan!)' },
      { command: 'aws rds describe-db-clusters', purpose: 'Check Aurora writer/reader endpoints and Multi-AZ status' },
    ],
    productionChecklist: [
      'Use DynamoDB `Query` (partition key lookup), NEVER `Scan` in production API paths—Scan reads every item in the table.',
      'Put RDS Proxy in front of Aurora PostgreSQL when connecting from AWS Lambda to prevent connection exhaustion.',
      'Block all S3 public access at the account level and serve static assets through CloudFront with Origin Access Control (OAC).',
    ],
    commonFailure: {
      symptom: 'DynamoDB throttling (`ProvisionedThroughputExceededException`) even though average table load is low.',
      rootCause: 'Hot partition key (e.g., using `status="ACTIVE"` or today’s date as Partition Key puts 100% of writes onto a single shard).',
      fix: 'Choose high-cardinality partition keys (`USER#<uuid>`, `ORDER#<uuid>`) and use On-Demand capacity mode for bursty traffic.',
    },
    quickCheck: {
      question: 'Why should your backend generate an S3 Presigned URL instead of accepting 50 MB file uploads directly and forwarding them to S3?',
      options: [
        { id: 'a', text: 'S3 rejects uploads from backend servers' },
        { id: 'b', text: 'Direct browser-to-S3 upload eliminates double network bandwidth, prevents API worker/memory exhaustion, and scales seamlessly' },
        { id: 'c', text: 'Presigned URLs make S3 buckets publicly readable forever' },
      ],
      correctId: 'b',
      explanation:
        'Presigned URLs grant scoped, time-limited upload access to one exact S3 key while keeping heavy binary streams off your application servers.',
    },
  },
  {
    id: 'aws-03-event-driven-sqs-sns-observability',
    track: 'aws-dev',
    number: 3,
    level: 'Production',
    title: 'Event-Driven AWS: SQS + DLQ, SNS Fan-Out & CloudWatch Observability',
    tagline: 'Decouple microservices with durable queues, automatic retries, and structured JSON telemetry.',
    readTime: '7 min',
    plainEnglish:
      'Synchronous HTTP chains break when one downstream service slows down. Publish domain events to an SNS Topic (or EventBridge) and fan out into independent SQS Queues—one for Email, one for Analytics, one for Billing. Configure a Dead-Letter Queue (DLQ) so poison messages never block healthy orders.',
    architectureFlow: [
      'Order Service commits DB + Outbox -> SNS Topic (`orders.created`)',
      'Fan-Out -> SQS Email Queue + SQS Analytics Queue',
      'Consumer fails 3x -> Automatic move to Dead-Letter Queue (DLQ)',
      'CloudWatch Alarm pages SRE + X-Ray traces correlation ID',
    ],
    codeTitle: 'Java AWS SDK v2: Publish Event to SQS & Structured JSON Logging',
    codeLanguage: 'java',
    codeSnippet: `import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

// Reuse a SINGLE thread-safe SqsClient bean (keeps HTTP connection pool warm!)
public class OrderEventPublisher {
    private final SqsClient sqs;
    private final String queueUrl;

    public OrderEventPublisher(SqsClient sqs, String queueUrl) {
        this.sqs = sqs;
        this.queueUrl = queueUrl;
    }

    public void publishOrderCreated(String orderId, String traceId) {
        String payload = """
            {"event":"order.created","orderId":"%s","traceId":"%s"}
            """.formatted(orderId, traceId);

        sqs.sendMessage(SendMessageRequest.builder()
            .queueUrl(queueUrl)
            .messageBody(payload)
            .build());
    }
}`,
    cliCheatsheet: [
      { command: 'aws sqs get-queue-attributes --queue-url <url> --attribute-names ApproximateNumberOfMessages', purpose: 'Check backlog depth of an SQS queue or DLQ' },
      { command: 'aws sqs start-message-move-task --source-arn <dlq-arn>', purpose: 'Redrive fixed messages from DLQ back to main queue' },
      { command: 'aws secretsmanager get-secret-value --secret-id prod/db', purpose: 'Fetch encrypted secret JSON via IAM-authenticated CLI' },
    ],
    productionChecklist: [
      'Always set SQS `VisibilityTimeout >= 6 * lambdaTimeout` so a slow worker doesn’t get duplicated mid-processing.',
      'Make every SQS consumer idempotent—Standard SQS guarantees at-least-once delivery.',
      'Attach a CloudWatch Alarm on `ApproximateNumberOfMessagesVisible > 0` for every Dead-Letter Queue.',
    ],
    commonFailure: {
      symptom: 'A customer gets charged or emailed twice for the same order.',
      rootCause: 'Standard SQS delivered the message twice (normal at-least-once behavior), and the consumer did not check an idempotency key.',
      fix: 'Record `order_id` with a unique constraint / DynamoDB conditional write before executing side effects.',
    },
    quickCheck: {
      question: 'Why must every AWS SQS Standard Queue consumer be idempotent?',
      options: [
        { id: 'a', text: 'Standard SQS guarantees at-least-once delivery, meaning rare duplicate deliveries will happen in production' },
        { id: 'b', text: 'SQS deletes messages before workers read them' },
        { id: 'c', text: 'Idempotency disables Dead-Letter Queues' },
      ],
      correctId: 'a',
      explanation:
        'Distributed queues guarantee at-least-once delivery for high availability; consumers must safely handle receiving the same event twice.',
    },
  },

  /* ========================== GCP FOR DEVELOPERS (4) ========================== */
  {
    id: 'gcp-01-iam-cloudrun-gke',
    track: 'gcp-dev',
    number: 1,
    level: 'Basics',
    title: 'GCP Resource Hierarchy, Workload Identity & Cloud Run vs. GKE',
    tagline: 'Deploy zero-ops scale-to-zero containers in 30 seconds on Cloud Run—with zero JSON key files.',
    readTime: '8 min',
    plainEnglish:
      'GCP organizes everything cleanly into Projects (each project is an isolated billing and IAM boundary). Never download Service Account JSON key files! Use Workload Identity Federation for CI/CD and attach a dedicated Service Account directly to Cloud Run or GKE Autopilot pods. Cloud Run takes any Docker image, gives you automatic HTTPS, revision traffic splitting, and scales from 0 to 1,000 instances automatically.',
    architectureFlow: [
      'Docker Image -> Artifact Registry (`us-central1-docker.pkg.dev`)',
      'Cloud Run Service (Managed HTTPS + Concurrency 80/container)',
      'Attached Least-Privilege Service Account (Zero JSON Keys)',
      'Revision Traffic Split (`90% rev-1` / `10% rev-2 canary`)',
    ],
    codeTitle: 'Deploy & Canary-Split a Container API on Cloud Run (`gcloud`)',
    codeLanguage: 'bash',
    codeSnippet: `# 1. Build & push container directly with Cloud Build -> Artifact Registry
gcloud builds submit \\
  --tag us-central1-docker.pkg.dev/$PROJECT_ID/apps/orders-api:v2

# 2. Deploy new revision with 0% live traffic first (safe canary!)
gcloud run deploy orders-api \\
  --image us-central1-docker.pkg.dev/$PROJECT_ID/apps/orders-api:v2 \\
  --region us-central1 \\
  --service-account orders-api-sa@$PROJECT_ID.iam.gserviceaccount.com \\
  --set-secrets="DB_PASS=orders-db-pass:latest" \\
  --min-instances=1 --max-instances=50 \\
  --no-traffic

# 3. Shift 10% traffic to canary revision & verify metrics before 100%
gcloud run services update-traffic orders-api \\
  --region us-central1 \\
  --to-latest=10`,
    cliCheatsheet: [
      { command: 'gcloud auth application-default login', purpose: 'Authenticate local Python/Java GCP SDKs without JSON keys' },
      { command: 'gcloud run services describe orders-api --region us-central1', purpose: 'Inspect live URL, revisions, traffic split, and memory/CPU' },
      { command: 'gcloud logging read "resource.type=cloud_run_revision" --limit 20', purpose: 'Query structured Cloud Logging entries from CLI' },
    ],
    productionChecklist: [
      'Set `--min-instances=1` on latency-sensitive production APIs to eliminate cold starts while still autoscaling up on spikes.',
      'Never create downloadable Service Account JSON keys (`iam.disableServiceAccountKeyCreation` org policy).',
      'Use Cloud Run for HTTP/gRPC/event microservices; graduate to GKE Autopilot when you need custom K8s operators, sidecar meshes, or stateful workloads.',
    ],
    commonFailure: {
      symptom: 'Cloud Run container fails startup check: `Container failed to start and listen on the port defined by PORT`.',
      rootCause: 'Application bound to `127.0.0.1` instead of `0.0.0.0`, or hardcoded port 5000 instead of reading the `PORT` env var (default 8080).',
      fix: 'Bind your server to `0.0.0.0` and read `os.environ.get("PORT", 8080)` (or `server.port=${PORT:8080}` in Spring Boot).',
    },
    quickCheck: {
      question: 'Why does GCP strongly discourage downloading Service Account JSON key files?',
      options: [
        { id: 'a', text: 'JSON keys do not work with Python or Java' },
        { id: 'b', text: 'Static keys never expire automatically and are a top source of credential leaks; attached Service Accounts & Workload Identity issue short-lived tokens automatically' },
        { id: 'c', text: 'Cloud Run cannot read JSON files' },
      ],
      correctId: 'b',
      explanation:
        'Application Default Credentials (ADC) fetch short-lived tokens from the GCE/Cloud Run/GKE metadata server with zero static secrets to rotate or leak.',
    },
  },
  {
    id: 'gcp-02-storage-sql-bigquery',
    track: 'gcp-dev',
    number: 2,
    level: 'Core Workflow',
    title: 'GCP Data Stack: Cloud Storage, Cloud SQL, Firestore & BigQuery',
    tagline: 'Pick the right GCP database for OLTP transactions, real-time apps, and petabyte SQL analytics.',
    readTime: '8 min',
    plainEnglish:
      'GCP gives developers clear purpose-built data stores: Cloud Storage (GCS) for blobs/uploads via V4 Signed URLs, Cloud SQL (managed PostgreSQL/MySQL) connected via encrypted Cloud SQL Auth Proxy, Firestore for real-time document sync, Cloud Spanner for global strong consistency, and BigQuery for serverless columnar analytics over terabytes in seconds.',
    architectureFlow: [
      'App -> Cloud SQL Auth Proxy (Auto mTLS, No IP Allowlists)',
      'Media Uploads -> GCS V4 Signed URLs -> Object Lifecycle Rules',
      'Operational Streams -> Pub/Sub -> BigQuery Storage Write API',
      'Secret Manager injects rotated credentials at runtime',
    ],
    codeTitle: 'Python GCP SDK: GCS Signed URL & BigQuery Parameterized Query',
    codeLanguage: 'python',
    codeSnippet: `from datetime import timedelta
from google.cloud import storage, bigquery

# Uses Application Default Credentials (ADC) automatically — zero API keys in code!
storage_client = storage.Client()
bq_client = bigquery.Client()

def generate_gcs_upload_url(bucket_name: str, blob_name: str) -> str:
    blob = storage_client.bucket(bucket_name).blob(blob_name)
    return blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=5),
        method="PUT",
        content_type="application/pdf",
    )

def top_skus_last_7_days(region: str) -> list[dict]:
    # Always use parameterized queries & select only needed columns (columnar billing!)
    query = """
        SELECT sku, SUM(revenue_cents) AS total_cents
        FROM \`analytics.order_events\`
        WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
          AND region = @region
        GROUP BY sku ORDER BY total_cents DESC LIMIT 10
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("region", "STRING", region)]
    )
    return [dict(row) for row in bq_client.query(query, job_config=job_config)]`,
    cliCheatsheet: [
      { command: 'gcloud storage ls gs://my-bucket/', purpose: 'Fast parallel GCS object listing and transfers' },
      { command: 'gcloud sql connect orders-pg --user=app', purpose: 'Connect to Cloud SQL PostgreSQL securely' },
      { command: 'bq query --use_legacy_sql=false --dry_run "SELECT ..."', purpose: 'Check exact bytes scanned & cost BEFORE running a BigQuery query' },
    ],
    productionChecklist: [
      'Never run `SELECT *` on BigQuery—it is columnar and bills by bytes scanned per column; always partition tables by date and cluster by filter keys.',
      'Connect Cloud Run/GKE to Cloud SQL via Private Service Connect or Cloud SQL Auth Proxy (automatic IAM + mTLS encryption).',
      'Enable Uniform Bucket-Level Access on GCS buckets so IAM controls everything consistently.',
    ],
    commonFailure: {
      symptom: 'Unexpected $800 BigQuery bill from a single dashboard refresh loop.',
      rootCause: 'Unpartitioned `SELECT *` full-table scans running repeatedly on a multi-terabyte table.',
      fix: 'Partition by `event_date`, enforce `require_partition_filter = true`, select only required columns, and set project-level `maximum_bytes_billed`.',
    },
    quickCheck: {
      question: 'Why is `SELECT *` an expensive anti-pattern in Google BigQuery?',
      options: [
        { id: 'a', text: 'BigQuery does not support wildcard syntax' },
        { id: 'b', text: 'BigQuery uses columnar storage and on-demand pricing charges per byte scanned—selecting all columns scans the entire table width unnecessarily' },
        { id: 'c', text: 'It locks the table against concurrent writes' },
      ],
      correctId: 'b',
      explanation:
        'Columnar engines only read columns referenced in the query. Pruning unused columns and partitioning by date can cut BigQuery cost and latency by 95%+.',
    },
  },
  {
    id: 'gcp-03-pubsub-eventarc-observability',
    track: 'gcp-dev',
    number: 3,
    level: 'Production',
    title: 'GCP Async Messaging: Pub/Sub, Cloud Tasks & Cloud Observability',
    tagline: 'Build globally resilient event pipelines with Push Subscriptions straight into Cloud Run.',
    readTime: '7 min',
    plainEnglish:
      'Cloud Pub/Sub is GCP’s global managed message bus combining SNS fan-out and SQS queuing in one service: publishers write to a Topic, and each Subscription gets its own independent copy of every message with built-in Dead-Letter Topics and replay/seek! Cloud Run can receive Pub/Sub messages as authenticated HTTPS POST pushes with automatic autoscaling.',
    architectureFlow: [
      'Order Service -> Pub/Sub Topic (`orders-created`)',
      'Push Subscription (OIDC JWT Verified) -> Cloud Run Worker',
      'Failure after 5 retries -> Dead-Letter Topic + Alert Policy',
      'OpenTelemetry -> Cloud Trace + Cloud Logging (Correlated Trace ID)',
    ],
    codeTitle: 'Java GCP Pub/Sub Publisher + Structured Cloud Logging Trace Correlation',
    codeLanguage: 'java',
    codeSnippet: `import com.google.cloud.pubsub.v1.Publisher;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;

public class GcpOrderPublisher {
    private final Publisher publisher;

    public GcpOrderPublisher(String projectId, String topicId) throws Exception {
        // Publisher batches messages automatically for high throughput!
        this.publisher = Publisher.newBuilder(TopicName.of(projectId, topicId)).build();
    }

    public String publishOrder(String orderId, String jsonPayload) throws Exception {
        PubsubMessage msg = PubsubMessage.newBuilder()
            .setData(ByteString.copyFromUtf8(jsonPayload))
            .putAttributes("event_type", "order.created")
            .putAttributes("order_id", orderId)
            .build();
        return publisher.publish(msg).get();
    }
}`,
    cliCheatsheet: [
      { command: 'gcloud pubsub topics publish orders-created --message=\'{"id":"1"}\'', purpose: 'Publish a test event directly to a Pub/Sub topic' },
      { command: 'gcloud pubsub subscriptions seek sub-email --time=-1h', purpose: 'Replay the last 1 hour of messages after deploying a bug fix' },
      { command: 'gcloud secrets versions access latest --secret="api-key"', purpose: 'Inspect the latest version of a secret in Secret Manager' },
    ],
    productionChecklist: [
      'Write structured JSON logs to `stdout` with `severity` and `logging.googleapis.com/trace`—Cloud Run/GKE automatically ships and correlates them in Cloud Logging + Cloud Trace.',
      'Use Pub/Sub for many-to-many async events; use Cloud Tasks when you need per-task scheduling, rate-limiting, or deduplication against an HTTP worker.',
      'Always configure a Dead-Letter Topic (`--dead-letter-topic`) and max delivery attempts (`5`) on every production subscription.',
    ],
    commonFailure: {
      symptom: 'A Pub/Sub Push Subscription retries the same slow message forever even though the worker succeeded.',
      rootCause: 'The worker took longer than the Subscription’s `ackDeadlineSeconds` (default 10s), so Pub/Sub assumed timeout and redelivered.',
      fix: 'Increase `ackDeadlineSeconds` (up to 600s) to match worst-case processing time and keep consumers idempotent.',
    },
    quickCheck: {
      question: 'When should a GCP developer pick Cloud Tasks instead of Cloud Pub/Sub?',
      options: [
        { id: 'a', text: 'When you need explicit per-task scheduled delivery times, queue rate-limiting (max dispatches/sec), and targeted worker invocation' },
        { id: 'b', text: 'When you need fan-out to 10 independent downstream microservices' },
        { id: 'c', text: 'When storing 100 GB video files' },
      ],
      correctId: 'a',
      explanation:
        'Pub/Sub excels at decoupled many-to-many event streaming/fan-out; Cloud Tasks gives fine-grained control over dispatch rates, retries, and delayed execution.',
    },
  },
];

export const AWS_GCP_DEVELOPER_MAPPINGS: AwsGcpDeveloperMapping[] = [
  {
    id: 'map-containers',
    task: 'Deploy Containerized REST API (Zero Server Ops)',
    category: 'Compute',
    awsService: 'AWS ECS Fargate (or App Runner)',
    gcpService: 'Google Cloud Run',
    whenToPick: 'Use Cloud Run or App Runner for instant HTTPS + scale-to-zero; ECS Fargate when integrating deeply with AWS VPC/ALB.',
    awsCode: `# AWS ECS Fargate (via Copilot or Terraform)
aws ecs update-service \\
  --cluster prod-cluster \\
  --service orders-api \\
  --force-new-deployment`,
    gcpCode: `# GCP Cloud Run (Single command with auto HTTPS)
gcloud run deploy orders-api \\
  --image us-central1-docker.pkg.dev/$PROJ/apps/api:v2 \\
  --region us-central1 --min-instances=1`,
  },
  {
    id: 'map-k8s',
    task: 'Managed Kubernetes Cluster',
    category: 'Compute',
    awsService: 'Amazon EKS (+ Karpenter / Fargate)',
    gcpService: 'Google Kubernetes Engine (GKE Autopilot)',
    whenToPick: 'GKE Autopilot manages node pools & security automatically; EKS + Karpenter gives granular EC2 spot/instance control.',
    awsCode: `aws eks update-kubeconfig \\
  --region us-east-1 \\
  --name prod-eks-cluster`,
    gcpCode: `gcloud container clusters get-credentials prod-gke \\
  --region us-central1 \\
  --project $PROJECT_ID`,
  },
  {
    id: 'map-object-storage',
    task: 'Direct File Upload via Presigned / Signed URL',
    category: 'Storage & DB',
    awsService: 'Amazon S3 (Presigned URL)',
    gcpService: 'Cloud Storage (V4 Signed URL)',
    whenToPick: 'Always keep large binary uploads off your API servers using short-lived 5-minute signed PUT URLs.',
    awsCode: `url = boto3.client("s3").generate_presigned_url(
    "put_object",
    Params={"Bucket": "uploads", "Key": key},
    ExpiresIn=300
)`,
    gcpCode: `url = storage.Client().bucket("uploads").blob(key) \\
    .generate_signed_url(
        version="v4", expiration=timedelta(minutes=5), method="PUT"
    )`,
  },
  {
    id: 'map-async-events',
    task: 'Async Event Fan-Out & Reliable Queueing',
    category: 'Messaging',
    awsService: 'Amazon SNS + SQS (+ DLQ)',
    gcpService: 'Cloud Pub/Sub (+ Dead-Letter Topic)',
    whenToPick: 'AWS pairs SNS (fan-out) with SQS (queue buffer); GCP Pub/Sub combines topic fan-out + durable subscriptions in one service.',
    awsCode: `boto3.client("sns").publish(
    TopicArn=TOPIC_ARN,
    Message=json.dumps({"orderId": "ord_42"})
)`,
    gcpCode: `pubsub_v1.PublisherClient().publish(
    topic_path,
    json.dumps({"orderId": "ord_42"}).encode("utf-8")
).result()`,
  },
  {
    id: 'map-secrets',
    task: 'Read Encrypted Database Password at Runtime',
    category: 'Identity & Secrets',
    awsService: 'AWS Secrets Manager',
    gcpService: 'GCP Secret Manager',
    whenToPick: 'Cache secrets in memory with TTL refresh—never call Secrets Manager on every single incoming HTTP request!',
    awsCode: `secret = boto3.client("secretsmanager") \\
    .get_secret_value(SecretId="prod/orders/db")["SecretString"]`,
    gcpCode: `resp = secretmanager.SecretManagerServiceClient() \\
    .access_secret_version(name="projects/p/secrets/db/versions/latest")
secret = resp.payload.data.decode("utf-8")`,
  },
  {
    id: 'map-managed-sql',
    task: 'Managed PostgreSQL + Analytics Warehouse',
    category: 'Storage & DB',
    awsService: 'Amazon RDS Aurora + Redshift / Athena',
    gcpService: 'Cloud SQL / AlloyDB + BigQuery',
    whenToPick: 'Keep transactional OLTP in Aurora/Cloud SQL and stream append-only analytics to BigQuery/Athena.',
    awsCode: `# Connect via RDS Proxy + IAM Auth Token
aws rds generate-db-auth-token \\
  --hostname prod.cluster-xyz.us-east-1.rds.amazonaws.com \\
  --port 5432 --username app_user`,
    gcpCode: `# Connect via Cloud SQL Auth Proxy (auto mTLS)
./cloud-sql-proxy proj:us-central1:orders-pg --port 5432`,
  },
];
