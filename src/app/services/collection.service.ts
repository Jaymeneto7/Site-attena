import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Collection {
  key: string;
  label: string;
}

const DEFAULTS: Collection[] = [
  { key: 'lancamentos', label: 'Lançamentos' },
  { key: 'verao-2024',  label: 'Verão 2024' },
  { key: 'basicos',     label: 'Básicos' },
];

const STORAGE_KEY = 'site_collections_v2';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private _cols$ = new BehaviorSubject<Collection[]>(this._load());

  readonly collections$ = this._cols$.asObservable();

  get collections(): Collection[] { return this._cols$.getValue(); }

  add(label: string): boolean {
    const key = label.trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!key || this.collections.some(c => c.key === key)) return false;
    const updated = [...this.collections, { key, label: label.trim() }];
    this._cols$.next(updated);
    this._persist(updated);
    return true;
  }

  remove(key: string): void {
    const updated = this.collections.filter(c => c.key !== key);
    this._cols$.next(updated);
    this._persist(updated);
  }

  private _load(): Collection[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [...DEFAULTS];
    } catch {
      return [...DEFAULTS];
    }
  }

  private _persist(all: Collection[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
}
