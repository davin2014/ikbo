import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Columns } from '../interface/columns';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './sales-form.component.html',
  styleUrl: './sales-form.component.scss'
})
export class SalesFormComponent {
  @Output() formSubmit: EventEmitter<Columns> = new EventEmitter();
  form: FormGroup = new FormGroup({}) ;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      dateini: ['2023-10-01'],
      datefin: ['2023-10-02'],
      customer: [false],
      country: [false],
      provider: [false],
      category: [false],
      variety: [false],
      color: [false]
    });
  }

  onSubmit(event: Event) {
    // Obtén los valores del formulario
    const formValues = this.form.value;
  
    this.formSubmit.emit(this.form.value)
    // Aquí puedes manejar los valores del formulario como necesites
    console.log(formValues);
  }
}
