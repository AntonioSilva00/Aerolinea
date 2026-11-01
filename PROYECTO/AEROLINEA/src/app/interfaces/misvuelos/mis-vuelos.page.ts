
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-vuelos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-vuelos.page.html'
})
export class MisVuelosPage implements OnInit, OnDestroy {

  fechaSalida = '2026-11-05T08:00:00-06:00';

  tiempoRestante = '';
  puedeCheckIn = false;

  private intervalo?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.actualizarTiempo();

    this.intervalo = setInterval(() => {
      this.actualizarTiempo();
    }, 1000);
  }

  actualizarTiempo(): void {
    const ahora = Date.now();
    const salida = new Date(this.fechaSalida).getTime();

    const diferencia = salida - ahora;

    if (diferencia <= 0) {
      this.tiempoRestante = 'Hora de salida alcanzada';
      this.puedeCheckIn = false;
      return;
    }

    const dias = Math.floor(diferencia / 86400000);
    const horas = Math.floor(
      (diferencia % 86400000) / 3600000
    );
    const minutos = Math.floor(
      (diferencia % 3600000) / 60000
    );

    this.tiempoRestante =
      `${dias}d ${horas}h ${minutos}min`;

    this.puedeCheckIn =
      diferencia <= 24 * 60 * 60 * 1000;
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }
}
