import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    isLogedIn: boolean = false;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        this.authService.isLogedIn()
            .then(d => this.isLogedIn = d)
            .catch(err => console.log(err));
            
        this.authService.authStateChanged.subscribe(e => {
            this.isLogedIn = e;
            if(e) {
                if(this.router.url === '/auth') {
                    this.router.navigate(['/dashboard']).then(() => {
                        window.location.reload();
                    });
                }
            } else {
                if(this.router.url !== '/auth') {
                    this.router.navigate(['/auth']).then(() => {
                        window.location.reload();
                    });
                }
            }
        });
    }
}