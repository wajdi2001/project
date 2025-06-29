import { doc, setDoc, serverTimestamp, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const initializeFirebaseData = async () => {
  try {
    console.log('Initializing Firebase data...');

    // Check if data already exists
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (!categoriesSnapshot.empty) {
      console.log('Firebase data already initialized');
      return;
    }

    // Initialize categories
    const categories = [
      {
        id: 'coffee',
        name: 'Coffee',
        description: 'Hot and cold coffee beverages',
        sortOrder: 1,
        isActive: true
      },
      {
        id: 'tea',
        name: 'Tea',
        description: 'Various tea selections',
        sortOrder: 2,
        isActive: true
      },
      {
        id: 'food',
        name: 'Food',
        description: 'Sandwiches, pastries, and snacks',
        sortOrder: 3,
        isActive: true
      },
      {
        id: 'desserts',
        name: 'Desserts',
        description: 'Sweet treats and desserts',
        sortOrder: 4,
        isActive: true
      },
      {
        id: 'beverages',
        name: 'Cold Beverages',
        description: 'Juices, sodas, and cold drinks',
        sortOrder: 5,
        isActive: true
      }
    ];

    for (const category of categories) {
      const categoryRef = doc(db, 'categories', category.id);
      await setDoc(categoryRef, {
        ...category,
        createdAt: serverTimestamp()
      });
      console.log(`Created category: ${category.name}`);
    }

    // Initialize products
    const products = [
      // Coffee Products
      {
        id: 'espresso',
        name: 'Espresso',
        description: 'Rich and bold espresso shot',
        price: 3.00,
        category: 'coffee',
        isActive: true,
        stock: 100,
        barcode: '1234567890001',
        variants: [
          { id: 'single', name: 'Single Shot', priceModifier: 0, type: 'size' },
          { id: 'double', name: 'Double Shot', priceModifier: 1.50, type: 'size' }
        ]
      },
      {
        id: 'latte',
        name: 'Latte',
        description: 'Espresso with steamed milk and light foam',
        price: 4.50,
        category: 'coffee',
        isActive: true,
        stock: 100,
        barcode: '1234567890002',
        variants: [
          { id: 'small', name: 'Small (8oz)', priceModifier: 0, type: 'size' },
          { id: 'medium', name: 'Medium (12oz)', priceModifier: 0.75, type: 'size' },
          { id: 'large', name: 'Large (16oz)', priceModifier: 1.25, type: 'size' },
          { id: 'extra-shot', name: 'Extra Shot', priceModifier: 1.00, type: 'extra' },
          { id: 'decaf', name: 'Decaf', priceModifier: 0, type: 'extra' }
        ]
      },
      {
        id: 'cappuccino',
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and thick foam',
        price: 4.00,
        category: 'coffee',
        isActive: true,
        stock: 100,
        barcode: '1234567890003',
        variants: [
          { id: 'small', name: 'Small (6oz)', priceModifier: 0, type: 'size' },
          { id: 'medium', name: 'Medium (8oz)', priceModifier: 0.50, type: 'size' },
          { id: 'large', name: 'Large (12oz)', priceModifier: 1.00, type: 'size' }
        ]
      },
      {
        id: 'americano',
        name: 'Americano',
        description: 'Espresso with hot water',
        price: 3.50,
        category: 'coffee',
        isActive: true,
        stock: 100,
        barcode: '1234567890004',
        variants: [
          { id: 'small', name: 'Small (8oz)', priceModifier: 0, type: 'size' },
          { id: 'medium', name: 'Medium (12oz)', priceModifier: 0.50, type: 'size' },
          { id: 'large', name: 'Large (16oz)', priceModifier: 1.00, type: 'size' }
        ]
      },
      {
        id: 'mocha',
        name: 'Mocha',
        description: 'Espresso with chocolate and steamed milk',
        price: 5.00,
        category: 'coffee',
        isActive: true,
        stock: 100,
        barcode: '1234567890005'
      },
      {
        id: 'macchiato',
        name: 'Macchiato',
        description: 'Espresso with a dollop of foamed milk',
        price: 4.25,
        category: 'coffee',
        isActive: true,
        stock: 100,
        barcode: '1234567890006'
      },
      
      // Tea Products
      {
        id: 'green-tea',
        name: 'Green Tea',
        description: 'Fresh brewed green tea',
        price: 2.50,
        category: 'tea',
        isActive: true,
        stock: 50,
        barcode: '1234567890007'
      },
      {
        id: 'black-tea',
        name: 'Black Tea',
        description: 'Classic black tea',
        price: 2.25,
        category: 'tea',
        isActive: true,
        stock: 50,
        barcode: '1234567890008'
      },
      {
        id: 'chai-latte',
        name: 'Chai Latte',
        description: 'Spiced tea with steamed milk',
        price: 4.00,
        category: 'tea',
        isActive: true,
        stock: 50,
        barcode: '1234567890009'
      },
      
      // Food Products
      {
        id: 'croissant',
        name: 'Butter Croissant',
        description: 'Fresh baked butter croissant',
        price: 2.50,
        category: 'food',
        isActive: true,
        stock: 30,
        barcode: '1234567890010'
      },
      {
        id: 'muffin-blueberry',
        name: 'Blueberry Muffin',
        description: 'Fresh blueberry muffin',
        price: 3.25,
        category: 'food',
        isActive: true,
        stock: 25,
        barcode: '1234567890011'
      },
      {
        id: 'bagel',
        name: 'Everything Bagel',
        description: 'Toasted bagel with cream cheese',
        price: 3.75,
        category: 'food',
        isActive: true,
        stock: 20,
        barcode: '1234567890012'
      },
      {
        id: 'sandwich-turkey',
        name: 'Turkey Sandwich',
        description: 'Turkey, lettuce, tomato on sourdough',
        price: 7.50,
        category: 'food',
        isActive: true,
        stock: 15,
        barcode: '1234567890013'
      },
      {
        id: 'sandwich-veggie',
        name: 'Veggie Sandwich',
        description: 'Fresh vegetables with hummus',
        price: 6.75,
        category: 'food',
        isActive: true,
        stock: 15,
        barcode: '1234567890014'
      },
      
      // Desserts
      {
        id: 'cookie-chocolate',
        name: 'Chocolate Chip Cookie',
        description: 'Homemade chocolate chip cookie',
        price: 2.00,
        category: 'desserts',
        isActive: true,
        stock: 40,
        barcode: '1234567890015'
      },
      {
        id: 'brownie',
        name: 'Fudge Brownie',
        description: 'Rich chocolate fudge brownie',
        price: 3.50,
        category: 'desserts',
        isActive: true,
        stock: 20,
        barcode: '1234567890016'
      },
      {
        id: 'cheesecake',
        name: 'New York Cheesecake',
        description: 'Classic New York style cheesecake',
        price: 4.75,
        category: 'desserts',
        isActive: true,
        stock: 12,
        barcode: '1234567890017'
      },
      
      // Cold Beverages
      {
        id: 'iced-coffee',
        name: 'Iced Coffee',
        description: 'Cold brewed coffee over ice',
        price: 3.25,
        category: 'beverages',
        isActive: true,
        stock: 100,
        barcode: '1234567890018'
      },
      {
        id: 'smoothie-berry',
        name: 'Berry Smoothie',
        description: 'Mixed berry smoothie with yogurt',
        price: 5.50,
        category: 'beverages',
        isActive: true,
        stock: 30,
        barcode: '1234567890019'
      },
      {
        id: 'juice-orange',
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 3.75,
        category: 'beverages',
        isActive: true,
        stock: 25,
        barcode: '1234567890020'
      }
    ];

    for (const product of products) {
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, {
        ...product,
        createdAt: serverTimestamp()
      });
      console.log(`Created product: ${product.name}`);
    }

    // Initialize settings
    const settingsRef = doc(db, 'settings', 'general');
    await setDoc(settingsRef, {
      shopName: 'Coffee Shop POS',
      address: '123 Main Street\nYour City, State 12345',
      phone: '(555) 123-4567',
      email: 'info@coffeeshop.com',
      taxRate: 0.08,
      currency: 'USD',
      receiptFooter: 'Thank you for your visit!\nPlease come again!',
      printerName: 'A116W-HC',
      enableSound: true,
      enableNotifications: true,
      theme: 'light',
      language: 'en',
      createdAt: serverTimestamp()
    });
    console.log('Created general settings');

    // Initialize sample cash flow data
    const sampleCashFlows = [
      {
        type: 'in',
        amount: 500.00,
        reason: 'Opening cash register',
        cashierId: 'system',
        createdAt: serverTimestamp()
      },
      {
        type: 'out',
        amount: 50.00,
        reason: 'Petty cash for supplies',
        cashierId: 'system',
        createdAt: serverTimestamp()
      }
    ];

    for (const cashFlow of sampleCashFlows) {
      await setDoc(doc(db, 'cashFlows', `sample-${Date.now()}-${Math.random()}`), cashFlow);
    }

    console.log('Firebase data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    throw error;
  }
};