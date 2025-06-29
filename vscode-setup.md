# VS Code Development Setup

This guide will help you set up the Coffee Shop POS project for development in VS Code with automatic deployment.

## 🔧 Required Extensions

Install these VS Code extensions for the best development experience:

1. **ES7+ React/Redux/React-Native snippets** - Provides React snippets
2. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
3. **TypeScript Importer** - Auto import for TypeScript
4. **Prettier - Code formatter** - Code formatting
5. **ESLint** - Linting support
6. **Firebase** - Firebase integration
7. **GitLens** - Enhanced Git capabilities
8. **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
9. **Bracket Pair Colorizer** - Color matching brackets
10. **Thunder Client** - API testing (alternative to Postman)

## ⚙️ VS Code Settings

Create `.vscode/settings.json` in your project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <your-repo>
cd coffee-pos-system
npm install

# Start development server
npm run dev
```

### 2. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Start Electron app
npm run electron-dev
```

### 3. Deployment Commands
```bash
# Deploy to Netlify (production)
npm run deploy

# Deploy preview to Netlify
npm run deploy:preview

# Build Electron app
npm run build-electron

# Use deployment script
./deploy.sh
```

## 🔄 Auto-Deployment Setup

### Option 1: Netlify CLI (Recommended)
1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Link your project:
   ```bash
   netlify link
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Option 2: GitHub Actions
1. Push your code to GitHub
2. Set up these secrets in your GitHub repository:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

3. Push to main/master branch to trigger automatic deployment

### Option 3: Netlify Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Auto-deploy on push to main branch

## 📁 Project Structure

```
coffee-pos-system/
├── public/                 # Static assets
│   ├── electron.js        # Electron main process
│   └── preload.js         # Electron preload script
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── .github/workflows/     # GitHub Actions
├── netlify.toml          # Netlify configuration
├── deploy.sh             # Deployment script
└── package.json          # Dependencies and scripts
```

## 🐛 Debugging

### React DevTools
Install React Developer Tools browser extension for debugging React components.

### Firebase Debugging
Use Firebase console and browser DevTools to debug Firebase operations.

### Electron Debugging
```bash
# Start with DevTools open
npm run electron-dev
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check for TypeScript errors: `npm run lint`
   - Ensure all dependencies are installed: `npm install`

2. **Deployment Fails**
   - Verify Netlify CLI is installed and logged in
   - Check build output in `dist` folder
   - Review netlify.toml configuration

3. **Firebase Connection Issues**
   - Verify Firebase configuration in `src/config/firebase.ts`
   - Check Firebase project settings
   - Ensure Firestore rules allow read/write

4. **Electron Issues**
   - Check Node.js version compatibility
   - Verify Electron dependencies are installed
   - Review electron.js configuration

### Performance Tips

1. **Development**
   - Use React DevTools Profiler
   - Monitor bundle size with `npm run build`
   - Optimize images and assets

2. **Production**
   - Enable gzip compression (configured in netlify.toml)
   - Use lazy loading for routes
   - Optimize Firebase queries

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Netlify Documentation](https://docs.netlify.com)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Test thoroughly: `npm run build` and `npm run lint`
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create a Pull Request

Happy coding! 🚀
```