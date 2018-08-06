import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

//pages
import { RegisterPage } from '../register/register';
import { ForgotPasswordPage } from '../forgotPassword/forgotPassword';
import { GoogleMapPage } from '../googleMap/googleMap';

//providers
import { ApiProvider } from '../../providers/api/api'; 

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [ApiProvider]
})
export class LoginPage {
  private error;  
  private email:string;
  private password:string;

  constructor(public navCtrl: NavController, 
    public api: ApiProvider, 
    public alert: AlertController,
    public loading: LoadingController,
    private storage: Storage) {

  }

  goToRegister() {
    this.navCtrl.push(RegisterPage);
  }

  //returns false if both email and password are valid, otherwise returns a string for the error
  verifyFields(email, password) {
    let error:string = '';
    if (!email) {
      error += 'Please enter a valid email <br />';
    }
    if (!password) {
      error += 'Please enter a password';
    }
    if (error) {
      return error;
    }
    return false;
  }

  async ionViewWillEnter() {
    //log in using stored email and password
    let email = await this.storage.get('email');
    let password = await this.storage.get('password');

    if (email && password && !this.password && !this.email) {
      this.password = password;
      this.email = email;

      this.login();
    }    
  }

  login() {    

    this.error = this.verifyFields(this.email, this.password);

    if (!this.error) {
      //show loading indicator
      const loader = this.loading.create({
        content: "Logging in...",
        dismissOnPageChange: true,
      });
      loader.present();

      //on success will return the auth token
      //on failure will return object describing failure
      this.api.login(this.email, this.password)
      .then((result) => {
        //console.log("api call result", result);
        
        this.storage.set('email', this.email);
        this.storage.set('password', this.password);

        //navigate to the appropiate page here
        //this.navCtrl.push(GoogleMapPage);
        this.navCtrl.setRoot(GoogleMapPage);
      })
      .catch ((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
        //console.log("api error: ", error);
      })
      .then(() => {
        loader.dismiss();
      });      
    }
  }

  goToForgotPassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }
}
