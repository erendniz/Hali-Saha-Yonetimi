import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { CartProvider } from './CartContext';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MainPage from './MainPage';
import FieldsPage from './FieldsPage';
import MyFieldsPage from './MyFieldsPage';
import AppointmentsPage from './AppointmentsPage';
import ProtectedRoute from './ProtectedRoute';
import CartPage from './CartPage';
import PaymentPage from './PaymentPage';

function App() {

  const [cart, setCart] = useState([]);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));

   return(<CartProvider> <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/main" element={<ProtectedRoute>
    <MainPage />
  </ProtectedRoute>} />
  <Route path="/fields" element={<ProtectedRoute><FieldsPage /></ProtectedRoute>} />
        <Route path="/my-fields" element={<ProtectedRoute><MyFieldsPage /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />}></Route>
        <Route path="/checkout" element={<PaymentPage cart={cart} setCart={setCart} user={user} />} />
      </Routes>
    </Router>
    </CartProvider>
   );
}
export default App;
