import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicoResumen {
  id: number;
  nombres: string;
  apellidos: string;
  numeroColegiatura: string;
  especialidad: string;
  telefono?: string;
  correo?: string;
  bActivo: boolean;
}

export interface RegistrarMedicoDto {
  nombres: string;
  apellidos: string;
  numeroColegiatura: string;
  especialidad: string;
  telefono?: string;
  correo?: string;
}

export interface ActualizarMedicoDto extends RegistrarMedicoDto {
  id: number;
}

export interface ResultadoGrilla<T> {
  data: T;
  totalRegistros: number;
  totalPaginas: number;
}

export interface IOutcome<T> {
  statusCode: number;
  hasSucceeded: boolean;
  value: T;
  detailError: any;
}

@Injectable({ providedIn: 'root' })
export class MedicosApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1/plataforma/medicos`;

  obtenerTodos(pagina = 1, tamanioPagina = 10, filtro?: string): Observable<IOutcome<ResultadoGrilla<MedicoResumen[]>>> {
    const params: Record<string, string> = {
      pagina: String(pagina),
      tamanioPagina: String(tamanioPagina)
    };
    if (filtro) params['filtro'] = filtro;
    return this.http.get<IOutcome<ResultadoGrilla<MedicoResumen[]>>>(this.base, { params });
  }

  registrar(dto: RegistrarMedicoDto): Observable<IOutcome<number>> {
    return this.http.post<IOutcome<number>>(this.base, dto);
  }

  actualizar(dto: ActualizarMedicoDto): Observable<IOutcome<boolean>> {
    return this.http.put<IOutcome<boolean>>(`${this.base}/${dto.id}`, dto);
  }

  eliminar(id: number): Observable<IOutcome<boolean>> {
    return this.http.delete<IOutcome<boolean>>(`${this.base}/${id}`);
  }
}
