import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MisVuelosPage } from './mis-vuelos.page';
import { ViajesStoreService } from '../../services/viajes-store.service';

declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => { toBeTruthy: () => void };

describe('MisVuelosPage',()=>{
 beforeEach(async()=>{await TestBed.configureTestingModule({imports:[MisVuelosPage],providers:[provideRouter([]),{provide:ViajesStoreService,useValue:{viajes:[],offline:false,sincronizadoEn:null,cargar:async()=>{},checkin:async()=>{}}}]}).compileComponents();});
 it('crea el componente',()=>{const f=TestBed.createComponent(MisVuelosPage);expect(f.componentInstance).toBeTruthy();f.destroy();});
});
