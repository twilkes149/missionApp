import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';

//pages
import { RegisterPage } from '../register/register';
import { ForgotPasswordPage } from '../forgotPassword/forgotPassword';
import { DummyPage } from '../dummy/dummy';

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
    public loading: LoadingController) {

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
        console.log("api call result", result);
        
        //navigate to the appropiate page here
        this.navCtrl.push(DummyPage);
      })
      .catch ((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
        console.log("api error: ", error);
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
