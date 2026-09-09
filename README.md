# Demo - Sistema de Citas Médicas

¡Hola! Este repositorio contiene el código fuente de la demostración funcional del sistema de Citas Médicas. 

Aquí tienes las instrucciones paso a paso para ejecutar el proyecto de forma local en tu computadora, usando los servicios que ya tienes instalados.

## 1. Preparar la Base de Datos (SQL Server)

Hemos incluido un archivo con todo lo necesario para que la base de datos se cree sola y con datos de prueba.

1. Abre tu SQL Server Management Studio (SSMS) o Azure Data Studio.
2. En esta misma carpeta encontrarás el archivo **`database.sql`**. Ábrelo en tu gestor de base de datos.
3. Ejecuta todo el script. Esto creará la base de datos `citas_medicas`, sus tablas y cargará un usuario administrador, además de médicos, pacientes y citas de prueba para que puedas empezar a usar la aplicación de inmediato.

*(Nota: El script ha creado el usuario **admin** con contraseña **admin123** para que puedas iniciar sesión en la web).*

*(Nota 2: Asegúrate de que las credenciales de tu SQL Server coincidan con las que están en el archivo `citas-medicas-back/src/CITAMEDICA/appsettings.json`. Ejemplo:*
`"CitasMedicas": "Server=DELTA;Database=citas_medicas;User Id=sa;Password=arch;TrustServerCertificate=True;Encrypt=False;"`
*Si los datos de tu servidor son diferentes, actualízalo en dicho archivo).*

## 2. Levantar el Backend (.NET)

Abre una terminal (PowerShell o CMD), entra a la carpeta del backend y ejecuta el proyecto:

```powershell
cd citas-medicas-back
dotnet run --project src\CITAMEDICA\CITAMEDICA.csproj
```

Verás que el servidor inicia (te dirá que está escuchando en el puerto `60826`). Déjalo corriendo y abre una nueva pestaña de terminal.

## 3. Levantar el Frontend (Angular)

En tu nueva terminal, navega a la carpeta del frontend, instala las dependencias y arráncalo:

```powershell
cd citas-medicas-web
npm install
npm start
```

## 4. ¡A probar!

Una vez que Angular termine de compilar, abre tu navegador favorito y ve a:
**[http://localhost:8094](http://localhost:8094)**

Ahí podrás ver el sistema completo funcionando, navegar entre Pacientes, Médicos y Citas, y probar el CRUD completo en todas sus pantallas.
