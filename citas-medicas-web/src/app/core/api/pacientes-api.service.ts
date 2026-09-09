import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistrarPacienteDto {
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface ActualizarPacienteDto extends RegistrarPacienteDto {
  id: number;
}

export interface PacienteResumen {
  id: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  genero: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
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
export class PacientesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1/plataforma/pacientes`;

  registrar(dto: RegistrarPacienteDto): Observable<ResultadoCitaMedica<number>> {
    return this.http.post<ResultadoCitaMedica<number>>(this.base, dto);
  }

  actualizar(dto: ActualizarPacienteDto): Observable<ResultadoCitaMedica<boolean>> {
    return this.http.put<ResultadoCitaMedica<boolean>>(`${this.base}/${dto.id}`, dto);
  }

  eliminar(id: number): Observable<ResultadoCitaMedica<boolean>> {
    return this.http.delete<ResultadoCitaMedica<boolean>>(`${this.base}/${id}`);
  }

  obtenerTodos(pagina = 1, tamanioPagina = 10, documento?: string, nombre?: string): Observable<ResultadoCitaMedica<ResultadoGrilla<PacienteResumen[]>>> {
    const params: Record<string, string> = {
      pagina: String(pagina),
      tamanioPagina: String(tamanioPagina)
    };
    if (documento) params['documento'] = documento;
    if (nombre) params['nombre'] = nombre;
    return this.http.get<ResultadoCitaMedica<ResultadoGrilla<PacienteResumen[]>>>(this.base, { params });
  }
}

