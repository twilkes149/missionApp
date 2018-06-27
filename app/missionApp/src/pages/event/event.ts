import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';

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
    public alert: AlertController,
    public loading: LoadingController) {

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

  //calls api to delete an event by its id
  deleteEvent() {
    if (!this.event || !this.event.id) {//dont delete an event if we don't have id
      return;
    }

    //show loading indicator
    const loader = this.loading.create({
      content: "Loading...",
      dismissOnPageChange: true,
    });
    loader.present();

    this.api.deleteEvent(this.event.id)
    .then((response) => {
      this.navCtrl.pop();//return to prev page
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

  updateEvent() {    
    this.event.description = this.description;//update description

    //show loading indicator
    const loader = this.loading.create({
      content: "Loading in...",
      dismissOnPageChange: true,
    });
    loader.present();

    this.api.updateEvent(this.event)
    .then((result) => {
      const message = this.alert.create({
        title: 'Success',
        subTitle: 'Updated event',
        buttons: ['OK']
      });
      message.present();
    })
    .catch ((error) => {
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    })
    .then (() => {
      loader.dismiss();
    });   
  }

  //calls api to create an event
  async createEvent() {    
    if (this.title && this.description) { 
      //show loading indicator
      const loader = this.loading.create({
        content: "Loading in...",
        dismissOnPageChange: true,
      });
      loader.present();

      let event = {//create event object
        title: this.title,
        description: this.description,
        personId: this.person.id,
        familyKey: this.person.familyKey,
      };

      this.api.createEvent(event)
      .then((response) => {
        this.navCtrl.pop();//return to previous page
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
        loader.dismiss();//disiss the loading indicator
      });
    }
  }

  checkInput() {
    console.log("checking", this.description, this.event.description);    
    if (this.description != this.event.description) {
      this.showSubmit = true;      
    }
    else {
      this.showSubmit = false;
    }
  }
}