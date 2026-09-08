FROM mcr.microsoft.com/dotnet/sdk:10.0 AS compilacion
ENV DOTNET_NOLOGO=1 DOTNET_CLI_TELEMETRY_OPTOUT=1
WORKDIR /origen
COPY Directory.Build.props Directory.Packages.props global.json ./
COPY src/ src/
RUN dotnet restore src/CitasMedicas.WebApi/CitasMedicas.WebApi.csproj
RUN dotnet publish src/CitasMedicas.WebApi/CitasMedicas.WebApi.csproj \
    -c Release -o /artefacto --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS servicio
ENV DOTNET_NOLOGO=1 ASPNETCORE_URLS=http://+:8080
WORKDIR /app
COPY --from=compilacion /artefacto .
EXPOSE 8080
ENTRYPOINT ["dotnet", "CitasMedicas.WebApi.dll"]