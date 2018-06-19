import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

//pages
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { ForgotPasswordPage } from '../pages/forgotPassword/forgotPassword';
import { GoogleMapPage } from '../pages/googleMap/googleMap';

//providers
import { HTTP } from '@ionic-native/http';
import { ApiProvider } from '../providers/api/api';
import { GoogleMaps } from '@ionic-native/google-maps';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    GoogleMapPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    GoogleMapPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    ApiProvider,
    GoogleMaps,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
