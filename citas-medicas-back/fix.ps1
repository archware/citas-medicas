$ErrorActionPreference = 'Stop'

Write-Host "1. Actualizar .sln"
$slnFile = "CitasMedicas.sln"
$slnText = Get-Content $slnFile -Raw
$slnText = $slnText -replace 'WebApi\\WebApi\.csproj', 'CITAMEDICA\CITAMEDICA.csproj'
$slnText = $slnText -replace '"WebApi"', '"CITAMEDICA"'
Set-Content -Path $slnFile -Value $slnText -Encoding utf8

Write-Host "2. Cambiar WebApi.csproj -> CITAMEDICA.csproj"
Rename-Item -Path "src\CITAMEDICA\WebApi.csproj" -NewName "CITAMEDICA.csproj" -ErrorAction SilentlyContinue

Write-Host "3. Reemplazos de nombres de archivo VM / Handler"
function Rename-InDir($path) {
    $items = Get-ChildItem -Path $path -File -Recurse
    foreach ($f in $items) {
        $newName = $f.Name
        if ($newName -match 'VM\.cs') {
            if ($f.FullName -match 'Consultas') {
                $newName = $newName -replace 'VM\.cs', 'Consulta.cs'
            } else {
                $newName = $newName -replace 'VM\.cs', 'Comando.cs'
            }
        }
        if ($newName -match 'Handler\.cs') {
            if ($f.FullName -match 'Consultas') {
                $newName = $newName -replace 'Handler\.cs', 'ConsultaManejador.cs'
            } else {
                $newName = $newName -replace 'Handler\.cs', 'ComandoManejador.cs'
            }
        }
        if ($newName -match 'VMValidator\.cs') {
            if ($f.FullName -match 'Consultas') {
                $newName = $newName -replace 'VMValidator\.cs', 'ConsultaValidador.cs'
            } else {
                $newName = $newName -replace 'VMValidator\.cs', 'ComandoValidador.cs'
            }
        }
        if ($newName -ne $f.Name) {
            Rename-Item -Path $f.FullName -NewName $newName
        }
    }
}
Rename-InDir "src\Aplicacion\CasosUso"

Write-Host "4. Renombrar IOutcome.cs"
if (Test-Path "src\Aplicacion\Comun\Modelos\IOutcome.cs") {
    Rename-Item "src\Aplicacion\Comun\Modelos\IOutcome.cs" "ResultadoCitaMedica.cs"
}

Write-Host "5. Reemplazos de contenido..."
$replacements = [ordered]@{
    'namespace WebApi' = 'namespace CITAMEDICA'
    'using WebApi' = 'using CITAMEDICA'
    
    'RegistrarCitaVM' = 'RegistrarCitaComando'
    'RegistrarCitaHandler' = 'RegistrarCitaComandoManejador'
    'ActualizarCitaVM' = 'ActualizarCitaComando'
    'ActualizarCitaHandler' = 'ActualizarCitaComandoManejador'
    'CancelarCitaVM' = 'CancelarCitaComando'
    'CancelarCitaHandler' = 'CancelarCitaComandoManejador'
    'ObtenerCitasVM' = 'ObtenerCitasConsulta'
    'ObtenerCitasHandler' = 'ObtenerCitasConsultaManejador'
    
    'RegistrarPacienteVM' = 'RegistrarPacienteComando'
    'RegistrarPacienteHandler' = 'RegistrarPacienteComandoManejador'
    'ActualizarPacienteVM' = 'ActualizarPacienteComando'
    'ActualizarPacienteHandler' = 'ActualizarPacienteComandoManejador'
    'EliminarPacienteVM' = 'EliminarPacienteComando'
    'EliminarPacienteHandler' = 'EliminarPacienteComandoManejador'
    'ObtenerPacientesVM' = 'ObtenerPacientesConsulta'
    'ObtenerPacientesHandler' = 'ObtenerPacientesConsultaManejador'
    
    'RegistrarMedicoVM' = 'RegistrarMedicoComando'
    'RegistrarMedicoHandler' = 'RegistrarMedicoComandoManejador'
    'ActualizarMedicoVM' = 'ActualizarMedicoComando'
    'ActualizarMedicoHandler' = 'ActualizarMedicoComandoManejador'
    'EliminarMedicoVM' = 'EliminarMedicoComando'
    'EliminarMedicoHandler' = 'EliminarMedicoComandoManejador'
    'ObtenerMedicosVM' = 'ObtenerMedicosConsulta'
    'ObtenerMedicosHandler' = 'ObtenerMedicosConsultaManejador'
    
    'IniciarSesionVM' = 'IniciarSesionComando'
    'IniciarSesionHandler' = 'IniciarSesionComandoManejador'
    'RenovarTokenVM' = 'RenovarTokenComando'
    'RenovarTokenHandler' = 'RenovarTokenComandoManejador'
    'CerrarSesionVM' = 'CerrarSesionComando'
    'CerrarSesionHandler' = 'CerrarSesionComandoManejador'
    'ObtenerPerfilVM' = 'ObtenerPerfilConsulta'
    'ObtenerPerfilHandler' = 'ObtenerPerfilConsultaManejador'
    
    'IOutcome<bool>' = 'ResultadoCitaMedica<bool>'
    'IOutcome<int>' = 'ResultadoCitaMedica<int>'
    'IOutcome<CitaResumen>' = 'ResultadoCitaMedica<CitaResumen>'
    'IOutcome<PacienteResumen>' = 'ResultadoCitaMedica<PacienteResumen>'
    'IOutcome<MedicoResumen>' = 'ResultadoCitaMedica<MedicoResumen>'
    'IOutcome<ResultadoGrilla' = 'ResultadoCitaMedica<ResultadoGrilla'
    'IOutcome<IniciarSesionRespuesta>' = 'ResultadoCitaMedica<IniciarSesionRespuesta>'
    'IOutcome<PerfilRespuesta>' = 'ResultadoCitaMedica<PerfilRespuesta>'
    'public interface IOutcome<T> : IOutcome' = 'public interface ResultadoCitaMedica<T> : ResultadoCitaMedica'
    'public interface IOutcome' = 'public interface ResultadoCitaMedica'
    'IOutcome ' = 'ResultadoCitaMedica '
    
    'SuccessResult' = 'ExitoCitaMedica'
    'ErrorResult' = 'ErrorCitaMedica'
    'DetailError' = 'ErrorCitaMedica'
    
    '\[AllowAnonymousRequest\]' = '[PermitirSolicitudAnonima]'
    'AuthorizationBehaviour' = 'AutorizacionComportamiento'
}

$files = Get-ChildItem -Path "src" -Include "*.cs" -Recurse

foreach ($f in $files) {
    $text = Get-Content $f.FullName -Raw
    $modified = $false
    
    foreach ($k in $replacements.Keys) {
        if ($text -match [regex]::Escape($k)) {
            $text = $text -creplace [regex]::Escape($k), $replacements[$k]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $f.FullName -Value $text -Encoding utf8
    }
}
Write-Host "¡Completado!"
