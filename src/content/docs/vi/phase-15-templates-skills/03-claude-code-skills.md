---
title: 'Claude Code Skills'
description: 'Tìm hiểu Claude Code Skills: custom slash commands, automated workflows và reusable skill patterns.'
---

# Module 15.3: Claude Code Skills

> **Thời gian ước tính**: ~30 phút
>
> **Yêu cầu trước**: Module 15.2 (Templates lệnh & prompt)
>
> **Kết quả**: Sau module này, bạn sẽ hiểu Claude Code Skill, biết find và install, và use để extend Claude capability.

---

## 1. WHY — Tại sao cần học

Bạn muốn Claude work với Kubernetes, Terraform, hoặc specific framework. Claude có general knowledge, nhưng không có specialized command, best practice, và workflow cho tool của bạn. Bạn phải teach same thing repeatedly.

Skill package knowledge này. Install một skill, và Claude immediately biết pattern, best practice, và workflow. No repeated teaching.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Skill là gì?

```text
Skill = Knowledge + Tools + Workflows

- Knowledge: Domain-specific information
- Tools: Command và integration
- Workflows: Step-by-step process
```

### Skill Type

| Type | Source | Examples |
|------|--------|----------|
| **Official** | Anthropic | Core development skill |
| **Community** | Open source | Framework-specific skill |
| **Custom** | You/team | Company-specific skill |

### Skill Component

```text
⚠️ Structure có thể vary — verify implementation hiện tại

/skill-name/
├── SKILL.md          # Skill documentation
├── prompts/          # Prompt template
├── tools/            # Tool definition
├── workflows/        # Multi-step workflow
└── examples/         # Usage example
```

### Skill Extend Claude như thế nào

```text
Không có Skill:
Bạn: "Tạo Kubernetes deployment"
Claude: [Generic YAML, có thể miss best practice]

Có Kubernetes Skill:
Bạn: "Tạo Kubernetes deployment"
Claude: [Production-ready YAML với health check,
         resource limit, proper label]
```

### Skill Discovery

- Official skill repository
- Community skill registry
- GitHub search cho Claude Code skill
- Team internal skill library

---

## 3. DEMO — Từng bước cụ thể

**Scenario**: Sử dụng skill để improve Claude domain knowledge.

### Bước 1: Explore Available Skill

```bash
# ⚠️ Command có thể vary — verify implementation hiện tại

$ claude skill list --available

Official Skills:
- docker: Docker container management
- kubernetes: Kubernetes orchestration
- terraform: Infrastructure as Code

Community Skills:
- nextjs: Next.js development pattern
- prisma: Prisma ORM workflow
```

### Bước 2: Install một Skill

```bash
# ⚠️ Verify implementation hiện tại

$ claude skill install kubernetes

Installing kubernetes skill...
✓ Downloaded skill package
✓ Registered tools
✓ Loaded prompts

Kubernetes skill installed.
```

### Bước 3: Dùng Skill trong Session

```text
Bạn: Tạo production-ready deployment cho Node.js app
với 3 replica.

Claude: [Dùng kubernetes skill]

Tôi sẽ tạo production-ready deployment:
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-app
  labels:
    app: nodejs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nodejs-app
  template:
    spec:
      containers:
      - name: nodejs-app
        image: your-registry/nodejs-app:latest
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
```

**Skill đảm bảo**:
- Resource limit (prevent runaway container)
- Health probe (automatic restart on failure)
- Proper label (cho service discovery)

### Bước 4: Skill-Specific Command

```text
Bạn: /k8s-debug my-pod đang CrashLoopBackOff

Claude: [Skill-guided debugging]

Kubernetes debugging workflow:
1. Check pod status: kubectl describe pod my-pod
2. Check logs: kubectl logs my-pod --previous
3. Common cause:
   - Application error (check log)
   - Missing config/secret
   - Resource limit quá thấp
```

---

## 4. PRACTICE — Luyện tập

### Bài 1: Explore Available Skill

**Mục tiêu**: Discover skill nào tồn tại.

**Hướng dẫn**:
1. List available official skill
2. Đọc documentation cho 2-3 skill
3. Identify skill nào giúp project hiện tại

<details>
<summary>💡 Gợi ý</summary>

Focus vào skill match tech stack: cloud provider, framework, database.

</details>

<details>
<summary>✅ Giải pháp</summary>

Useful skill theo role:
- **Backend**: kubernetes, docker, database skill
- **Frontend**: nextjs, react, tailwind skill
- **DevOps**: terraform, aws/gcp, ci-cd skill
- **Data**: python, pandas, jupyter skill

Pick 1-2 relevant nhất với công việc hàng ngày.

</details>

### Bài 2: Install và Use một Skill

**Mục tiêu**: Trải nghiệm skill-enhanced Claude output.

**Hướng dẫn**:
1. Install skill relevant cho project
2. Hỏi Claude câu hỏi domain-specific
3. So sánh output quality với/không có skill

<details>
<summary>💡 Gợi ý</summary>

Try cùng prompt trước và sau khi install skill để thấy difference.

</details>

<details>
<summary>✅ Giải pháp</summary>

Example so sánh:
- **Không có skill**: Generic code, missing best practice
- **Có skill**: Production-ready code, include error handling, follow convention

Skill provide domain expertise Claude không có otherwise.

</details>

### Bài 3: Evaluate Skill Quality

**Mục tiêu**: Learn cách assess community skill.

**Hướng dẫn**:
1. Tìm community skill cho tech stack của bạn
2. Test trên 3 task khác nhau
3. Evaluate: documentation, accuracy, maintenance

<details>
<summary>💡 Gợi ý</summary>

Check: last updated, GitHub star, issue/response, example quality.

</details>

<details>
<summary>✅ Giải pháp</summary>

Quality checklist:
- [ ] Clear documentation với example
- [ ] Updated trong 6 tháng gần đây
- [ ] Maintainer responsive
- [ ] Accurate output trên test của bạn

Không install skill fail nhiều check.

</details>

---

## 5. CHEAT SHEET

### Skill Command

```bash
# ⚠️ Verify implementation hiện tại

claude skill list             # List installed
claude skill list --available # List tất cả available
claude skill install [name]   # Install skill
claude skill remove [name]    # Remove skill
claude skill info [name]      # Skill detail
```

### Popular Skill Category

| Category | Examples |
|----------|----------|
| **Cloud** | AWS, GCP, Azure |
| **DevOps** | Kubernetes, Docker, Terraform |
| **Databases** | PostgreSQL, MongoDB, Redis |
| **Frameworks** | Next.js, Django, FastAPI |
| **Tools** | Git, CI/CD, Testing |

### Skill Quality Checklist

- [ ] Documentation rõ ràng
- [ ] Real code example
- [ ] Active maintenance
- [ ] Positive community feedback

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Install mọi skill | Chỉ install cái cần |
| Trust skill blindly | Review output critically |
| Dùng outdated skill | Check version và maintenance |
| Ignore skill conflict | Aware skill interaction |
| Không đọc skill doc | Understand capability trước |
| Ignore skill command | Learn shortcut |
| Require skill để hoạt động | Skill enhance, không nên required |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Fintech Việt Nam migrate sang Kubernetes. Team có ít K8s experience. Claude helped nhưng output generic, missing production pattern.

**Skill Solution**:

Install kubernetes skill cung cấp:
- Production-ready manifest template
- Security best practice (RBAC, NetworkPolicy)
- Debugging workflow
- Scaling pattern

**Team Workflow**:
1. "Tạo deployment cho payment-service"
2. Claude dùng skill → production-ready YAML
3. Team review (learning while doing)
4. Deploy with confidence

**Kết quả (2 tháng)**:
- Manifest quality: Generic → Production-ready
- Security issue: 8 → 1 (skill enforce best practice)
- Time to deploy: -40% (ít back-and-forth fix)
- Team learning: Accelerated (skill explain pattern)

**Quote**: "Skill như có Kubernetes expert pair programming. Được production-ready output trong khi learning best practice."

---

> **Tiếp theo**: [Module 15.4: Hệ sinh thái cộng đồng](../04-community-ecosystem/) →
