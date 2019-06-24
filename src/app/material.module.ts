// src/app/material.module.ts
import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatListModule,
    MatSliderModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule
} from '@angular/material';

const modules = [
    MatButtonModule,
    MatListModule,
    MatSliderModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule
];

@NgModule({
    imports: modules,
    exports: modules
})
export class MaterialModule {}