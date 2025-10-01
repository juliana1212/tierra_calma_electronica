import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegistrarPlantasComponent } from './pages/registrar-plantas/registrar-plantas';
import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';
import { AuthGuard } from './guards/auth-guard';
import { MonsteraComponent } from './pages/monstera/monstera';


export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Tierra en Calma - Inicio' },
  { path: 'login', component: LoginComponent, title: 'Tierra en Calma - Login' },

  // 🔹 Rutas privadas
  { path: 'mis-plantas', component: MisPlantasComponent, canActivate: [AuthGuard], title: 'Mis Plantas' },
  { path: 'registrar-planta', component: RegistrarPlantasComponent, canActivate: [AuthGuard], title: 'Registrar Planta' },
  { path: 'monstera', component: MonsteraComponent },
  { path: '**', redirectTo: '' }
];


