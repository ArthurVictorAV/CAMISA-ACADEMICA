import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/layout/Header";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        duration={3000}
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f1f5f9",
            border: "1px solid rgba(251, 191, 36, 0.15)",
            fontSize: "14px",
          },
        }}
      />
      <Header />
      <main className="max-w-6xl mx-auto px-4">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;