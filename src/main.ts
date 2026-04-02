import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/Module/app-app.routes';
import { provideHttpClient } from '@angular/common/http';
import { applyRandomTheme } from './app/theme/apply-random-theme';

registerLocaleData(localePt, 'pt-BR');
applyRandomTheme();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
}).catch(err => console.error(err));