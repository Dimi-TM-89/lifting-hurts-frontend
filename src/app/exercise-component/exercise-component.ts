import { Component, Input } from '@angular/core';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercise-component',
  imports: [],
  templateUrl: './exercise-component.html',
  styleUrl: './exercise-component.css',
})
export class ExerciseComponent {
  @Input() exercise!: Exercise;
}
