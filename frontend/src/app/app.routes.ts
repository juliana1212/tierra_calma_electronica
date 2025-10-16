import { Routes } from '@angular/router';

// Layouts
import { PublicLayoutComponent } from './layouts/public-layout';
import { PrivateLayoutComponent } from './layouts/private-layout';

// Páginas públicas
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';

// Páginas privadas
import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';

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
      { path: 'mis-plantas', component: MisPlantasComponent }
    ]
  },

  // Redirección por defecto
  { path: '**', redirectTo: '' }
];
