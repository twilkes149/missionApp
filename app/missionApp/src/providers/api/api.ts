import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {
  private baseUrl = 'https://twilkes-base-server.herokuapp.com/';
  private authToken;  

  constructor(public http: HTTP) {
    console.log('Hello ApiProvider Provider');
    this.authToken = null;
  }

  //calls api for login and returns promise
  login(email, password) {
    this.http.setDataSerializer('json');
    if (this.authToken) {
      return Promise.resolve(this.authToken);
    }
    else {
      let body = {
        email: email,
        password: password,
      };

      return new Promise((resolve, reject) => {
        this.http.post(this.baseUrl + 'login', body, {})
        .then((response) => {          
          this.authToken = JSON.parse(response.data).token;//save the auth token
          resolve(this.authToken);
        })
        .catch((error) => {//let user know something happened, probalby not caused by my api
          if (error.error)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
    }
  }

  //calls api for register and returns a promise
  register(password, email, firstName, lastName) {
    this.http.setDataSerializer('json');
    if (this.authToken) {
      return Promise.resolve(this.authToken);
    }
    else {
      return new Promise((resolve, reject) => {
        let body = {          
          email: email,
          password: password,
          firstname: firstName,
          lastname: lastName,
        };

        this.http.post(this.baseUrl + 'register', body, {})
        .then((response) => {
          this.authToken = JSON.parse(response.data).token;//save the auth token
          resolve(this.authToken);
        })
        .catch((error) => {
          if (error.error)
            reject(JSON.parse(error.error));
          else //not sure what happened, probably an error not cause by my api
            reject({messagae: "Unknown error occured"});
        });
      });
    }
  }

  forgotPassword(email) {
    this.http.setDataSerializer('json');
    return new Promise((resolve, reject) => {
      let body = {
        email: email,
      };

      this.http.post(this.baseUrl + 'forgotPassword', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch ((error) => {
        if (error.error)
          reject(JSON.parse(error.error));
        else //not sure what happened, probably an error not cause by my api
          reject({message: "Unknown error occured"});
      });
    });
  }

  //the token comes from the email, password is the new password
  resetPassword(token, password) {
    this.http.setDataSerializer('json');
    return new Promise((resolve, reject) => {
      let body = {
        password: password,
        token: token,
      };
      this.http.post(this.baseUrl + 'resetPassword', body, {})
      .then((response) => {
        this.logout();
        resolve(JSON.parse(response.data));        
      })
      .catch((error) => {
        if (error.error)
          reject(JSON.parse(error.error));
        else //not sure what happened, probably an error not cause by my api
          reject({message: "Unknown error occured"});
      });
    });
  }

  //destroys current user data
  logout() {
    this.authToken = null;
  }
}
