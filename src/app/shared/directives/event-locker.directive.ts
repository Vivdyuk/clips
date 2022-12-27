import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[app-event-locker]'
})
export class EventLockerDirective {

  @HostListener('dragover', ['$event'])
  @HostListener('drop', ['$event'])
  public handleEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
