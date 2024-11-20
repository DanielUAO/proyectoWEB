import './App.css';
import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, addDoc } from './firebase';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from './firebase';

function App() {
  // Estado para productos y formulario
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
    e.preventDefault();
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
      await addDoc(collection(db, 'productos'), {
        nombre,
        descripcion,
        precio: parseFloat(precio),
      });
      setNombre('');
      setDescripcion('');
      setPrecio('');
    }
  };

  return (
    <div className="App">
      <h1>Tienda Online</h1>

      {/* Sección de autenticación */}
      {user ? (
        <div>
          <div className="logout-button">
            <button onClick={handleSignOut}>Cerrar sesión</button>
          </div>
          <h2>Bienvenido, {user.email}</h2>
        </div>
      ) : (
        <div>
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
      )}

      {/* Resto del contenido */}
      {user && (
        <div>
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
        </div>
      )}

      {/* Mostrar productos */}
      {user && (
        <>
          <h2>Productos</h2>
          <div className="productos">
            {productos.map((producto, index) => (
              <div key={index} className="producto">
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <p>Precio: ${producto.precio}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
