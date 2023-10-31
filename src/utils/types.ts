import type { IMouseEvent, MouseConstraint } from 'matter-js';

export interface Category {
  color: string;
  radius: number;
  categoryBit: number;
}

export interface MyMouseEvent extends IMouseEvent<MouseConstraint> {
  mouse: {
    position: {
      x: number;
      y: number;
    };
  };
}
