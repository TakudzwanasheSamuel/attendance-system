# Contributing Guidelines

Thank you for your interest in contributing to the Smart Student Monitoring System!

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- Git

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/TakudzwanasheSamuel/attendance-system.git
cd attendance-system

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma db push
npm run seed

# Start development server
npm run dev
```

## 🧪 Testing

Always run tests before submitting changes:

```bash
# Quick test
npm run test:quick

# Full test suite
npm test

# Specific tests
npm run test:backend
npm run test:frontend
npm run test:performance
```

## 📝 Code Standards

### TypeScript
- Use strict TypeScript mode
- Define interfaces for all props
- Use proper type annotations

### Components
- Use functional components with hooks
- Follow naming conventions (PascalCase for components)
- Include proper TypeScript interfaces

### API Routes
- Use proper HTTP status codes
- Include error handling
- Add request/response validation
- Include logging for debugging

### Database
- Use Prisma for all database operations
- Follow naming conventions (camelCase)
- Include proper indexes for performance

## 🔄 Development Workflow

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(auth): add password visibility toggle
fix(enrollment): resolve authentication issue
docs(readme): update installation instructions
test(api): add enrollment endpoint tests
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make your changes
3. Run full test suite
4. Update documentation if needed
5. Submit pull request to `develop`
6. Ensure all checks pass
7. Request review

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── lecturer/          # Lecturer pages
│   └── student/           # Student pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── lecturer/         # Lecturer-specific components
│   ├── shared/           # Shared components
│   └── student/          # Student-specific components
├── lib/                  # Utility functions
└── middleware.ts         # Next.js middleware

docs/                     # Documentation
scripts/                  # Utility scripts
prisma/                   # Database schema
```

## 🎯 Areas for Contribution

### High Priority
- Performance optimizations
- Mobile responsiveness improvements
- Additional security features
- Enhanced error handling

### Medium Priority
- UI/UX improvements
- Additional testing coverage
- Documentation improvements
- Accessibility enhancements

### Low Priority
- Code refactoring
- Additional utility functions
- Enhanced logging
- Development tooling

## 🐛 Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, Node.js version)
- Screenshots if applicable

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Node.js: [e.g., 18.0.0]

**Screenshots**
If applicable, add screenshots.
```

## ✨ Feature Requests

For new features:
- Check existing issues first
- Describe the feature clearly
- Explain the use case
- Consider implementation complexity

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other ways to achieve the same goal.

**Additional Context**
Any other relevant information.
```

## 🔧 Development Guidelines

### Adding New Components
1. Create component in appropriate directory
2. Include TypeScript interface for props
3. Add proper error handling
4. Include loading states
5. Add accessibility attributes
6. Write tests if applicable

### Adding New API Routes
1. Create route in `src/app/api/`
2. Include proper authentication
3. Add request validation
4. Include error handling
5. Add response typing
6. Update API documentation

### Database Changes
1. Update Prisma schema
2. Generate migration
3. Update seed data if needed
4. Test with existing data
5. Update related queries

## 📚 Documentation

### When to Update Documentation
- Adding new features
- Changing existing functionality
- Fixing bugs that affect usage
- Updating setup procedures

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update table of contents
- Test all instructions

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Credited in documentation

## 📞 Getting Help

- **Questions:** Open a discussion on GitHub
- **Issues:** Check existing issues first
- **Documentation:** Review the docs/ directory
- **Testing:** Run the test suite for guidance

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy Contributing!** 🚀
