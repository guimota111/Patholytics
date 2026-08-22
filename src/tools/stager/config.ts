/**
 * O Estadiador de origem calcula o grupo prognostico mas nunca o exibe. O port
 * preserva esse comportamento: a tabela roda, o resultado fica disponivel em
 * `CalculatorResult.stageGroup`, e esta flag decide se ele chega a tela.
 *
 * Ligar aqui passa a mostrar "Grupo prognostico" no painel de resultado de
 * todas as calculadoras que definem um.
 */
export const SHOW_STAGE_GROUP = false
