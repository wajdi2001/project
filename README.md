# Coffee Shop POS System

A modern, feature-rich Point of Sale system built with React, TypeScript, and Firebase. Supports both web and desktop (Electron) deployment with A116W-HC hardware integration.

## 🚀 Features

- **Modern POS Interface**: Clean, intuitive design optimized for touch and desktop
- **Multi-language Support**: English and French translations
- **Hardware Integration**: A116W-HC receipt printer, cash drawer, and barcode scanner
- **Real-time Data**: Firebase backend with real-time synchronization
- **Role-based Access**: Admin, Cashier, and Server roles with different permissions
- **Comprehensive Reporting**: Sales analytics, product performance, and financial reports
- **Offline Support**: Local storage for offline operation
- **Responsive Design**: Works on tablets, desktops, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Desktop**: Electron with hardware integration
- **Charts**: Recharts for analytics
- **Icons**: Lucide React
- **Deployment**: Netlify (web), Electron Builder (desktop)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd coffee-pos-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Update `src/config/firebase.ts` with your config

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Web Deployment (Netlify)

#### Automatic Deployment
The project is configured for automatic deployment to Netlify:

1. **Using Netlify CLI**
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy to production
   npm run deploy
   
   # Deploy preview
   npm run deploy:preview
   ```

2. **Using the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **GitHub Actions**
   - Push to main/master branch triggers automatic deployment
   - Set up `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in GitHub secrets

#### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider

### Desktop Deployment (Electron)

1. **Build for current platform**
   ```bash
   npm run build-electron
   ```

2. **Build for all platforms**
   ```bash
   npm run dist
   ```

The built applications will be in the `dist-electron` folder.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Hardware Configuration
For A116W-HC hardware integration:
- Ensure proper drivers are installed
- Configure printer settings in the Settings page
- Test hardware connections using the built-in test functions

## 👥 Demo Accounts

The system comes with pre-configured demo accounts:

- **Admin**: admin@coffee.com / admin123
- **Cashier**: cashier@coffee.com / cashier123
- **Server**: server@coffee.com / server123

## 📱 Usage

### POS Operations
1. **Adding Products**: Click on products or scan barcodes
2. **Managing Cart**: Adjust quantities, add variants, remove items
3. **Processing Payments**: Support for cash and card payments
4. **Hardware Integration**: Print receipts, open cash drawer

### Management Features
- **Product Management**: Add, edit, categorize products
- **Order Tracking**: Monitor order status and history
- **Staff Management**: Manage user accounts and permissions
- **Reports**: View sales analytics and performance metrics
- **Cash Flow**: Track cash in/out transactions

## 🔒 Security

- Firebase Authentication for secure user management
- Role-based access control
- Secure API endpoints
- Data validation and sanitization

## 🌐 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo accounts for testing

## 🔄 Updates

The application supports automatic updates when deployed as an Electron app. Web version updates are deployed automatically through Netlify.

---

Built with ❤️ for modern coffee shops and retail businesses.