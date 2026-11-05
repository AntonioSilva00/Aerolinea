import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

function nipValido(control: AbstractControl): ValidationErrors | null {
  const nip = String(control.value ?? '');
  if (!/^\d{4}$/.test(nip)) return { nip: true };
  const n = [...nip].map(Number);
  const asc = n.every((x, i) => i === 0 || x === n[i-1] + 1);
  const desc = n.every((x, i) => i === 0 || x === n[i-1] - 1);
  return asc || desc || new Set(n).size === 1 ? { nip: true } : null;
}
@Component({selector:'app-register',standalone:true,imports:[CommonModule,ReactiveFormsModule,HttpClientModule],schemas:[CUSTOM_ELEMENTS_SCHEMA],templateUrl:'./register.page.html',styleUrls:['./register.page.scss']})
export class RegisterPage {
 private fb=inject(FormBuilder); private http=inject(HttpClient);
 // Ajustar a la IP LAN del servidor XAMPP, o integrar con ApiService existente.
 apiUrl='http://192.168.1.5/api_aerolinea/auth/registro.php';
 enviando=false; error=''; exito=''; mostrarPassword=false;
 form=this.fb.nonNullable.group({
  nombre:['',[Validators.required,Validators.maxLength(100)]],
  apellido_paterno:['',[Validators.required,Validators.maxLength(100)]],
  apellido_materno:['',[Validators.required,Validators.maxLength(100)]],
  direccion:['',[Validators.required,Validators.maxLength(255)]],
  nip:['',[Validators.required,nipValido]],
  fecha_nacimiento:['',[Validators.required]],
  genero:['',[Validators.required]],
  pais_origen:['México',[Validators.required]],
  correo:['',[Validators.required,Validators.email]],
  telefono:['',[Validators.required,Validators.pattern(/^\+?\d{10,15}$/)]],
  password:['',[Validators.required,Validators.minLength(12)]]
 });
 registrar() {
  this.error='';this.exito='';
  if(this.form.invalid){this.form.markAllAsTouched();this.error='Revisa los campos marcados.';return;}
  this.enviando=true;
  this.http.post<{ok:boolean;mensaje:string;correo_enviado:boolean}>(this.apiUrl,this.form.getRawValue()).subscribe({
   next:r=>{this.enviando=false;this.exito=r.mensaje;this.form.reset();},
   error:e=>{this.enviando=false;this.error=e.error?.error || 'No fue posible conectar con el servidor.';}
  });
 }
}
