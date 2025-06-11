import React, { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // alternar entre login y registro
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleAuth = async () => {
    const url = isLogin
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        } else {
          alert('Registro exitoso, ahora inicia sesión');
          setIsLogin(true);
        }
      } else {
        alert(data.error || 'Error en la autenticación');
      }
    } catch (err) {
      console.error('Error en autenticación:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }

    setInput('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMessages([]);
  };

  // Mostrar login o registro si no hay token
  if (!token) {
    return (
      <div style={styles.container}>
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAuth} style={styles.button}>
          {isLogin ? 'Login' : 'Registrarse'}
        </button>
        <p>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} style={styles.linkButton}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    );
  }

  // Mostrar chat si hay token
  return (
    <div style={styles.container}>
      <h2>Chat Especializado</h2>
      <button onClick={handleLogout} style={styles.logout}>Cerrar sesión</button>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#007bff' : '#eee',
              color: msg.sender === 'user' ? 'white' : 'black',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Enviar</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial',
  },
  chatBox: {
    height: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
  },
  message: {
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '75%',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
  },
  logout: {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
  },
};

export default App;
