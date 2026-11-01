import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Router } from '@angular/router';
import { IonHeader,IonToolbar,IonTitle,IonContent,IonButton,IonIcon,IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline,refreshOutline,pawOutline,cloudOfflineOutline,qrCodeOutline } from 'ionicons/icons';
import { ViajesStoreService } from '../../services/viajes-store.service';
import { Viaje,PasajeroViaje } from '../../models/viajes.model';
@Component({selector:'app-pase-abordar',standalone:true,imports:[CommonModule,IonHeader,IonToolbar,IonTitle,IonContent,IonButton,IonIcon,IonSpinner],templateUrl:'./pase-abordar.page.html',styleUrls:['./pase-abordar.page.scss']})
export class PaseAbordarPage implements OnInit {
 viaje?:Viaje; pasajero?:PasajeroViaje; cargando=false;
 constructor(public store:ViajesStoreService,private route:ActivatedRoute,private router:Router){addIcons({arrowBackOutline,refreshOutline,pawOutline,cloudOfflineOutline,qrCodeOutline});}
 async ngOnInit(){await this.actualizar();}
 async actualizar(){this.cargando=true;try{await this.store.cargar();const rid=Number(this.route.snapshot.paramMap.get('reservaId'));const pid=Number(this.route.snapshot.paramMap.get('pasajeroId'));this.viaje=this.store.viajes.find(v=>Number(v.reserva_id)===rid);this.pasajero=this.viaje?.pasajeros.find(p=>Number(p.reserva_pasajero_id)===pid);}finally{this.cargando=false;}}
 volver(){void this.router.navigate(['/mis-vuelos']);}
}
