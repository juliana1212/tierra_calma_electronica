import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout';
import { PrivateLayoutComponent } from './layouts/private-layout';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';
import { RegistrarPlantasComponent } from './pages/registrar-plantas/registrar-plantas';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent }
    ]
  },
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'mis-plantas', component: MisPlantasComponent, canActivate: [AuthGuard] },
      { path: 'registrar-planta', component: RegistrarPlantasComponent, canActivate: [AuthGuard] }
    ]
  }
];
