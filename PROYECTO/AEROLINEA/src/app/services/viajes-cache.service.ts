import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

import { ViajesResponse } from '../models/viajes.model';

interface CacheViajes {
  data: ViajesResponse;
  syncedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViajesCacheService {

  private connection?: SQLiteDBConnection;
  private connectionPromise?: Promise<SQLiteDBConnection>;

  private sqlite = new SQLiteConnection(CapacitorSQLite);

  private readonly dbName = 'skyflow_cache';

  // ========================================
  // INICIALIZAR SQLITE
  // ========================================

  private async db(): Promise<SQLiteDBConnection> {

    if (this.connection) {
      return this.connection;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.abrirDB();

    try {
      this.connection = await this.connectionPromise;
      return this.connection;
    } finally {
      this.connectionPromise = undefined;
    }
  }

  private async abrirDB(): Promise<SQLiteDBConnection> {

    console.log('[SQLITE] Inicializando base de datos');

    const consistency =
      await this.sqlite.checkConnectionsConsistency();

    console.log(
      '[SQLITE] Consistencia:',
      consistency.result
    );

    const exists = (
      await this.sqlite.isConnection(this.dbName, false)
    ).result;

    const connection = exists
      ? await this.sqlite.retrieveConnection(
          this.dbName,
          false
        )
      : await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );

    const isOpen = await connection.isDBOpen();

    if (!isOpen.result) {
      await connection.open();
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS viajes_cache (
        usuario_key TEXT PRIMARY KEY,
        json TEXT NOT NULL,
        synced_at TEXT NOT NULL
      );
    `);

    console.log('[SQLITE] Base de datos preparada');

    return connection;
  }

  // ========================================
  // GUARDAR VIAJES
  // ========================================

  async guardar(
    usuarioKey: string,
    data: ViajesResponse
  ): Promise<void> {

    if (!usuarioKey) {
      throw new Error(
        'No se puede guardar caché sin ID de usuario'
      );
    }

    const syncedAt = new Date().toISOString();

    const payload = JSON.stringify({
      data,
      syncedAt
    });

    if (!Capacitor.isNativePlatform()) {

      localStorage.setItem(
        `skyflow_cache_${usuarioKey}`,
        payload
      );

      console.log('[CACHE WEB] Información guardada');
      return;
    }

    const db = await this.db();

    await db.run(
      `INSERT OR REPLACE INTO viajes_cache
       (usuario_key, json, synced_at)
       VALUES (?, ?, ?)`,
      [usuarioKey, payload, syncedAt]
    );

    console.log('[SQLITE] Viajes guardados:', {
      usuarioKey,
      reservas: data.reservas.length
    });
  }

  // ========================================
  // RECUPERAR VIAJES
  // ========================================

  async leer(
    usuarioKey: string
  ): Promise<CacheViajes | null> {

    if (!usuarioKey) {
      return null;
    }

    let payload: string | null = null;

    if (!Capacitor.isNativePlatform()) {

      payload = localStorage.getItem(
        `skyflow_cache_${usuarioKey}`
      );

    } else {

      const db = await this.db();

      const result = await db.query(
        `SELECT json
         FROM viajes_cache
         WHERE usuario_key = ?`,
        [usuarioKey]
      );

      payload = result.values?.[0]?.json ?? null;
    }

    if (!payload) {
      console.log('[CACHE] No hay datos guardados');
      return null;
    }

    try {

      const saved = JSON.parse(payload) as CacheViajes;

      if (
        !saved ||
        !Array.isArray(saved.data?.reservas)
      ) {
        console.warn('[CACHE] Datos guardados inválidos');
        return null;
      }

      console.log('[CACHE] Datos recuperados:', {
        reservas: saved.data.reservas.length,
        sincronizadoEn: saved.syncedAt
      });

      return saved;

    } catch (error) {

      console.error(
        '[CACHE] Error interpretando datos:',
        error
      );

      return null;
    }
  }

  // ========================================
  // BORRAR CACHÉ DE UN USUARIO
  // ========================================

  async borrar(usuarioKey: string): Promise<void> {

    if (!Capacitor.isNativePlatform()) {

      localStorage.removeItem(
        `skyflow_cache_${usuarioKey}`
      );

      return;
    }

    const db = await this.db();

    await db.run(
      `DELETE FROM viajes_cache
       WHERE usuario_key = ?`,
      [usuarioKey]
    );

    console.log('[SQLITE] Caché eliminada para usuario');
  }
}
