import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
 
    authStateChanged = new EventEmitter<boolean>();

    constructor(private router: Router) {
        Hub.listen('auth', (data) => {
            console.log("AuthService " + data.payload.event);
            switch(data.payload.event) {
                case "signIn":
                    this.authState = true;
                    break;
                case "signOut":
                    this.authState = false;
                    break;
            }
        });
        this.isLogedIn()
            .then(a => this.authState = a)
            .catch(err => console.log(err));
    }

    private __authState: boolean = false;
    private get authState(): boolean {
        return this.__authState;
    }
    private set authState(state: boolean) {
        if(state != this.__authState) {
            this.__authState = state;
            this.authStateChanged.emit(state);
        }
    }

    logout() {
        //this.authState = false;
        return Auth.signOut()
            .then(a => {
                this.authState = false;
            })
            .catch(err => console.log(err));
    }

    isLogedIn(): Promise<boolean> {
        return Auth.currentAuthenticatedUser({bypassCache: false})
            .then(d => {
                //this.authState = true;
                return true;
            })
            .catch(e => {
                //this.authState = false;
                return false;
            });
    }
}