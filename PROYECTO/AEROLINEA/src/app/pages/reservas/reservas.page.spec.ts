declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn?: () => void | Promise<void>) => void;
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, ReservasPage } from './reservas.page';

describe('ReservasPage', () => {
  let component: ReservasPage;
  let fixture: ComponentFixture<ReservasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasPage]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});