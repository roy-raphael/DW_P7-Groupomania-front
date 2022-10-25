import { animate, animation, sequence, style } from '@angular/animations';

export const flashAnimation = animation([
  sequence([
    animate('250ms', style({
      'background-color': '#ffd7d7'
    })),
    animate('250ms', style({
      'background-color': 'white'
    })),
  ]),
])