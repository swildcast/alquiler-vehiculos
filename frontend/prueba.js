let precios = [30,45,80];


function calcularCostos(preciosporDia, dias) {
    return preciosporDia * dias;
}

for (let i = 0; i < precios.length; i++) {
  let total = calcularCosto(precios[i], 5);
  console.log("Opción " + (i + 1) + ": $" + total);
}