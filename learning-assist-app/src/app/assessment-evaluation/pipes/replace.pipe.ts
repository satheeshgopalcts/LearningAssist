import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
  standalone: true
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, search: string, replacement: string): string {
    if (!value || !search) {
      return value;
    }
    return value.replace(new RegExp(search, 'g'), replacement);
  }
}
