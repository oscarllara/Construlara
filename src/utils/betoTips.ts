export const BETO_TIPS = [
  "Para evitar trincas no reboco, molhe bem a parede antes de aplicar a massa em dias muito quentes.",
  "O porcelanato polido é lindo, mas cuidado: ele escorrega muito quando molhado. Prefira o acetinado para áreas externas.",
  "Vai pintar? Use fita crepe nas bordas e retire-a antes da tinta secar totalmente para um acabamento perfeito.",
  "Cimento guardado diretamente no chão estraga rápido. Use sempre um estrado de madeira para evitar a umidade.",
  "Na hidráulica, nunca use fogo para curvar tubos de PVC. Isso fragiliza o material e causa vazamentos futuros.",
  "Para calcular a quantidade de tijolos, calcule a área da parede e multiplique por 25 (para tijolo de 6 furos padrão).",
  "Argamassa AC-III é a única recomendada para colar piso sobre piso ou em áreas de alta temperatura como churrasqueiras.",
  "Sempre compre 10% a mais de piso para garantir o estoque de recortes e futuras manutenções.",
  "Lâmpadas de LED 6500K (brancas) são melhores para cozinhas, enquanto as 3000K (amarelas) trazem conforto para quartos.",
  "Antes de concretar, verifique se todas as tubulações elétricas e hidráulicas estão fixas e no lugar certo.",
  "O rejunte epóxi é o mais resistente a manchas e fungos, ideal para dentro do box do banheiro.",
  "Para limpar ferramentas após o uso com cimento, use uma mistura de água e vinagre para remover crostas difíceis.",
  "Mantenha os equipamentos de locação sempre limpos. Isso evita multas de limpeza e garante a durabilidade da máquina.",
  "Ao usar o martelete, não force a máquina contra a parede. Deixe o peso do equipamento e a vibração fazerem o trabalho.",
  "Verifique o óleo das betoneiras a cada 40 horas de uso para evitar o travamento do motor."
];

export const getRandomTip = () => {
  return BETO_TIPS[Math.floor(Math.random() * BETO_TIPS.length)];
};