import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  providers: [ApiProvider]
})
export class SettingsPage {
  public families;
  public currentFamily;

  constructor(public navCtrl: NavController,     
    public params: NavParams,
    public alert: AlertController,
    private api: ApiProvider,
    private storage: Storage) {
  }

  async ionViewWillEnter() {
    let familyKey = await this.storage.get("familyKey");//get current selected family

    if (familyKey) {
      this.currentFamily = familyKey;
    }

    this.families = await this.api.getFamilyKeys()    
    .catch((error) => {
      this.families = null;
    });

    //take out all of the ' marks in the name
    if (this.families) {
      this.families.map((family) => {
        family.name = family.name.replace(/^'|'$/g, '');
        return family;
      });
    }
  }

  createFamily() {
    console.log('creating family');
    const prompt = this.alert.create({
      title: 'Create Family',//prompt user for to enter name for the new family
      message: "Enter a name for the new family group",
      inputs: [
        {
          name: 'familyName',
          placeholder: 'name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Create',
          handler: data => {
            console.log('Saved clicked', data.familyName);

            //call api to create family
            this.api.createFamily(data.familyName)
            .then((result) => {//success, show message
              const message1 = this.alert.create({
                title: 'Success',
                subTitle: 'Family Created',
                buttons: ['OK']
              });
              message1.present();
            })            
            .catch((error) => {//error, show message
              const message = this.alert.create({
                title: 'Error',
                subTitle: error.error,
                buttons: ['OK']
              });
              message.present();
            });
          }
        }
      ]
    });
    prompt.present();
  }

  goBack() {
    this.navCtrl.pop();
  }

  logout() {
    this.api.logout();
    this.navCtrl.popToRoot();//go to login screen
  }

  ionViewWillLeave() {    
    if (this.currentFamily) {
      console.log('saving currentFamily:', this.currentFamily);
      this.storage.set('familyKey', this.currentFamily);
    }
  }
}