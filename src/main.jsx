import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; 
import store from "./store/store"; 
import App from "./App.jsx";
import "./index.css";
import "./i18n.js";
import { UsersProvider } from "./pages/usersContext.jsx";
import { TitleProvider } from "./context/TitleContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
   
    <Provider store={store}> 
      <BrowserRouter>
        <UsersProvider>
          <TitleProvider>
            <App />
          </TitleProvider>
        </UsersProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);