import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

//pages
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { ForgotPasswordPage } from '../pages/forgotPassword/forgotPassword';
import { GoogleMapPage } from '../pages/googleMap/googleMap';
import { PersonPage } from '../pages/person/person';
import { EventPage } from '../pages/event/event';
import { EditPersonPage } from '../pages/editPerson/editPerson';
import { CreatePersonPage } from '../pages/createPerson/createPerson';
import { SettingsPage } from '../pages/settings/settings';

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
    PersonPage,
    EventPage,
    EditPersonPage,
    CreatePersonPage,
    SettingsPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    GoogleMapPage,
    PersonPage,
    EventPage,
    EditPersonPage,
    CreatePersonPage,
    SettingsPage,
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
