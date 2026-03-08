/**
 * Database Layer
 * Manages SQLite database connection, schema initialization, and CRUD operations
 */

import sqlite3 from 'sqlite3';
import { configManager } from '../config/config';
import { Course, CourseSummary } from '../types/index';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database class for managing SQLite operations
 */
class Database {
  private db: sqlite3.Database | null = null;
  private initialized = false;

  /**
   * Initialize the database connection and create schema
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const dbPath = configManager.getRequired('DATABASE_PATH') as string;
    
    // Ensure the directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    this.db = await this.createConnection(dbPath);
    
    // Create schema
    await this.createSchema();
    
    this.initialized = true;
  }

  /**
   * Create database connection
   */
  private createConnection(dbPath: string): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to database: ${err.message}`));
        } else {
          resolve(db);
        }
      });
    });
  }

  /**
   * Create database schema with courses table and indexes
   */
  private async createSchema(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        language TEXT NOT NULL,
        overview TEXT NOT NULL,
        learning_outcomes TEXT NOT NULL,
        chapters TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;

    const createCreatedAtIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_created_at ON courses(created_at DESC)
    `;

    const createLanguageIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_language ON courses(language)
    `;

    await this.run(createTableSQL);
    await this.run(createCreatedAtIndexSQL);
    await this.run(createLanguageIndexSQL);
  }

  /**
   * Execute a SQL statement with no return value
   */
  private run(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Execute a SQL query that returns a single row
   */
  private get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  }

  /**
   * Execute a SQL query that returns multiple rows
   */
  private all<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * Save a course to the database
   * @param course - Course object to save
   * @returns The course ID
   */
  async saveCourse(course: Course): Promise<string> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }

    const sql = `
      INSERT INTO courses (id, title, topic, language, overview, learning_outcomes, chapters, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      course.id,
      course.title,
      course.topic,
      course.language,
      course.overview,
      JSON.stringify(course.learning_outcomes),
      JSON.stringify(course.chapters),
      course.created_at
    ];

    await this.run(sql, params);
    return course.id;
  }

  /**
   * Retrieve a course by ID
   * @param id - Course ID
   * @returns Course object or null if not found
   */
  async getCourseById(id: string): Promise<Course | null> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }

    const sql = `SELECT * FROM courses WHERE id = ?`;
    const row = await this.get<any>(sql, [id]);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      topic: row.topic,
      language: row.language,
      overview: row.overview,
      learning_outcomes: JSON.parse(row.learning_outcomes),
      chapters: JSON.parse(row.chapters),
      created_at: row.created_at
    };
  }

  /**
   * Get all courses (summary view)
   * @returns Array of course summaries
   */
  async getAllCourses(): Promise<CourseSummary[]> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }

    const sql = `
      SELECT id, title, topic, language, created_at
      FROM courses
      ORDER BY created_at DESC
    `;

    const rows = await this.all<CourseSummary>(sql);
    return rows;
  }

  /**
   * Delete all courses from the database
   */
  async deleteAllCourses(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }

    const sql = `DELETE FROM courses`;
    await this.run(sql);
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.db = null;
          this.initialized = false;
          resolve();
        }
      });
    });
  }
}

// Export singleton instance
export const database = new Database();
