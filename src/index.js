import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import './style.css';
import './indexAdmin.css';
import './indexVendedor.css';
import './views/crud-vendedor/FinanciamientoView.css';
import { NotificationContext } from './context/NotificationContext';

// Importa todas las vistas
import Home from './views/home';
import Catalogo from './views/catalogo';
import Testimonios from './views/testimonios';
import Contacto from './views/contacto';
import Sucursales from './views/sucursal';
import InicioSesion from './views/inicio_sesion';
import Registro from './views/registro';
import InfoAuto from './views/info_auto';
import Cotizacion from './views/cotizacion';
import NotFound from './views/not-found';
import VistaMarca from './views/vistaMarca';
import SubtipoVista from './views/subtipoVista';
import SolicitudForm from './views/formulario/SolicitudForm';


import AuditoriaView from './views/cruds/AuditoriaView';
import DashboardView from './views/cruds/DashboardView';
import ImagenesView from './views/cruds/ImagenesView';
import MarcasView from './views/cruds/MarcasView';
import PublicacionesView from './views/cruds/PublicacionesView';
import SettingsView from './views/cruds/SettingsView';
import UsuariosView from './views/cruds/UsuariosView';
import VehiculosView from './views/cruds/VehiculosView';
import FinanciamientoView from './views/crud-vendedor/FinanciamientoView';

import PublicacionesViewVendedor from './views/crud-vendedor/PublicacionesViewVendedor';
import SettingsViewVendedor from './views/crud-vendedor/SettingsViewVendedor';
import VehiculosViewVendedor from './views/crud-vendedor/VehiculosViewVendedor';
import VentasView from './views/crud-vendedor/VentasView';
import DashboardViewVendedor from './views/crud-vendedor/DashboardViewVendedor';

const App = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <Router>
        <div className="app-container">
          {notification && (
            <div className={`notification ${notification.type}`}>
              <span className="notification-icon">
                {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              </span>
              {notification.message}
            </div>
          )}
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/catalogo" component={Catalogo} />
            <Route exact path="/info-auto" component={InfoAuto} />
            <Route exact path="/testimonios" component={Testimonios} />
            <Route exact path="/contacto" component={Contacto} />
            <Route exact path="/sucursales" component={Sucursales} />
            <Route exact path="/login" component={InicioSesion} />
            <Route exact path="/registro" component={Registro} />
            <Route exact path="/cotizacion" component={Cotizacion} />
            <Route exact path="/solicitud-credito" component={SolicitudForm} />
            
            <Route exact path="/marca/:idMarca" component={VistaMarca} />
            <Route exact path="/subtipo/:tipo" component={SubtipoVista} />
            <Route exact path="/auditoria" component={AuditoriaView} />
            <Route exact path="/dashboard" component={DashboardView} />
            <Route exact path="/imagenes" component={ImagenesView} />
            <Route exact path="/marcas" component={MarcasView} />
            <Route exact path="/publicaciones" component={PublicacionesView} />
            <Route exact path="/settings" component={SettingsView} />
            <Route exact path="/usuarios" component={UsuariosView} />
            <Route exact path="/vehiculos" component={VehiculosView} />
            <Route exact path="/dashboard-vendedor" component={DashboardViewVendedor} />
            <Route exact path="/financiamiento-vendedor" component={FinanciamientoView} />
            <Route exact path="/publicaciones-vendedor" component={PublicacionesViewVendedor} />
            <Route exact path="/settings-vendedor" component={SettingsViewVendedor} />
            <Route exact path="/vehiculos-vendedor" component={VehiculosViewVendedor} />
            <Route exact path="/ventas-vendedor" component={VentasView} />
            <Route path="*" component={NotFound} />
          </Switch>
        </div>
      </Router>
    </NotificationContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));