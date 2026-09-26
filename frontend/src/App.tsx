import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <main>
        <h1>StockSense</h1>
        <p>Inventory management workspace</p>
      </main>
    </AuthProvider>
  );
}

export default App;
