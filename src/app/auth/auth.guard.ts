import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        return this.authService.isLogedIn()
        .then(data => {
            if(data)
                return true;
            return this.router.createUrlTree(['/auth']);
        })
        .catch(err => this.router.createUrlTree(['/auth']));
    }
}
