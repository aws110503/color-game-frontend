import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (saved && saved !== 'system') {
      this.renderer.setAttribute(document.documentElement, 'data-theme', saved);
    }
  }

  setTheme(mode: 'light' | 'dark' | 'system'): void {
    const html = document.documentElement;
    if (mode === 'system') {
      this.renderer.removeAttribute(html, 'data-theme');
    } else {
      this.renderer.setAttribute(html, 'data-theme', mode);
    }
    localStorage.setItem('theme', mode);
  }

  getCurrentTheme(): 'light' | 'dark' | 'system' {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  }
}