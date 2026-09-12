import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon],
})
export class HomePage implements OnInit {
  constructor(private router: Router) {
    // En Ionic Standalone, los iconos se registran manualmente
    addIcons({ airplane });
  }

  ngOnInit() {
    // Inicia la redirección automática después de 3000 milisegundos (3 segundos)
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }
}