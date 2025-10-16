import { Routes } from '@angular/router';

// Layouts
import { PublicLayoutComponent } from './layouts/public-layout';
import { PrivateLayoutComponent } from './layouts/private-layout';
import { MonsteraComponent } from './pages/monstera/monstera';
// Páginas públicas
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';

// Páginas privadas
import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';
import { RegistrarPlantasComponent } from './pages/registrar-plantas/registrar-plantas'; // ✅ agrega esto

export const routes: Routes = [
  // 🌿 Layout público (antes de iniciar sesión)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent }
    ]
  },

  // 🌱 Layout privado (después del login)
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'mis-plantas', component: MisPlantasComponent },
      { path: 'registrar-plantas', component: RegistrarPlantasComponent },
      { path: 'monstera', component: MonsteraComponent } // 👈 NUEVA RUTA
    ]
  },

  // Redirección por defecto
  { path: '**', redirectTo: '' }
];

