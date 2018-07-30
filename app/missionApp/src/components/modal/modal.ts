import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'modal-component',
  templateUrl: 'modal.html'
})
/*
* This is a base class for a a modal with the purpose of editing a number of fields.
* It expects a number of params:
* @params modalTitle:string - this is the title to be displayed at the top
* @params inputFields:array - this is a list of inputs to be displayed. inputFields is a list of objects:
*  label
*  type
*  field
*  value
*  placeholder
*
* @params deleteCallback - this is a function to be run when the user presses the delete key
* @params saveCallback - this is a function to be run when the user presses the save key
*/
export class Modal { 
  public modalTitle:string = 'Modal';
  public inputFields:any;//this will be an array of which the modal will render a list of inputs
  public deleteFunction:Function = null;
  public saveFunction:Function = null;

  public color:string = 'white';
  public selectedColor: string = 'red';
  public selected;

  public loading:boolean = false;

  constructor(public view: ViewController,
    public params: NavParams) {
    
    //grabbing modal parameters
    this.modalTitle = this.params.get('modalTitle');
    this.inputFields = this.params.get('inputFields');
    this.deleteFunction = this.params.get('deleteCallback');
    this.saveFunction = this.params.get('saveCallback');
    this.selected = [];
    //setting default parameters
    if (!this.modalTitle) {//default title
      this.modalTitle = 'Edit Modal';
    }

    if (!this.inputFields) {//default input field
      this.inputFields = [{
        label: 'Input',
        type: 'text',
        field: 'input',
        id: 1,
        value: 'something',
        placeholder: 'Your text here',
      }];
    }
  }

  select(id) {
    console.log(id);
    if (!this.selected.includes(id)) {
      this.selected.push(id);      
    }    
  }

  getColor(id) {
    if (this.selected.includes(id)) {
      return 'red';
    }
    else {
      return 'white';
    }
  }

  //save this resource
  async save() {
    let body = this.inputFields.map(field => {
      return {
        field: field.field,
        value: field.value,
        id: field.id,
      };
    });


    if (this.saveFunction) {
      this.loading = true;
      await this.saveFunction(body);
      this.loading = false;
      this.view.dismiss();
    }
  }

  //delete this resource
  delete() {
    if (this.deleteFunction) {
      this.deleteFunction(this.inputFields[0].id);
      this.view.dismiss();
    }
  }

  //cancel / close the modal
  dismiss() {
    this.view.dismiss();
  }
}