import { Component, inject } from '@angular/core';

import { Observable } from 'rxjs/internal/Observable';

import { AsyncPipe, JsonPipe } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../service/sales.service';
import { Sale } from '../interface/sale';
import { SalesFormComponent } from '../sales-form/sales-form.component';
import { Columns } from '../interface/columns';
import { map, reduce } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [AsyncPipe, NgbModule, FormsModule, SalesFormComponent, JsonPipe],
  templateUrl: './sales-table.component.html',
  styleUrl: './sales-table.component.scss'
})
export class SalesTableComponent {
  form:Columns = {
    dateini: '2023-10-01',
    datefin: '2023-10-02',
    customer: false,
    country: false,
    provider: false,
    category: false,
    variety: false,
    color: false
    };
  nuColumns = 0;
  isCollapsed = true;
  columnsC = ['customer', 'country', 'provider', 'category', 'variety', 'color'];
  dates: any[] = [];
  total = 4;
  columns: { [key: string]: boolean } = {
    customer: false,
    country: false,
    provider: false,
    category: true,
    variety: false,
    color: true
  };
  sales$: Observable<any> = of([{}]);

  constructor(private salesSevive: SalesService) { }

  ngOnInit() {}

  get totalTSum() {
    return this.sales$.pipe(
      reduce((sum, item: { totalT: number }) => sum + item['totalT'], 0)
    );
  }

  onSubmit(column: Columns) {
    if(Object.values(column).filter(value => value).length-1 <= 2){
      alert('Debe seleccionar al menos 2 columna');
      return
    }
    this.form = column;
    this.nuColumns = Object.values(column).filter(value => value).length-1;
    this.columns = Object.fromEntries(Object.entries(column));
    
    this.getSales();
  }

  getColumns() {
    return this.columnsC.filter(column => this.columns[column]);
  }

  getSales(){
    const columns = this.getColumns();
    this.sales$ = this.salesSevive.getSales(this.form.dateini, this.form.datefin, columns, 'stems').pipe(
      map((sales:Sale[]) => {
        this.getValue(this.joinSales(this.groupSalesByMultipleFields(sales)));
        let salesGrouped = this.groupSalesByMultipleFields(sales);
        let salesJoined = this.joinSales(salesGrouped);
        let value = this.getValue(salesJoined);
        this.dates = this.getUniqueDates(sales);
        let sums = [];
        for (let index = 0; index < this.dates.length; index++) {
          sums.push(this.sumStemsByDateAndGroup(value, this.dates[index],this.dates, columns));
        }
        sums = sums.flat();
      return  sums;
      })
    );

    
  }

  groupSalesByMultipleFields(sales: any[]): any[] {
    return sales.reduce((grouped: { [date: string]: { [key: string]: Sale } }, sale: Sale) => {
      // Si no existe un grupo para esta fecha, crea uno
      if (!grouped[sale.date]) {
        grouped[sale.date] = {};
      }
  
      // Concatena las variables por las que quieres agrupar para formar una clave única
      const key = `${sale.customer}-${sale.country}-${sale.provider}-${sale.category}-${sale.variety}-${sale.color}`;
  
      if (!grouped[sale.date][key]) {
        // Si no existe un grupo para esta clave, crea uno
        grouped[sale.date][key] = { ...sale, stems: 0 };
      }
  
      // Suma los tallos al grupo existente
      grouped[sale.date][key].stems += sale.stems;
  
      return grouped;
    }, {});
  }

  joinSales(sales: any[]): any[] {
    // Convierte el objeto sales en un array
    const salesArray = Object.values(sales);
  
    // Crea un mapa para almacenar las ventas unidas
    const salesMap = new Map<string, Sale>();
  
    // Itera sobre cada venta
    for (const sale of salesArray) {
      // Genera una clave única para esta venta
      const key = `${sale.customer}-${sale.country}-${sale.provider}-${sale.category}-${sale.variety}-${sale.color}`;
  
      // Si existe una venta en el mapa con la misma clave, une los dos objetos
      if (salesMap.has(key)) {
        salesMap.set(key, { ...salesMap.get(key), ...sale });
      } else {
        // Si no existe una venta en el mapa con la misma clave, agrega la venta al mapa
        salesMap.set(key, sale);
      }
    }
  
    // Convierte el mapa de vuelta a un array
    return Array.from(salesMap.values());
  }


  getValue(sales: any ): any[] {
    let valueA:any = [];
    // Usando Object.entries()
    Object.entries(sales[0]).forEach(([key, value]) => {
      
      valueA.push( value);
    });
    return valueA;
  }


  groupByFields(sales:any[], fields: string[]) {
    return sales.reduce((groups, item) => {
      const group = JSON.stringify(fields.map(field => item[field]));
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  sumStemsByDateAndGroup(sales:any[], date:String, dates:any[], fields:any[]) {
    
    // Filtra las ventas por la fecha
    let filteredSales = sales.filter(sale => sale.date === date);
  
    // Agrupa las ventas filtradas
    let groupedSales = this.groupByFields(filteredSales, fields);
  
    // Suma los valores de 'stems' para cada grupo
    let sums = (Object.values(groupedSales) as any[][]).map((group: any[]) => {
      
      return group.reduce((total:any, item:any) =>{
        let data = {
          ...item,
          [item['date']]: total + item.stems
        };
        data['totalT'] = 0;
        for (let index = 0; index < dates.length; index++) {
          if(item['date'] !== dates[index]){
            data[dates[index]] = 0;
          }
          data['totalT'] += data[dates[index]];
          
        }
        
        return data;
        }, 0);
    });
  
    return sums;
  }

  getUniqueDates(sales: any[]) {
    let dates = sales.map(sale => sale.date);
    let uniqueDates = [...new Set(dates)];
    return uniqueDates;
  }




}
