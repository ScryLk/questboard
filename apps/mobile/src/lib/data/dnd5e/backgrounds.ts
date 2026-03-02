import {
  BookOpen,
  Drama,
  Fingerprint,
  Music,
  TreePine,
  Hammer,
  Tent,
  Crown,
  Mountain,
  GraduationCap,
  Anchor,
  Shield,
  Footprints,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

// ─── Types ──────────────────────────────────────────────

export interface BackgroundFeature {
  name: string;
  description: string;
}

export interface PersonalitySuggestion {
  id: string;
  text: string;
}

export interface Background {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: number;
  feature: BackgroundFeature;
  personalityTraits: PersonalitySuggestion[];
  ideals: PersonalitySuggestion[];
  bonds: PersonalitySuggestion[];
  flaws: PersonalitySuggestion[];
  equipment: string[];
}

// ─── Equipment Packs (class-based) ──────────────────────

export interface EquipmentChoice {
  id: string;
  label: string;
  options: { id: string; name: string; items: string[] }[];
}

export interface ClassEquipmentPack {
  classId: string;
  fixed: string[];
  choices: EquipmentChoice[];
}

// ─── Backgrounds Data ───────────────────────────────────

export const DND5E_BACKGROUNDS: Background[] = [
  {
    id: "acolyte",
    name: "Acólito",
    tagline: "Devoto de um templo sagrado",
    icon: BookOpen,
    color: "#6C5CE7",
    skillProficiencies: ["Intuição", "Religião"],
    toolProficiencies: [],
    languages: 2,
    feature: {
      name: "Abrigo dos Fiéis",
      description:
        "Você e seus companheiros podem receber cura e cuidados gratuitos em templos e santuários da sua fé.",
    },
    personalityTraits: [
      { id: "ac-p1", text: "Idolatro um herói da minha fé e cito seus feitos constantemente." },
      { id: "ac-p2", text: "Consigo encontrar pontos em comum entre os maiores inimigos, simpatizando com eles." },
      { id: "ac-p3", text: "Vejo presságios em cada evento e ação. Os deuses falam conosco." },
      { id: "ac-p4", text: "Nada pode abalar minha atitude otimista." },
      { id: "ac-p5", text: "Cito textos sagrados em quase todas as situações." },
      { id: "ac-p6", text: "Sou tolerante com outras fés e respeito a adoração de outros deuses." },
    ],
    ideals: [
      { id: "ac-i1", text: "Tradição. As antigas tradições de adoração e sacrifício devem ser preservadas." },
      { id: "ac-i2", text: "Caridade. Sempre tento ajudar os necessitados, não importa o custo pessoal." },
      { id: "ac-i3", text: "Mudança. Devemos auxiliar as mudanças que os deuses constantemente operam no mundo." },
      { id: "ac-i4", text: "Fé. Confio que minha divindade guiará minhas ações." },
    ],
    bonds: [
      { id: "ac-b1", text: "Eu faria qualquer coisa para recuperar uma relíquia antiga da minha fé." },
      { id: "ac-b2", text: "Algum dia me vingarei do templo corrupto que me chamou de herege." },
      { id: "ac-b3", text: "Devo minha vida ao sacerdote que me acolheu quando meus pais morreram." },
    ],
    flaws: [
      { id: "ac-f1", text: "Julgo os outros severamente, e a mim mesmo mais severamente ainda." },
      { id: "ac-f2", text: "Confio demais nos que exercem poder dentro da hierarquia do meu templo." },
      { id: "ac-f3", text: "Minha piedade às vezes me leva a confiar cegamente naqueles que professam fé no meu deus." },
    ],
    equipment: [
      "Símbolo sagrado",
      "Livro de preces",
      "5 varetas de incenso",
      "Vestimentas",
      "Roupas comuns",
      "Algibeira com 15 po",
    ],
  },
  {
    id: "charlatan",
    name: "Charlatão",
    tagline: "Mestre da trapaça e do disfarce",
    icon: Drama,
    color: "#E94560",
    skillProficiencies: ["Enganação", "Prestidigitação"],
    toolProficiencies: ["Kit de disfarce", "Kit de falsificação"],
    languages: 0,
    feature: {
      name: "Identidade Falsa",
      description:
        "Você criou uma segunda identidade com documentação, contatos e disfarces. Pode assumir essa persona a qualquer momento.",
    },
    personalityTraits: [
      { id: "ch-p1", text: "Tenho um truque para cada situação e sempre puxo proveito de outro." },
      { id: "ch-p2", text: "Adulo constantemente as pessoas para conseguir o que quero." },
      { id: "ch-p3", text: "Sou um mentiroso nato e acho difícil falar a verdade." },
      { id: "ch-p4", text: "Sarcasmo e ironia são minhas armas preferidas." },
    ],
    ideals: [
      { id: "ch-i1", text: "Independência. Sou espírito livre — ninguém me diz o que fazer." },
      { id: "ch-i2", text: "Justiça. Nunca roubo de quem não pode se dar ao luxo de perder." },
      { id: "ch-i3", text: "Amizade. Os bens materiais vêm e vão. Os laços de amizade duram para sempre." },
    ],
    bonds: [
      { id: "ch-b1", text: "Dei um calote em alguém importante e preciso evitá-lo a todo custo." },
      { id: "ch-b2", text: "Devo tudo ao meu mentor — uma pessoa horrível provavelmente apodrecendo na cadeia." },
    ],
    flaws: [
      { id: "ch-f1", text: "Não resisto a um rosto bonito." },
      { id: "ch-f2", text: "Estou sempre em dívida. Gasto meus lucros ilícitos em luxos decadentes." },
      { id: "ch-f3", text: "Estou convencido de que ninguém pode me enganar como eu engano os outros." },
    ],
    equipment: [
      "Roupas finas",
      "Kit de disfarce",
      "Ferramentas de trapaça",
      "Algibeira com 15 po",
    ],
  },
  {
    id: "criminal",
    name: "Criminoso",
    tagline: "Experiência nas leis do submundo",
    icon: Fingerprint,
    color: "#2D3436",
    skillProficiencies: ["Enganação", "Furtividade"],
    toolProficiencies: ["Jogo de azar", "Ferramentas de ladrão"],
    languages: 0,
    feature: {
      name: "Contato Criminal",
      description:
        "Você tem um contato confiável que age como seu elo de ligação com uma rede de outros criminosos.",
    },
    personalityTraits: [
      { id: "cr-p1", text: "Sempre tenho um plano para quando as coisas derem errado." },
      { id: "cr-p2", text: "Estou sempre calmo, não importa a situação." },
      { id: "cr-p3", text: "A primeira coisa que faço num lugar novo é anotar tudo de valor." },
      { id: "cr-p4", text: "Prefiro fazer um novo amigo do que um novo inimigo." },
    ],
    ideals: [
      { id: "cr-i1", text: "Honra. Não roubo de outros no ofício." },
      { id: "cr-i2", text: "Liberdade. Correntes devem ser quebradas, assim como aqueles que as forjam." },
      { id: "cr-i3", text: "Ganância. Faço tudo por dinheiro." },
    ],
    bonds: [
      { id: "cr-b1", text: "Estou tentando pagar uma dívida antiga que devo a um generoso benfeitor." },
      { id: "cr-b2", text: "Meus lucros ilícitos vão para sustentar minha família." },
    ],
    flaws: [
      { id: "cr-f1", text: "Quando vejo algo valioso, não consigo pensar em nada além de roubá-lo." },
      { id: "cr-f2", text: "Quando as coisas ficam difíceis, viro as costas e corro." },
      { id: "cr-f3", text: "Uma pessoa inocente está presa por um crime que cometi. Não me incomodo." },
    ],
    equipment: [
      "Pé de cabra",
      "Roupas escuras com capuz",
      "Algibeira com 15 po",
    ],
  },
  {
    id: "entertainer",
    name: "Artista",
    tagline: "Performista nato que vive pelo palco",
    icon: Music,
    color: "#A29BFE",
    skillProficiencies: ["Acrobacia", "Atuação"],
    toolProficiencies: ["Kit de disfarce", "Instrumento musical"],
    languages: 0,
    feature: {
      name: "Pela Demanda Popular",
      description:
        "Você sempre encontra um lugar para performar, recebendo acomodação e comida grátis enquanto se apresentar.",
    },
    personalityTraits: [
      { id: "en-p1", text: "Conheço uma história para cada situação." },
      { id: "en-p2", text: "Sempre que vou a um lugar novo, coleciono rumores locais e espalho fofocas." },
      { id: "en-p3", text: "Sou um perfeccionista incorrigível." },
      { id: "en-p4", text: "Adoro ser o centro das atenções." },
    ],
    ideals: [
      { id: "en-i1", text: "Beleza. Quando me apresento, faço o mundo melhor do que era." },
      { id: "en-i2", text: "Criatividade. O mundo precisa de novas ideias e ações ousadas." },
      { id: "en-i3", text: "Honestidade. A arte deve refletir a alma; deve vir de dentro." },
    ],
    bonds: [
      { id: "en-b1", text: "Meu instrumento é meu bem mais precioso e me lembra de alguém que amei." },
      { id: "en-b2", text: "O trabalho de alguém foi roubado e quero devolver a fama ao verdadeiro autor." },
    ],
    flaws: [
      { id: "en-f1", text: "Faço qualquer coisa para ganhar fama e renome." },
      { id: "en-f2", text: "Sou um grande fã do meu próprio trabalho e acho difícil elogiar outros." },
    ],
    equipment: [
      "Instrumento musical",
      "Favor de um admirador",
      "Traje de artista",
      "Algibeira com 15 po",
    ],
  },
  {
    id: "folk-hero",
    name: "Herói Popular",
    tagline: "Campeão do povo comum",
    icon: TreePine,
    color: "#00B894",
    skillProficiencies: ["Adestrar Animais", "Sobrevivência"],
    toolProficiencies: ["Ferramentas de artesão", "Veículos terrestres"],
    languages: 0,
    feature: {
      name: "Hospitalidade Rústica",
      description:
        "Pessoas comuns o abrigam e protegem, arriscando suas vidas para ocultá-lo se necessário.",
    },
    personalityTraits: [
      { id: "fh-p1", text: "Julgo as pessoas por suas ações, não por suas palavras." },
      { id: "fh-p2", text: "Se alguém está em perigo, estou sempre pronto para ajudar." },
      { id: "fh-p3", text: "Penso nas coisas profundamente e devagar." },
      { id: "fh-p4", text: "Não me levo a sério. Qual é a graça de viver sem rir?" },
    ],
    ideals: [
      { id: "fh-i1", text: "Respeito. As pessoas merecem ser tratadas com dignidade." },
      { id: "fh-i2", text: "Justiça. Nenhum tirano deve oprimir o povo." },
      { id: "fh-i3", text: "Sinceridade. Não há bem em fingir ser algo que não sou." },
    ],
    bonds: [
      { id: "fh-b1", text: "Tenho uma família, mas não sei onde estão. Espero vê-los algum dia." },
      { id: "fh-b2", text: "Protejo aqueles que não podem se proteger." },
    ],
    flaws: [
      { id: "fh-f1", text: "O tirano que governa minha terra não vai parar de me caçar." },
      { id: "fh-f2", text: "Estou convencido da importância do meu destino e cego a deficiências." },
    ],
    equipment: [
      "Ferramentas de artesão",
      "Pá",
      "Panela de ferro",
      "Roupas comuns",
      "Algibeira com 10 po",
    ],
  },
  {
    id: "guild-artisan",
    name: "Artesão de Guilda",
    tagline: "Membro habilidoso de uma corporação",
    icon: Hammer,
    color: "#FDCB6E",
    skillProficiencies: ["Intuição", "Persuasão"],
    toolProficiencies: ["Ferramentas de artesão"],
    languages: 1,
    feature: {
      name: "Membro da Guilda",
      description:
        "Sua guilda oferece alojamento, ajuda legal e suporte político. Pode acessar salões da guilda em qualquer cidade.",
    },
    personalityTraits: [
      { id: "ga-p1", text: "Acredito que qualquer coisa que valha a pena, vale a pena fazer bem feito." },
      { id: "ga-p2", text: "Sou sempre educado e respeitoso." },
      { id: "ga-p3", text: "Gosto de falar longamente sobre minha profissão." },
      { id: "ga-p4", text: "Não gosto de perder dinheiro e vou pechinchar até o último centavo." },
    ],
    ideals: [
      { id: "ga-i1", text: "Comunidade. É dever de toda pessoa civilizada fortalecer os laços da comunidade." },
      { id: "ga-i2", text: "Generosidade. Meus talentos foram dados para que eu os use em benefício do mundo." },
      { id: "ga-i3", text: "Liberdade. Todos devem ser livres para perseguir seus próprios meios de vida." },
    ],
    bonds: [
      { id: "ga-b1", text: "A oficina onde aprendi meu ofício é o lugar mais importante do mundo para mim." },
      { id: "ga-b2", text: "Criarei uma obra-prima, mesmo que isso me leve a vida inteira." },
    ],
    flaws: [
      { id: "ga-f1", text: "Farei qualquer coisa para obter uma peça rara ou item de meu ofício." },
      { id: "ga-f2", text: "Sou terrivelmente invejoso de quem pode ofuscar meu trabalho artesanal." },
    ],
    equipment: [
      "Ferramentas de artesão",
      "Carta de recomendação da guilda",
      "Roupas de viajante",
      "Algibeira com 15 po",
    ],
  },
  {
    id: "hermit",
    name: "Eremita",
    tagline: "Recluso que busca iluminação",
    icon: Tent,
    color: "#55EFC4",
    skillProficiencies: ["Medicina", "Religião"],
    toolProficiencies: ["Kit de herbalismo"],
    languages: 1,
    feature: {
      name: "Descoberta",
      description:
        "Você descobriu algo profundo durante seu isolamento — uma verdade sobre o cosmos, os deuses ou uma força poderosa.",
    },
    personalityTraits: [
      { id: "he-p1", text: "Estive isolado por tanto tempo que raramente falo, preferindo gestos." },
      { id: "he-p2", text: "Sou completamente sereno, mesmo diante de um desastre." },
      { id: "he-p3", text: "Frequentemente me perco em meus próprios pensamentos e contemplação." },
      { id: "he-p4", text: "Sinto uma conexão com a natureza que me faz sentir deslocado na civilização." },
    ],
    ideals: [
      { id: "he-i1", text: "Conhecimento. O caminho para o poder e autoaperfeiçoamento é o conhecimento." },
      { id: "he-i2", text: "Liberdade. A mão pesada da sociedade sufoca a alma." },
      { id: "he-i3", text: "Lógica. As emoções não devem nublar o pensamento racional." },
    ],
    bonds: [
      { id: "he-b1", text: "Meu isolamento me deu grande percepção sobre um grande mal que só eu posso destruir." },
      { id: "he-b2", text: "Entrei no isolamento para me esconder de alguém que ainda pode estar me caçando." },
    ],
    flaws: [
      { id: "he-f1", text: "Agora que voltei ao mundo, aproveito seus prazeres um pouco demais." },
      { id: "he-f2", text: "Tenho ideias dogmáticas e não abro mão delas." },
    ],
    equipment: [
      "Estojo de pergaminho cheio de estudos",
      "Cobertor de inverno",
      "Roupas comuns",
      "Kit de herbalismo",
      "5 po",
    ],
  },
  {
    id: "noble",
    name: "Nobre",
    tagline: "Nascido em berço privilegiado",
    icon: Crown,
    color: "#DFE6E9",
    skillProficiencies: ["História", "Persuasão"],
    toolProficiencies: ["Jogo de azar"],
    languages: 1,
    feature: {
      name: "Posição de Privilégio",
      description:
        "Pessoas comuns fazem o possível para acomodá-lo e evitar seu descontentamento. Bem-vindo na alta sociedade.",
    },
    personalityTraits: [
      { id: "no-p1", text: "Minha eloqüência disfarça qualquer vacilação real que eu sinta." },
      { id: "no-p2", text: "As pessoas comuns me adoram por minha gentileza e generosidade." },
      { id: "no-p3", text: "Ninguém pode duvidar olhando para mim que estou acima da plebe." },
      { id: "no-p4", text: "Aceito grandes esforços para parecer bem. Jamais me verão com má aparência." },
    ],
    ideals: [
      { id: "no-i1", text: "Respeito. O respeito devido a mim é também devido a toda pessoa, nobre ou não." },
      { id: "no-i2", text: "Responsabilidade. É meu dever respeitar a autoridade dos que estão acima de mim." },
      { id: "no-i3", text: "Nobreza obriga. É minha obrigação proteger o povo abaixo de mim." },
    ],
    bonds: [
      { id: "no-b1", text: "Enfrentarei qualquer desafio para ganhar a aprovação de minha família." },
      { id: "no-b2", text: "A aliança de minha família com outra família nobre deve ser mantida a todo custo." },
    ],
    flaws: [
      { id: "no-f1", text: "Secretamente, acredito que todos estão abaixo de mim." },
      { id: "no-f2", text: "Escondo um segredo realmente escandaloso que poderia arruinar minha família." },
    ],
    equipment: [
      "Roupas finas",
      "Anel de sinete",
      "Pergaminho de linhagem",
      "Algibeira com 25 po",
    ],
  },
  {
    id: "outlander",
    name: "Forasteiro",
    tagline: "Cresceu nas terras selvagens",
    icon: Mountain,
    color: "#74B9FF",
    skillProficiencies: ["Atletismo", "Sobrevivência"],
    toolProficiencies: ["Instrumento musical"],
    languages: 1,
    feature: {
      name: "Andarilho",
      description:
        "Você possui memória excelente para mapas e geografia. Sempre encontra alimento e água fresca para si e até cinco pessoas.",
    },
    personalityTraits: [
      { id: "ou-p1", text: "Sou guiado por uma sede de viagem que me levou para longe de casa." },
      { id: "ou-p2", text: "Cuido de meus amigos como se fossem meus filhotes." },
      { id: "ou-p3", text: "Observei um animal e senti uma conexão profunda com ele — é meu totem espiritual." },
      { id: "ou-p4", text: "Sou estranho em terras civilizadas e não conheço seus costumes." },
    ],
    ideals: [
      { id: "ou-i1", text: "Mudança. A vida é como as estações, em constante transformação." },
      { id: "ou-i2", text: "Natureza. O mundo natural é mais importante que as construções da civilização." },
      { id: "ou-i3", text: "Glória. Devo ganhar glória em batalha, para mim e meu clã." },
    ],
    bonds: [
      { id: "ou-b1", text: "Minha família, clã ou tribo é a coisa mais importante na minha vida." },
      { id: "ou-b2", text: "Sofri uma terrível derrota e quero vingança contra a força que me derrotou." },
    ],
    flaws: [
      { id: "ou-f1", text: "Sou lento em confiar em membros de outras raças, tribos e sociedades." },
      { id: "ou-f2", text: "A violência é minha resposta para quase todos os desafios." },
    ],
    equipment: [
      "Bordão",
      "Armadilha de caça",
      "Troféu de um animal",
      "Roupas de viajante",
      "Algibeira com 10 po",
    ],
  },
  {
    id: "sage",
    name: "Sábio",
    tagline: "Dedicado ao estudo e ao conhecimento",
    icon: GraduationCap,
    color: "#0984E3",
    skillProficiencies: ["Arcanismo", "História"],
    toolProficiencies: [],
    languages: 2,
    feature: {
      name: "Pesquisador",
      description:
        "Quando tenta aprender algo, se você não sabe a informação, geralmente sabe onde e de quem obtê-la.",
    },
    personalityTraits: [
      { id: "sa-p1", text: "Uso palavras polissilábicas que transmitem a impressão de grande erudição." },
      { id: "sa-p2", text: "Li todos os livros da maior biblioteca do mundo — ou gosto de me gabar disso." },
      { id: "sa-p3", text: "Estou acostumado a ajudar os que não são tão inteligentes, e pacientemente explico tudo." },
      { id: "sa-p4", text: "Não há nada que eu goste mais do que um bom mistério." },
    ],
    ideals: [
      { id: "sa-i1", text: "Conhecimento. O caminho para o poder é o conhecimento." },
      { id: "sa-i2", text: "Beleza. O que é belo nos aponta para o que é verdadeiro." },
      { id: "sa-i3", text: "Lógica. As emoções não devem turvar o pensamento lógico." },
    ],
    bonds: [
      { id: "sa-b1", text: "É meu dever proteger meus alunos." },
      { id: "sa-b2", text: "Possuo um texto antigo com segredos terríveis que não devem cair em mãos erradas." },
    ],
    flaws: [
      { id: "sa-f1", text: "Sou facilmente distraído pela promessa de informação." },
      { id: "sa-f2", text: "A maioria das pessoas grita e corre ao ver um demônio. Eu paro e tomo notas." },
    ],
    equipment: [
      "Pote de tinta preta",
      "Caneta-tinteiro",
      "Faca pequena",
      "Carta de universidade",
      "Roupas comuns",
      "Algibeira com 10 po",
    ],
  },
  {
    id: "sailor",
    name: "Marinheiro",
    tagline: "Veterano dos mares e oceanos",
    icon: Anchor,
    color: "#00CEC9",
    skillProficiencies: ["Atletismo", "Percepção"],
    toolProficiencies: ["Ferramentas de navegador", "Veículos aquáticos"],
    languages: 0,
    feature: {
      name: "Passagem de Navio",
      description:
        "Quando precisa, pode conseguir passagem gratuita em navios para você e seus companheiros.",
    },
    personalityTraits: [
      { id: "sl-p1", text: "Meus amigos sabem que podem contar comigo, não importa o quê." },
      { id: "sl-p2", text: "Trabalho duro para que possa jogar duro quando acabar." },
      { id: "sl-p3", text: "Gosto de velejar para novos portos e fazer novos amigos com uma caneca de cerveja." },
      { id: "sl-p4", text: "Estico a verdade para um bom conto." },
    ],
    ideals: [
      { id: "sl-i1", text: "Liberdade. O mar é liberdade — a liberdade de ir a qualquer lugar e fazer qualquer coisa." },
      { id: "sl-i2", text: "Justiça. Todos nós tripulamos o mesmo barco, puxamos o mesmo peso." },
    ],
    bonds: [
      { id: "sl-b1", text: "Sou leal ao meu capitão primeiro, a tudo mais depois." },
      { id: "sl-b2", text: "O navio é o mais importante — tripulantes e capitães vêm e vão." },
    ],
    flaws: [
      { id: "sl-f1", text: "Sigo ordens, mesmo que ache que estejam erradas." },
      { id: "sl-f2", text: "Quando começo a beber, fica difícil parar." },
    ],
    equipment: [
      "Bastão (clava)",
      "50 pés de corda de seda",
      "Amuleto de sorte",
      "Roupas comuns",
      "Algibeira com 10 po",
    ],
  },
  {
    id: "soldier",
    name: "Soldado",
    tagline: "Treinado para guerra e disciplina",
    icon: Shield,
    color: "#636E72",
    skillProficiencies: ["Atletismo", "Intimidação"],
    toolProficiencies: ["Jogo de azar", "Veículos terrestres"],
    languages: 0,
    feature: {
      name: "Patente Militar",
      description:
        "Soldados de sua antiga organização reconhecem sua autoridade e respeitam seu posto. Pode exercer influência sobre outros soldados.",
    },
    personalityTraits: [
      { id: "so-p1", text: "Sou sempre educado e respeitoso." },
      { id: "so-p2", text: "Sou assombrado por memórias de guerra. Não consigo tirar imagens de violência da cabeça." },
      { id: "so-p3", text: "Perdi muitos amigos e sou lento para fazer novos." },
      { id: "so-p4", text: "Tenho uma história para cada situação, inspirada em minhas experiências militares." },
    ],
    ideals: [
      { id: "so-i1", text: "Bem Maior. Nosso destino é dar nossas vidas na defesa dos outros." },
      { id: "so-i2", text: "Nação. Minha cidade, nação ou povo são tudo o que importa." },
      { id: "so-i3", text: "Força. A força é o que importa no final." },
    ],
    bonds: [
      { id: "so-b1", text: "Ainda lutaria e morreria por aqueles com quem servi." },
      { id: "so-b2", text: "Alguém me salvou a vida no campo de batalha. Nunca vou deixar essa dívida impaga." },
    ],
    flaws: [
      { id: "so-f1", text: "O inimigo monstruoso que enfrentamos em batalha ainda me dá pesadelos." },
      { id: "so-f2", text: "Tenho pouco respeito por quem não provou ser um bom guerreiro." },
    ],
    equipment: [
      "Insígnia de patente",
      "Troféu de um inimigo",
      "Conjunto de dados de osso",
      "Roupas comuns",
      "Algibeira com 10 po",
    ],
  },
  {
    id: "urchin",
    name: "Órfão",
    tagline: "Sobrevivente das ruas da cidade",
    icon: Footprints,
    color: "#B2BEC3",
    skillProficiencies: ["Prestidigitação", "Furtividade"],
    toolProficiencies: ["Kit de disfarce", "Ferramentas de ladrão"],
    languages: 0,
    feature: {
      name: "Segredos da Cidade",
      description:
        "Você conhece os padrões secretos e fluxo das cidades. Pode encontrar passagens por bairros urbanos duas vezes mais rápido.",
    },
    personalityTraits: [
      { id: "ur-p1", text: "Escondo restos de comida e bugigangas nos meus bolsos." },
      { id: "ur-p2", text: "Faço milhares de perguntas." },
      { id: "ur-p3", text: "Prefiro dormir de costas para a parede, com tudo que possuo em meus braços." },
      { id: "ur-p4", text: "Como um animal faminto, nunca sabendo quando será minha próxima refeição." },
    ],
    ideals: [
      { id: "ur-i1", text: "Respeito. Todas as pessoas merecem ser tratadas com dignidade." },
      { id: "ur-i2", text: "Comunidade. Temos que cuidar uns dos outros, porque ninguém mais vai." },
      { id: "ur-i3", text: "Mudança. Os de baixo serão os de cima." },
    ],
    bonds: [
      { id: "ur-b1", text: "Minha cidade é meu lar e lutarei para defendê-la." },
      { id: "ur-b2", text: "Tenho um benfeitor que me ajudou a sair das ruas. Devo-lhe minha vida." },
    ],
    flaws: [
      { id: "ur-f1", text: "Se estou em desvantagem numérica, vou fugir de uma luta." },
      { id: "ur-f2", text: "O ouro parece uma grande quantidade de dinheiro para mim, e farei quase qualquer coisa por mais." },
    ],
    equipment: [
      "Faca pequena",
      "Mapa da cidade onde cresceu",
      "Rato de estimação",
      "Lembrança dos pais",
      "Roupas comuns",
      "Algibeira com 10 po",
    ],
  },
];

// ─── Class Equipment Packs ──────────────────────────────

export const CLASS_EQUIPMENT_PACKS: ClassEquipmentPack[] = [
  {
    classId: "fighter",
    fixed: ["Armadura de cota de malha OU armadura de couro + arco longo + 20 flechas"],
    choices: [
      {
        id: "fighter-weapon",
        label: "Arma principal",
        options: [
          { id: "martial-shield", name: "Arma marcial + Escudo", items: ["Arma marcial (escolha)", "Escudo"] },
          { id: "two-martial", name: "Duas armas marciais", items: ["Arma marcial (escolha)", "Arma marcial (escolha)"] },
        ],
      },
      {
        id: "fighter-ranged",
        label: "Arma à distância",
        options: [
          { id: "light-crossbow", name: "Besta leve + 20 virotes", items: ["Besta leve", "20 virotes"] },
          { id: "two-handaxes", name: "Duas machadinhas", items: ["Machadinha", "Machadinha"] },
        ],
      },
      {
        id: "fighter-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "dungeoneer", name: "Pacote de Aventureiro", items: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações", "Cantil", "50 pés de corda"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "wizard",
    fixed: ["Grimório"],
    choices: [
      {
        id: "wizard-weapon",
        label: "Arma",
        options: [
          { id: "quarterstaff", name: "Bordão", items: ["Bordão"] },
          { id: "dagger", name: "Adaga", items: ["Adaga"] },
        ],
      },
      {
        id: "wizard-focus",
        label: "Foco",
        options: [
          { id: "component-pouch", name: "Bolsa de componentes", items: ["Bolsa de componentes"] },
          { id: "arcane-focus", name: "Foco arcano", items: ["Foco arcano"] },
        ],
      },
      {
        id: "wizard-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "scholar", name: "Pacote de Estudioso", items: ["Mochila", "Livro de saber", "Tinta", "Caneta", "10 folhas de pergaminho", "Saquinho de areia", "Faca pequena"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "rogue",
    fixed: ["Armadura de couro", "Duas adagas"],
    choices: [
      {
        id: "rogue-weapon",
        label: "Arma principal",
        options: [
          { id: "rapier", name: "Rapieira", items: ["Rapieira"] },
          { id: "shortsword", name: "Espada curta", items: ["Espada curta"] },
        ],
      },
      {
        id: "rogue-ranged",
        label: "Arma à distância",
        options: [
          { id: "shortbow", name: "Arco curto + 20 flechas", items: ["Arco curto", "20 flechas"] },
          { id: "shortsword-2", name: "Espada curta extra", items: ["Espada curta"] },
        ],
      },
      {
        id: "rogue-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "burglar", name: "Pacote de Assaltante", items: ["Mochila", "Saco de 1000 esferas", "10 pés de linha", "Sino", "5 velas", "Pé de cabra", "Martelo", "10 pítons", "Lanterna coberta", "2 frascos de óleo", "5 dias de rações", "Caixa de fogo", "Cantil", "50 pés de corda"] },
          { id: "dungeoneer", name: "Pacote de Aventureiro", items: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações", "Cantil", "50 pés de corda"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "cleric",
    fixed: ["Escudo", "Símbolo sagrado"],
    choices: [
      {
        id: "cleric-weapon",
        label: "Arma",
        options: [
          { id: "mace", name: "Maça", items: ["Maça"] },
          { id: "warhammer", name: "Martelo de guerra", items: ["Martelo de guerra"] },
        ],
      },
      {
        id: "cleric-armor",
        label: "Armadura",
        options: [
          { id: "scale-mail", name: "Brunea", items: ["Brunea"] },
          { id: "leather", name: "Armadura de couro", items: ["Armadura de couro"] },
          { id: "chain-mail", name: "Cota de malha", items: ["Cota de malha"] },
        ],
      },
      {
        id: "cleric-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "priest", name: "Pacote de Sacerdote", items: ["Mochila", "Cobertor", "10 velas", "Caixa de fogo", "Caixa de esmola", "2 blocos de incenso", "Incensário", "Vestimentas", "2 dias de rações", "Cantil"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "barbarian",
    fixed: ["4 azagaias"],
    choices: [
      {
        id: "barbarian-weapon",
        label: "Arma principal",
        options: [
          { id: "greataxe", name: "Machado grande", items: ["Machado grande"] },
          { id: "martial", name: "Arma marcial corpo-a-corpo", items: ["Arma marcial (escolha)"] },
        ],
      },
      {
        id: "barbarian-secondary",
        label: "Arma secundária",
        options: [
          { id: "two-handaxes", name: "Duas machadinhas", items: ["Machadinha", "Machadinha"] },
          { id: "simple", name: "Arma simples qualquer", items: ["Arma simples (escolha)"] },
        ],
      },
    ],
  },
  {
    classId: "bard",
    fixed: ["Armadura de couro", "Adaga"],
    choices: [
      {
        id: "bard-weapon",
        label: "Arma",
        options: [
          { id: "rapier", name: "Rapieira", items: ["Rapieira"] },
          { id: "longsword", name: "Espada longa", items: ["Espada longa"] },
          { id: "simple", name: "Arma simples", items: ["Arma simples (escolha)"] },
        ],
      },
      {
        id: "bard-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "diplomat", name: "Pacote de Diplomata", items: ["Baú", "2 estojos de mapas", "Roupas finas", "Frasco de tinta", "Caneta", "Lâmpada", "2 frascos de óleo", "5 folhas de papel", "Frasco de perfume", "Cera", "Sabão"] },
          { id: "entertainer", name: "Pacote de Artista", items: ["Mochila", "Saco de dormir", "2 trajes", "5 velas", "5 dias de rações", "Cantil", "Kit de disfarce"] },
        ],
      },
    ],
  },
  {
    classId: "druid",
    fixed: ["Escudo de madeira", "Foco druídico"],
    choices: [
      {
        id: "druid-weapon",
        label: "Arma",
        options: [
          { id: "scimitar", name: "Cimitarra", items: ["Cimitarra"] },
          { id: "simple-melee", name: "Arma simples corpo-a-corpo", items: ["Arma simples (escolha)"] },
        ],
      },
      {
        id: "druid-armor",
        label: "Armadura",
        options: [
          { id: "leather", name: "Armadura de couro", items: ["Armadura de couro"] },
          { id: "hide", name: "Gibão de peles", items: ["Gibão de peles"] },
        ],
      },
    ],
  },
  {
    classId: "monk",
    fixed: ["10 dardos"],
    choices: [
      {
        id: "monk-weapon",
        label: "Arma",
        options: [
          { id: "shortsword", name: "Espada curta", items: ["Espada curta"] },
          { id: "simple", name: "Arma simples", items: ["Arma simples (escolha)"] },
        ],
      },
      {
        id: "monk-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "dungeoneer", name: "Pacote de Aventureiro", items: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações", "Cantil", "50 pés de corda"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "paladin",
    fixed: ["Cota de malha", "Símbolo sagrado"],
    choices: [
      {
        id: "paladin-weapon",
        label: "Arma principal",
        options: [
          { id: "martial-shield", name: "Arma marcial + Escudo", items: ["Arma marcial (escolha)", "Escudo"] },
          { id: "two-martial", name: "Duas armas marciais", items: ["Arma marcial (escolha)", "Arma marcial (escolha)"] },
        ],
      },
      {
        id: "paladin-secondary",
        label: "Arma secundária",
        options: [
          { id: "javelins", name: "5 azagaias", items: ["Azagaia x5"] },
          { id: "simple-melee", name: "Arma simples corpo-a-corpo", items: ["Arma simples (escolha)"] },
        ],
      },
      {
        id: "paladin-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "priest", name: "Pacote de Sacerdote", items: ["Mochila", "Cobertor", "10 velas", "Caixa de fogo", "Caixa de esmola", "2 blocos de incenso", "Incensário", "Vestimentas", "2 dias de rações", "Cantil"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "ranger",
    fixed: [],
    choices: [
      {
        id: "ranger-armor",
        label: "Armadura",
        options: [
          { id: "scale-mail", name: "Brunea", items: ["Brunea"] },
          { id: "leather", name: "Armadura de couro", items: ["Armadura de couro"] },
        ],
      },
      {
        id: "ranger-weapon",
        label: "Arma corpo-a-corpo",
        options: [
          { id: "two-shortswords", name: "Duas espadas curtas", items: ["Espada curta", "Espada curta"] },
          { id: "two-simple", name: "Duas armas simples corpo-a-corpo", items: ["Arma simples (escolha)", "Arma simples (escolha)"] },
        ],
      },
      {
        id: "ranger-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "dungeoneer", name: "Pacote de Aventureiro", items: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações", "Cantil", "50 pés de corda"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "sorcerer",
    fixed: ["Duas adagas"],
    choices: [
      {
        id: "sorcerer-weapon",
        label: "Arma",
        options: [
          { id: "light-crossbow", name: "Besta leve + 20 virotes", items: ["Besta leve", "20 virotes"] },
          { id: "simple", name: "Arma simples", items: ["Arma simples (escolha)"] },
        ],
      },
      {
        id: "sorcerer-focus",
        label: "Foco",
        options: [
          { id: "component-pouch", name: "Bolsa de componentes", items: ["Bolsa de componentes"] },
          { id: "arcane-focus", name: "Foco arcano", items: ["Foco arcano"] },
        ],
      },
      {
        id: "sorcerer-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "dungeoneer", name: "Pacote de Aventureiro", items: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações", "Cantil", "50 pés de corda"] },
          { id: "explorer", name: "Pacote de Explorador", items: ["Mochila", "Saco de dormir", "Kit de refeição", "Caixa de fogo", "10 tochas", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
  {
    classId: "warlock",
    fixed: ["Armadura de couro", "Duas adagas"],
    choices: [
      {
        id: "warlock-weapon",
        label: "Arma",
        options: [
          { id: "light-crossbow", name: "Besta leve + 20 virotes", items: ["Besta leve", "20 virotes"] },
          { id: "simple", name: "Arma simples", items: ["Arma simples (escolha)"] },
        ],
      },
      {
        id: "warlock-focus",
        label: "Foco",
        options: [
          { id: "component-pouch", name: "Bolsa de componentes", items: ["Bolsa de componentes"] },
          { id: "arcane-focus", name: "Foco arcano", items: ["Foco arcano"] },
        ],
      },
      {
        id: "warlock-pack",
        label: "Pacote de equipamento",
        options: [
          { id: "scholar", name: "Pacote de Estudioso", items: ["Mochila", "Livro de saber", "Tinta", "Caneta", "10 folhas de pergaminho", "Saquinho de areia", "Faca pequena"] },
          { id: "dungeoneer", name: "Pacote de Aventureiro", items: ["Mochila", "Pé de cabra", "Martelo", "10 pítons", "10 tochas", "Caixa de fogo", "10 dias de rações", "Cantil", "50 pés de corda"] },
        ],
      },
    ],
  },
];
