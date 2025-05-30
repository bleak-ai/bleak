# 📦 Publishing Guide for `bleakai` Package

This guide covers all the steps needed to publish and maintain the `bleakai` npm package.

## 🔧 Prerequisites

1. **npm account**: You need an npm account with access to the `bleakai` package
2. **npm CLI**: Make sure you're logged in via `npm login`
3. **Git repository**: Set up the repository (covered below)

## 🚀 Initial Setup (One-time)

### 3. Verify npm Login

```bash
npm whoami
# Should show your npm username
```

### 4. Test Build Process

```bash
cd packages/bleakai
npm run build
```

Verify that the `dist/` directory contains:

- `index.es.js`
- `index.umd.js`
- `index.d.ts`
- Source maps

## 📋 Pre-Publishing Checklist

Before each publish, ensure:

### ✅ Code Quality

- [ ] All TypeScript compiles without errors: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm run test` (if applicable)
- [ ] Build succeeds: `npm run build`

### ✅ Package Configuration

- [ ] Version number is correct in `package.json`
- [ ] `README.md` is up to date
- [ ] All necessary files are included in `files` array
- [ ] Entry points (`main`, `module`, `types`) are correct

### ✅ Documentation

- [ ] README has usage examples
- [ ] API documentation is current
- [ ] Changelog is updated (if you maintain one)

## 🔄 Publishing Process

### 1. Version Bump

Choose the appropriate version bump:

```bash
# Patch (bug fixes): 2.0.0 -> 2.0.1
npm version patch

# Minor (new features): 2.0.0 -> 2.1.0
npm version minor

# Major (breaking changes): 2.0.0 -> 3.0.0
npm version major
```

This will:

- Update version in `package.json`
- Create a git commit
- Create a git tag

### 2. Test Package Before Publishing

```bash
# Create a tarball to inspect
npm pack

# This creates bleakai-x.x.x.tgz
# You can extract and inspect it to verify contents
```

### 3. Publish to npm

```bash
# For regular releases
npm publish

# For beta/pre-release versions
npm publish --tag beta
```

### 4. Push Changes to Git

```bash
git push
git push --tags
```

## 🏷️ Version Management Strategy

### Semantic Versioning

- **Patch** (x.x.X): Bug fixes, no breaking changes
- **Minor** (x.X.x): New features, backward compatible
- **Major** (X.x.x): Breaking changes

### Pre-release Versions

For testing before official release:

```bash
# Create pre-release version
npm version prerelease --preid=beta
# Results in: 2.0.1-beta.0

# Publish as beta
npm publish --tag beta

# Install beta version
npm install bleakai@beta
```

## 🔒 Security & Best Practices

### 1. Enable 2FA on npm Account

```bash
npm profile enable-2fa auth-and-writes
```

### 2. Use .npmignore (if needed)

Create `.npmignore` to exclude files from package:

```
src/
*.test.ts
*.spec.ts
vite.config.ts
tsconfig.json
.eslintrc.*
```

### 3. Verify Package Contents

```bash
# See what will be published
npm publish --dry-run
```

## 🚨 Emergency Procedures

### Unpublish a Version (within 24 hours)

```bash
npm unpublish bleakai@version
```

### Deprecate a Version

```bash
npm deprecate bleakai@version "Deprecated due to critical bug"
```

## 📊 Post-Publishing

### 1. Verify Installation

```bash
# Test in a clean directory
mkdir test-install && cd test-install
npm init -y
npm install bleakai
```

### 2. Update Documentation

- [ ] Update main project README if needed
- [ ] Update any dependent projects
- [ ] Announce release (if significant)

### 3. Monitor

- Check npm download stats: https://npmjs.com/package/bleakai
- Monitor for issues/bug reports
- Watch for dependency vulnerabilities

## 🔧 Automation (Optional)

### GitHub Actions for Auto-Publishing

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Package
on:
  push:
    tags:
      - "v*"
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: cd packages/bleakai && npm run build
      - run: cd packages/bleakai && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📞 Quick Commands Reference

```bash
# Build and test
npm run build && npm run test

# Version bump and publish
npm version patch && npm publish && git push --tags

# Check package info
npm view bleakai

# Check your published packages
npm profile get

# See download stats
npm view bleakai --json
```

## 🔍 Troubleshooting

### Common Issues

1. **"Package not found"** - Check if you're logged into the right npm account
2. **"Version already exists"** - Bump the version number
3. **"Build fails"** - Check TypeScript errors and dependencies
4. **"Permission denied"** - Verify npm account has publish rights to the package

### Getting Help

- npm support: https://www.npmjs.com/support
- Check package status: `npm view bleakai`
- Verify build output in `dist/` directory

---

**Remember**: Always test thoroughly before publishing, and consider the impact on users when making breaking changes!
