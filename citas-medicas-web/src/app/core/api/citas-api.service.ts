import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CitaResumen {
  id: number;
  idPaciente: number;
  nombrePaciente: string;
  idMedico: number;
  nombreMedico: string;
  fechaHora: string;
  motivo: string;
  estado: string;
  diagnostico?: string;
  tratamiento?: string;
}

export interface RegistrarCitaDto {
  idPaciente: number;
  idMedico: number;
  fechaHora: string;
  motivo: string;
  estado: string;
  diagnostico?: string;
  tratamiento?: string;
  idIdempotencia?: string;
}

export interface ActualizarCitaDto {
  id: number;
  fechaHora: string;
  motivo: string;
  estado?: string;
  diagnostico?: string;
  tratamiento?: string;
}

export interface ResultadoGrilla<T> {
  data: T;
  totalRegistros: number;
  totalPaginas: number;
}

export interface ResultadoCitaMedica<T> {
  statusCode: number;
  hasSucceeded: boolean;
  value: T;
  detalleErrorCitaMedica: any;
}

@Injectable({ providedIn: 'root' })
export class CitasApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1/plataforma/citas`;

  listar(pagina = 1, tamanioPagina = 10, idMedico?: number, fecha?: string, estado?: string): Observable<ResultadoCitaMedica<ResultadoGrilla<CitaResumen[]>>> {
    const params: Record<string, string> = {
      pagina: String(pagina),
      tamanioPagina: String(tamanioPagina)
    };
    if (idMedico) params['idMedico'] = String(idMedico);
    if (fecha) params['fecha'] = fecha;
    if (estado) params['estado'] = estado;
    return this.http.get<ResultadoCitaMedica<ResultadoGrilla<CitaResumen[]>>>(this.base, { params });
  }

  registrar(dto: RegistrarCitaDto): Observable<ResultadoCitaMedica<number>> {
    return this.http.post<ResultadoCitaMedica<number>>(this.base, dto);
  }

  actualizar(dto: ActualizarCitaDto): Observable<ResultadoCitaMedica<boolean>> {
    return this.http.put<ResultadoCitaMedica<boolean>>(`${this.base}/${dto.id}`, dto);
  }

  cancelar(id: number): Observable<ResultadoCitaMedica<boolean>> {
    return this.http.patch<ResultadoCitaMedica<boolean>>(`${this.base}/${id}/cancelar`, {});
  }
}

