import './App.css';
import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, addDoc } from './firebase';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from './firebase';

function App() {
  // Estados para productos y formulario
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  // Estado para autenticación de usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // Estado para mostrar el formulario de agregar producto
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  // Estado para mostrar la ventana emergente de compra
  const [showPurchaseWindow, setShowPurchaseWindow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaFecha, setTarjetaFecha] = useState('');
  const [tarjetaCVV, setTarjetaCVV] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // Efecto para cargar productos de Firestore
  useEffect(() => {
    const fetchProductos = async () => {
      const productosCollection = collection(db, 'productos');
      const productosSnapshot = await getDocs(productosCollection);
      const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(productosList);
    };
    fetchProductos();
  }, []);

  // Efecto para manejar el cambio de estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Función para manejar el envío del formulario de autenticación (registro o inicio de sesión)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento predeterminado
    try {
      if (isSignUp) {
        // Registro de usuario en Firebase
        await createUserWithEmailAndPassword(auth, email, password);
        setError(''); // Limpiar errores en caso de éxito
      } else {
        // Inicio de sesión
        await signInWithEmailAndPassword(auth, email, password);
        setError(''); // Limpiar errores en caso de éxito
      }
    } catch (error) {
      setError(error.message); // Mostrar error si ocurre un problema
    }
  };

  // Función para manejar el cierre de sesión
  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Función para agregar productos a Firestore
  const agregarProducto = async () => {
    if (nombre && descripcion && precio) {
      // Asegúrate de que el precio se guarda como un número flotante
      await addDoc(collection(db, 'productos'), {
        nombre,
        descripcion,
        precio: parseFloat(precio),
      });
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setShowAddProductForm(false); // Cerrar el formulario después de agregar el producto
    } else {
      setError("Por favor complete todos los campos.");
    }
  };

  // Función para manejar la compra del producto
  const handlePurchase = () => {
    if (cantidad && tarjetaNumero && tarjetaFecha && tarjetaCVV) {
      setPurchaseMessage('¡Gracias por su compra!');
      setTimeout(() => {
        setShowPurchaseWindow(false);
        setPurchaseMessage('');
      }, 2000); // Cerrar ventana y limpiar mensaje después de 2 segundos
    } else {
      setPurchaseMessage('Por favor complete todos los campos.');
    }
  };

  return (
    <div className="App">
      <h1>Tienda Online</h1>

      {/* Sección de autenticación */}
      {!user ? (
        <div className="auth-section">
          <h2>{isSignUp ? 'Registrarse' : 'Iniciar sesión'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">{isSignUp ? 'Registrar' : 'Iniciar sesión'}</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      ) : (
        <>
          {/* Sección de productos solo visible cuando el usuario está autenticado */}
          <div className="store-section">
            <h2>Bienvenido, {user.email}</h2>

            {/* Solo muestra el botón de Cerrar sesión aquí */}
            <div className="logout-button">
              <button onClick={handleSignOut}>Cerrar sesión</button>
            </div>

            <h2>Productos</h2>
            <div className="productos">
              {productos.map((producto, index) => (
                <div
                  key={index}
                  className="producto"
                  onClick={() => {
                    setSelectedProduct(producto);
                    setShowPurchaseWindow(true);
                  }}
                >
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion}</p>
                  <p>Precio: ${producto.precio}</p>
                </div>
              ))}
            </div>

            {/* Solo se muestra el botón de agregar producto cuando está autenticado */}
            <div
              className="add-product-button"
              onClick={() => setShowAddProductForm(!showAddProductForm)}
            >
              +
            </div>

            {/* Formulario para agregar producto */}
            {showAddProductForm && (
              <div className="add-product-form">
                <h2>Agregar Producto</h2>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                />
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del producto"
                />
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Precio"
                />
                <button onClick={agregarProducto}>Agregar Producto</button>
                <button
                  className="close-add-product"
                  onClick={() => setShowAddProductForm(false)}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Ventana emergente de compra */}
      {showPurchaseWindow && selectedProduct && (
        <div className="purchase-window">
          <h2>Comprar {selectedProduct.nombre}</h2>
          <p>Precio: ${selectedProduct.precio}</p>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Cantidad"
            min="1"
          />
          <input
            type="text"
            value={tarjetaNumero}
            onChange={(e) => setTarjetaNumero(e.target.value)}
            placeholder="Número de tarjeta"
          />
          <input
            type="text"
            value={tarjetaFecha}
            onChange={(e) => setTarjetaFecha(e.target.value)}
            placeholder="Fecha de vencimiento (MM/AA)"
          />
          <input
            type="text"
            value={tarjetaCVV}
            onChange={(e) => setTarjetaCVV(e.target.value)}
            placeholder="CVV"
          />
          <button onClick={handlePurchase}>Enviar</button>
          {purchaseMessage && <p>{purchaseMessage}</p>}
          <button onClick={() => setShowPurchaseWindow(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

export default App;
