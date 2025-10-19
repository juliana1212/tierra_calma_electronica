import { Routes } from '@angular/router';

// Layouts
import { PublicLayoutComponent } from './layouts/public-layout';
import { PrivateLayoutComponent } from './layouts/private-layout';

// Páginas públicas
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';

// Páginas privadas
import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';
import { RegistrarPlantasComponent } from './pages/registrar-plantas/registrar-plantas';
import { MonsteraComponent } from './pages/monstera/monstera';

export const routes: Routes = [
  // Público
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },                       // login normal
      { path: 'login/registro', component: LoginComponent, data: { openRegister: true } } // ruta directa a registro
    ]
  },

  // Privado
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'mis-plantas', component: MisPlantasComponent },
      { path: 'registrar-plantas', component: RegistrarPlantasComponent },
      { path: 'monstera', component: MonsteraComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
