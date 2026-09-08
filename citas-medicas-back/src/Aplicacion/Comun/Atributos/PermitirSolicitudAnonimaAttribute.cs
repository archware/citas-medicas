namespace Aplicacion.Comun.Atributos;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class PermitirSolicitudAnonimaAttribute : Attribute { }
