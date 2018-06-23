import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api'; 

@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
  providers: [ApiProvider]
})
export class EventPage {  
  public name:string;  
  private event:any;
  private person:any;
  
  public description:string;
  public title:string;
  public showSubmit:boolean;

  constructor (public navCtrl: NavController,
    private api: ApiProvider,
    public params: NavParams,
    public alert: AlertController) {

    this.event = this.params.get('event');//get event that is passed in
    if (this.event) {
      this.name = this.event.title;
      this.description = this.event.description;  
    }
    else {
      this.name = "Create Event";
      this.description = '';
      this.person = this.params.get('person');
    }
  }

  goBack() {
    this.navCtrl.pop();
  }

  deleteEvent() {

  }

  checkInput() {
    console.log("checking", this.description, this.event.description);    
    if (this.description != this.event.description) {
      this.showSubmit = true;
      console.log("show submit");
    }
    else {
      this.showSubmit = false;
    }
  }
}