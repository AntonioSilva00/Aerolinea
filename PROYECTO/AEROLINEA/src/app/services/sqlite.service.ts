
import { Injectable } from '@angular/core';

import { Capacitor } from '@capacitor/core';

import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {

  private sqlite = new SQLiteConnection(CapacitorSQLite);

  private db!: SQLiteDBConnection;

  private initialized = false;

  // Comprueba si estamos ejecutando una aplicación nativa
  private isNative = Capacitor.isNativePlatform();

  async initialize(): Promise<boolean> {

    // No inicializar SQLite en navegador
    if (!this.isNative) {
      console.log('SQLite desactivado en navegador. Se utiliza MySQL mediante PHP.');
      return false;
    }

    if (this.initialized) {
      return true;
    }

    try {

      const consistency =
        await this.sqlite.checkConnectionsConsistency();

      const exists =
        await this.sqlite.isConnection('escolar', false);

      if (consistency.result && exists.result) {

        this.db = await this.sqlite.retrieveConnection(
          'escolar',
          false
        );

      } else {

        this.db = await this.sqlite.createConnection(
          'escolar',
          false,
          'no-encryption',
          1,
          false
        );

      }

      await this.db.open();

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          correo TEXT NOT NULL
        );
      `);

      this.initialized = true;

      console.log('SQLite inicializado correctamente en Android.');

      return true;

    } catch (error) {

      console.error('Error al inicializar SQLite:', error);

      throw error;
    }
  }

  async insertarUsuario(nombre: string, correo: string) {

    this.verificarInicializacion();

    return this.db.run(
      'INSERT INTO usuarios (nombre, correo) VALUES (?, ?)',
      [nombre, correo]
    );
  }

  async obtenerUsuarios() {

    this.verificarInicializacion();

    return this.db.query(
      'SELECT * FROM usuarios'
    );
  }

  private verificarInicializacion() {

    if (!this.isNative) {
      throw new Error(
        'SQLite no está disponible en el navegador. Utiliza la API PHP/MySQL.'
      );
    }

    if (!this.initialized) {
      throw new Error(
        'SQLite todavía no ha sido inicializado. Ejecuta initialize() primero.'
      );
    }
  }
}
