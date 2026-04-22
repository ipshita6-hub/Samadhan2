# Contributing to University Ticketing System

Thank you for your interest in contributing! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/university-ticketing-system/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check existing [Issues](https://github.com/yourusername/university-ticketing-system/issues) for similar suggestions
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/university-ticketing-system.git
   cd university-ticketing-system
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Test backend: `cd backend && python test_endpoints.py`
   - Test frontend: `cd frontend && npm start`
   - Verify all features work

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Add JSDoc comments for complex functions

### General
- Write clear commit messages
- Keep commits atomic (one feature/fix per commit)
- Update documentation for new features
- Add comments for complex logic

## Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Testing

- Test all changes locally before submitting PR
- Ensure no console errors
- Test in both light and dark mode
- Test responsive design (mobile, tablet, desktop)
- Test with different user roles (student, admin)

## Documentation

- Update README.md if adding new features
- Update API documentation for new endpoints
- Add inline comments for complex code
- Update configuration examples if needed

## Questions?

Feel free to ask questions by:
- Opening an issue
- Commenting on existing issues
- Reaching out to maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

Thank you for contributing! 🎉
