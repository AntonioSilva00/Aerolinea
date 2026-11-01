import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { ViajesResponse } from '../models/viajes.model';
@Injectable({providedIn:'root'})
export class ViajesCacheService {
  private connection?:SQLiteDBConnection;
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private async db():Promise<SQLiteDBConnection> {
    if(this.connection) return this.connection;
    await this.sqlite.checkConnectionsConsistency();
    const exists = (await this.sqlite.isConnection('skyflow_cache',false)).result;
    const c=exists ? await this.sqlite.retrieveConnection('skyflow_cache',false) : await this.sqlite.createConnection('skyflow_cache',false,'no-encryption',1,false);
    await c.open();
    await c.execute('CREATE TABLE IF NOT EXISTS viajes_cache (usuario_key TEXT PRIMARY KEY, json TEXT NOT NULL, synced_at TEXT NOT NULL);');
    this.connection=c; return c;
  }
  // Solo prototipo web: localStorage NO es almacenamiento seguro de pases o datos personales.
  // En Android se usa SQLite; para producción, cifrar SQLite con una clave segura del dispositivo.
  async guardar(usuarioKey:string,data:ViajesResponse):Promise<void> {
    const payload=JSON.stringify({data,syncedAt:new Date().toISOString()});
    if(!Capacitor.isNativePlatform()) { localStorage.setItem(`skyflow_cache_${usuarioKey}`,payload); return; }
    const db=await this.db();
    await db.run('INSERT OR REPLACE INTO viajes_cache(usuario_key,json,synced_at) VALUES(?,?,?)',[usuarioKey,payload,new Date().toISOString()]);
  }
  async leer(usuarioKey:string):Promise<{data:ViajesResponse;syncedAt:string}|null> {
    let payload:string|null=null;
    if(!Capacitor.isNativePlatform()) payload=localStorage.getItem(`skyflow_cache_${usuarioKey}`);
    else { const db=await this.db(); const r=await db.query('SELECT json FROM viajes_cache WHERE usuario_key=?',[usuarioKey]); payload=(r.values?.[0]?.json as string)||null; }
    if(!payload) return null;
    try{return JSON.parse(payload);}catch{return null;}
  }
  async borrar(usuarioKey:string):Promise<void> {
    if(!Capacitor.isNativePlatform()) {localStorage.removeItem(`skyflow_cache_${usuarioKey}`);return;}
    const db=await this.db();await db.run('DELETE FROM viajes_cache WHERE usuario_key=?',[usuarioKey]);
  }
}
