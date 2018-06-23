import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api'; 

@Component({
  selector: 'page-person',
  templateUrl: 'person.html',
  providers: [ApiProvider]
})
export class PersonPage {
  public person:any;
  public name:string;
  public gender:string;

  constructor(public navCtrl: NavController, 
    private api: ApiProvider,
    public params: NavParams,
    public alert: AlertController) {    

    //get info for person
    this.person = params.get('person');

    console.log('got person', this.person);
    this.name = this.person.firstName + ' ' + this.person.lastName;
    this.gender = (this.person.gender == 'm') ? 'man' : 'woman';
  }

  goToEditPersonPage() {

  }

  goBack() {
    this.navCtrl.pop();
  }
}