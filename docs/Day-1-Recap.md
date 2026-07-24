# Day 1 Recap — GH-900

## What We Learned Today

Day 1 focused on building a solid foundation for understanding Git, GitHub, repositories, collaboration, GitHub Copilot, Code Scanning, GitHub Projects, Codespaces, and Markdown. The session combined theory, demonstrations, hands-on labs, and a live end-to-end project to show how modern development teams work together using GitHub.

## 1. Understanding Git vs GitHub

The first key concept was learning the difference between **Git** and **GitHub**.

### Git

- Open-source version control system
- Tracks code changes over time
- Maintains commit history
- Allows branching and merging
- Helps teams work on the same code without overwriting each other's work

### GitHub

- Cloud platform built around Git
- Hosts repositories
- Provides collaboration tools
- Adds security scanning, automation, projects, Copilot, Codespaces, and more

A major focus was understanding why version control is important when multiple developers work on the same source code. Without version control, developers can accidentally overwrite each other's changes. Git solves this problem by tracking every change and allowing safe collaboration.

## 2. Why Version Control Matters

### Scenario Covered

Two developers work on the same application:

- Developer A adds a new feature
- Developer B fixes a bug

Without proper version control:

- One person's changes may overwrite another person's changes.

With Git:

- Both developers work independently.
- Changes are merged safely.
- History is preserved.
- Teams can roll back to earlier versions if needed.

### Real-World Use Cases

✅ Banking applications

✅ Enterprise software development

✅ Website development

✅ Configuration management

✅ Infrastructure as Code

✅ Documentation management

✅ Team collaboration across countries

## 3. Git Fundamentals

The session introduced common Git concepts:

### Repository (Repo)

A place where source code is stored.

### Commit

A snapshot of changes.

### Branch

A separate line of development.

### Merge

Combines changes from multiple branches.

### Clone

Downloads a repository to your computer.

### Git Commands Covered

- `git clone`
- `git status`
- `git add`
- `git commit`
- `git push`
- `git pull`
- `git fetch`
- `git log`

These commands form the foundation of daily Git operations.

## 4. GitHub Organizations and Repositories

The training demonstrated:

### Personal Account

Best for:

- Individual projects
- Learning
- Small experiments

### Organization

Best for:

- Teams
- Enterprises
- Project management
- Permission management

Topics covered included:

- Teams
- Members
- Roles
- Repository access
- Read/Write/Admin permissions

### Use Case

A company may have:

- Front-end team
- Back-end team
- Security team

Each team receives access only to the repositories they need.

## 5. GitHub Issues and Project Management

GitHub can manage work, not just code.

### Issues

Used to track:

- Tasks
- Features
- Bugs
- Improvements

### Labels

Help categorize work:

- Bug
- Enhancement
- Documentation
- Work Item

### GitHub Projects

A Kanban-style board was demonstrated:

- Backlog
- In Progress
- QA
- Done

### Benefits

- Better visibility
- Team collaboration
- Sprint planning
- Work tracking

### Use Cases

✅ Agile projects

✅ Scrum teams

✅ Software releases

✅ Product development

✅ Internal IT projects

## 6. GitHub Flow and Pull Requests

One of the most important Day 1 topics.

### Recommended Flow

1. Create branch
2. Make changes
3. Commit changes
4. Push branch
5. Create Pull Request
6. Review changes
7. Merge into Main

### Why Not Work Directly in Main?

Main branch should remain stable.

Benefits:

- Code review
- Collaboration
- Conflict prevention
- Better quality control

### Branch Protection

The session demonstrated how to:

- Protect Main branch
- Require Pull Requests
- Require approvals before merge

### Real-World Use Case

In enterprise environments:

- Developers cannot merge directly to Main.
- Senior reviewers must approve changes before deployment.

## 7. GitHub Copilot

A significant portion of the session focused on GitHub Copilot.

Topics covered:

### AI-Assisted Development

GitHub Copilot can:

- Generate code
- Explain code
- Create documentation
- Suggest fixes
- Generate tests
- Resolve merge conflicts

### Copilot Agent Mode

The demonstration showed how Copilot can:

- Work on GitHub Issues
- Create code automatically
- Update documentation
- Generate Pull Requests

### Models

Different AI models were discussed, including:

- Claude family models
- GPT family models
- Gemini family models

GitHub Copilot provides access to multiple AI models depending on licensing.

## 8. Live End-to-End Project

A complete project was created from scratch.

### Application

Node.js web application

### Activities Demonstrated

- Repository creation
- Issue creation
- GitHub Project setup
- Copilot-assisted coding
- Commit workflow
- Branch workflow
- Pull Requests
- Merge process

### Additional Enhancement

A weather application using Azure Maps was demonstrated.

Features included:

- Location lookup
- Temperature
- Humidity
- UV Index
- Weather forecast

This showed how GitHub and Copilot can accelerate real development projects.

## 9. GitHub Code Scanning and Security

Security was covered as an essential development practice.

### CodeQL

Code scanning tool built into GitHub.

Purpose:

- Detect security vulnerabilities
- Find coding issues
- Improve software quality

### Dependabot

Automatically:

- Monitors dependencies
- Identifies vulnerabilities
- Suggests updates

### Shift Left Security

Security should be introduced as early as possible.

Instead of:

```text
Build → Deploy → Find Security Problem
```

Do:

```text
Write Code → Scan Code → Fix → Deploy
```

### Use Cases

✅ Secure software development

✅ Compliance requirements

✅ DevSecOps

✅ Enterprise code reviews

## 10. GitHub Codespaces

GitHub Codespaces provides cloud development environments.

Benefits:

- Browser-based development
- No local setup required
- Consistent environment
- Fast project onboarding

### Use Cases

✅ Student labs

✅ Temporary development environments

✅ Remote development

✅ Team standardization

## 11. GitHub Plans and Licensing

Different GitHub offerings were discussed:

### GitHub Free

Good for:

- Learning
- Personal projects

### GitHub Team

Good for:

- Small teams
- Collaboration

### GitHub Enterprise

Adds:

- Enterprise security
- Identity integration
- Governance controls
- Compliance features

GitHub Copilot licensing was also discussed as a separate add-on.

## 12. Markdown

Markdown is the primary documentation language in GitHub.

Examples:

**Headers**

```markdown
# Title
## Subtitle
```

**Bold**

```markdown
**Text**
```

**Code Blocks**

````markdown
```javascript
console.log("Hello")
```
````

**Images**

```markdown
![Alt Text](image.png)
```

### Use Cases

✅ Project documentation

✅ README files

✅ Technical guides

✅ Knowledge sharing

✅ Pull Request documentation

## Key Exam Tips

### Remember These

✅ Git = Version Control System

✅ GitHub = Platform built on Git

✅ Commit = Snapshot

✅ Repository = Code storage location

✅ Branch = Isolated development path

✅ Pull Request = Request to merge changes

✅ Main branch should be protected

✅ GitHub Issues track work

✅ GitHub Projects manage workflow

✅ CodeQL performs code scanning

✅ GitHub Copilot assists development

✅ Codespaces provide cloud development environments

✅ Markdown is used for documentation

Several exam-focused reminders were also discussed around GitHub filters, Issues, Projects, Pull Requests, and repository management.

## Links Shared During Training

### Microsoft Learn

- [GitHub Foundations Certification](https://learn.microsoft.com/en-us/credentials/certifications/github-foundations)
- [Lab 1 - Guided Tour of GitHub](https://learn.microsoft.com/en-us/training/modules/introduction-to-github/6-guided-tour-of-github)
- [Lab 2 - Configure Code Scanning](https://learn.microsoft.com/en-us/training/modules/configure-code-scanning/5-exercise)
- [Lab 3 - Develop with GitHub Copilot and VS Code](https://learn.microsoft.com/en-us/training/modules/introduction-to-github-copilot/5-exercise)
- [Lab 4 - Code with Codespaces and VS Code](https://learn.microsoft.com/en-us/training/modules/code-with-github-codespaces/5-exercise-code-with-codespaces)
- [Lab 5 - Communicate Using Markdown](https://learn.microsoft.com/en-us/training/modules/communicate-using-markdown/3-communicating-using-markdown)

### GitHub References

- [Git](https://git-scm.com/)
- [GH-900 Training Organization](https://github.com/GH-900-trainings)
- [GH-900 July 2026 Repository](https://github.com/GH-900-trainings/GH-900-July-2026)

### Legacy Version Control Systems

- [Concurrent Versions System (CVS)](https://en.wikipedia.org/wiki/Concurrent_Versions_System)
- [Apache Subversion (SVN)](https://subversion.apache.org/)

### Tools and Resources

- [Oh My Posh](https://ohmyposh.dev/)
- [Azure Animations](https://aka.ms/AzureAnimations)
