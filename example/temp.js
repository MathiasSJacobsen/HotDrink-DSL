export function baseSumFunc(a) {
  return a ? 1000: 0;
}
export function baseSumFunc2(a) {
  return a != 0
}

export function weekendFunc(a) {
  return a ? 0.5: 0;
}

export function weekendFunc2(a) {
  return a != 0
}

export function discountFunc2(a) {
  return a != 0
}

export function discountFunc(a) {
  return a ? 1: 0;
}

export function sumFunc(nettleie, discount, weekendFee, kWh, priceOfkWh) {

  const feeAmount = parseInt(kWh) * parseInt(priceOfkWh) * parseInt(weekendFee);
  const pricekWh = parseInt(kWh) * parseInt(priceOfkWh);

  return parseInt(nettleie) + feeAmount + pricekWh;
}

export function placeToNorwayPriceFunction(place, pricekWh) {
  switch (place.toLowerCase()) {
    case "nord":
      return 1.1*pricekWh;
    case "sør":
      return 5*pricekWh;
    case "vest":
      return 4.5*pricekWh;
    case "øst":
      return 3.5*pricekWh;
    default:
      return pricekWh;
  }
}

export function NorwayPriceToPricekWhFunction2(norwayPrice, place) {
  switch (place.toLowerCase()) {
    case "nord":
      return norwayPrice/1.1;
    case "sør":
      return norwayPrice/5;
    case "vest":
      return norwayPrice/4.5;
    case "øst":
      return norwayPrice/3.5;
    default:
      return norwayPrice;
  }
}
