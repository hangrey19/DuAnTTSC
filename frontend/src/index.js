import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Cập nhật ở đây
import './index.scss';
import './style/style.scss';
import App from './App';
import store from "./redux";
import { Provider } from "react-redux";
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/dist/jquery.min.js";
import "popper.js/dist/umd/popper.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "font-awesome/css/font-awesome.min.css";

// ✅ Tạo root đúng cách theo React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Không cần thay đổi phần này
reportWebVitals();
