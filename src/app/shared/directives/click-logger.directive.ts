import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appClickLogger]'
})
export class ClickLoggerDirective {
  @Input() appClickLogger: string = 'Elemento clickeado';

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    console.log(`${this.appClickLogger}:`, {
      timestamp: new Date().toISOString(),
      target: (event.target as HTMLElement).tagName,
      position: {
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY
      }
    });

    // Acción adicional: agregar clase temporal
    const element = event.target as HTMLElement;
    element.classList.add('click-active');
    
    setTimeout(() => {
      element.classList.remove('click-active');
    }, 300);
  }
}