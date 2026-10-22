export type Direction = 'south' | 'north' | 'west' | 'east';
export interface Position { x: number; y: number; elevation: number }
export interface PlayerState extends Position {
  facing: Direction;
  previousFacing: Direction;
  move?: { fromX:number; fromY:number; toX:number; toY:number; frame:number; frames:number };
}
export interface GameState {
  frame: number;
  mapId: 'LittlerootTown';
  player: PlayerState;
  flags: Set<string>;
  variables: Map<string, number>;
  dialogue: string[] | null;
  dialoguePage: number;
}
