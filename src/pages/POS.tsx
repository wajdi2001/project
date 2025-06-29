import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Receipt,
  Search,
  X,
  Coffee,
  Menu
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { Product, CartItem, Category } from '../types';
import toast from 'react-hot-toast';

const POS: React.FC = () => {
  const { user } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(0.08);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Product[];
      setProducts(productsData.filter(p => p.isActive));

      // Load categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder));

      // Load settings
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setTaxRate(settings.taxRate || 0.08);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, variant?: any) => {
    const cartItemId = `${product.id}-${variant?.id || 'default'}`;
    const existingItem = cart.find(item => item.id === cartItemId);
    
    const unitPrice = product.price + (variant?.priceModifier || 0);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * unitPrice }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        product,
        quantity: 1,
        variants: variant ? [variant] : [],
        unitPrice,
        totalPrice: unitPrice
      };
      setCart([...cart, newItem]);
    }
    
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Panier vidé');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    if (paymentMethod === 'cash') {
      const cashAmount = parseFloat(cashReceived);
      if (isNaN(cashAmount) || cashAmount < total) {
        toast.error('Montant en espèces insuffisant');
        return;
      }
    }

    try {
      const orderNumber = `CMD-${Date.now()}`;
      const orderData = {
        orderNumber,
        items: cart,
        subtotal,
        tax,
        total,
        status: 'completed',
        paymentMethod,
        paymentStatus: 'paid',
        cashierId: user?.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      toast.success('Commande terminée avec succès !');
      
      clearCart();
      setShowPayment(false);
      setShowMobileCart(false);
      setCashReceived('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Erreur lors du traitement du paiement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Cart Overlay */}
      {showMobileCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileCart(false)} />
      )}

      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Point de Vente</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Sélectionnez des produits à ajouter au panier</p>
            </div>
            
            {/* Mobile Cart Button */}
            <button
              onClick={() => setShowMobileCart(true)}
              className="lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 border-b border-gray-200 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher des produits ou scanner un code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous les produits
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Coffee className="h-10 w-10 text-gray-400" />
                </div>
                
                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                  
                  {/* Price and Add Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-gray-100">
                      {product.variants.slice(0, 2).map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => addToCart(product, variant)}
                          className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded border transition-colors"
                        >
                          <span className="font-medium">{variant.name}</span>
                          {variant.priceModifier > 0 && (
                            <span className="text-blue-600 ml-1">(+${variant.priceModifier.toFixed(2)})</span>
                          )}
                        </button>
                      ))}
                      {product.variants.length > 2 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{product.variants.length - 2} autres options
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Products Found */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Essayez d'ajuster votre recherche ou filtre de catégorie</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Cart (Desktop) */}
      <div className="hidden lg:flex w-96 bg-white border-l border-gray-200 flex-col">
        <CartSection 
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          taxRate={taxRate}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          onProcessPayment={() => setShowPayment(true)}
        />
      </div>

      {/* Mobile Cart Slide-out */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${showMobileCart ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Commande actuelle</h2>
            <button
              onClick={() => setShowMobileCart(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <CartSection 
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            taxRate={taxRate}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onProcessPayment={() => {
              setShowPayment(true);
              setShowMobileCart(false);
            }}
            isMobile={true}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Paiement</h3>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-3xl font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} articles • Taxe: ${tax.toFixed(2)}
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Espèces</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Carte</span>
                </button>
              </div>

              {/* Cash Payment Input */}
              {paymentMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Espèces reçues
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  {cashReceived && parseFloat(cashReceived) >= total && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700">
                        Monnaie: ${(parseFloat(cashReceived) - total).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Process Payment Button */}
            <button
              onClick={processPayment}
              disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Receipt className="h-5 w-5" />
              <span>Finaliser le paiement</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Cart Section Component
interface CartSectionProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onProcessPayment: () => void;
  isMobile?: boolean;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  subtotal,
  tax,
  total,
  taxRate,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onProcessPayment,
  isMobile = false
}) => {
  return (
    <>
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Commande actuelle</h2>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Vider le panier"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Panier vide</p>
            <p className="text-sm mt-1">Ajoutez des produits pour commencer une commande</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                    {item.variants.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        {item.variants.map(v => v.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      ${item.unitPrice.toFixed(2)} chacun
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary & Payment */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxe ({(taxRate * 100).toFixed(1)}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onProcessPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Receipt className="h-5 w-5" />
            <span>Traiter le paiement</span>
          </button>
        </div>
      )}
    </>
  );
};

export default POS;