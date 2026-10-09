export function relativeWindLabel(angle) {
  const labels = [
    "para frente",
    "à frente e à direita",
    "para a direita",
    "atrás e à direita",
    "para trás",
    "atrás e à esquerda",
    "para a esquerda",
    "à frente e à esquerda",
  ];
  return labels[Math.round(angle / 45) % 8];
}
export function soaringAdvice(air, flight, weather) {
  if (flight.state === "grounded")
    return {
      kind: "rest",
      title: "Pronto para relançar",
      hint: "Segure o sopro e solte. Procure uma corrente para subir.",
    };
  if (flight.state === "crumpled")
    return {
      kind: "rest",
      title: "Redobrando o papel…",
      hint: "Seu próximo voo começa no ponto seguro.",
    };
  if (air.y < -0.7)
    return {
      kind: "sink",
      title: `↓ Ar descendo · ${air.y.toFixed(1)} m/s`,
      hint:
        air.source === "ridge"
          ? "Saia deste lado da encosta. Busque o lado que recebe o vento."
          : "Afaste-se da descendente e procure nuvens ou aves circulando.",
    };
  if (air.y > 0.7) {
    const hints = {
      thermal: "Faça círculos para permanecer no centro da térmica.",
      ridge: "Continue junto à encosta que recebe o vento.",
      mist: "A névoa ajuda um pouco. Evite a cortina de água.",
      wave: "Aproveite esta faixa de ar que sobe.",
      geyser: "Aproveite o jato enquanto ele estiver ativo.",
      balloon: "Fique perto desta coluna de ar quente.",
      gust: "Acompanhe esta corrente de vento.",
    };
    return {
      kind: flight.vy > 0.2 ? "lift" : "potential",
      title: `↑ Ar subindo · +${air.y.toFixed(1)} m/s`,
      hint:
        flight.speed < 6
          ? "Pouca velocidade: abaixe suavemente o nariz."
          : flight.vy < -0.2 && flight.pitch < -0.25
            ? "Nivele o nariz: você está mergulhando apesar da corrente."
            : flight.vy < -0.2 && air.source === "thermal"
              ? "O ar sobe, mas você afunda. Aproxime-se do centro."
              : hints[air.source] ||
                "Procure o centro da corrente para ganhar altura.",
    };
  }
  return {
    kind: "neutral",
    title: "→ Ar quase estável",
    hint:
      weather.sun < 0.15
        ? "Poucas térmicas agora. Busque vento subindo pelas encostas."
        : "Procure nuvens e aves. Siga as setas verdes de subida.",
  };
}
