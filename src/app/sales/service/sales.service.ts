import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sale } from '../interface/sale';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private url = 'https://apitest.ikbo.co/sales';

  constructor(private http: HttpClient) { }

  getSales(dateini: string, datefin: string, columns: string[], value: string): Observable<Sale[]> {
    let params = new HttpParams()
      .set('dateini', dateini)
      .set('datefin', datefin)
      .set('value', value);
  
    columns.forEach(column => {
      params = params.append('columns[]', column);
    });
  
    return this.http.get<Sale[]>(this.url, { params });
  }


}
