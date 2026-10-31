import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { SQLiteService } from './services/sqlite.service';
import { addIcons } from 'ionicons';
import { airplane } from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
  private sqliteService: SQLiteService
  
) {  addIcons({
    airplane
  });
}

async ngOnInit() {
  await this.sqliteService.initialize();
  console.log('SQLite inicializado');
}
}
