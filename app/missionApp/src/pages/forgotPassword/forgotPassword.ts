import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-forgotPassword',
  templateUrl: 'forgotPassword.html'
})
export class ForgotPasswordPage {  

  private email:string;
  private token:string;
  private password:string;
  private confirmPassword:string;

  private enteredEmail:boolean;
  private error;

  constructor(public navCtrl: NavController,
    public alert: AlertController,
    public loading: LoadingController,
    private api: ApiProvider) {
    this.enteredEmail = false;    
  }

  //returns false if no error, otherwise an error message
  verifyEmail(email) {    
    if (!email)
      return 'Please enter a valid email';
    else
      return false;
  }

  verifyToken(token) {
    if (!token)
      return "Please enter a token <br />";
    else
      return false;
  }

  verifyPassword(password, password2) {
    if (!password) {
      return "Please enter a password <br/>";      
    }
    else if (password != password2) {
      return "Passwords do not match <br />";
    }
    else {
      return false;
    }
  }

  forgotPassword() {    
    this.error = this.verifyEmail(this.email);

    if (!this.error) {
      //show loading indicator
      const loader = this.loading.create({
        content: "Loading...",
        dismissOnPageChange: true,
      });
      loader.present();


      this.api.forgotPassword(this.email)
      .then((result) => {
        this.enteredEmail = true;//changes page
      })
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      })
      .then(() => {
        loader.dismiss();
      });
    }    
  }

  resetPassword() {
    this.error = this.verifyToken(this.token);

    if (!this.error) {
      //show loading indicator
      const loader = this.loading.create({
        content: "Loading...",
        dismissOnPageChange: true,
      });
      loader.present();

      this.api.resetPassword(this.token, this.password)
      .then((response) => {
        const message = this.alert.create({
          title: 'Success',
          subTitle: 'Your password was reset',
          buttons: ['OK']
        });
        message.present();
      })
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      })
      .then(() => {
        loader.dismiss();
      });
    }
    else if (this.verifyPassword(this.password, this.confirmPassword)) {//if there is a password error
      this.error += this.verifyPassword(this.password, this.confirmPassword); //display error message
    }
  }
}
