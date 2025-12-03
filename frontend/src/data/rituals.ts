/**
 * Lista completa de rituais do sistema Ordem Paranormal RPG
 * Baseado nas regras oficiais
 */

export interface Ritual {
  id: string
  name: string
  circle: number // Círculo do ritual (1-5)
  element: 'SANGUE' | 'MORTE' | 'ENERGIA' | 'CONHECIMENTO' | 'MEDO' | 'VARIÁVEL'
  cost: {
    pe: number
    san?: number
  }
  execution: 'livre' | 'reação' | 'movimento' | 'padrão' | 'completa'
  range: string
  target: string
  duration: string
  resistance?: string
  description: string
  discente?: {
    pe: number
    description: string
    requiresCircle?: number
  }
  verdadeiro?: {
    pe: number
    description: string
    requiresCircle?: number
    requiresAffinity?: boolean
  }
  requiresIngredients: boolean
  ingredients?: string[]
  isHomebrew?: boolean // Indica se é um ritual homebrew (criado pela comunidade)
}

/**
 * Rituais do 1º Círculo
 */
export const RITUALS_CIRCLE_1: Ritual[] = [
  // CONHECIMENTO
  {
    id: 'amaldicar-arma',
    name: 'Amaldiçoar Arma',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'cena',
    resistance: 'Vontade parcial',
    description:
      'Uma aura espiralada surge sobre o alvo. No início de cada turno dele, ele deve fazer um teste de Vontade. Se falhar, não poderá se deslocar naquele turno (ele ainda pode agir, só não pode se deslocar). Se o alvo passar nesse teste dois turnos seguidos o efeito termina.',
    verdadeiro: {
      pe: 4,
      description: 'muda o alvo para "seres a sua escolha".',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Símbolo de Conhecimento', 'Objeto pessoal do alvo'],
  },
  {
    id: 'compreensao-paranormal',
    name: 'Compreensão Paranormal',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser ou objeto',
    duration: 'cena',
    resistance: 'Vontade anula',
    description:
      'O ritual confere a você compreensão sobrenatural da linguagem. Se tocar um objeto contendo informação (ou livro, um dispositivo com uma gravação…), você entende as palavras mesmo que não conheça seu idioma, contanto que se trate de um idioma humano (não funciona com símbolos ou sigilos paranormais). Se tocar uma pessoa, pode se comunicar com ela como se falassem um idioma em comum. Se tocar um ser não inteligente, como um animal, pode perceber seus sentimentos básicos, como medo ou felicidade. Um alvo involuntário tem direito a um teste de Vontade.',
    discente: {
      pe: 2,
      description:
        'muda o alcance para "curto" e o alvo para "alvos escolhidos". Você pode entender todos os alvos afetados.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o alcance para "pessoal" e o alvo para "você". Em vez do normal, você pode falar, entender e escrever qualquer idioma humano.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal transparente', 'Água pura'],
  },
  {
    id: 'enfeiticar',
    name: 'Enfeitiçar',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 pessoa',
    duration: 'cena',
    resistance: 'Vontade anula',
    description:
      'Este ritual torna o alvo prestativo (veja a página 45). Ele não fica sob seu controle, mas percebe suas palavras e ações da maneira mais favorável possível. Você recebe um bônus de +10 em testes de Diplomacia com ele. Um alvo hostil ou que esteja envolvido em combate recebe +5 em seu teste de resistência. Se você ou seus aliados tomarem qualquer ação hostil contra o alvo, o efeito é dissipado e o alvo retorna à atitude que tinha antes (ou piorada, de acordo com o mestre).',
    discente: {
      pe: 2,
      description:
        'em vez do normal, você sugere uma ação para o alvo e ele obedece. A sugestão deve ser feita de modo que pareça aceitável, a critério do mestre. Pedir que o alvo atire em seu companheiro, por exemplo, dissipa o efeito. Já sugerir a um guarda que descanse um pouco, de modo que você e seus aliados passem por ele, é aceitável. Quando o alvo executa a ação, o efeito termina. Você pode determinar uma condição específica para a sugestão: por exemplo, que o policial prenda a próxima pessoa de casaco verde que ele encontrar.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'afeta todos os alvos dentro do alcance.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Fio de prata', 'Objeto do alvo'],
  },
  {
    id: 'perturbacao',
    name: 'Perturbação',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 pessoa',
    duration: '1 rodada',
    resistance: 'Vontade anula',
    description:
      'Você dá uma ordem que o alvo deve ser capaz de ouvir (mas não precisa entender). Se falhar na resistência, ele deve obedecer à ordem em seu próprio turno da melhor maneira possível. Escolha um dos efeitos: Fuja, Largue, Pare, Sente-se, Venha.',
    discente: {
      pe: 2,
      description:
        'muda o alvo para "1 ser" e adiciona o seguinte comando: "Sofra. O alvo é acometido de dor aguda. Ele sofre 3d8 pontos de dano de Conhecimento e fica abalado por uma rodada".',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o alvo para "até 5 seres" ou adiciona o seguinte comando: "Ataque. O alvo deve fazer a ação agredir contra um outro alvo a sua escolha em alcance médio, com todas as suas capacidades".',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Vela preta', 'Corda'],
  },
  {
    id: 'ouvir-sussurros',
    name: 'Ouvir os Sussurros',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'médio',
    target: '1 ser',
    duration: 'sustentada',
    resistance: 'Vontade anula',
    description:
      'Através de uma superfície reflexiva, como um espelho, uma bacia de água ou mesmo uma TV desligada, você pode ver e ouvir um ser escolhido e seus arredores (cerca de 6m em qualquer direção). O alvo pode estar a qualquer distância, mas tem direito a um teste de resistência no início de cada um de seus turnos para impedir a observação.',
    requiresIngredients: true,
    ingredients: ['Superfície reflexiva', 'Vela'],
  },
  {
    id: 'tecer-ilusao',
    name: 'Tecer Ilusão',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'médio',
    target: 'ilusão que se estende a até 4 cubos de 1,5m',
    duration: 'cena',
    resistance: 'Vontade desacredita',
    description:
      'Este ritual cria uma ilusão visual (uma pessoa, uma parede…) ou sonora (um grito de socorro, um uivo assustador…). O ritual cria apenas imagens ou sons simples, com volume equivalente à voz de uma pessoa para cada cubo de 1,5m no efeito. Não é possível criar cheiros, texturas ou temperaturas, nem sons complexos, como uma música ou diálogo. Seres e objetos atravessam uma ilusão sem sofrer dano, mas o ritual pode, por exemplo, esconder uma armadilha ou emboscada. A ilusão é dissipada se você sair do alcance.',
    discente: {
      pe: 2,
      description:
        'muda o efeito para até 8 cubos de 1,5m e a duração para sustentada. Você pode criar ilusões de imagem e som combinados, e pode criar sons complexos, odores e sensações térmicas. Também pode criar sensações táteis, como texturas; objetos ainda atravessam a ilusão, mas seres não conseguem atravessá-la sem passar em um teste de Vontade. A cada rodada, você pode usar uma ação livre para mover a imagem ou alterar o som, como aumentar o volume ou fazer com que pareça se afastar ou se aproximar, ainda dentro dos limites do efeito.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'você cria a ilusão de um perigo mortal. Quando o ritual é conjurado, e no início de cada um de seus turnos, um alvo interagindo com a ilusão deve fazer um teste de Vontade; se falhar, acredita que a ilusão é real e sofre 6d6 pontos de dano de Conhecimento. O alvo racionaliza o efeito sempre que falha no teste (por exemplo, acredita que o mesmo teto pode cair sobre ele várias vezes). Se um alvo passar em dois testes de Vontade seguidos, o efeito é anulado para ele.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Espelho quebrado', 'Fumaça'],
  },

  // ENERGIA
  {
    id: 'fortalecimento-sensorial',
    name: 'Fortalecimento Sensorial',
    circle: 1,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Você potencializa seus sentidos, recebendo +1 em Investigação, Luta, Percepção e Pontaria.',
    discente: {
      pe: 2,
      description:
        'além do normal, seus inimigos sofrem -1 em testes de ataque contra você.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'além do normal, você apura seus sentidos para perceber perigo. Você fica imune às condições surpreendido e desprevenido e recebe +10 em Defesa e Reflexos.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Ervas'],
  },
  {
    id: 'odio-incontrolavel',
    name: 'Ódio Incontrolável',
    circle: 1,
    element: 'SANGUE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 pessoa',
    duration: 'cena',
    description:
      'O alvo entra em um frenesi, aumentando sua agressividade e capacidade de luta. Ele recebe +2 em testes de ataque e rolagens de dano corpo a corpo e resistência a balístico, corte, impacto e perfuração 5. Enquanto o efeito durar, o alvo não pode fazer nenhuma ação que exige calma e concentração (como usar a perícia Furtividade ou conjurar rituais), e deve sempre atacar um alvo em sua rodada, mesmo que seja um aliado se ele for o único a seu alcance.',
    discente: {
      pe: 2,
      description:
        'além do normal, sempre que o alvo usar a ação agredir, pode fazer um ataque corpo a corpo adicional contra o mesmo alvo.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o bônus de ataque e dano para +5 e o alvo passa a sofrer apenas metade do dano dos tipos balístico, corte, impacto e perfuração.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Sangue de animal', 'Corda'],
  },

  // MEDO
  {
    id: 'cineraria',
    name: 'Cinerária',
    circle: 1,
    element: 'MEDO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: 'veja texto',
    duration: 'cena',
    description:
      'Você manipula o calor e o fogo. Ao conjurar o ritual, escolha um dos seguintes efeitos: Chamejar (arma causa +1d6 de dano de fogo), Esquentar (objeto esquenta e causa 1d6 de dano por rodada), Extinguir (apaga chama e cria fumaça), Modelar (move chama 9m por rodada, causa 3d6 de dano de fogo).',
    discente: {
      pe: 3,
      description:
        'muda a duração para sustentada e adiciona "Resistência: Reflexos reduz à metade". Em vez do normal, uma vez por rodada você pode gastar uma ação de movimento para projetar uma labareda, num alvo em alcance curto. O alvo sofre 4d6 pontos de dano de Energia (Reflexos reduz à metade).',
      requiresCircle: 2,
    },
    requiresIngredients: true,
    ingredients: ['Vela', 'Carvão'],
  },
  {
    id: 'terceiro-olho',
    name: 'Terceiro Olho',
    circle: 1,
    element: 'CONHECIMENTO',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Seus olhos se enchem de sigilos e você passa a enxergar auras paranormais em alcance longo. Rituais, itens amaldiçoados e criaturas emitem auras. Você sabe o elemento da aura e seu poder aproximado. Além disso, você pode gastar uma ação de movimento para descobrir se um ser que possa ver em alcance médio tem poderes paranormais ou se é capaz de conjurar rituais e de quais elementos.',
    discente: {
      pe: 2,
      description: 'muda a duração para 1 dia.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'também pode enxergar objetos e seres invisíveis, que aparecem como formas translúcidas.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Tinta preta'],
  },

  // VARIÁVEL
  {
    id: 'distorcer-aparencia',
    name: 'Distorcer Aparência',
    circle: 1,
    element: 'SANGUE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    resistance: 'Vontade desacredita',
    description:
      'Você modifica sua aparência de modo a parecer outra pessoa. Isso inclui altura, peso, tom de pele, cor de cabelo, timbre de voz, impressão digital, córnea etc. Você recebe +10 em testes de Enganação para disfarce, mas não recebe habilidades da nova forma nem modifica suas demais estatísticas.',
    discente: {
      pe: 2,
      description:
        'muda o alcance para "curto" e o alvo para "1 ser". Um alvo involuntário pode anular o efeito com um teste de Vontade.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'como em Discente, mas muda o alvo para "seres escolhidos".',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Espelho', 'Tecido'],
  },
]

/**
 * Rituais do 2º Círculo
 */
export const RITUALS_CIRCLE_2: Ritual[] = [
  // CONHECIMENTO
  {
    id: 'aprimorar-mente',
    name: 'Aprimorar Mente',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'cena',
    description:
      'O alvo tem sua mente energizada por fagulhas do Conhecimento. Ele recebe +1 em Intelecto ou Presença, à escolha dele (PE, perícias treinadas ou graus de treinamento).',
    discente: {
      pe: 5,
      description:
        'muda o efeito para "fornece +10 na Defesa e resistência a balístico, corte, impacto e perfuração 5".',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 9,
      description:
        'muda o efeito para "fornece +15 na Defesa e resistência a balístico, corte, impacto e perfuração 10".',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal de conhecimento', 'Livro antigo'],
  },
  {
    id: 'amaldicar-tecnologia',
    name: 'Amaldiçoar Tecnologia',
    circle: 2,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 acessório ou arma de fogo',
    duration: 'cena',
    description:
      'Você imbui o alvo com Energia, fazendo-o funcionar acima de sua capacidade. O item recebe uma modificação a sua escolha.',
    discente: {
      pe: 2,
      description: 'muda para duas modificações.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'muda para três modificações.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Componente eletrônico', 'Fio de cobre'],
  },
  {
    id: 'deteccao-ameacas',
    name: 'Detecção de Ameaças',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'área: esfera de 18m de raio',
    duration: 'cena',
    description:
      'Você recebe uma percepção aguçada sobre perigos à sua volta. Quando um ser hostil ou armadilha entra na área do efeito, você tem uma sensação de perigo e pode gastar uma ação de movimento para fazer um teste de Percepção (DT 20). Se passar, sabe a direção e distância do perigo.',
    discente: {
      pe: 3,
      description:
        'além do normal, você não fica desprevenido contra perigos detectados e recebe +5 em testes de resistência contra armadilhas.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Pena de corvo'],
  },
  {
    id: 'eletrocussao',
    name: 'Eletrocussão',
    circle: 1,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser ou objeto',
    duration: 'instantânea',
    resistance: 'Fortitude parcial',
    description:
      'Você manifesta e dispara uma corrente elétrica contra o alvo, que sofre 3d6 pontos de dano de eletricidade e fica vulnerável por uma rodada. Se passar no teste de resistência, sofre apenas metade do dano e evita a condição. Se usado contra objetos eletrônicos, este ritual causa o dobro de dano e ignora resistência.',
    discente: {
      pe: 2,
      description:
        'muda o alvo para "área: linha de 30m". Você dispara um poderoso raio que causa 6d6 pontos de dano de Energia em todos os seres e objetos livres na área.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o alvo para "alvos escolhidos". Em vez do normal, você dispara vários relâmpagos, um para cada alvo escolhido, causando 8d6 pontos de dano de Energia em cada.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Fio de cobre', 'Bateria'],
  },
  {
    id: 'esconder-olhos',
    name: 'Esconder dos Olhos',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'curto',
    target: 'área: nuvem de 6m de raio',
    duration: 'cena',
    description:
      'Uma nuvem de fuligem espessa eleva-se de um ponto a sua escolha, obscurecendo toda a visão — seres a até 1,5m têm camuflagem leve e seres a partir de 3m têm camuflagem total. Um vento forte dispersa a nuvem em 4 rodadas e um vendaval a dispersa em 1 rodada. A nuvem não funciona sob a água.',
    discente: {
      pe: 2,
      description:
        'você pode escolher seres no alcance ao conjurar o ritual; eles enxergam através do efeito.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'além do normal, a nuvem fica espessa, quase sólida. Qualquer ser dentro dela tem seu deslocamento reduzido para 3m (independente de seu deslocamento normal) e sofre –2 em testes de ataque.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Carvão', 'Óleo'],
  },
  {
    id: 'coincidencia-forcada',
    name: 'Coincidência Forçada',
    circle: 1,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'cena',
    description:
      'Você manipula os caminhos do caos para que o alvo tenha mais sorte. O alvo recebe +2 em testes de perícias.',
    discente: {
      pe: 2,
      description: 'muda o alvo para aliados à sua escolha.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o alvo para aliados à sua escolha e o bônus para +5.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Moeda', 'Fio vermelho'],
  },

  // ENERGIA
  {
    id: 'embaralhar',
    name: 'Embaralhar',
    circle: 1,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Você cria três cópias ilusórias suas, como hologramas extremamente realistas. As cópias ficam ao seu redor e imitam suas ações, tornando difícil para um inimigo saber quem é o verdadeiro. Você recebe +6 na Defesa. Cada vez que um ataque contra você erra, uma das imagens desaparece e o bônus na Defesa diminui em 2. Um oponente deve ver as cópias para ser confundido.',
    discente: {
      pe: 2,
      description: 'muda o número de cópias para 5 (e o bônus na Defesa para +10).',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o número de cópias para 8 (e o bônus na Defesa para +16). Além do normal, toda vez que uma cópia é destruída, emite um clarão de luz. O ser que destruiu a cópia fica ofuscado por uma rodada.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Espelho', 'Cristal'],
  },
  {
    id: 'luz',
    name: 'Luz',
    circle: 1,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 objeto',
    duration: 'cena',
    resistance: 'Vontade anula',
    description: 'O alvo emite luz.',
    requiresIngredients: true,
    ingredients: ['Vela', 'Cristal'],
  },
  {
    id: 'polarizacao-caotica',
    name: 'Polarização Caótica',
    circle: 1,
    element: 'ENERGIA',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: 'você',
    duration: 'sustentada',
    resistance: 'Vontade anula',
    description:
      'Você gera uma aura magnética sobrenatural. Escolha um dos efeitos a seguir: Atrair (puxa objetos metálicos) ou Repelir (repele objetos, recebendo resistência a balístico, corte, impacto e perfuração 5).',
    requiresIngredients: true,
    ingredients: ['Ímã', 'Fio metálico'],
  },
  {
    id: 'chamas-caos',
    name: 'Chamas do Caos',
    circle: 2,
    element: 'ENERGIA',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'curto',
    target: 'veja texto',
    duration: 'cena',
    description: 'Manipula fogo e calor de forma caótica.',
    verdadeiro: {
      pe: 9,
      description:
        'muda o alcance para "curto", o alvo para "seres escolhidos" e aumenta a cura para 7d8+7 PV.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Carvão', 'Óleo'],
  },
  {
    id: 'contencao-fantasmagorica',
    name: 'Contenção Fantasmagórica',
    circle: 2,
    element: 'ENERGIA',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'médio',
    target: '1 ser',
    duration: 'cena',
    resistance: 'Reflexos anula',
    description:
      'Três laços de Energia surgem do chão e se enroscam no alvo, deixando-o agarrado. O alvo pode tentar se livrar, gastando uma ação padrão para fazer um teste de Atletismo (DT do ritual). Se passar, destrói um laço, mais um laço adicional para cada 5 pontos pelos quais superou a DT. Os laços também podem ser atacados e destruídos: cada um tem Defesa 10, 10 PV, RD 5 e imunidade a Energia.',
    discente: {
      pe: 3,
      description:
        'aumenta o número de laços para 6, e você pode escolher o alvo de cada laço, com um mínimo de dois laços por alvo.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 5,
      description:
        'como discente, e cada laço destruído libera uma onda de choque que causa 2d6+2 pontos de dano de Energia no alvo agarrado.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Corda', 'Cristal'],
  },
  {
    id: 'dissonancia-acustica',
    name: 'Dissonância Acústica',
    circle: 2,
    element: 'ENERGIA',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'médio',
    target: 'área: esfera com 6m de raio',
    duration: 'sustentada',
    description:
      'Você manipula a vibração do ar, criando uma área de dissonância sonora. Enquanto estiverem na área, todos os seres ficam surdos. Essa dissonância impede que seres dentro da área conjurem rituais.',
    discente: {
      pe: 1,
      description:
        'muda a área para "alvo: 1 objeto". Em vez do normal, o alvo emana uma área de silêncio com 3m de raio.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 3,
      description:
        'muda a duração para cena. Em vez do normal, nenhum som pode deixar a área, mas seres dentro da área podem falar, ouvir e conjurar rituais normalmente.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Sino', 'Corda'],
  },
  {
    id: 'sopro-caos',
    name: 'Sopro do Caos',
    circle: 2,
    element: 'ENERGIA',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'médio',
    target: 'varia',
    duration: 'sustentada',
    description:
      'Você altera os movimentos de massas de ar de forma caótica. Ao conjurar o ritual, escolha um dos efeitos abaixo: Ascender (levita alvo), Sopro (empurra alvos), Vento (cria área de vento forte).',
    discente: {
      pe: 3,
      description: 'passa a afetar alvos Grandes.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 9,
      description: 'passa a afetar alvos Enormes.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Pena', 'Cristal'],
  },
  {
    id: 'tela-ruido',
    name: 'Tela de Ruído',
    circle: 2,
    element: 'ENERGIA',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Este ritual cria uma película de Energia que recobre seu corpo e absorve energia cinética. Você recebe 30 PV temporários, mas apenas contra dano balístico, de corte, de impacto ou de perfuração. Alternativamente, você pode conjurar este ritual como uma reação quando sofrer dano, recebendo resistência 15 apenas contra esse dano.',
    discente: {
      pe: 3,
      description: 'aumenta os PV temporário para 60 e a resistência para 30.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 7,
      description:
        'muda o alcance para curto e o alvo para 1 ser ou objeto Enorme ou menor. Em vez do normal, cria uma esfera imóvel e tremeluzente.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Tecido'],
  },

  // MORTE
  {
    id: 'cicatrizacao',
    name: 'Cicatrização',
    circle: 1,
    element: 'MORTE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'instantânea',
    description:
      'Você acelera o tempo ao redor das feridas do alvo, que cicatrizam instantaneamente. O alvo recupera 3d8+3 PV, mas envelhece 1 ano automaticamente.',
    discente: {
      pe: 2,
      description: 'aumenta a cura para 5d8+5 PV.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 9,
      description:
        'muda o alcance para "curto", o alvo para "seres escolhidos" e aumenta a cura para 7d8+7 PV.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Bandagens', 'Água benta'],
  },
  {
    id: 'consumir-manancial',
    name: 'Consumir Manancial',
    circle: 2,
    element: 'MORTE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'instantânea',
    description:
      'Você suga uma pequena porção do tempo de vida de plantas, insetos e até mesmo do solo ao redor, gerando Lodo e recebendo 3d6 pontos de vida temporários. Os PV temporários desaparecem ao final da cena.',
    discente: {
      pe: 2,
      description: 'muda os PV temporários recebidos para 6d6.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o alvo para "área: esfera com 6m de raio centrada em você" e a resistência para "Fortitude reduz à metade". Em vez do normal, você suga energia de todos os seres vivos na área, causando 3d6 pontos de dano de Morte em cada um e recebendo PV temporários iguais ao dano total causado até o final da cena.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Terra de cemitério', 'Osso'],
  },
  {
    id: 'decadencia',
    name: 'Decadência',
    circle: 1,
    element: 'MORTE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'instantânea',
    resistance: 'Fortitude reduz à metade',
    description: 'Causa dano de Morte ao alvo.',
    verdadeiro: {
      pe: 5,
      description: 'afeta apenas alvos a sua escolha.',
      requiresCircle: 2,
    },
    requiresIngredients: true,
    ingredients: ['Osso de animal morto', 'Terra de cemitério'],
  },
  {
    id: 'definhar',
    name: 'Definhar',
    circle: 1,
    element: 'MORTE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'cena',
    resistance: 'Fortitude parcial',
    description:
      'Você dispara uma lufada de cinzas que drena as forças do alvo. O alvo fica fatigado. Se passar no teste de resistência, em vez disso fica vulnerável.',
    discente: {
      pe: 2,
      description:
        'em vez do normal, o alvo fica exausto. Se passar na resistência, fica fatigado.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'como discente, mas muda o alvo para "até 5 seres".',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cinzas', 'Terra'],
  },
  {
    id: 'desacelerar-impacto',
    name: 'Desacelerar Impacto',
    circle: 2,
    element: 'MORTE',
    cost: { pe: 2 },
    execution: 'reação',
    range: 'curto',
    target: '1 ser ou objetos somando até 10 espaços',
    duration: 'até chegar ao solo ou cena, o que vier primeiro',
    description:
      'O alvo cai lentamente. A velocidade da queda é reduzida para 18m por rodada — o suficiente para não causar dano. Como conjurar este ritual é uma reação, você pode conjurá-lo rápido o bastante para salvar a si ou um aliado de quedas inesperadas.',
    verdadeiro: {
      pe: 3,
      description: 'aumenta o total de alvos para seres ou objetos somando até 100 espaços.',
      requiresCircle: 2,
    },
    requiresIngredients: true,
    ingredients: ['Pena', 'Tecido leve'],
  },
  {
    id: 'espirais-perdicao',
    name: 'Espirais da Perdição',
    circle: 1,
    element: 'MORTE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'cena',
    description:
      'Espirais surgem no corpo do alvo, tornando seus movimentos lentos. O alvo sofre -1 em testes de ataque.',
    discente: {
      pe: 2,
      description: 'muda a penalidade para -2.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 8,
      description: 'muda a penalidade para -2 e o alvo para "seres escolhidos".',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cinzas', 'Corda preta'],
  },
  {
    id: 'nuvem-cinzas',
    name: 'Nuvem de Cinzas',
    circle: 1,
    element: 'MORTE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'médio',
    target: 'área: nuvem com 6m de raio',
    duration: 'sustentada',
    description:
      'Cria uma nuvem de cinzas que obscurece a visão e causa dano de Morte aos seres na área.',
    requiresIngredients: true,
    ingredients: ['Cinzas', 'Terra'],
  },
  {
    id: 'definhar-2',
    name: 'Definhar',
    circle: 2,
    element: 'MORTE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'cena',
    resistance: 'Fortitude parcial',
    description:
      'Espirais de trevas envolvem sua mão e definham o alvo, que sofre 2d8+2 pontos de dano de Morte.',
    discente: {
      pe: 2,
      description:
        'muda a resistência para "nenhuma" e o dano para 3d8+3. Como parte da execução do ritual, você transfere as espirais para uma arma e faz um ataque corpo a corpo contra o alvo com esta arma.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description:
        'muda o alcance para "pessoal" o alvo para "área: explosão com 6m de raio" e o dano para 8d8+8.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cinzas', 'Terra de cemitério'],
  },
  {
    id: 'eco-espiral',
    name: 'Eco Espiral',
    circle: 2,
    element: 'MORTE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: '2 rodadas',
    resistance: 'Fortitude reduz à metade',
    description:
      'Você manifesta em suas mãos uma pequena cópia do alvo feita de cinzas. No início do próximo turno após conjurar este ritual, você precisa gastar uma ação padrão para se concentrar nele; caso contrário, ele se dissipa sem efeito. No início do segundo turno, você precisa gastar uma ação padrão para descarregá-lo. Se fizer isso, a cópia explode e o alvo sofre dano de Morte igual a quantidade de dano que sofreu na rodada em que você se concentrou.',
    discente: {
      pe: 3,
      description: 'muda o alvo para "até 5 seres".',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 7,
      description:
        'muda a duração para "até 3 rodadas", permitindo que você se concentre nas duas primeiras e descarregue na terceira.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cinzas', 'Terra'],
  },
  {
    id: 'paradoxo',
    name: 'Paradoxo',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'veja texto',
    description:
      'Este ritual distorce o fluxo de tempo em relação a você, criando um pequeno bolsão temporal que dura 3 rodadas. Durante este tempo, você pode agir, mas não pode se deslocar do lugar nem interagir com seres e objetos.',
    requiresIngredients: true,
    ingredients: ['Relógio quebrado', 'Areia'],
  },
  {
    id: 'miasma-entropico',
    name: 'Miasma Entrópico',
    circle: 2,
    element: 'MORTE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'médio',
    target: 'área: nuvem com 6m de raio',
    duration: 'instantânea',
    resistance: 'Fortitude parcial',
    description:
      'Cria uma explosão de emanações tóxicas. Seres na área sofrem 4d8 pontos de dano químico e ficam enjoados por 1 rodada. Se passarem na resistência, sofrem metade do dano e não ficam enjoados.',
    discente: {
      pe: 3,
      description: 'muda o dano para 6d8 de Morte.',
      requiresCircle: 2,
    },
    requiresIngredients: true,
    ingredients: ['Veneno', 'Terra'],
  },
  {
    id: 'corpo-adaptado',
    name: 'Corpo Adaptado',
    circle: 1,
    element: 'SANGUE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 pessoa ou animal',
    duration: 'cena',
    description:
      'Este ritual modifica a biologia do alvo para permitir a sobrevivência em ambientes hostis. O alvo fica imune a calor e frio extremos, pode respirar na água se respirar ar (ou vice-versa) e não sufoca em fumaça densa.',
    discente: {
      pe: 2,
      description: 'muda a duração para 1 dia.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'muda o alcance para "curto" e o alvo para "pessoas ou animais escolhidos".',
      requiresCircle: 2,
    },
    requiresIngredients: true,
    ingredients: ['Ervas', 'Água'],
  },
  {
    id: 'velocidade-mortal',
    name: 'Velocidade Mortal',
    circle: 2,
    element: 'MORTE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'sustentada',
    description:
      'Você distorce a passagem do tempo ao redor do alvo, tornando-o extremamente veloz. O alvo pode realizar uma ação de movimento adicional por turno. Esta ação não pode ser usada para conjurar rituais.',
    discente: {
      pe: 3,
      description:
        'em vez de uma ação de movimento, o alvo recebe uma ação padrão adicional por turno.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 7,
      description: 'muda o alvo para "alvos escolhidos".',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Relógio', 'Areia'],
  },

  // SANGUE
  {
    id: 'arma-atroz',
    name: 'Arma Atroz',
    circle: 2,
    element: 'SANGUE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'toque',
    target: '1 pessoa',
    duration: 'permanente até ser descarregada',
    description:
      'Você transfere parte de seu poder para outra pessoa. Escolha um ritual de até 3º círculo que você conheça; o alvo pode conjurar este ritual em sua forma básica uma vez, sem pagar seu custo em PE (mas pode usar formas avançadas gastando seus próprios PE para isso). Até o ritual transferido ser conjurado, seus PE máximos diminuem em um valor igual ao custo dele.',
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Corda vermelha'],
  },
  {
    id: 'invadir-mente',
    name: 'Invadir Mente',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'médio ou toque',
    target: '1 ser ou 2 pessoas voluntárias',
    duration: 'instantânea ou 1 dia',
    resistance: 'Vontade parcial ou nenhuma',
    description:
      'Quando conjura este ritual, você gera um dos efeitos a seguir, a sua escolha: rajada mental (6d6 de dano de Conhecimento) ou ligação telepática (comunicação mental por 1 dia).',
    discente: {
      pe: 3,
      description:
        'se escolher rajada mental, aumenta o dano para 10d6. Se escolher ligação telepática, em vez do normal, você cria um elo mental que permite que você gaste uma ação de movimento para ver e ouvir pelos sentidos do alvo.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description:
        'se escolher rajada mental, aumenta o dano para 10d6 e muda o alvo para "seres escolhidos". Se escolher ligação telepática, você pode criar um vínculo mental entre até 5 pessoas.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Fio de prata'],
  },
  {
    id: 'localizacao',
    name: 'Localização',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'área: círculo com 90m de raio',
    duration: 'cena',
    description:
      'Este ritual pode encontrar uma pessoa ou objeto a sua escolha. Você pode pensar em termos gerais ("um policial", "algo de metal") ou específicos ("A delegada Joana", "uma pistola"). O ritual indica a direção e distância da pessoa ou objeto mais próximo desse tipo, caso esteja ao alcance.',
    discente: {
      pe: 3,
      description:
        'muda o alcance para "toque", o alvo para "1 pessoa" e a duração para "1 hora". Em vez do normal, a pessoa tocada descobre o caminho mais direto para entrar ou sair de um lugar.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 7,
      description: 'aumenta a área para círculo de 1km de raio.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Bússola', 'Mapa'],
  },
  {
    id: 'armadura-sangue',
    name: 'Armadura de Sangue',
    circle: 1,
    element: 'SANGUE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Seu sangue escorre para fora do corpo, cobrindo-o sob a forma de uma carapaça que fornece +5 em Defesa. Esse bônus é cumulativo com outros rituais, mas não com bônus fornecido por equipamento.',
    discente: {
      pe: 3,
      description: 'muda o bônus para +10.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description: 'muda o bônus para +15.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Tecido vermelho'],
  },
  {
    id: 'aprimorar-fisico',
    name: 'Aprimorar Físico',
    circle: 1,
    element: 'SANGUE',
    cost: { pe: 1 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'cena',
    description:
      'O alvo tem seus músculos tonificados e seus ligamentos reforçados, recebendo +1 em Agilidade ou Força, à escolha dele.',
    discente: {
      pe: 3,
      description: 'muda o bônus para +2.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description: 'muda o bônus para +3.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Sangue de animal', 'Ervas'],
  },
  {
    id: 'descarnar',
    name: 'Descarnar',
    circle: 2,
    element: 'SANGUE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'instantânea',
    resistance: 'Fortitude parcial',
    description:
      'Este ritual cruel faz com que lacerações se manifestem na pele e órgãos do alvo, que sofre 6d8 pontos de dano (metade corte, metade Sangue) e fica com uma hemorragia severa. No início de cada turno dele, o alvo deve fazer um teste de Fortitude. Se falhar, sofre 2d8 pontos de dano de Sangue.',
    discente: {
      pe: 3,
      description: 'muda o dano direto para 10d8 e o dano da hemorragia para 4d8.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description:
        'muda o alvo para você e a duração para sustentada. Enquanto o ritual durar, seus ataques corpo a corpo causam 4d8 pontos de dano de Sangue adicional e deixam o alvo com hemorragia automaticamente.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Lâmina', 'Sangue'],
  },
  {
    id: 'flagelo-sangue',
    name: 'Flagelo de Sangue',
    circle: 2,
    element: 'SANGUE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Você recebe +5 em testes de ataque e rolagens de dano corpo a corpo e 30 PV temporários. Enquanto estiver transformado, sua mente é tomada por fúria selvagem; você não pode falar nem conjurar rituais e a cada rodada deve atacar o ser mais próximo possível.',
    discente: {
      pe: 3,
      description:
        'além do normal, você recebe imunidade a atordoamento, fadiga, sangramento, sono e veneno.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 9,
      description:
        'muda os bônus em testes de ataque e rolagens de dano para +10 e os PV temporários para 50.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Sangue', 'Corda'],
  },
  {
    id: 'hemofagia',
    name: 'Hemofagia',
    circle: 2,
    element: 'SANGUE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'instantânea',
    resistance: 'Fortitude reduz à metade',
    description:
      'Você arranca o sangue do corpo do alvo através da pele dele, causando 6d6 pontos de dano de Sangue. Você então absorve esse sangue, recuperando pontos de vida iguais à metade do dano causado.',
    discente: {
      pe: 3,
      description:
        'muda a resistência para "nenhuma". Como parte da execução do ritual, você faz um ataque corpo a corpo contra o alvo.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 7,
      description:
        'muda o alcance para "pessoal", o alvo para "você" e a duração para "cena". Em vez do normal, a cada rodada você pode gastar uma ação padrão para tocar 1 ser e causar 4d6 pontos de dano de Sangue.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Vaso', 'Sangue'],
  },
  {
    id: 'transfusao-vital',
    name: 'Transfusão Vital',
    circle: 2,
    element: 'SANGUE',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'instantânea',
    description:
      'Você toca outro ser e transfere sua própria energia vital para ele, podendo perder até 30 pontos de vida para que o alvo recupere a mesma quantidade em PV. Você não pode ficar com menos de 1 PV por causa desse ritual.',
    discente: {
      pe: 3,
      description: 'Você pode transferir até 50 pontos de vida.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description: 'Você pode transferir até 100 pontos de vida.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Corda'],
  },

  // MEDO
  {
    id: 'protecao-rituais',
    name: 'Proteção contra Rituais',
    circle: 2,
    element: 'MEDO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'cena',
    description:
      'Você canaliza uma aura de Medo puro, que protege o alvo contra efeitos paranormais. O alvo recebe resistência a dano paranormal 5 e +5 em testes de resistência contra rituais e habilidades de criaturas paranormais.',
    discente: {
      pe: 3,
      description: 'muda o alvo para até 5 seres tocados.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 6,
      description:
        'muda o alvo para até 5 seres tocados, a resistência a dano para 10 e o bônus em testes de resistência para +10.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Vela preta', 'Símbolo de medo'],
  },
  {
    id: 'rejeitar-nevoa',
    name: 'Rejeitar Névoa',
    circle: 2,
    element: 'MEDO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'curto',
    target: 'área: nuvem de 6m de raio',
    duration: 'cena',
    description:
      'Você manifesta um leve redemoinho de névoa que se movimenta suavemente dentro da área. Rituais conjurados dentro da área têm seu custo aumentado em +2 PE por círculo e sua execução aumentada em um passo.',
    requiresIngredients: true,
    ingredients: ['Névoa', 'Cristal'],
  },
  {
    id: 'vomitar-pestes',
    name: 'Vomitar Pestes',
    circle: 3,
    element: 'SANGUE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'médio',
    target: 'área: 1 enxame Grande (quadrado de 3m)',
    duration: '5 rodadas',
    description:
      'Você vomita um enxame de insetos paranormais que atacam os alvos na área.',
    requiresIngredients: true,
    ingredients: ['Insetos', 'Veneno'],
  },
  {
    id: 'dissipar-ritual',
    name: 'Dissipar Ritual',
    circle: 3,
    element: 'MEDO',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'médio',
    target: '1 ser ou objeto, ou esfera com 3m de raio',
    duration: 'instantânea',
    description:
      'Você dissipa rituais ativos, como se a duração deles tivesse acabado. Efeitos de rituais instantâneos não podem ser dissipados. Faça um teste de Ocultismo; você anula quaisquer rituais ativos no alvo ou na área com DT igual ou menor que o resultado do teste.',
    requiresIngredients: true,
    ingredients: ['Cristal', 'Símbolo'],
  },
]

/**
 * Rituais do 3º Círculo
 */
export const RITUALS_CIRCLE_3: Ritual[] = [
  // CONHECIMENTO
  {
    id: 'alterar-memoria',
    name: 'Alterar Memória',
    circle: 3,
    element: 'VARIÁVEL', // Escolhido ao aprender (Conhecimento, Energia, Morte ou Sangue)
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'toque',
    target: '1 arma corpo a corpo ou pacote de munição',
    duration: 'cena',
    description:
      'Quando aprender este ritual, escolha um elemento entre Conhecimento, Energia, Morte e Sangue. Este ritual passa a ser do elemento escolhido. Você imbui a arma ou munições com o elemento, fazendo com que causem +1d6 de dano do tipo do elemento.',
    discente: {
      pe: 2,
      description: 'muda o bônus de dano para +2d6.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'muda o bônus de dano para +4d6.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Símbolo do elemento', 'Arma ou munição'],
  },
  {
    id: 'contato-paranormal',
    name: 'Contato Paranormal',
    circle: 3,
    element: 'CONHECIMENTO',
    cost: { pe: 3 },
    execution: 'completa',
    range: 'pessoal',
    target: 'você',
    duration: '1 dia',
    description:
      'Você barganha com a entidade de Conhecimento para que o auxilie durante o dia, em troca de se alimentar de sua Sanidade. Quando o ritual é conjurado, você recebe seis d6. Sempre que fizer um teste de perícia, você pode gastar um desses d6, rolá-lo e adicionar o resultado no teste. No entanto, essa ajuda tem um preço: sempre que rolar um 6 no dado, a entidade toma 2 pontos de Sanidade de você. Se você ficar sem dados ou chegar a Sanidade 0, o ritual acaba.',
    discente: {
      pe: 4,
      description:
        'muda os dados de auxílio para d8. Sempre que rolar um 8 num desses dados, a entidade toma 3 pontos de sua Sanidade.',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 9,
      description:
        'muda os dados de auxílio para d12. Sempre que rolar um 12 num desses dados, a entidade toma 5 pontos de sua Sanidade.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Livro antigo', 'Tinta preta', 'Vela'],
  },
  {
    id: 'mergulho-mental',
    name: 'Mergulho Mental',
    circle: 3,
    element: 'CONHECIMENTO',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'toque',
    target: '1 pessoa',
    duration: 'sustentada',
    resistance: 'Vontade parcial',
    description:
      'Você mergulha nos pensamentos do alvo para descobrir informações sobre ele. Durante o mergulho, você fica desprevenido. No início de cada turno seu que estiver sustentando o efeito e tocando o alvo, ele deve fazer um teste de Vontade. Se falhar, deve responder uma pergunta sua que possa ser respondida com "sim" ou "não", sendo incapaz de mentir. O que você descobre depende das suas perguntas e do mestre: talvez você não descubra tudo que há para saber, mas pode ganhar pistas para continuar a investigação.',
    verdadeiro: {
      pe: 4,
      description:
        'muda a execução para 1 dia, o alcance para ilimitado e adiciona como componente ritualístico uma cuba de ouro cheia d\'água e uma máscara (acessório de categoria II). Você pode realizar o mergulho mental à distância, submergindo seu rosto mascarado na água enquanto mentaliza o alvo. Para que esse ritual funcione, você precisa ter alguma informação sobre o alvo, como nome completo, e um objeto pessoal ou fotografia.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Água', 'Objeto do alvo'],
  },
  {
    id: 'videncia',
    name: 'Vidência',
    circle: 3,
    element: 'CONHECIMENTO',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'ilimitado',
    target: '1 ser',
    duration: 'sustentada',
    resistance: 'Vontade anula',
    description:
      'Através de uma superfície reflexiva, como um espelho, uma bacia de água ou mesmo uma TV desligada, você pode ver e ouvir um ser escolhido e seus arredores (cerca de 6m em qualquer direção). O alvo pode estar a qualquer distância, mas tem direito a um teste de resistência no início de cada um de seus turnos para impedir a observação.',
    requiresIngredients: true,
    ingredients: ['Superfície reflexiva', 'Vela', 'Água'],
  },

  // ENERGIA
  {
    id: 'convocacao-instantanea',
    name: 'Convocação Instantânea',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'ilimitado',
    target: '1 objeto de até 2 espaços',
    duration: 'instantânea',
    resistance: 'Vontade anula',
    description:
      'Você invoca um objeto de qualquer lugar para sua mão. O item deve ter sido previamente preparado com o símbolo do ritual e pode ocupar no máximo 2 espaços. Se o objeto estiver sendo empunhado por outra pessoa, ela pode fazer um teste de Vontade para negar o efeito, mas você saberá onde o objeto está e quem o está carregando. Por até 1h depois da convocação, você pode gastar uma ação de movimento para enviar o objeto de volta para o local em que ele estava antes.',
    discente: {
      pe: 4,
      description: 'muda o alvo para um objeto de até 10 espaços.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 9,
      description:
        'muda o alvo para "1 recipiente Médio (como uma mala ou caixote), com itens que somem até 10 espaços" e a duração para "permanente". Em vez do normal, você encanta o recipiente para mantê-lo escondido no Outro Lado. Você pode convocar o recipiente para um espaço livre adjacente, ou de volta para o esconderijo paranormal, com uma ação padrão. Quando conjura esta versão do ritual, você perde 1 PE permanentemente.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Símbolo do ritual', 'Corda'],
  },
  {
    id: 'salto-fantasma',
    name: 'Salto Fantasma',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'médio',
    target: 'você',
    duration: 'instantânea',
    description:
      'Seu corpo se transforma momentaneamente em Energia pura e viaja até outro ponto. Você não precisa perceber nem ter linha de efeito ao seu destino, podendo apenas imaginá-lo, desde que já tenha observado o local de alguma forma (em pessoa, por fotografia, por vídeo…). Uma vez transportado, você não pode agir pelo resto do seu turno. Este ritual não permite que você apareça dentro de um corpo sólido.',
    discente: {
      pe: 2,
      description:
        'muda a execução para reação. Em vez do normal, você salta para um espaço adjacente (1,5m), recebendo +10 na Defesa e em testes de Reflexos contra um ataque ou efeito que esteja prestes a atingi-lo.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 4,
      description:
        'muda o alcance para longo e o alvo para você e até dois outros seres voluntários que você esteja tocando.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Pena'],
  },
  {
    id: 'transfigurar-agua',
    name: 'Transfigurar Água',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'longo',
    target: 'área: esfera com 30m de raio',
    duration: 'cena',
    resistance: 'veja texto',
    description:
      'Você canaliza Energia sobre um corpo de água, para que ele adquira movimentos e comportamentos paranormais e caóticos. Ao conjurar o ritual, escolha um dos seguintes efeitos: Congelar, Derreter, Enchente, Evaporar (5d8 de dano de Energia), Partir.',
    verdadeiro: {
      pe: 5,
      description: 'aumenta o deslocamento de enchente para +12m e o dano de evaporar para 10d8.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Água', 'Cristal'],
  },
  {
    id: 'transfigurar-terra',
    name: 'Transfigurar Terra',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'longo',
    target: 'área: 9 cubos com 1,5m de lado',
    duration: 'sustentada',
    description:
      'Você imbui terra, pedra, lama, argila ou areia na área com Energia, gerando efeitos sobrenaturais e caóticos. Ao conjurar o ritual, escolha um dos seguintes efeitos: Solidificar (transforma lama ou areia em terra ou pedra), Modelar (cria objetos ou estruturas).',
    discente: {
      pe: 3,
      description: 'muda a área para 15 cubos com 1,5m de lado.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description: 'também afeta todos os tipos de minerais e metais.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Terra', 'Pedra', 'Cristal'],
  },

  // MORTE
  {
    id: 'ancora-temporal',
    name: 'Âncora Temporal',
    circle: 3,
    element: 'MORTE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Você ancora o fluxo temporal ao seu redor, protegendo-se de efeitos que alteram o tempo. Você fica imune a efeitos que alterem sua velocidade, aceleração ou desaceleração temporal.',
    requiresIngredients: true,
    ingredients: ['Relógio quebrado', 'Areia'],
  },
  {
    id: 'poeira-podridao',
    name: 'Poeira da Podridão',
    circle: 3,
    element: 'MORTE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'médio',
    target: 'área: nuvem com 6m de raio',
    duration: 'sustentada',
    resistance: 'Fortitude (veja texto)',
    description:
      'Você manifesta uma nuvem de poeira que apodrece os seres na área. Ao conjurar o ritual, e no início de cada um de seus turnos, seres e objetos na área sofrem 4d8 pontos de dano de Morte (Fortitude reduz à metade). Alvos que falharem no teste também não podem recuperar PV de nenhuma forma por uma rodada.',
    verdadeiro: {
      pe: 4,
      description: 'muda o dano para 4d8+16.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cinzas', 'Terra de cemitério'],
  },
  {
    id: 'tentaculos-lodo',
    name: 'Tentáculos de Lodo',
    circle: 3,
    element: 'MORTE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'médio',
    target: 'área: veja texto',
    duration: 'sustentada',
    description:
      'Tentáculos de lodo surgem do chão e agarram os alvos na área. Os tentáculos causam dano de Morte e podem impedir o movimento dos alvos agarrados.',
    discente: {
      pe: 3,
      description: 'aumenta o número de tentáculos e o dano causado.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description:
        'muda o alcance para curto e o alvo para 1 ser ou objeto Enorme ou menor. Em vez do normal, cria uma esfera imóvel de lodo que aprisiona o alvo.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Lodo', 'Terra de cemitério'],
  },
  {
    id: 'zerar-entropia',
    name: 'Zerar Entropia',
    circle: 3,
    element: 'MORTE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'cena',
    resistance: 'Fortitude anula',
    description:
      'Você zera completamente a entropia do alvo em relação ao ambiente, deixando-o paralisado. Se passar na resistência, em vez disso fica lento. No início de cada um de seus turnos, o alvo pode gastar uma ação completa para fazer um novo teste de Vontade. Se passar, encerra o efeito.',
    discente: {
      pe: 4,
      description: 'muda o alvo para "1 ser".',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 11,
      description: 'muda o alvo para "seres escolhidos".',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Relógio parado', 'Areia'],
  },

  // SANGUE
  {
    id: 'ferver-sangue',
    name: 'Ferver Sangue',
    circle: 3,
    element: 'SANGUE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'curto',
    target: '1 ser',
    duration: 'sustentada',
    description:
      'Você faz o sangue do alvo ferver dentro de seu corpo, causando dano de Sangue contínuo. O alvo sofre dano de Sangue no início de cada turno enquanto o ritual durar.',
    requiresIngredients: true,
    ingredients: ['Sangue', 'Carvão quente'],
  },
  {
    id: 'forma-monstruosa',
    name: 'Forma Monstruosa',
    circle: 3,
    element: 'SANGUE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Seu corpo se transforma, assumindo uma forma que combina suas características com as de uma criatura de Sangue; suas roupas e proteção se mesclam à sua carne, transformando-se em uma couraça, e quaisquer objetos em suas mãos se fundem aos seus braços, transformando-se em garras pontiagudas. Seu tamanho muda para Grande e você recebe +5 em testes de ataque e rolagens de dano corpo a corpo e 30 PV temporários. Enquanto estiver transformado, sua mente é tomada por fúria selvagem; você não pode falar nem conjurar rituais e a cada rodada deve atacar o ser mais próximo possível.',
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Pele de animal'],
  },
  {
    id: 'purgatorio',
    name: 'Purgatório',
    circle: 3,
    element: 'SANGUE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'curto',
    target: 'área de 6m de raio',
    duration: 'sustentada',
    resistance: 'Fortitude parcial',
    description:
      'Você faz brotar uma poça de sangue pegajoso na área afetada. Inimigos na área se tornam vulneráveis a dano balístico, de corte, de impacto e de perfuração. Um alvo que tente sair da área é acometido de uma dor terrível; sofre 6d6 pontos de dano de Sangue e deve fazer um teste de Fortitude. Se passar, consegue sair. Se falhar, a dor faz com que não consiga se mover e perca a ação de movimento.',
    requiresIngredients: true,
    ingredients: ['Sangue', 'Terra'],
  },
]

/**
 * Rituais do 4º Círculo
 */
export const RITUALS_CIRCLE_4: Ritual[] = [
  // CONHECIMENTO
  {
    id: 'controle-mental',
    name: 'Controle Mental',
    circle: 4,
    element: 'CONHECIMENTO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'médio',
    target: '1 pessoa ou animal',
    duration: 'sustentada',
    resistance: 'Vontade parcial',
    description:
      'Você domina a mente do alvo, que obedece todos os seus comandos, exceto ordens suicidas. Um alvo tem direito a um teste de Vontade no final de cada um de seus turnos para se livrar do efeito. Alvos que passarem no teste ficam pasmos por 1 rodada (apenas uma vez por cena).',
    discente: {
      pe: 5,
      description: 'muda o alvo para até cinco pessoas ou animais.',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 10,
      description: 'muda o alvo para até dez pessoas ou animais.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Objeto do alvo'],
  },
  {
    id: 'inexistir',
    name: 'Inexistir',
    circle: 4,
    element: 'CONHECIMENTO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'instantânea',
    resistance: 'Vontade parcial',
    description:
      'Este é um ritual extremamente cruel, que já condenou grandes agentes da Ordem ao oblívio. Você toca o alvo com a intenção de apagá-lo por completo da existência, fazendo a mente e o corpo do alvo serem reescritos e desmantelados da existência. O alvo começa a levitar a poucos centímetros do chão e textos narrando todos os momentos de sua vida surgem e brilham por cima de sua pele, até que a existência dele começa a ser destruída de dentro, causando 10d12+10 pontos de dano de Conhecimento. Se o alvo passar no teste de resistência, em vez disso sofre 2d12 pontos de dano e fica debilitado por uma rodada. Independente do resultado do teste de resistência, se os PV do alvo forem reduzidos a 0 ou menos, ele será completamente apagado, não restando nenhum traço de sua existência.',
    discente: {
      pe: 5,
      description: 'muda o dano para 15d12+15 e o dano resistido para 3d12.',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 10,
      description: 'muda o dano para 20d12+20 e o dano resistido para 4d12.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Livro proibido', 'Tinta preta', 'Vela'],
  },
  {
    id: 'possessao',
    name: 'Possessão',
    circle: 4,
    element: 'CONHECIMENTO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'longo',
    target: '1 pessoa viva ou morta',
    duration: '1 dia',
    resistance: 'Vontade anula',
    description:
      'Você projeta sua consciência no corpo de uma pessoa viva ou morta. Enquanto possuir o alvo, você assume o controle total do corpo dele (se o alvo estiver vivo, a consciência dele troca de lugar com a sua, ficando inerte dentro do seu corpo desacordado). Em termos de jogo, você continua usando a sua ficha, mas com os atributos físicos (Agilidade, Força e Vigor) e deslocamento do alvo. Se o alvo passar no teste de resistência, sabe que você tentou possuí-lo e fica imune a este ritual por um dia.',
    requiresIngredients: true,
    ingredients: ['Objeto pessoal do alvo', 'Vela preta'],
  },

  // ENERGIA
  {
    id: 'alterar-destino',
    name: 'Alterar Destino',
    circle: 4,
    element: 'ENERGIA',
    cost: { pe: 4 },
    execution: 'reação',
    range: 'pessoal',
    target: 'você',
    duration: 'instantânea',
    description:
      'Você vislumbra seu futuro próximo, analisando milhões de possibilidades e escolhendo a melhor. Você recebe +15 em um teste de resistência ou na Defesa contra um ataque.',
    verdadeiro: {
      pe: 5,
      description: 'muda o alcance para "curto" e o alvo para "um aliado à sua escolha".',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Moeda'],
  },
  {
    id: 'alterar-destino-arma',
    name: 'Alterar Destino (Arma)',
    circle: 4,
    element: 'ENERGIA',
    cost: { pe: 4 },
    execution: 'reação',
    range: 'toque',
    target: '1 arma corpo a corpo ou pacote de munição',
    duration: 'cena',
    description:
      'Você imbui a arma ou munições com Energia, alterando seu destino. A arma recebe bônus em testes de ataque e na margem de ameaça.',
    requiresIngredients: true,
    ingredients: ['Arma ou munição', 'Cristal'],
  },
  {
    id: 'deflagracao-energia',
    name: 'Deflagração de Energia',
    circle: 4,
    element: 'ENERGIA',
    cost: { pe: 4 },
    execution: 'completa',
    range: 'pessoal',
    target: 'área: explosão de 15m de raio',
    duration: 'instantânea',
    resistance: 'Fortitude parcial',
    description:
      'Você acumula uma quantidade imensa de Energia, então a libera em uma explosão intensa, como uma estrela em plena terra. Todos na área sofrem 3d10 x 10 pontos de dano de Energia e todos os itens tecnológicos (armas de fogo, acessórios e utensílios) param de funcionar (em termos de regras, estão quebrados). Você não é afetado pela explosão. Alvos que passem no teste de Fortitude sofrem metade do dano e seus itens voltam a funcionar após 1d4 rodadas.',
    requiresIngredients: true,
    ingredients: ['Cristal', 'Componente eletrônico'],
  },
  {
    id: 'teletransporte',
    name: 'Teletransporte',
    circle: 4,
    element: 'ENERGIA',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'toque',
    target: 'até 5 seres voluntários',
    duration: 'instantânea',
    description:
      'O ritual transforma o corpo e equipamento dos alvos em energia pura e os faz reaparecer num lugar a sua escolha a até 1.000km. Quando conjura este ritual, você precisa fazer um teste de Ocultismo, com DT definida pelo seu conhecimento sobre o destino. DT 25: lugar visitado com frequência. DT 30: lugar visitado pelo menos uma vez. DT 35: lugar nunca visitado, só conhecido por descrição. Se passar no teste, os alvos chegam ao lugar desejado. Se falhar, você chega em um lugar parecido mas errado ou distante (até 1d10 x 10 km).',
    verdadeiro: {
      pe: 5,
      description: 'pode se teletransportar para qualquer local na Terra.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Mapa'],
  },

  // MORTE
  {
    id: 'convocar-algoz',
    name: 'Convocar o Algoz',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'médio',
    target: '1 pessoa',
    duration: 'sustentada',
    resistance: 'Vontade parcial, Fortitude parcial',
    description:
      'Usando os medos subconscientes do alvo, você manipula a espiral da Morte para criar uma imagem daquilo que ele mais teme. Apenas a própria vítima vê o algoz com nitidez; outros seres presentes (incluindo você) enxergam apenas um vulto sombrio. O algoz surge adjacente a você. No fim de cada turno seu, ele flutua 12m em direção à vítima. Se o algoz terminar o turno em alcance curto da vítima, ela deve fazer um teste de Vontade; se falhar, ficará abalada. Se o algoz terminar o turno adjacente à vítima, ela deve fazer um teste de Fortitude. Se falhar, sofre um colapso e fica com 0 PV. Se passar, sofre 6d6 pontos de dano de Morte (este dano não pode reduzir o alvo a menos de 1 PV). O algoz persegue o alvo implacavelmente, mesmo além do alcance do ritual. Ele é incorpóreo e imune a dano e só desaparece se deixar o alvo morrendo ou se for dissipado.',
    requiresIngredients: true,
    ingredients: ['Objeto do medo do alvo', 'Vela preta'],
  },
  {
    id: 'distorcao-temporal',
    name: 'Distorção Temporal',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: '3 rodadas',
    description:
      'Este ritual distorce o fluxo de tempo em relação a você, criando um pequeno bolsão temporal que dura 3 rodadas. Durante este tempo, você pode agir, mas não pode se deslocar do lugar nem interagir com seres e objetos. Da mesma forma, efeitos contínuos não o afetam, e quaisquer efeitos que você iniciar não afetarão a área ao seu redor.',
    verdadeiro: {
      pe: 5,
      description: 'muda a duração para "1 dia" e concede os mesmos benefícios de discente.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Relógio', 'Areia'],
  },
  {
    id: 'fim-inevitavel',
    name: 'Fim Inevitável',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'completa',
    range: 'extremo',
    target: 'buraco negro com 1,5m de diâmetro',
    duration: '4 rodadas',
    resistance: 'Fortitude parcial',
    description:
      'Você cria um vácuo em um espaço desocupado a sua escolha. No início de cada um de seus quatro turnos seguintes, todos os seres a até 90m do vácuo, incluindo você, devem fazer um teste de Fortitude. Em caso de falha, ficam caídos e são puxados 30m na direção do vácuo. Objetos soltos também são puxados. Seres podem gastar uma ação de movimento para se segurar em algum objeto fixo, recebendo +5 em seus testes de resistência. Seres e objetos que iniciem seu turno tocando o vácuo temporal sofrem 100 pontos de dano de Morte por rodada.',
    discente: {
      pe: 5,
      description: 'muda a duração para "5 rodadas" e o efeito para que você não seja afetado.',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 10,
      description:
        'muda a duração para "6 rodadas" e o efeito para que seres escolhidos dentro do alcance não sejam afetados.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Relógio quebrado', 'Areia negra'],
  },

  // SANGUE
  {
    id: 'capturar-coracao',
    name: 'Capturar o Coração',
    circle: 4,
    element: 'SANGUE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'curto',
    target: '1 pessoa',
    duration: 'cena',
    resistance: 'Vontade parcial',
    description:
      'Você desperta uma paixão doentia e obcecada por você no alvo, que passa a querer agradá-lo a todo custo, mesmo que para isso precise ficar contra seus amigos. No início de cada turno do alvo ele deve fazer um teste de Vontade. Se falhar, age de forma a ajudá-lo na melhor de suas capacidades naquele turno. Se o alvo passar nesse teste dois turnos seguidos o efeito termina.',
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Objeto do alvo'],
  },
  {
    id: 'invólucro-carne',
    name: 'Invólucro de Carne',
    circle: 4,
    element: 'SANGUE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'curto',
    target: '1 clone seu',
    duration: 'cena',
    description:
      'Você manifesta uma poça de sangue no chão, de onde emerge uma cópia sua. Ela é idêntica em aparência e capacidades (em termos de jogo, tem as mesmas estatísticas) e surge com uma cópia de todo equipamento mundano que você estiver carregando. A cópia não tem consciência (valor de Intelecto e Presença nulos) e não age sem que você dê uma ordem. Você pode gastar uma ação de movimento para dar uma ordem à cópia, como "lute contra aquele ser". No final de cada um de seus turnos, a cópia segue a ordem da melhor maneira possível. Alternativamente, no início de seu turno, você pode controlar ativamente a cópia. Se fizer isso, você entra num transe temporário e assume o controle da cópia como se fosse seu corpo, usando os sentidos dela. A cópia se desfaz em uma poça de sangue coagulado se chegar a 0 PV ou sair do alcance.',
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Tecido'],
  },
  {
    id: 'vinculo-sangue',
    name: 'Vínculo de Sangue',
    circle: 4,
    element: 'SANGUE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'curto',
    target: '1 pessoa',
    duration: 'cena',
    resistance: 'Vontade parcial',
    description:
      'Você manifesta um símbolo de Sangue no seu corpo e no corpo do alvo. Sempre que você sofrer dano, o alvo deve fazer um teste de Fortitude. Se ele falhar, você sofre apenas metade do dano e ele sofre a metade restante.',
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Sangue do alvo'],
  },

  // MEDO
  {
    id: 'canalizar-medo',
    name: 'Canalizar o Medo',
    circle: 4,
    element: 'MEDO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'cena',
    description:
      'O alvo tem sua mente energizada por fagulhas do Conhecimento. Ele recebe +1 em Intelecto ou Presença, à escolha dele (PE, perícias treinadas ou graus de treinamento).',
    discente: {
      pe: 3,
      description: 'muda o bônus para +2.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 7,
      description: 'muda o bônus para +3.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Vela preta', 'Símbolo de medo'],
  },
  {
    id: 'conhecendo-medo',
    name: 'Conhecendo o Medo',
    circle: 4,
    element: 'MEDO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'toque',
    target: '1 pessoa',
    duration: 'instantânea',
    resistance: 'Vontade parcial',
    description:
      'Você manifesta medo absoluto na mente do alvo. Se ele falhar no teste de resistência, a Sanidade dele é reduzida a 0 e ele fica enlouquecendo. Se ele passar, sofre 10d6 pontos de dano mental e fica apavorado por 1 rodada. Uma pessoa que fique insana pelo efeito deste ritual se transforma em uma criatura paranormal a critério do mestre.',
    requiresIngredients: true,
    ingredients: ['Vela preta', 'Objeto do medo'],
  },
  {
    id: 'lamina-medo',
    name: 'Lâmina do Medo',
    circle: 4,
    element: 'MEDO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'toque',
    target: '1 ser',
    duration: 'cena',
    description:
      'Você manifesta uma lâmina feita de medo puro que causa dano mental e de Medo ao alvo. A lâmina é incorpórea e ignora armaduras mundanas, causando dano direto à mente do alvo.',
    verdadeiro: {
      pe: 7,
      description: 'aumenta a área de efeito para círculo de 1km de raio, afetando todos os seres dentro da área.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Lâmina', 'Vela preta'],
  },
  {
    id: 'medo-tangivel',
    name: 'Medo Tangível',
    circle: 4,
    element: 'MEDO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'O ritual transforma seu corpo em uma manifestação do Medo, tornando-o imune a efeitos mundanos. Você fica imune às condições atordoado, cego, debilitado, enjoado, envenenado, exausto, fatigado, fraco, lento, ofuscado e paralisado, além de doenças e venenos, e não sofre dano adicional por acertos críticos e ataques furtivos. Além disso, dano do tipo balístico, corte, impacto ou perfuração não podem reduzir seu total de pontos de vida abaixo de 1, tornando-o virtualmente imortal contra efeitos mundanos.',
    verdadeiro: {
      pe: 7,
      description:
        'como a versão discente, mas muda a duração para 3 rodadas. Um ser que inicie seu turno dentro da área sofre o dano novamente.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Vela preta', 'Símbolo de medo'],
  },
  {
    id: 'presenca-medo',
    name: 'Presença do Medo',
    circle: 4,
    element: 'MEDO',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'área: emanação de 9m de raio',
    duration: 'sustentada',
    description:
      'Você se torna um receptáculo para o Medo puro, emanando ondas de pavor e ruína. Alvos dentro da área no momento da conjuração ou no início de cada um de seus turnos são acometidos por sofrimento intenso e sofrem 5d8 de dano mental e 5d8 de dano de Medo (Vontade reduz ambos à metade). Alvos que falharem no teste ficam atordoados por uma rodada (este efeito funciona apenas uma vez por cena).',
    requiresIngredients: true,
    ingredients: ['Vela preta', 'Símbolo de medo'],
  },
]

/**
 * Rituais Homebrew (criados pela comunidade)
 */
export const RITUALS_HOMEBREW: Ritual[] = [
  // SANGUE
  {
    id: 'asas-sangue',
    name: 'Asas de Sangue',
    circle: 3,
    element: 'SANGUE',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena',
    description:
      'Seus ossos se retorcem e suas escapulas se tornam asas, permitindo você voar até 1 metro do chão. Você recebe +3 de deslocamento e é imune a efeitos aplicados no terreno, e qualquer ataque contra você tem -1d20.',
    discente: {
      pe: 2,
      description: 'Você consegue voar a até 3m do chão e recebe +5 de defesa.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 5,
      description: 'Você consegue voar a até 7m do chão e recebe +6 de movimento e +7 na defesa.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Sangue próprio', 'Penas'],
    isHomebrew: true,
  },
  {
    id: 'explosao-sensacoes',
    name: 'Explosão de Sensações',
    circle: 4,
    element: 'SANGUE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'curto',
    target: '1 pessoa',
    duration: 'cena',
    resistance: 'Vontade anula',
    description:
      'Você desperta sentimentos extremos na mente do alvo, que deve fazer um teste de vontade por rodada. Role 1d8 caso o alvo falhe, os resultados são: 1. Frustrado, 2. Esmorecido, 3. Confuso, 4. Atordoado, 5. Fraco, 6. Debilitado, 7. Desprevenido, 8. Vulnerável.',
    verdadeiro: {
      pe: 5,
      description:
        'Ao invés de 1d8, role 1d10, adicionando duas novas condições: 9. Enjoado, 10. Inconsciente.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Sangue', 'Objeto do alvo'],
    isHomebrew: true,
  },

  // MORTE
  {
    id: 'reabrir-feridas',
    name: 'Re-Abrir Feridas',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'padrão',
    range: 'curto',
    target: '1 pessoa',
    duration: 'instantânea',
    resistance: 'Fortitude anula',
    description: 'Você re-abre as feridas curadas do alvo, causando dano igual ao dobro da cura.',
    requiresIngredients: true,
    ingredients: ['Terra de cemitério', 'Sangue'],
    isHomebrew: true,
  },
  {
    id: 'monstro-lodo',
    name: 'Monstro de Lodo',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'completa',
    range: 'sumona um monstro de lodo na sua frente',
    target: '1 monstro de lodo',
    duration: 'até o monstro morrer',
    description:
      '(Para conjurar esse ritual, você precisa de uma poça de lodo ou dois frascos de lodo) Você molda uma aberração de lodo, que segue UM comando que você der a ele. Você não pode dissipar esse ritual. Você precisa de afinidade para ganhar esse ritual. Ordens impossíveis fazem com que ele se comporte como uma criatura de Morte.',
    discente: {
      pe: 3,
      description: 'O monstro fica mais forte.',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 5,
      description: 'O monstro fica mais forte ainda.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Poça de lodo ou dois frascos de lodo'],
    isHomebrew: true,
  },
  {
    id: 'devoção-espiral',
    name: 'Devoção Espiral',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'completa',
    range: 'pessoal',
    target: 'você',
    duration: 'instantânea',
    description:
      'Você contata a entidade da Morte e entrega a ela parte de sua própria percepção temporal da Realidade, em troca da restauração plena de sua saúde. Você recupera todos os pontos de vida e PE, e elimina quaisquer condições negativas que o estejam afetando. Porém, no final da cena, perde 1d4 pontos de Sanidade permanentemente. Além disso, cada vez que conjura este ritual, sua pele adquire uma tonalidade mais acizentada e seu sangue fica mais escuro. Alguns ocultistas temem que múltiplos usos tenham como efeito colateral transformá-lo em um luzídio, embora ninguém saiba exatamente quantas conjurações seriam necessárias para completar a transformação.',
    requiresIngredients: true,
    ingredients: ['Relógio quebrado', 'Areia negra'],
    isHomebrew: true,
  },
  {
    id: 'acelerar',
    name: 'Acelerar',
    circle: 4,
    element: 'MORTE',
    cost: { pe: 4 },
    execution: 'completa',
    range: 'pessoal',
    target: 'você',
    duration: 'até o fim da cena de combate',
    description:
      'Acelera você no tempo, te dando uma ação extra na iniciativa. Você usa esse ritual fora de uma cena de batalha e, quando você entrar em uma batalha você ganha mais uma rodada na iniciativa com o mesmo valor da sua iniciativa normal. Você precisa de afinidade para escolher esse ritual.',
    requiresIngredients: true,
    ingredients: ['Relógio', 'Areia'],
    isHomebrew: true,
  },

  // CONHECIMENTO
  {
    id: 'realocar-conhecimento',
    name: 'Realocar Conhecimento',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'movimento',
    range: 'médio',
    target: 'você',
    duration: 'instantânea',
    description:
      'Todo o conhecimento que compõe você se desmonta e remonta em outro lugar, teleportando você para algum lugar em alcance médio.',
    discente: {
      pe: 3,
      description: 'Muda o alcance para longo.',
      requiresCircle: 2,
    },
    verdadeiro: {
      pe: 5,
      description: 'Como discente; muda o alvo para "Pessoas Escolhidas".',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Livro'],
    isHomebrew: true,
  },
  {
    id: 'manipular-conhecimento',
    name: 'Manipular Conhecimento',
    circle: 2,
    element: 'CONHECIMENTO',
    cost: { pe: 2 },
    execution: 'padrão',
    range: 'adjacente',
    target: '1 equipamento',
    duration: 'cena',
    description:
      'Você manipula o conhecimento ao seu redor para gerar um equipamento (que não te deixe em sobrecarga e você possa levar) na sua mão.',
    verdadeiro: {
      pe: 5,
      description: 'Você pode criar qualquer equipamento.',
      requiresCircle: 2,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Objeto similar'],
    isHomebrew: true,
  },
  {
    id: 'alma-liberada',
    name: 'Alma Liberada',
    circle: 3,
    element: 'CONHECIMENTO',
    cost: { pe: 3 },
    execution: 'completa',
    range: 'médio',
    target: 'você',
    duration: 'sustentada',
    description:
      'Desprende sua alma de seu corpo, te permitindo andar seu deslocamento até estar em alcance médio do seu corpo (te permite atravessar paredes, mas não paredes paranormais ou protegidas por algum ritual).',
    discente: {
      pe: 3,
      description: 'Muda o alcance para longo e te permite voar 3m a mais do seu deslocamento.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 6,
      description: 'Muda o alcance para extremo e o alvo para pessoas escolhidas.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Vela'],
    isHomebrew: true,
  },
  {
    id: 'profecia-impossivel',
    name: 'Profecia Impossível',
    circle: 4,
    element: 'CONHECIMENTO',
    cost: { pe: 4 },
    execution: 'completa',
    range: 'toque',
    target: '1 pessoa',
    duration: 'instantânea',
    resistance: 'Vontade anula',
    description:
      'Você toca no alvo, sussurando no ouvido dele verdades impossíveis que a mente dele não aguenta, fazendo com que ele fique paralisado por 1d4 rodadas ou até ele passar no teste de vontade. A DT diminui em 5 a cada rodada. Para conseguir esse ritual você precisa de afinidade a conhecimento.',
    verdadeiro: {
      pe: 5,
      description: 'Muda o tempo de paralisação para 1d6 rodadas.',
      requiresCircle: 4,
    },
    requiresIngredients: true,
    ingredients: ['Livro proibido', 'Vela preta'],
    isHomebrew: true,
  },

  // ENERGIA
  {
    id: 'golpe-caotico',
    name: 'Golpe Caótico',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 },
    execution: 'padrão',
    range: 'pessoal',
    target: 'você',
    duration: 'cena, ou até você atacar, o que for primeiro',
    description:
      'O caos brinca com seu próximo ataque, melhorando ele. Quando der o seu próximo ataque, role 1d4: 1. +1 na margem de ameaça, 2. +1 no multiplicador de crítico, 3. O ataque causa +1d6 de dano, 4. Todo o dano do ataque é convertido para dano de energia.',
    discente: {
      pe: 3,
      description: 'O efeito 1 aumenta em 1 e o efeito 3 aumenta em 1d6+3.',
      requiresCircle: 4,
    },
    verdadeiro: {
      pe: 5,
      description: 'Muda a duração para "Cena, ou até você der dois ataques, o que for primeiro".',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Componente eletrônico'],
    isHomebrew: true,
  },
  {
    id: 'conjurar-ritual',
    name: 'Conjurar Ritual',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 }, // Custo base, mas o custo real depende do ritual sorteado
    execution: 'padrão',
    range: 'do ritual que cair',
    target: 'do ritual que cair',
    duration: 'do ritual que cair',
    description:
      'Você conjura um ritual aleatório, decidido por uma roleta. Você paga o custo em PE do ritual que cair na roleta (o custo base de 3 PE é o mínimo, mas pode ser maior dependendo do ritual sorteado).',
    discente: {
      pe: 0,
      description: 'O ritual sai na sua forma discente e você pode rerolar uma vez.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 0,
      description: 'O ritual sai na sua forma verdadeira e você pode rerolar duas vezes.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Roleta'],
    isHomebrew: true,
  },
  {
    id: 'alterar-tempo',
    name: 'Alterar Tempo',
    circle: 3,
    element: 'ENERGIA',
    cost: { pe: 3 },
    execution: 'completa',
    range: 'raio de até 90m',
    target: 'área: raio de até 90m',
    duration: 'cena',
    description:
      'Você altera o tempo em um raio de até 90m, gerando um dos efeitos a seguir: Chuva, Neblina, Granizo, Neve. Todos os efeitos estão na página 296 do livro de regras.',
    discente: {
      pe: 3,
      description:
        'Muda a área para até 120m e adiciona os seguintes efeitos: Tempestade, Vendaval, Vento Forte.',
      requiresCircle: 3,
    },
    verdadeiro: {
      pe: 5,
      description: 'Muda a área para até 180m e adiciona os seguintes efeitos: Furacão, Tornado.',
      requiresCircle: 3,
    },
    requiresIngredients: true,
    ingredients: ['Cristal', 'Componente meteorológico'],
    isHomebrew: true,
  },
]

/**
 * Lista completa de todos os rituais disponíveis
 */
export const ALL_RITUALS: Ritual[] = [
  ...RITUALS_CIRCLE_1,
  ...RITUALS_CIRCLE_2,
  ...RITUALS_CIRCLE_3,
  ...RITUALS_CIRCLE_4,
  ...RITUALS_HOMEBREW,
]

/**
 * Filtra rituais por círculo
 */
export function getRitualsByCircle(circle: number): Ritual[] {
  return ALL_RITUALS.filter((r) => r.circle === circle)
}

/**
 * Filtra rituais por elemento
 */
export function getRitualsByElement(
  element: Ritual['element']
): Ritual[] {
  return ALL_RITUALS.filter((r) => r.element === element)
}

/**
 * Busca ritual por ID
 */
export function getRitualById(id: string): Ritual | undefined {
  return ALL_RITUALS.find((r) => r.id === id)
}

