import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Category {
  key: string;
  label: string;
}

const DEFAULTS: Category[] = [
  { key: 'tops',      label: 'Top' },
  { key: 'leggings',  label: 'Calça' },
  { key: 'shorts',    label: 'Shorts' },
  { key: 'conjuntos', label: 'Conjuntos' },
  { key: 'masculino', label: 'Masculino' },
];

const STORAGE_KEY = 'site_categories_v2';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _cats$ = new BehaviorSubject<Category[]>(this._load());

  readonly categories$ = this._cats$.asObservable();

  get categories(): Category[] { return this._cats$.getValue(); }

  add(label: string): boolean {
    const key = label.trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!key || this.categories.some(c => c.key === key)) return false;
    const updated = [...this.categories, { key, label: label.trim() }];
    this._cats$.next(updated);
    this._persist(updated);
    return true;
  }

  remove(key: string): void {
    const updated = this.categories.filter(c => c.key !== key);
    this._cats$.next(updated);
    this._persist(updated);
  }

  private _load(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [...DEFAULTS];
    } catch {
      return [...DEFAULTS];
    }
  }

  private _persist(all: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
}
