import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegistrarPlantasComponent } from './pages/registrar-plantas/registrar-plantas';
import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';
import { AuthGuard } from './guards/auth-guard';
import { MonsteraComponent } from './pages/monstera/monstera';
import { HeaderPrivadoComponent } from './pages/header-privado/header-privado';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Tierra en Calma - Inicio' },
  { path: 'login', component: LoginComponent, title: 'Tierra en Calma - Login' },

  // 🔹 Rutas privadas (con HeaderPrivadoComponent visible)
  {
    path: '',
    component: HeaderPrivadoComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'mis-plantas', component: MisPlantasComponent, title: 'Mis Plantas' },
      { path: 'registrar-planta', component: RegistrarPlantasComponent, title: 'Registrar Planta' },
      { path: 'monstera', component: MonsteraComponent, title: 'Monstera' }
    ]
  },

  { path: '**', redirectTo: '' }
];
