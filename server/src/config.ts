import { GameConfig } from './models/types';

export const defaultGameConfig: GameConfig = {
  minPlayers: 2,
  maxPlayers: 8,
  roundDuration: 60, // seconds
  intermissionDuration: 5, // seconds
  totalRounds: 3,
  prompts: [
    // Animals
    'cat', 'dog', 'elephant', 'giraffe', 'penguin', 'butterfly', 'octopus', 'dolphin',
    'tiger', 'lion', 'bear', 'rabbit', 'snake', 'turtle', 'fish', 'bird',
    
    // Objects
    'house', 'car', 'bicycle', 'tree', 'flower', 'sun', 'moon', 'star',
    'umbrella', 'chair', 'table', 'lamp', 'book', 'phone', 'computer', 'camera',
    
    // Food
    'pizza', 'hamburger', 'ice cream', 'cake', 'apple', 'banana', 'watermelon', 'carrot',
    'bread', 'cheese', 'egg', 'coffee', 'tea', 'cookie', 'donut', 'sandwich',
    
    // Activities
    'running', 'swimming', 'dancing', 'sleeping', 'reading', 'writing', 'cooking', 'singing',
    
    // Nature
    'mountain', 'ocean', 'river', 'cloud', 'rainbow', 'lightning', 'snowflake', 'leaf',
    
    // Misc
    'heart', 'smile', 'glasses', 'hat', 'shoe', 'key', 'clock', 'balloon'
  ]
};

export const serverPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
