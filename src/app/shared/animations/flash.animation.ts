import { animate, animation, sequence, style } from '@angular/animations';

export const flashAnimation = animation([
  sequence([
    animate('250ms', style({
      'background-color': 'rgb(201, 157, 242)'
    })),
    animate('250ms', style({
      'background-color': 'white'
    })),
  ]),
])