# Day 2 Recap — GH-900

## Today's Focus

Day 2 focused on moving beyond basic Git and GitHub concepts into real-world collaboration, security, GitHub Copilot, open source contribution, GitHub Actions, CI/CD, automation, administration, and exam preparation. The training continued using a practical project-based approach, demonstrating how GitHub can be used throughout the full software development lifecycle.

## 1. GitHub Copilot in GitHub

We explored how GitHub Copilot can work directly inside GitHub, not only in VS Code.

### What Copilot can help with

- Explain repositories
- Create implementation plans
- Review code
- Resolve merge conflicts
- Generate pull request summaries
- Analyze project work items
- Perform security fixes
- Assist with GitHub Actions workflows

### Key Takeaway

GitHub Copilot is evolving from a coding assistant into a project assistant that can help with planning, implementation, testing, security, and documentation.

### Real-World Use Case

A development team can ask Copilot to:

- Review a repository
- Analyze open work items
- Implement a feature
- Create a pull request
- Fix security findings
- Generate release notes

This reduces repetitive work and lets developers focus on design and business requirements.

## 2. GitHub Projects & Agile Planning

We reviewed GitHub Projects and how they can be used as an Agile planning tool.

Topics included:

- Epics
- Work items
- Priorities
- Status tracking
- Swim lanes
- Roadmaps
- Progress tracking

### Key Takeaway

GitHub Projects provides a centralized place to manage work, track progress, and connect development activities directly to project goals.

### Real-World Use Case

Teams can:

- Track application development
- Prioritize features
- Visualize work in progress
- Identify delivery bottlenecks

without needing a separate project management platform.

## 3. Open Source Contribution

### Concepts Covered

- Open Source repositories
- Forking
- Cloning
- Creating branches
- Pull Requests
- Contributing to projects outside your organization

### Workflow

```text
Fork Repository
      ↓
Clone Repository
      ↓
Modify Code
      ↓
Commit Changes
      ↓
Create Pull Request
      ↓
Project Maintainer Reviews
```

### Key Takeaway

Forking allows contributors to safely propose changes without requiring direct access to the original repository.

### Real-World Use Case

If you find a bug in an open-source project:

1. Fork the repository
2. Fix the issue
3. Submit a Pull Request
4. Allow maintainers to review and merge

## 4. InnerSource

InnerSource applies open-source collaboration practices inside an organization.

### Topics Covered

- Repository visibility
- Internal collaboration
- Discoverability
- Contribution guidelines
- Controlled access

### Key Takeaway

InnerSource helps organizations reuse components and encourage collaboration while maintaining governance and security.

### Real-World Use Case

A central engineering team can develop reusable APIs or frameworks that other internal teams can contribute to and improve.

## 5. GitHub Security Best Practices

Several important security concepts were discussed.

### Protect Sensitive Information

Never commit:

- Passwords
- API Keys
- Secrets
- Connection strings

Use these instead:

- `.gitignore`
- GitHub Secrets

### Security Features Covered

- CodeQL
- Secret Scanning
- Dependabot
- Security Advisories
- Branch Protection

### Dependabot

Dependabot monitors dependencies and alerts teams when libraries have known vulnerabilities.

### Key Takeaway

Security should be integrated throughout development rather than added at the end.

### Real-World Use Case

When an open-source library has a critical vulnerability:

- Dependabot detects it
- Pull Requests can be generated automatically
- Teams receive alerts immediately

## 6. OWASP Top 10 Awareness

The session highlighted common web application risks such as:

- SQL Injection
- Broken Access Control
- Cryptographic Failures
- Security Misconfiguration
- Cross-Site Request Forgery risks

### Key Takeaway

Developers should understand common attack vectors and use GitHub security tools to identify potential issues early.

### Real-World Use Case

Security scanning during Pull Requests helps prevent vulnerable code from reaching production environments.

## 7. GitHub Actions (CI/CD)

A significant portion of the session focused on automation using GitHub Actions.

### What was demonstrated?

Creating workflows for:

- Build
- Dependency validation
- Security checks
- Unit Testing
- Continuous Integration

### Example Flow

```text
Code Push
      ↓
Dependency Validation
      ↓
Security Checks
      ↓
Unit Tests
      ↓
Package Application
```

### Key Takeaway

GitHub Actions can automate repetitive development tasks and improve software quality.

### Real-World Use Case

Every code commit automatically:

- Runs tests
- Checks vulnerabilities
- Validates dependencies
- Prevents broken code from being merged

## 8. GitHub Secrets

The session demonstrated storing secrets securely within GitHub.

Instead of hard-coding values like:

- Azure API keys
- Database passwords
- OAuth secrets

use **GitHub Actions Secrets**.

### Key Takeaway

Secrets should never be stored in source code repositories.

## 9. GitHub Runners

Different runner types were covered.

### GitHub Hosted Runners

Managed by GitHub:

- Ubuntu
- Windows
- macOS

### Self-Hosted Runners

Managed by your organization.

### Real-World Use Case

Organizations with strict compliance requirements can execute workflows only on approved internal infrastructure.

## 10. Docker & Containerization

The sample application was containerized using Docker.

Topics covered:

- Dockerfile
- Docker Images
- Docker Containers
- Port Mapping
- Environment Variables

### Key Takeaway

Containerization allows applications to run consistently across environments.

### Real-World Use Case

Developers can package an application once and deploy it consistently to:

- Local machine
- Test environment
- Cloud platform
- Kubernetes cluster

## 11. GitHub Packages

The session demonstrated publishing artifacts and Docker images to GitHub Packages.

### Benefits

- Central package management
- Version control
- Secure distribution
- Development team collaboration

### Real-World Use Case

Internal teams can reuse shared application components without rebuilding functionality.

## 12. GitHub Administration

Topics included:

- Organizations
- Teams
- Roles
- Authentication
- Authorization
- Least Privilege
- MFA
- Passkeys
- Enterprise Governance

### Key Takeaway

Security and governance become increasingly important as GitHub adoption grows across an organization.

## 13. Azure DevOps vs GitHub

The differences and similarities between GitHub and Azure DevOps were discussed.

### GitHub Strengths

- Strong developer community
- Open-source ecosystem
- GitHub Copilot integration

### Azure DevOps Strengths

- Enterprise integration
- Native Microsoft ecosystem integration
- Boards, Pipelines, Repos, Test Plans, and Artifacts

### Key Takeaway

Both platforms support modern DevOps practices; the best choice depends on organizational requirements.

## GH-900 Exam Tips Shared

For the certification exam:

### Be familiar with:

- Issues
- Pull Requests
- Organizations
- Teams
- Repository Roles
- Security Features
- Search and Filters
- GitHub Flow
- GitHub Actions

Pay particular attention to:

- Repository settings
- Permissions
- Team structures
- Search/filter capabilities

These areas were highlighted as commonly appearing in exam questions.

## Links Shared During Training

### Course Repository

- [GH-900 Training Repository](https://github.com/GH-900-trainings/GH-900-July-2026)

### GitHub Foundations Certification

- [GitHub Foundations Certification](https://learn.microsoft.com/en-us/credentials/certifications/github-foundations)

### Kubernetes Pull Request Example

- [Kubernetes Pull Requests](https://github.com/kubernetes/kube-openapi/pulls)

### Security Reference

- [OWASP Top 10 Security Risks](https://owasp.org/www-project-top-ten/)

### Azure DevOps Learning Resource

- [AZ-400 Course Preview Playlist](https://www.youtube.com/watch?v=iZRx7l2JXw8&list=PLahhVEj9XNTeMSRsxaQcegvIC4Mh4dI6p)

### Lab 6

- [Create Your First Pull Request](https://learn.microsoft.com/en-us/training/modules/contribute-open-source/4-exercise-create-pr)

### Lab 7

- [InnerSource Fundamentals](https://learn.microsoft.com/en-us/training/modules/manage-innersource-program-github/3-innersource-fundamentals)

## ✅ Action Items After Training

- Review GitHub Actions workflows
- Practice Fork → Clone → Pull Request flow
- Explore Dependabot and CodeQL
- Build a simple GitHub Project board
- Review GitHub administration settings
- Complete Lab 6 and Lab 7
- Begin GH-900 exam preparation using the course repository and certification resources

## ⭐ IMPORTANT – Course Survey

Please complete the course survey to provide feedback and help improve future deliveries:

### Survey Form

🔗 [Complete Course Survey](https://www.metricsthatmatter.com/student/evaluation.asp?k=79335&i=103967)
