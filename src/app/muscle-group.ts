import { Exercise } from './exercise';

export interface MuscleGroup {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  exercises: Exercise[];
}
