import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };

  showAlert = false;
  alertMsg = 'Please wait! Logging in. . . '
  alertColor = 'blue';
  inSubmission = false;
  constructor(private auth: AngularFireAuth) { }

  ngOnInit(): void {
  }

  async login() {
    const { email, password } = this.credentials;
    this.showAlert = true;
    this.alertMsg = 'Please wait! Logging in. . . ';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.signInWithEmailAndPassword(email, password);
      this.alertMsg = 'Success';
      this.alertColor = 'green'

    } catch (e) {
      this.inSubmission = false;
      this.alertMsg = 'Can\'t find user';
      this.alertColor = 'red';
      console.log(e);

      return;
    }
  }
}
