// Rich Dataset for Additional Football Quiz Party Modes:
// Mode 2: Guess the Lineup (Starting XI)
// Mode 3: Top 10 Football Stats (Family Feud style)
// Mode 4: Career Path (Who Am I?)
// Mode 5: 4-Choice Football Trivia Speed Quiz
// Mode 6: 3x3 Footy Tic-Tac-Toe Grid

const LINEUPS = [
  {
    id: 'liv_2019_ucl',
    title: 'Liverpool - แชมป์ UCL 2019 (นัดชิงชนะสเปอร์ส 2-0)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Jürgen Klopp',
    formation: '4-3-3',
    clubColor: '#C8102E',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 13, flag: '🇧🇷', row: 4, col: 3, playerId: 'Alisson Becker', aliases: ['alisson', 'อลิสซอน'] },
      { slotId: 'rb', pos: 'RB', number: 66, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 5, playerId: 'Trent Alexander-Arnold', aliases: ['trent', 'taa', 'เทรนต์'] },
      { slotId: 'cb1', pos: 'CB', number: 32, flag: '🇨🇲', row: 3, col: 4, playerId: 'Joël Matip', aliases: ['matip', 'มาติป'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇳🇱', row: 3, col: 2, playerId: 'Virgil van Dijk', aliases: ['van dijk', 'vvd', 'ฟานไดจ์ค'] },
      { slotId: 'lb', pos: 'LB', number: 26, flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', row: 3, col: 1, playerId: 'Andrew Robertson', aliases: ['robertson', 'โรเบิร์ตสัน'] },
      { slotId: 'cm1', pos: 'CM', number: 14, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Jordan Henderson', aliases: ['henderson', 'เฮนเดอร์สัน'] },
      { slotId: 'cm2', pos: 'CDM', number: 3, flag: '🇧🇷', row: 2, col: 3, playerId: 'Fabinho', aliases: ['fabinho', 'ฟาบินโญ่'] },
      { slotId: 'cm3', pos: 'CM', number: 5, flag: '🇳🇱', row: 2, col: 2, playerId: 'Georginio Wijnaldum', aliases: ['wijnaldum', 'ไวจ์นัลดุม'] },
      { slotId: 'rw', pos: 'RW', number: 11, flag: '🇪🇬', row: 1, col: 5, playerId: 'Mohamed Salah', aliases: ['salah', 'ซาลาห์'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇧🇷', row: 1, col: 3, playerId: 'Roberto Firmino', aliases: ['firmino', 'ฟีร์มีโน่'] },
      { slotId: 'lw', pos: 'LW', number: 10, flag: '🇸🇳', row: 1, col: 1, playerId: 'Sadio Mané', aliases: ['mane', 'มาเน่'] }
    ]
  },
  {
    id: 'rma_2017_ucl',
    title: 'Real Madrid - แชมป์ UCL 2017 (ชนะยูเวนตุส 4-1)',
    subtitle: 'ระบบ 4-3-1-2 • กุนซือ: Zinedine Zidane',
    formation: '4-3-1-2',
    clubColor: '#00529F',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇨🇷', row: 4, col: 3, playerId: 'Keylor Navas', aliases: ['navas', 'นาบาส'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇪🇸', row: 3, col: 5, playerId: 'Dani Carvajal', aliases: ['carvajal', 'การ์บาฆาล'] },
      { slotId: 'cb1', pos: 'CB', number: 5, flag: '🇫🇷', row: 3, col: 4, playerId: 'Raphaël Varane', aliases: ['varane', 'วาราน'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇪🇸', row: 3, col: 2, playerId: 'Sergio Ramos', aliases: ['ramos', 'รามอส'] },
      { slotId: 'lb', pos: 'LB', number: 12, flag: '🇧🇷', row: 3, col: 1, playerId: 'Marcelo', aliases: ['marcelo', 'มาร์เซโล่'] },
      { slotId: 'cm1', pos: 'CM', number: 19, flag: '🇭🇷', row: 2, col: 5, playerId: 'Luka Modrić', aliases: ['modric', 'โมดริช'] },
      { slotId: 'cdm', pos: 'CDM', number: 14, flag: '🇧🇷', row: 2, col: 3, playerId: 'Casemiro', aliases: ['casemiro', 'คาเซมิโร่'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇩🇪', row: 2, col: 1, playerId: 'Toni Kroos', aliases: ['kroos', 'โครส'] },
      { slotId: 'cam', pos: 'CAM', number: 22, flag: '🇪🇸', row: 1, col: 3, playerId: 'Isco', aliases: ['isco', 'อิสโก้'] },
      { slotId: 'st1', pos: 'ST', number: 9, flag: '🇫🇷', row: 1, col: 4, playerId: 'Karim Benzema', aliases: ['benzema', 'เบนเซม่า'] },
      { slotId: 'st2', pos: 'ST', number: 7, flag: '🇵🇹', row: 1, col: 2, playerId: 'Cristiano Ronaldo', aliases: ['ronaldo', 'cr7', 'โรนัลโด้'] }
    ]
  },
  {
    id: 'bar_2015_ucl',
    title: 'Barcelona - สามแชมป์ 2015 ยุค MSN (ชนะยูเวนตุส 3-1)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Luis Enrique',
    formation: '4-3-3',
    clubColor: '#A50044',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇪', row: 4, col: 3, playerId: 'Marc-André ter Stegen', aliases: ['ter stegen', 'แทร์ สเตเก้น'] },
      { slotId: 'rb', pos: 'RB', number: 22, flag: '🇧🇷', row: 3, col: 5, playerId: 'Dani Alves', aliases: ['dani alves', 'ดานี่ อัลเวส'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇪🇸', row: 3, col: 4, playerId: 'Gerard Piqué', aliases: ['pique', 'ปิเก้'] },
      { slotId: 'cb2', pos: 'CB', number: 14, flag: '🇦🇷', row: 3, col: 2, playerId: 'Javier Mascherano', aliases: ['mascherano', 'มาสเคราโน่'] },
      { slotId: 'lb', pos: 'LB', number: 18, flag: '🇪🇸', row: 3, col: 1, playerId: 'Jordi Alba', aliases: ['jordi alba', 'อัลบา'] },
      { slotId: 'cm1', pos: 'CM', number: 4, flag: '🇭🇷', row: 2, col: 4, playerId: 'Ivan Rakitić', aliases: ['rakitic', 'ราคิติช'] },
      { slotId: 'cdm', pos: 'CDM', number: 5, flag: '🇪🇸', row: 2, col: 3, playerId: 'Sergio Busquets', aliases: ['busquets', 'บุสเกตส์'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇪🇸', row: 2, col: 2, playerId: 'Andrés Iniesta', aliases: ['iniesta', 'อิเนียสต้า'] },
      { slotId: 'rw', pos: 'RW', number: 10, flag: '🇦🇷', row: 1, col: 5, playerId: 'Lionel Messi', aliases: ['messi', 'เมสซี่'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇺🇾', row: 1, col: 3, playerId: 'Luis Suárez', aliases: ['suarez', 'ซัวเรซ'] },
      { slotId: 'lw', pos: 'LW', number: 11, flag: '🇧🇷', row: 1, col: 1, playerId: 'Neymar Jr', aliases: ['neymar', 'เนย์มาร์'] }
    ]
  },
  {
    id: 'mun_2008_ucl',
    title: 'Manchester United - แชมป์ UCL 2008 ที่มอสโก',
    subtitle: 'ระบบ 4-4-2 • กุนซือ: Sir Alex Ferguson',
    formation: '4-4-2',
    clubColor: '#DA291C',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇳🇱', row: 4, col: 3, playerId: 'Edwin van der Sar', aliases: ['van der sar', 'ฟานเดอร์ซาร์'] },
      { slotId: 'rb', pos: 'RB', number: 6, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 5, playerId: 'Wes Brown', aliases: ['wes brown', 'เวส บราวน์'] },
      { slotId: 'cb1', pos: 'CB', number: 5, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 4, playerId: 'Rio Ferdinand', aliases: ['ferdinand', 'ริโอ'] },
      { slotId: 'cb2', pos: 'CB', number: 15, flag: '🇷🇸', row: 3, col: 2, playerId: 'Nemanja Vidić', aliases: ['vidic', 'วิดิช'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇫🇷', row: 3, col: 1, playerId: 'Patrice Evra', aliases: ['evra', 'เอฟร่า'] },
      { slotId: 'rm', pos: 'RM', number: 4, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 5, playerId: 'Owen Hargreaves', aliases: ['hargreaves', 'ฮาร์กรีฟส์'] },
      { slotId: 'cm1', pos: 'CM', number: 18, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Paul Scholes', aliases: ['scholes', 'สโคลส์'] },
      { slotId: 'cm2', pos: 'CM', number: 16, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 2, playerId: 'Michael Carrick', aliases: ['carrick', 'คาร์ริค'] },
      { slotId: 'lm', pos: 'LM', number: 7, flag: '🇵🇹', row: 2, col: 1, playerId: 'Cristiano Ronaldo', aliases: ['ronaldo', 'cr7', 'โรนัลโด้'] },
      { slotId: 'st1', pos: 'ST', number: 10, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 4, playerId: 'Wayne Rooney', aliases: ['rooney', 'รูนี่ย์'] },
      { slotId: 'st2', pos: 'ST', number: 32, flag: '🇦🇷', row: 1, col: 2, playerId: 'Carlos Tevez', aliases: ['tevez', 'เตเวซ'] }
    ]
  },
  {
    id: 'mci_2023_ucl',
    title: 'Manchester City - สามแชมป์ประวัติศาสตร์ 2023',
    subtitle: 'ระบบ 3-2-4-1 • กุนซือ: Pep Guardiola',
    formation: '3-2-4-1',
    clubColor: '#6CABDD',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 31, flag: '🇧🇷', row: 4, col: 3, playerId: 'Ederson', aliases: ['ederson', 'เอแดร์ซอน'] },
      { slotId: 'cb1', pos: 'CB', number: 25, flag: '🇨🇭', row: 3, col: 5, playerId: 'Manuel Akanji', aliases: ['akanji', 'อคานจี'] },
      { slotId: 'cb2', pos: 'CB', number: 3, flag: '🇵🇹', row: 3, col: 3, playerId: 'Rúben Dias', aliases: ['ruben dias', 'รูเบน ดิอาส'] },
      { slotId: 'cb3', pos: 'CB', number: 6, flag: '🇳🇱', row: 3, col: 1, playerId: 'Nathan Aké', aliases: ['ake', 'อาเก้'] },
      { slotId: 'cdm1', pos: 'CDM', number: 5, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'John Stones', aliases: ['stones', 'สโตนส์'] },
      { slotId: 'cdm2', pos: 'CDM', number: 16, flag: '🇪🇸', row: 2, col: 2, playerId: 'Rodri', aliases: ['rodri', 'โรดรี้'] },
      { slotId: 'rw', pos: 'RW', number: 20, flag: '🇵🇹', row: 1, col: 5, playerId: 'Bernardo Silva', aliases: ['bernardo', 'แบร์นาร์โด้'] },
      { slotId: 'cam1', pos: 'CAM', number: 17, flag: '🇧🇪', row: 2, col: 5, playerId: 'Kevin De Bruyne', aliases: ['de bruyne', 'kdb', 'เดอบรอยน์'] },
      { slotId: 'cam2', pos: 'CAM', number: 8, flag: '🇩🇪', row: 2, col: 1, playerId: 'İlkay Gündoğan', aliases: ['gundogan', 'กุนโดกัน'] },
      { slotId: 'lw', pos: 'LW', number: 10, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 1, playerId: 'Jack Grealish', aliases: ['grealish', 'กรีลิช'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇳🇴', row: 1, col: 3, playerId: 'Erling Haaland', aliases: ['haaland', 'ฮาแลนด์'] }
    ]
  },
  {
    id: 'ars_2004_invincibles',
    title: 'Arsenal - ชุดแชมป์ไร้พ่าย The Invincibles 2003/04',
    subtitle: 'ระบบ 4-4-2 • กุนซือ: Arsène Wenger',
    formation: '4-4-2',
    clubColor: '#EF0107',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇪', row: 4, col: 3, playerId: 'Jens Lehmann', aliases: ['lehmann', 'เลห์มันน์'] },
      { slotId: 'rb', pos: 'RB', number: 12, flag: '🇨🇲', row: 3, col: 5, playerId: 'Lauren', aliases: ['lauren', 'ลอเรน'] },
      { slotId: 'cb1', pos: 'CB', number: 28, flag: '🇨🇮', row: 3, col: 4, playerId: 'Kolo Touré', aliases: ['kolo toure', 'โคโล่ ตูเร่'] },
      { slotId: 'cb2', pos: 'CB', number: 23, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 2, playerId: 'Sol Campbell', aliases: ['campbell', 'แคมป์เบลล์'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 1, playerId: 'Ashley Cole', aliases: ['ashley cole', 'แอชลีย์ โคล'] },
      { slotId: 'rm', pos: 'RM', number: 8, flag: '🇸🇪', row: 2, col: 5, playerId: 'Freddie Ljungberg', aliases: ['ljungberg', 'ลุงเบิร์ก'] },
      { slotId: 'cm1', pos: 'CM', number: 4, flag: '🇫🇷', row: 2, col: 4, playerId: 'Patrick Vieira', aliases: ['vieira', 'วิเอร่า'] },
      { slotId: 'cm2', pos: 'CM', number: 19, flag: '🇧🇷', row: 2, col: 2, playerId: 'Gilberto Silva', aliases: ['gilberto silva', 'จิลแบร์โต้ ซิลวา'] },
      { slotId: 'lm', pos: 'LM', number: 7, flag: '🇫🇷', row: 2, col: 1, playerId: 'Robert Pirès', aliases: ['pires', 'ปิแรส'] },
      { slotId: 'st1', pos: 'CF', number: 10, flag: '🇳🇱', row: 1, col: 4, playerId: 'Dennis Bergkamp', aliases: ['bergkamp', 'เบิร์กแคมป์'] },
      { slotId: 'st2', pos: 'ST', number: 14, flag: '🇫🇷', row: 1, col: 2, playerId: 'Thierry Henry', aliases: ['henry', 'อองรี'] }
    ]
  }
];

const TOP10_LISTS = [
  {
    id: 'pl_top_scorers',
    title: '10 อันดับดาวซัลโวสูงสุดตลอดกาล พรีเมียร์ลีก อังกฤษ',
    category: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League All-Time Top Scorers',
    items: [
      { rank: 1, name: 'Alan Shearer', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '260 ประตู', points: 100, aliases: ['shearer', 'เชียเรอร์'] },
      { rank: 2, name: 'Harry Kane', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '213 ประตู', points: 100, aliases: ['kane', 'เคน'] },
      { rank: 3, name: 'Wayne Rooney', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '208 ประตู', points: 110, aliases: ['rooney', 'รูนี่ย์'] },
      { rank: 4, name: 'Andy Cole', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '187 ประตู', points: 130, aliases: ['andy cole', 'แอนดี้ โคล'] },
      { rank: 5, name: 'Sergio Agüero', flag: '🇦🇷', stat: '184 ประตู', points: 120, aliases: ['aguero', 'กุน', 'อเกวโร่'] },
      { rank: 6, name: 'Frank Lampard', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '177 ประตู', points: 130, aliases: ['lampard', 'แลมพาร์ด'] },
      { rank: 7, name: 'Thierry Henry', flag: '🇫🇷', stat: '175 ประตู', points: 120, aliases: ['henry', 'อองรี'] },
      { rank: 8, name: 'Mohamed Salah', flag: '🇪🇬', stat: '170+ ประตู', points: 110, aliases: ['salah', 'ซาลาห์'] },
      { rank: 9, name: 'Robbie Fowler', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '163 ประตู', points: 140, aliases: ['fowler', 'ฟาวเลอร์'] },
      { rank: 10, name: 'Jermain Defoe', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '162 ประตู', points: 150, aliases: ['defoe', 'เดโฟ'] }
    ]
  },
  {
    id: 'ucl_top_scorers',
    title: '10 อันดับดาวซัลโวสูงสุดตลอดกาล ยูฟ่า แชมเปียนส์ลีก (UCL)',
    category: '🏆 UEFA Champions League All-Time Top Scorers',
    items: [
      { rank: 1, name: 'Cristiano Ronaldo', flag: '🇵🇹', stat: '140 ประตู', points: 100, aliases: ['ronaldo', 'cr7', 'โรนัลโด้'] },
      { rank: 2, name: 'Lionel Messi', flag: '🇦🇷', stat: '129 ประตู', points: 100, aliases: ['messi', 'เมสซี่'] },
      { rank: 3, name: 'Robert Lewandowski', flag: '🇵🇱', stat: '101+ ประตู', points: 110, aliases: ['lewandowski', 'เลวานดอฟสกี้'] },
      { rank: 4, name: 'Karim Benzema', flag: '🇫🇷', stat: '90 ประตู', points: 110, aliases: ['benzema', 'เบนเซม่า'] },
      { rank: 5, name: 'Raúl González', flag: '🇪🇸', stat: '71 ประตู', points: 130, aliases: ['raul', 'ราอูล'] },
      { rank: 6, name: 'Thomas Müller', flag: '🇩🇪', stat: '55+ ประตู', points: 130, aliases: ['muller', 'มุลเลอร์'] },
      { rank: 7, name: 'Ruud van Nistelrooy', flag: '🇳🇱', stat: '56 ประตู', points: 140, aliases: ['van nistelrooy', 'ฟานนิสเตลรอย'] },
      { rank: 8, name: 'Kylian Mbappé', flag: '🇫🇷', stat: '50+ ประตู', points: 120, aliases: ['mbappe', 'เอ็มบัปเป้'] },
      { rank: 9, name: 'Thierry Henry', flag: '🇫🇷', stat: '50 ประตู', points: 130, aliases: ['henry', 'อองรี'] },
      { rank: 10, name: 'Zlatan Ibrahimović', flag: '🇸🇪', stat: '48 ประตู', points: 140, aliases: ['ibrahimovic', 'zlatan', 'อิบราฮิโมวิช'] }
    ]
  },
  {
    id: 'most_expensive_transfers',
    title: '10 อันดับนักเตะค่าตัวแพงที่สุดในประวัติศาสตร์ลูกหนัง',
    category: '💰 Most Expensive Football Transfers Ever',
    items: [
      { rank: 1, name: 'Neymar Jr', flag: '🇧🇷', stat: '€222M (ไป PSG)', points: 100, aliases: ['neymar', 'เนย์มาร์'] },
      { rank: 2, name: 'Kylian Mbappé', flag: '🇫🇷', stat: '€180M (ไป PSG)', points: 100, aliases: ['mbappe', 'เอ็มบัปเป้'] },
      { rank: 3, name: 'Philippe Coutinho', flag: '🇧🇷', stat: '€135M (ไป Barcelona)', points: 110, aliases: ['coutinho', 'คูตินโญ่'] },
      { rank: 4, name: 'Ousmane Dembélé', flag: '🇫🇷', stat: '€135M (ไป Barcelona)', points: 120, aliases: ['dembele', 'เดมเบเล่'] },
      { rank: 5, name: 'João Félix', flag: '🇵🇹', stat: '€127M (ไป Atlético)', points: 120, aliases: ['joao felix', 'ชูเอา เฟลิกซ์'] },
      { rank: 6, name: 'Enzo Fernández', flag: '🇦🇷', stat: '€121M (ไป Chelsea)', points: 120, aliases: ['enzo', 'เอ็นโซ่'] },
      { rank: 7, name: 'Antoine Griezmann', flag: '🇫🇷', stat: '€120M (ไป Barcelona)', points: 130, aliases: ['griezmann', 'กรีซมันน์'] },
      { rank: 8, name: 'Jack Grealish', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '€117.5M (ไป Man City)', points: 120, aliases: ['grealish', 'กรีลิช'] },
      { rank: 9, name: 'Declan Rice', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '€116.6M (ไป Arsenal)', points: 120, aliases: ['rice', 'ไรซ์'] },
      { rank: 10, name: 'Moisés Caicedo', flag: '🇪🇨', stat: '€116M (ไป Chelsea)', points: 130, aliases: ['caicedo', 'ไคเซโด้'] }
    ]
  },
  {
    id: 'pl_top_assists',
    title: '10 อันดับจอมแอสซิสต์สูงสุดตลอดกาล พรีเมียร์ลีก',
    category: '🎯 Premier League All-Time Top Assists',
    items: [
      { rank: 1, name: 'Ryan Giggs', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', stat: '162 แอสซิสต์', points: 100, aliases: ['giggs', 'กิ๊กส์'] },
      { rank: 2, name: 'Kevin De Bruyne', flag: '🇧🇪', stat: '114+ แอสซิสต์', points: 100, aliases: ['de bruyne', 'kdb', 'เดอบรอยน์'] },
      { rank: 3, name: 'Cesc Fàbregas', flag: '🇪🇸', stat: '111 แอสซิสต์', points: 110, aliases: ['fabregas', 'ฟาเบรกาส'] },
      { rank: 4, name: 'Wayne Rooney', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '103 แอสซิสต์', points: 120, aliases: ['rooney', 'รูนี่ย์'] },
      { rank: 5, name: 'Frank Lampard', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '102 แอสซิสต์', points: 120, aliases: ['lampard', 'แลมพาร์ด'] },
      { rank: 6, name: 'Dennis Bergkamp', flag: '🇳🇱', stat: '94 แอสซิสต์', points: 130, aliases: ['bergkamp', 'เบิร์กแคมป์'] },
      { rank: 7, name: 'David Silva', flag: '🇪🇸', stat: '93 แอสซิสต์', points: 130, aliases: ['david silva', 'ดาบิด ซิลบา'] },
      { rank: 8, name: 'Steven Gerrard', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '92 แอสซิสต์', points: 120, aliases: ['gerrard', 'เจอร์ราร์ด'] },
      { rank: 9, name: 'James Milner', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stat: '89 แอสซิสต์', points: 140, aliases: ['milner', 'มิลเนอร์'] },
      { rank: 10, name: 'Mohamed Salah', flag: '🇪🇬', stat: '80+ แอสซิสต์', points: 120, aliases: ['salah', 'ซาลาห์'] }
    ]
  }
];

const CAREER_PATHS = [
  {
    id: 'cp_zlatan',
    answerName: 'Zlatan Ibrahimović',
    flag: '🇸🇪',
    position: 'FW',
    aliases: ['ibra', 'zlatan', 'ibrahimovic', 'อิบราฮิโมวิช'],
    hint: 'กองหน้าจอมคาราเต้สายดำผู้คว้าแชมป์ลีกมาแล้วทั่วยุโรป',
    steps: [
      { years: '1999–2001', club: 'Malmö FF', apps: 40, goals: 16 },
      { years: '2001–2004', club: 'Ajax', apps: 74, goals: 35 },
      { years: '2004–2006', club: 'Juventus', apps: 70, goals: 23 },
      { years: '2006–2009', club: 'Inter Milan', apps: 88, goals: 57 },
      { years: '2009–2011', club: 'Barcelona', apps: 29, goals: 16 },
      { years: '2010–2012', club: 'AC Milan', apps: 61, goals: 42 },
      { years: '2012–2016', club: 'Paris Saint-Germain', apps: 122, goals: 113 },
      { years: '2016–2018', club: 'Manchester United', apps: 33, goals: 17 }
    ]
  },
  {
    id: 'cp_ronaldo_cr7',
    answerName: 'Cristiano Ronaldo',
    flag: '🇵🇹',
    position: 'FW',
    aliases: ['cr7', 'ronaldo', 'โรนัลโด้'],
    hint: 'เจ้าของรางวัลบัลลงดอร์ 5 สมัย และท่าดีใจ SIUUU!',
    steps: [
      { years: '2002–2003', club: 'Sporting CP', apps: 25, goals: 3 },
      { years: '2003–2009', club: 'Manchester United', apps: 196, goals: 84 },
      { years: '2009–2018', club: 'Real Madrid', apps: 292, goals: 311 },
      { years: '2018–2021', club: 'Juventus', apps: 98, goals: 81 },
      { years: '2021–2022', club: 'Manchester United', apps: 40, goals: 19 },
      { years: '2023–ปัจจุบัน', club: 'Al-Nassr', apps: 60, goals: 58 }
    ]
  },
  {
    id: 'cp_salah',
    answerName: 'Mohamed Salah',
    flag: '🇪🇬',
    position: 'FW',
    aliases: ['salah', 'ซาลาห์', 'บังโม'],
    hint: 'Egyptian King ปีกขวาตัวจบสกอร์แห่งแอนฟิลด์',
    steps: [
      { years: '2012–2014', club: 'FC Basel', apps: 47, goals: 9 },
      { years: '2014–2016', club: 'Chelsea', apps: 13, goals: 2 },
      { years: '2015 (ยืมตัว)', club: 'Fiorentina', apps: 16, goals: 6 },
      { years: '2015–2017', club: 'AS Roma', apps: 65, goals: 29 },
      { years: '2017–ปัจจุบัน', club: 'Liverpool', apps: 265, goals: 165 }
    ]
  },
  {
    id: 'cp_debruyne',
    answerName: 'Kevin De Bruyne',
    flag: '🇧🇪',
    position: 'MF',
    aliases: ['de bruyne', 'kdb', 'เดอบรอยน์'],
    hint: 'จอมทัพเพลย์เมกเกอร์ชาวเบลเยียมผู้จ่ายบอลคมกริบที่สุดในยุคนี้',
    steps: [
      { years: '2008–2012', club: 'Genk', apps: 84, goals: 14 },
      { years: '2012–2014', club: 'Chelsea', apps: 3, goals: 0 },
      { years: '2012–2013 (ยืมตัว)', club: 'Werder Bremen', apps: 33, goals: 10 },
      { years: '2014–2015', club: 'VfL Wolfsburg', apps: 51, goals: 13 },
      { years: '2015–ปัจจุบัน', club: 'Manchester City', apps: 260, goals: 68 }
    ]
  },
  {
    id: 'cp_lewandowski',
    answerName: 'Robert Lewandowski',
    flag: '🇵🇱',
    position: 'FW',
    aliases: ['lewandowski', 'lewy', 'เลวานดอฟสกี้'],
    hint: 'เคยลงมาเป็นตัวสำรองแล้วยิง 5 ประตูใน 9 นาที!',
    steps: [
      { years: '2008–2010', club: 'Lech Poznań', apps: 58, goals: 32 },
      { years: '2010–2014', club: 'Borussia Dortmund', apps: 131, goals: 74 },
      { years: '2014–2022', club: 'Bayern Munich', apps: 253, goals: 238 },
      { years: '2022–ปัจจุบัน', club: 'Barcelona', apps: 80, goals: 55 }
    ]
  },
  {
    id: 'cp_lukaku',
    answerName: 'Romelu Lukaku',
    flag: '🇧🇪',
    position: 'FW',
    aliases: ['lukaku', 'ลูกากู'],
    hint: 'กองหน้าดาวยิงสูงสุดตลอดกาลทีมชาติเบลเยียมที่ย้ายทีมค่าตัวรวมแพงระดับโลก',
    steps: [
      { years: '2009–2011', club: 'Anderlecht', apps: 73, goals: 33 },
      { years: '2011–2014', club: 'Chelsea', apps: 10, goals: 0 },
      { years: '2013–2017', club: 'Everton', apps: 141, goals: 68 },
      { years: '2017–2019', club: 'Manchester United', apps: 66, goals: 28 },
      { years: '2019–2021', club: 'Inter Milan', apps: 72, goals: 47 },
      { years: '2021–2024', club: 'Chelsea / Inter / AS Roma', apps: 70, goals: 31 },
      { years: '2024–ปัจจุบัน', club: 'Napoli', apps: 15, goals: 7 }
    ]
  },
  {
    id: 'cp_dimaria',
    answerName: 'Ángel Di María',
    flag: '🇦🇷',
    position: 'FW',
    aliases: ['di maria', 'ดิมาเรีย'],
    hint: 'ปีกชาวอาร์เจนไตน์ผู้ยิงประตูในนัดชิงชนะเลิศทั้ง Copa América และฟุตบอลโลก 2022',
    steps: [
      { years: '2007–2010', club: 'Benfica', apps: 76, goals: 7 },
      { years: '2010–2014', club: 'Real Madrid', apps: 124, goals: 22 },
      { years: '2014–2015', club: 'Manchester United', apps: 27, goals: 3 },
      { years: '2015–2022', club: 'Paris Saint-Germain', apps: 197, goals: 56 },
      { years: '2022–2023', club: 'Juventus', apps: 26, goals: 4 }
    ]
  },
  {
    id: 'cp_hakimi',
    answerName: 'Achraf Hakimi',
    flag: '🇲🇦',
    position: 'DF',
    aliases: ['hakimi', 'ฮาคิมี่'],
    hint: 'แบ็กขวาความเร็วจัดจ้านชาวโมร็อกโกที่ผ่านการเล่นให้สโมสรยักษ์ใหญ่ 4 ลีก',
    steps: [
      { years: '2017–2020', club: 'Real Madrid', apps: 9, goals: 2 },
      { years: '2018–2020 (ยืมตัว)', club: 'Borussia Dortmund', apps: 54, goals: 7 },
      { years: '2020–2021', club: 'Inter Milan', apps: 37, goals: 7 },
      { years: '2021–ปัจจุบัน', club: 'Paris Saint-Germain', apps: 100, goals: 14 }
    ]
  }
];

const TRIVIA_QUESTIONS = [
  {
    id: 'tr_1',
    question: 'สโมสรใดคว้าแชมป์ ยูฟ่า แชมเปียนส์ลีก (รวมยูโรเปียนคัพ) มากที่สุดเป็นอันดับ 2 รองจาก เรอัล มาดริด?',
    options: ['Liverpool (6 สมัย)', 'AC Milan (7 สมัย)', 'Bayern Munich (6 สมัย)', 'Barcelona (5 สมัย)'],
    correctIndex: 1,
    explanation: 'AC Milan คว้าแชมป์ไปถึง 7 สมัย รองจาก Real Madrid (15 สมัย)'
  },
  {
    id: 'tr_2',
    question: 'ใครคือผู้เล่นที่ทำ "แฮตทริกเร็วที่สุด" ในประวัติศาสตร์พรีเมียร์ลีก อังกฤษ (ใช้เวลาเพียง 2 นาที 56 วินาที)?',
    options: ['Sadio Mané', 'Robbie Fowler', 'Sergio Agüero', 'Erling Haaland'],
    correctIndex: 0,
    explanation: 'Sadio Mané ทำแฮตทริกในเวลา 2 นาที 56 วินาที สมัยอยู่ Southampton นัดพบ Aston Villa ปี 2015'
  },
  {
    id: 'tr_3',
    question: 'ในนัดชิงชนะเลิศฟุตบอลโลก 2022 (อาร์เจนตินา ชนะจุดโทษ ฝรั่งเศส) คีลิยัน เอ็มบัปเป้ ยิงในเวลา 120 นาทีไปกี่ประตู?',
    options: ['2 ประตู', '3 ประตู (แฮตทริก)', '4 ประตู', '1 ประตู'],
    correctIndex: 1,
    explanation: 'Mbappé ยิงแฮตทริก 3 ประตูในเกมนัดชิงบอลโลก 2022 (เป็นคนที่ 2 ในประวัติศาสตร์ต่อจาก Geoff Hurst ปี 1966)'
  },
  {
    id: 'tr_4',
    question: 'สโมสรเดียวในพรีเมียร์ลีกยุค 38 นัด ที่คว้าแชมป์โดย "ไม่แพ้ใครเลยตลอดทั้งฤดูกาล" (ชนะ 26 เสมอ 12) คือทีมใด?',
    options: ['Chelsea (2004/05)', 'Manchester United (1998/99)', 'Arsenal (2003/04)', 'Manchester City (2017/18)'],
    correctIndex: 2,
    explanation: 'Arsenal ยุคไร้พ่าย (The Invincibles 2003/04) จบฤดูกาลด้วยสถิติ ชนะ 26 เสมอ 12 แพ้ 0'
  },
  {
    id: 'tr_5',
    question: 'นักเตะคนใดเป็นเจ้าของสถิติยิงประตูใน 1 ปีปฏิทิน (Calendar Year) สูงที่สุดในโลกถึง 91 ประตู ในปี 2012?',
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Gerd Müller'],
    correctIndex: 1,
    explanation: 'Lionel Messi ยิงไปถึง 91 ประตูในปี 2012 ทำลายสถิติเดิมของ Gerd Müller (85 ประตู)'
  },
  {
    id: 'tr_6',
    question: 'สโมสรใดคว้าแชมป์ บุนเดสลีกา เยอรมนี ฤดูกาล 2023/24 แบบไร้พ่ายตลอดทั้งฤดูกาลเป็นครั้งแรกในประวัติศาสตร์ลีก?',
    options: ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig'],
    correctIndex: 2,
    explanation: 'Bayer Leverkusen ของกุนซือ Xabi Alonso คว้าแชมป์บุนเดสลีกา 2023/24 แบบไม่แพ้ใครเลยตลอด 34 นัด'
  },
  {
    id: 'tr_7',
    question: 'ใครคือผู้ยิงประตูชัยในนาที 93:20 พา แมนเชสเตอร์ ซิตี้ แซงคว้าแชมป์พรีเมียร์ลีกปี 2011/12?',
    options: ['Edin Džeko', 'David Silva', 'Yaya Touré', 'Sergio Agüero'],
    correctIndex: 3,
    explanation: 'Sergio "Kun" Agüero ยิงประตูชัยนาที 93:20 ในเกมชนะ QPR 3-2 ("AGUEROOOO!")'
  },
  {
    id: 'tr_8',
    question: 'ผู้รักษาประตูคนเดียวในประวัติศาสตร์ที่เคยคว้ารางวัล บัลลงดอร์ (Ballon d\'Or) มาครองได้คือใคร?',
    options: ['Lev Yashin', 'Gianluigi Buffon', 'Manuel Neuer', 'Iker Casillas'],
    correctIndex: 0,
    explanation: 'Lev Yashin ตำนานนายทวารฉายา "แมงมุมดำ" แห่งสหภาพโซเวียต คว้าบัลลงดอร์ในปี 1963'
  }
];

const FOOTY_GRIDS = [
  {
    id: 'grid_1',
    title: 'ตาราง XO มหาอำนาจยุโรป #1',
    cols: [
      { type: 'club', id: 'real_madrid', label: 'Real Madrid', sub: '🇪🇸 เรอัล มาดริด' },
      { type: 'club', id: 'chelsea', label: 'Chelsea', sub: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 เชลซี' },
      { type: 'club', id: 'psg', label: 'PSG', sub: '🇫🇷 เปแอสเช' }
    ],
    rows: [
      { type: 'club', id: 'man_utd', label: 'Man United', sub: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 แมนยู' },
      { type: 'club', id: 'ac_milan', label: 'AC Milan', sub: '🇮🇹 เอซี มิลาน' },
      { type: 'club', id: 'barcelona', label: 'Barcelona', sub: '🇪🇸 บาร์เซโลน่า' }
    ]
  },
  {
    id: 'grid_2',
    title: 'ตาราง XO พรีเมียร์ลีก ปะทะ ยุโรป #2',
    cols: [
      { type: 'club', id: 'arsenal', label: 'Arsenal', sub: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 อาร์เซนอล' },
      { type: 'club', id: 'man_city', label: 'Man City', sub: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 แมนซิตี้' },
      { type: 'club', id: 'liverpool', label: 'Liverpool', sub: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ลิเวอร์พูล' }
    ],
    rows: [
      { type: 'club', id: 'barcelona', label: 'Barcelona', sub: '🇪🇸 บาร์เซโลน่า' },
      { type: 'club', id: 'bayern', label: 'Bayern Munich', sub: '🇩🇪 บาเยิร์น' },
      { type: 'club', id: 'inter_milan', label: 'Inter Milan', sub: '🇮🇹 อินเตอร์ มิลาน' }
    ]
  },
  {
    id: 'grid_3',
    title: 'ตาราง XO สโมสร x สัญชาติระดับโลก #3',
    cols: [
      { type: 'club', id: 'juventus', label: 'Juventus', sub: '🇮🇹 ยูเวนตุส' },
      { type: 'club', id: 'real_madrid', label: 'Real Madrid', sub: '🇪🇸 เรอัล มาดริด' },
      { type: 'club', id: 'man_utd', label: 'Man United', sub: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 แมนยู' }
    ],
    rows: [
      { type: 'flag', id: '🇫🇷', label: '🇫🇷 ฝรั่งเศส', sub: 'ทีมชาติฝรั่งเศส' },
      { type: 'flag', id: '🇧🇷', label: '🇧🇷 บราซิล', sub: 'ทีมชาติบราซิล' },
      { type: 'flag', id: '🇦🇷', label: '🇦🇷 อาร์เจนตินา', sub: 'ทีมชาติอาร์เจนตินา' }
    ]
  }
];

module.exports = {
  LINEUPS,
  TOP10_LISTS,
  CAREER_PATHS,
  TRIVIA_QUESTIONS,
  FOOTY_GRIDS
};
