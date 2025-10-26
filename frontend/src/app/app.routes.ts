import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './layouts/public-layout';
import { PrivateLayoutComponent } from './layouts/private-layout';
import { MonsteraComponent } from './pages/monstera/monstera';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { ChatbotComponent } from './pages/chatbot/chatbot';

import { MisPlantasComponent } from './pages/mis-plantas/mis-plantas';
import { RegistrarPlantasComponent } from './pages/registrar-plantas/registrar-plantas';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },                       // login normal
      { path: 'login/registro', component: LoginComponent, data: { openRegister: true } } // ruta directa a registro
    ]
  },

  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'mis-plantas', component: MisPlantasComponent },
      { path: 'registrar-plantas', component: RegistrarPlantasComponent },
      { path: 'monstera', component: MonsteraComponent }
    ]
  },

  {path: 'chatbot', 
  component: ChatbotComponent 
  },

  { path: '**', redirectTo: '' }
];
