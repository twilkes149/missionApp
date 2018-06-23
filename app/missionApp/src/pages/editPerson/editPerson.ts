import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api'; 

@Component({
  selector: 'page-editPerson',
  templateUrl: 'editPerson.html',
  providers: [ApiProvider]
})
export class EditPersonPage {   

  constructor (public navCtrl: NavController,
    private api: ApiProvider,
    public params: NavParams,
    public alert: AlertController) {
  }

  goBack() {
    this.navCtrl.pop();
  }
}