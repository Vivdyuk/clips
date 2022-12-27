import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { IUser } from "../models/user.model";
import { delay, filter, map, Observable, of, switchMap } from "rxjs";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private dbName = 'Users';
  private userCollection: AngularFirestoreCollection<IUser>;
  public isAuth$: Observable<boolean>;
  public isAuthWithDelay$: Observable<boolean>;
  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userCollection = db.collection(this.dbName)
    this.isAuth$ = auth.user.pipe(
      map(user => !!user)
    );
    this.isAuthWithDelay$ = this.isAuth$.pipe(
      delay(1000)
    );
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => this.route.firstChild),
      switchMap(route => route?.data ?? of({}))
    ).subscribe(data => {
      this.redirect = !!data.authOnly
    })
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('There\'s no password provided');
    }

    const userCredentials = await this.auth.createUserWithEmailAndPassword(userData.email as string, userData.password as string)

    if (!userCredentials.user) {
      throw new Error('User can\'t be found');
    }

    await this.userCollection.doc(userCredentials.user.uid).set({
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      age: userData.age
    })

    await userCredentials.user.updateProfile({
      displayName: userData.name,
    })
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut()

    if (this.redirect) {
      await this.router.navigateByUrl('')
    }
  }
}
