// import AppRoutes from "./routes/AppRoutes";

// function App() {
//   return <AppRoutes />;
// }

// export default App;

import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./components/common/AuthContext";
import "./styles/print.css";

function App() {
  return (
    <>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  );
}

export default App;
