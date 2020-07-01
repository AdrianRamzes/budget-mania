import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { Router } from '@angular/router';

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'eu-central-1:bed78bd0-921f-4d0c-9af7-018d6bac45e5',

        // REQUIRED - Amazon Cognito Region
        region: 'eu-central-1',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-central-1_RBd43RtGv',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '3md8krt2g1jmd6jdd7tk505adp',
    }
});

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