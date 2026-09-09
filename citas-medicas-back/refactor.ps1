$ErrorActionPreference = 'Stop'

$slnDir = "C:\Users\cotaha\source\repos\Entregable-CitasMedicas\citas-medicas-back"
Write-Host "Refactorizando en $slnDir"

# 1. Renombrar WebApi -> CITAMEDICA
if (Test-Path "src\WebApi\WebApi.csproj") {
    Rename-Item -Path "src\WebApi\WebApi.csproj" -NewName "CITAMEDICA.csproj"
}
if (Test-Path "src\WebApi") {
    Rename-Item -Path "src\WebApi" -NewName "CITAMEDICA"
}

# 2. Actualizar .sln
$slnFile = "CitasMedicas.sln"
if (Test-Path $slnFile) {
    $slnText = Get-Content $slnFile -Raw
    $slnText = $slnText -replace 'WebApi\\WebApi\.csproj', 'CITAMEDICA\CITAMEDICA.csproj'
    $slnText = $slnText -replace '"WebApi"', '"CITAMEDICA"'
    Set-Content -Path $slnFile -Value $slnText -Encoding utf8
}

# 3. Lista de reemplazos textuales
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
            # Use -creplace for case-sensitive replacement
            $text = $text -creplace [regex]::Escape($k), $replacements[$k]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $f.FullName -Value $text -Encoding utf8
    }
}

# 4. Renombrar archivos
function Rename-InDir($path) {
    $items = Get-ChildItem -Path $path -File -Recurse
    foreach ($f in $items) {
        $newName = $f.Name
        foreach ($k in $replacements.Keys) {
            if ($k -match 'VM|Handler') {
                if ($newName -match $k) {
                    $newName = $newName -replace $k, $replacements[$k]
                }
            }
        }
        if ($newName -ne $f.Name) {
            Rename-Item -Path $f.FullName -NewName $newName
        }
    }
}
Rename-InDir "src\Aplicacion\CasosUso"

# Renombrar IOutcome.cs
if (Test-Path "src\Aplicacion\Comun\Modelos\IOutcome.cs") {
    Rename-Item "src\Aplicacion\Comun\Modelos\IOutcome.cs" "ResultadoCitaMedica.cs"
}
