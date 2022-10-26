import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'username'
})
export class UsernamePipe implements PipeTransform {
  transform(value: { firstName: string, lastName: string, pseudo: string | undefined }, locale: 'en' | 'fr' = 'fr'): string {
    if (value.pseudo != null) return value.pseudo;
    return locale === 'fr' ?
      `${value.firstName} ${value.lastName.toUpperCase()}` :
      `${value.firstName} ${value.lastName}`;
  }
}