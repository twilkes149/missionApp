import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

//pages
import { LoginPage } from '../login/login';
import { DummyPage } from '../dummy/dummy';

//providers
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers: [ApiProvider]
})
export class RegisterPage {
  private error;

  private email:string;
  private password:string;
  private firstName:string;
  private lastName:string;
  private confirmPassword:string;  

  constructor(public navCtrl: NavController, 
    private api: ApiProvider,
    public loading: LoadingController,
    public alert: AlertController) {

  }

  //returns false if no error, and returns error string if there is an error
  verifyFields(email, password, password2, firstName, lastName) {
    let error:string = '';
    if (!email)
      error += "Please enter a valid email <br/>";
    
    if (!password)
      error += "Please enter a password </br>";
    else if (password != password2)
      error += "Passwords don't match <br/>";
    
    if (!firstName)
      error += "Please enter your first name <br/>";
    if (!lastName)
      error += "Please enter your last name <br/>";  
    
    if (error)
      return error;
    return false; 
  }

  register() {
    this.error = this.verifyFields(this.email, this.password, this.confirmPassword, this.firstName, this.lastName);

    if (!this.error) {
      //show loading indicator
      const loader = this.loading.create({
        content: "Registering...",
        dismissOnPageChange: true,
      });
      loader.present();

      this.api.register(this.password, this.email, this.firstName, this.lastName)
      .then((result) => {
        console.log("API register result: ", result)

        //navigate to appropiate page here
        this.navCtrl.push(DummyPage);
      })
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
        console.log("api error: ", error);
      })
      .then(() => {
        loader.dismiss();//dismiss loading indicator
      });
    }
  }

  goToLogin() {
    //we get here from the login page, so going back should just be a pop
    this.navCtrl.pop();
  }

}
