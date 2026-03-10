import { Injectable, inject, signal } from '@angular/core';
import { Partner } from '../models/partner.model';
import { Observable, tap, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private http = inject(HttpClient);

    public partners = signal<Partner[]>([]);
    public activePartner = signal<Partner | null>(null);

    constructor() { }

    loadAllPartners(): Observable<Partner[]> {
        if (this.partners().length > 0) {
            return of(this.partners());
        }

        // Load partners from static JSON (no backend endpoint exists for partners)
        return this.http.get<Partner[]>('/assets/data/partners.json').pipe(
            tap(data => this.partners.set(data))
        );
    }

    getPartnerBySlug(slug: string): Observable<Partner | undefined> {
        return this.loadAllPartners().pipe(
            map(partners => partners.find(p => p.slug === slug)),
            tap(partner => {
                if (partner) {
                    this.activePartner.set(partner);
                    this.applyPartnerTheme(partner);
                }
            })
        );
    }

    applyPartnerTheme(partner: Partner) {
        if (partner.color) {
            // For this prototype, we'll set a CSS variable on the body/root for partner-specific theme
            document.documentElement.style.setProperty('--partner-color', partner.color);
        }
    }

    clearActivePartner() {
        this.activePartner.set(null);
        document.documentElement.style.removeProperty('--partner-color');
    }
}
