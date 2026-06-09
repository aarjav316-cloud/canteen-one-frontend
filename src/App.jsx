import AppRouter from "./app/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "",
          style: {
            padding: "0",
            background: "transparent",
            boxShadow: "none",
          },
        }}
      />
    </>
  );
}
export default App;
