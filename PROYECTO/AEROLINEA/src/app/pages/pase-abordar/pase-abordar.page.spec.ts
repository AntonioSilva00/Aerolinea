declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void | Promise<void>) => void;

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PaseAbordarPage } from './pase-abordar.page';
import { ViajesStoreService } from '../../services/viajes-store.service';

describe('PaseAbordarPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaseAbordarPage],
      providers: [
        provideRouter([]),
        {
          provide: ViajesStoreService,
          useValue: {
            viajes: [],
            offline: false,
            sincronizadoEn: null,
            cargar: async () => {},
          },
        },
      ],
    }).compileComponents();
  });

  it('crea el componente', () => {
    const f = TestBed.createComponent(PaseAbordarPage);
    expect(f.componentInstance).toBeTruthy();
    f.destroy();
  });
});
