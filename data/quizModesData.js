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
  },
  {
    id: 'arg_2022_wc',
    title: '🇦🇷 ทีมชาติอาร์เจนตินา - แชมป์ฟุตบอลโลก 2022 (นัดชิงชนะฝรั่งเศส)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Lionel Scaloni',
    formation: '4-3-3',
    clubColor: '#38BDF8',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 23, flag: '🇦🇷', row: 4, col: 3, playerId: 'Emiliano Martínez', aliases: ['emiliano martinez', 'dibu martinez', 'martinez', 'เอมิเลียโน่ มาร์ติเนซ', 'ดิบู'] },
      { slotId: 'rb', pos: 'RB', number: 26, flag: '🇦🇷', row: 3, col: 5, playerId: 'Nahuel Molina', aliases: ['molina', 'โมลิน่า'] },
      { slotId: 'cb1', pos: 'CB', number: 13, flag: '🇦🇷', row: 3, col: 4, playerId: 'Cristian Romero', aliases: ['romero', 'cuti romero', 'โรเมโร่'] },
      { slotId: 'cb2', pos: 'CB', number: 19, flag: '🇦🇷', row: 3, col: 2, playerId: 'Nicolás Otamendi', aliases: ['otamendi', 'โอตาเมนดี้'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇦🇷', row: 3, col: 1, playerId: 'Nicolás Tagliafico', aliases: ['tagliafico', 'ตากลียาฟิโก้'] },
      { slotId: 'cm1', pos: 'CM', number: 7, flag: '🇦🇷', row: 2, col: 4, playerId: 'Rodrigo De Paul', aliases: ['de paul', 'เดอ ปอล'] },
      { slotId: 'cdm', pos: 'CDM', number: 24, flag: '🇦🇷', row: 2, col: 3, playerId: 'Enzo Fernández', aliases: ['enzo', 'enzo fernandez', 'เอ็นโซ่'] },
      { slotId: 'cm2', pos: 'CM', number: 20, flag: '🇦🇷', row: 2, col: 2, playerId: 'Alexis Mac Allister', aliases: ['mac allister', 'แม็ค อัลลิสเตอร์'] },
      { slotId: 'rw', pos: 'RW', number: 10, flag: '🇦🇷', row: 1, col: 5, playerId: 'Lionel Messi', aliases: ['messi', 'เมสซี่'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇦🇷', row: 1, col: 3, playerId: 'Julián Álvarez', aliases: ['julian alvarez', 'alvarez', 'ฮูเลียน อัลวาเรซ', 'อัลวาเรซ'] },
      { slotId: 'lw', pos: 'LW', number: 11, flag: '🇦🇷', row: 1, col: 1, playerId: 'Ángel Di María', aliases: ['di maria', 'ดิ มาเรีย'] }
    ]
  },
  {
    id: 'fra_2018_wc',
    title: '🇫🇷 ทีมชาติฝรั่งเศส - แชมป์ฟุตบอลโลก 2018 (นัดชิงชนะโครเอเชีย 4-2)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Didier Deschamps',
    formation: '4-2-3-1',
    clubColor: '#1E3A8A',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇫🇷', row: 4, col: 3, playerId: 'Hugo Lloris', aliases: ['lloris', 'ญอริส', 'ยอริส'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇫🇷', row: 3, col: 5, playerId: 'Benjamin Pavard', aliases: ['pavard', 'ปาวาร์'] },
      { slotId: 'cb1', pos: 'CB', number: 4, flag: '🇫🇷', row: 3, col: 4, playerId: 'Raphaël Varane', aliases: ['varane', 'วาราน'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🇫🇷', row: 3, col: 2, playerId: 'Samuel Umtiti', aliases: ['umtiti', 'อุมติตี้'] },
      { slotId: 'lb', pos: 'LB', number: 21, flag: '🇫🇷', row: 3, col: 1, playerId: 'Lucas Hernandez', aliases: ['lucas hernandez', 'hernandez', 'ลูกัส แอร์กน็องเดซ'] },
      { slotId: 'cdm1', pos: 'CDM', number: 13, flag: '🇫🇷', row: 2, col: 4, playerId: "N'Golo Kanté", aliases: ['kante', 'ngolo kante', 'กองเต้'] },
      { slotId: 'cdm2', pos: 'CM', number: 6, flag: '🇫🇷', row: 2, col: 2, playerId: 'Paul Pogba', aliases: ['pogba', 'ป็อกบา'] },
      { slotId: 'rw', pos: 'RW', number: 10, flag: '🇫🇷', row: 1, col: 5, playerId: 'Kylian Mbappé', aliases: ['mbappe', 'เอ็มบัปเป้', 'ประธานเป้'] },
      { slotId: 'cam', pos: 'CAM', number: 7, flag: '🇫🇷', row: 2, col: 3, playerId: 'Antoine Griezmann', aliases: ['griezmann', 'กรีซมันน์'] },
      { slotId: 'lw', pos: 'LM', number: 14, flag: '🇫🇷', row: 1, col: 1, playerId: 'Blaise Matuidi', aliases: ['matuidi', 'มาตุยดี้'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇫🇷', row: 1, col: 3, playerId: 'Olivier Giroud', aliases: ['giroud', 'ชิรูด์'] }
    ]
  },
  {
    id: 'esp_2024_euro',
    title: '🇪🇸 ทีมชาติสเปน - แชมป์ยูโร 2024 (นัดชิงชนะอังกฤษ 2-1)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Luis de la Fuente',
    formation: '4-2-3-1',
    clubColor: '#DC2626',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 23, flag: '🇪🇸', row: 4, col: 3, playerId: 'Unai Simón', aliases: ['unai simon', 'simon', 'อูไน ซิมอน'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇪🇸', row: 3, col: 5, playerId: 'Dani Carvajal', aliases: ['carvajal', 'การ์บาฆาล'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇪🇸', row: 3, col: 4, playerId: 'Robin Le Normand', aliases: ['le normand', 'เลอ นอร์กม็องด์'] },
      { slotId: 'cb2', pos: 'CB', number: 14, flag: '🇪🇸', row: 3, col: 2, playerId: 'Aymeric Laporte', aliases: ['laporte', 'ลาปอร์ต'] },
      { slotId: 'lb', pos: 'LB', number: 24, flag: '🇪🇸', row: 3, col: 1, playerId: 'Marc Cucurella', aliases: ['cucurella', 'คูคูเรย่า', 'กูกูเรย่า'] },
      { slotId: 'cdm1', pos: 'CDM', number: 16, flag: '🇪🇸', row: 2, col: 4, playerId: 'Rodri', aliases: ['rodri', 'โรดรี้'] },
      { slotId: 'cdm2', pos: 'CM', number: 8, flag: '🇪🇸', row: 2, col: 2, playerId: 'Fabián Ruiz', aliases: ['fabian ruiz', 'fabian', 'ฟาเบียน รุยซ์'] },
      { slotId: 'rw', pos: 'RW', number: 19, flag: '🇪🇸', row: 1, col: 5, playerId: 'Lamine Yamal', aliases: ['yamal', 'lamine yamal', 'ยามาล'] },
      { slotId: 'cam', pos: 'CAM', number: 10, flag: '🇪🇸', row: 2, col: 3, playerId: 'Dani Olmo', aliases: ['dani olmo', 'olmo', 'โอลโม่'] },
      { slotId: 'lw', pos: 'LW', number: 17, flag: '🇪🇸', row: 1, col: 1, playerId: 'Nico Williams', aliases: ['nico williams', 'williams', 'นิโก้ วิลเลียมส์'] },
      { slotId: 'st', pos: 'ST', number: 7, flag: '🇪🇸', row: 1, col: 3, playerId: 'Álvaro Morata', aliases: ['morata', 'โมราต้า'] }
    ]
  },
  {
    id: 'esp_2010_wc',
    title: '🇪🇸 ทีมชาติสเปน - แชมป์ฟุตบอลโลก 2010 ยุคทอง Tiki-Taka',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Vicente del Bosque',
    formation: '4-2-3-1',
    clubColor: '#B91C1C',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇪🇸', row: 4, col: 3, playerId: 'Iker Casillas', aliases: ['casillas', 'กาซียาส', 'คาซิยาส'] },
      { slotId: 'rb', pos: 'RB', number: 15, flag: '🇪🇸', row: 3, col: 5, playerId: 'Sergio Ramos', aliases: ['ramos', 'รามอส'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇪🇸', row: 3, col: 4, playerId: 'Gerard Piqué', aliases: ['pique', 'ปิเก้'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🇪🇸', row: 3, col: 2, playerId: 'Carles Puyol', aliases: ['puyol', 'ปูโยล'] },
      { slotId: 'lb', pos: 'LB', number: 11, flag: '🇪🇸', row: 3, col: 1, playerId: 'Joan Capdevila', aliases: ['capdevila', 'คัปเดบิล่า'] },
      { slotId: 'cdm1', pos: 'CDM', number: 16, flag: '🇪🇸', row: 2, col: 4, playerId: 'Sergio Busquets', aliases: ['busquets', 'บุสเกตส์'] },
      { slotId: 'cdm2', pos: 'CDM', number: 14, flag: '🇪🇸', row: 2, col: 2, playerId: 'Xabi Alonso', aliases: ['xabi alonso', 'alonso', 'ชาบี อลอนโซ่'] },
      { slotId: 'rw', pos: 'RW', number: 18, flag: '🇪🇸', row: 1, col: 5, playerId: 'Pedro Rodríguez', aliases: ['pedro', 'เปโดร'] },
      { slotId: 'cam', pos: 'CAM', number: 8, flag: '🇪🇸', row: 2, col: 3, playerId: 'Xavi Hernández', aliases: ['xavi', 'ชาบี'] },
      { slotId: 'lw', pos: 'LM', number: 6, flag: '🇪🇸', row: 1, col: 1, playerId: 'Andrés Iniesta', aliases: ['iniesta', 'อิเนียสต้า'] },
      { slotId: 'st', pos: 'ST', number: 7, flag: '🇪🇸', row: 1, col: 3, playerId: 'David Villa', aliases: ['david villa', 'villa', 'ดาบิด บีย่า', 'บีย่า'] }
    ]
  },
  {
    id: 'bra_2002_wc',
    title: '🇧🇷 ทีมชาติบราซิล - แชมป์ฟุตบอลโลก 2002 ยุคสามทหารเสือ 3R',
    subtitle: 'ระบบ 3-4-1-2 • กุนซือ: Luiz Felipe Scolari',
    formation: '3-4-1-2',
    clubColor: '#EAB308',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇧🇷', row: 4, col: 3, playerId: 'Marcos', aliases: ['marcos', 'มาร์กอส'] },
      { slotId: 'rwb', pos: 'RWB', number: 2, flag: '🇧🇷', row: 3, col: 5, playerId: 'Cafu', aliases: ['cafu', 'คาฟู'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇧🇷', row: 3, col: 4, playerId: 'Lúcio', aliases: ['lucio', 'ลูซิโอ'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🇧🇷', row: 3, col: 3, playerId: 'Edmílson', aliases: ['edmilson', 'เอ็ดมิลสัน'] },
      { slotId: 'cb3', pos: 'CB', number: 4, flag: '🇧🇷', row: 3, col: 2, playerId: 'Roque Júnior', aliases: ['roque junior', 'โรเก้ จูเนียร์'] },
      { slotId: 'lwb', pos: 'LWB', number: 6, flag: '🇧🇷', row: 3, col: 1, playerId: 'Roberto Carlos', aliases: ['roberto carlos', 'โรแบร์โต้ คาร์ลอส', 'คาร์ลอส'] },
      { slotId: 'cm1', pos: 'CDM', number: 8, flag: '🇧🇷', row: 2, col: 4, playerId: 'Gilberto Silva', aliases: ['gilberto silva', 'จิลแบร์โต้ ซิลวา'] },
      { slotId: 'cm2', pos: 'CM', number: 15, flag: '🇧🇷', row: 2, col: 2, playerId: 'Kléberson', aliases: ['kleberson', 'เคลแบร์สัน'] },
      { slotId: 'cam', pos: 'CAM', number: 11, flag: '🇧🇷', row: 2, col: 3, playerId: 'Ronaldinho', aliases: ['ronaldinho', 'โรนัลดินโญ่', 'เหยินน้อย'] },
      { slotId: 'st1', pos: 'CF', number: 10, flag: '🇧🇷', row: 1, col: 4, playerId: 'Rivaldo', aliases: ['rivaldo', 'ริวัลโด้'] },
      { slotId: 'st2', pos: 'ST', number: 9, flag: '🇧🇷', row: 1, col: 2, playerId: 'Ronaldo Nazário', aliases: ['ronaldo', 'r9', 'ronaldo nazario', 'โรนัลโด้', 'โด้อ้วน'] }
    ]
  },
  {
    id: 'ger_2014_wc',
    title: '🇩🇪 ทีมชาติเยอรมนี - แชมป์ฟุตบอลโลก 2014 ที่บราซิล',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Joachim Löw',
    formation: '4-3-3',
    clubColor: '#334155',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇪', row: 4, col: 3, playerId: 'Manuel Neuer', aliases: ['neuer', 'นอยเออร์'] },
      { slotId: 'rb', pos: 'RB', number: 16, flag: '🇩🇪', row: 3, col: 5, playerId: 'Philipp Lahm', aliases: ['lahm', 'ลาห์ม'] },
      { slotId: 'cb1', pos: 'CB', number: 20, flag: '🇩🇪', row: 3, col: 4, playerId: 'Jérôme Boateng', aliases: ['boateng', 'บัวเต็ง'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🇩🇪', row: 3, col: 2, playerId: 'Mats Hummels', aliases: ['hummels', 'ฮุมเมิลส์'] },
      { slotId: 'lb', pos: 'LB', number: 4, flag: '🇩🇪', row: 3, col: 1, playerId: 'Benedikt Höwedes', aliases: ['howedes', 'เฮอเวเดส'] },
      { slotId: 'cm1', pos: 'CM', number: 6, flag: '🇩🇪', row: 2, col: 4, playerId: 'Sami Khedira', aliases: ['khedira', 'kramer', 'เคดิร่า', 'คราเมอร์'] },
      { slotId: 'cdm', pos: 'CDM', number: 7, flag: '🇩🇪', row: 2, col: 3, playerId: 'Bastian Schweinsteiger', aliases: ['schweinsteiger', 'ชไวน์สไตเกอร์'] },
      { slotId: 'cm2', pos: 'CM', number: 18, flag: '🇩🇪', row: 2, col: 2, playerId: 'Toni Kroos', aliases: ['kroos', 'โครส'] },
      { slotId: 'rw', pos: 'RW', number: 13, flag: '🇩🇪', row: 1, col: 5, playerId: 'Thomas Müller', aliases: ['muller', 'thomas muller', 'มุลเลอร์'] },
      { slotId: 'st', pos: 'ST', number: 11, flag: '🇩🇪', row: 1, col: 3, playerId: 'Miroslav Klose', aliases: ['klose', 'โคลเซ่'] },
      { slotId: 'lw', pos: 'LW', number: 8, flag: '🇩🇪', row: 1, col: 1, playerId: 'Mesut Özil', aliases: ['ozil', 'โอซิล'] }
    ]
  },
  {
    id: 'ita_2006_wc',
    title: '🇮🇹 ทีมชาติอิตาลี - แชมป์ฟุตบอลโลก 2006 (นัดชิงชนะฝรั่งเศส)',
    subtitle: 'ระบบ 4-4-1-1 • กุนซือ: Marcello Lippi',
    formation: '4-4-1-1',
    clubColor: '#2563EB',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇮🇹', row: 4, col: 3, playerId: 'Gianluigi Buffon', aliases: ['buffon', 'บุฟฟ่อน'] },
      { slotId: 'rb', pos: 'RB', number: 19, flag: '🇮🇹', row: 3, col: 5, playerId: 'Gianluca Zambrotta', aliases: ['zambrotta', 'ซามบร็อตต้า'] },
      { slotId: 'cb1', pos: 'CB', number: 5, flag: '🇮🇹', row: 3, col: 4, playerId: 'Fabio Cannavaro', aliases: ['cannavaro', 'คันนาวาโร่'] },
      { slotId: 'cb2', pos: 'CB', number: 23, flag: '🇮🇹', row: 3, col: 2, playerId: 'Marco Materazzi', aliases: ['materazzi', 'มาเตราซซี่'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇮🇹', row: 3, col: 1, playerId: 'Fabio Grosso', aliases: ['grosso', 'กรอสโซ่'] },
      { slotId: 'rm', pos: 'RM', number: 16, flag: '🇮🇹', row: 2, col: 5, playerId: 'Mauro Camoranesi', aliases: ['camoranesi', 'คาโมราเนซี่'] },
      { slotId: 'cm1', pos: 'CDM', number: 8, flag: '🇮🇹', row: 2, col: 4, playerId: 'Gennaro Gattuso', aliases: ['gattuso', 'กัตตูโซ่'] },
      { slotId: 'cm2', pos: 'CM', number: 21, flag: '🇮🇹', row: 2, col: 2, playerId: 'Andrea Pirlo', aliases: ['pirlo', 'ปิร์โล่'] },
      { slotId: 'lm', pos: 'LM', number: 20, flag: '🇮🇹', row: 2, col: 1, playerId: 'Simone Perrotta', aliases: ['perrotta', 'แปร์ร็อตต้า'] },
      { slotId: 'cam', pos: 'CF', number: 10, flag: '🇮🇹', row: 1, col: 4, playerId: 'Francesco Totti', aliases: ['totti', 'ต๊อตติ'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇮🇹', row: 1, col: 2, playerId: 'Luca Toni', aliases: ['luca toni', 'toni', 'ลูก้า โทนี่'] }
    ]
  },
  {
    id: 'mun_1999_treble',
    title: 'Manchester United - ทริปเปิลแชมป์ 1999 (คัมแบ็กชนะบาเยิร์น 2-1)',
    subtitle: 'ระบบ 4-4-2 • กุนซือ: Sir Alex Ferguson',
    formation: '4-4-2',
    clubColor: '#DC2626',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇰', row: 4, col: 3, playerId: 'Peter Schmeichel', aliases: ['schmeichel', 'ชไมเคิ่ล'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 5, playerId: 'Gary Neville', aliases: ['gary neville', 'neville', 'แกรี่ เนวิลล์'] },
      { slotId: 'cb1', pos: 'CB', number: 6, flag: '🇳🇱', row: 3, col: 4, playerId: 'Jaap Stam', aliases: ['stam', 'jaap stam', 'ยาป สตัม'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🇳🇴', row: 3, col: 2, playerId: 'Ronny Johnsen', aliases: ['johnsen', 'รอนนี่ ยอห์นเซ่น'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇮🇪', row: 3, col: 1, playerId: 'Denis Irwin', aliases: ['irwin', 'เดนิส เออร์วิน'] },
      { slotId: 'rm', pos: 'RM', number: 7, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 5, playerId: 'David Beckham', aliases: ['beckham', 'เบ็คแฮม'] },
      { slotId: 'cm1', pos: 'CM', number: 8, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Nicky Butt', aliases: ['nicky butt', 'butt', 'นิกกี้ บัตต์'] },
      { slotId: 'cm2', pos: 'CM', number: 11, flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', row: 2, col: 2, playerId: 'Ryan Giggs', aliases: ['giggs', 'กิ๊กส์'] },
      { slotId: 'lm', pos: 'LM', number: 15, flag: '🇸🇪', row: 2, col: 1, playerId: 'Jesper Blomqvist', aliases: ['blomqvist', 'บลอมควิสต์'] },
      { slotId: 'st1', pos: 'ST', number: 19, flag: '🇹🇹', row: 1, col: 4, playerId: 'Dwight Yorke', aliases: ['yorke', 'ดไวท์ ยอร์ค'] },
      { slotId: 'st2', pos: 'ST', number: 9, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 2, playerId: 'Andy Cole', aliases: ['andy cole', 'cole', 'แอนดี้ โคล'] }
    ]
  },
  {
    id: 'bar_2011_ucl',
    title: 'Barcelona - แชมป์ UCL 2011 ยุคต่างดาวที่เวมบลีย์ (ชนะแมนฯ ยูไนเต็ด 3-1)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Pep Guardiola',
    formation: '4-3-3',
    clubColor: '#991B1B',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇪🇸', row: 4, col: 3, playerId: 'Víctor Valdés', aliases: ['valdes', 'บัลเดส'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇧🇷', row: 3, col: 5, playerId: 'Dani Alves', aliases: ['dani alves', 'ดานี่ อัลเวส'] },
      { slotId: 'cb1', pos: 'CB', number: 14, flag: '🇦🇷', row: 3, col: 4, playerId: 'Javier Mascherano', aliases: ['mascherano', 'มาสเคราโน่'] },
      { slotId: 'cb2', pos: 'CB', number: 3, flag: '🇪🇸', row: 3, col: 2, playerId: 'Gerard Piqué', aliases: ['pique', 'ปิเก้'] },
      { slotId: 'lb', pos: 'LB', number: 22, flag: '🇫🇷', row: 3, col: 1, playerId: 'Éric Abidal', aliases: ['abidal', 'อาบิดัล'] },
      { slotId: 'cm1', pos: 'CM', number: 6, flag: '🇪🇸', row: 2, col: 4, playerId: 'Xavi Hernández', aliases: ['xavi', 'ชาบี'] },
      { slotId: 'cdm', pos: 'CDM', number: 16, flag: '🇪🇸', row: 2, col: 3, playerId: 'Sergio Busquets', aliases: ['busquets', 'บุสเกตส์'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇪🇸', row: 2, col: 2, playerId: 'Andrés Iniesta', aliases: ['iniesta', 'อิเนียสต้า'] },
      { slotId: 'rw', pos: 'RW', number: 17, flag: '🇪🇸', row: 1, col: 5, playerId: 'Pedro Rodríguez', aliases: ['pedro', 'เปโดร'] },
      { slotId: 'st', pos: 'CF', number: 10, flag: '🇦🇷', row: 1, col: 3, playerId: 'Lionel Messi', aliases: ['messi', 'เมสซี่'] },
      { slotId: 'lw', pos: 'LW', number: 7, flag: '🇪🇸', row: 1, col: 1, playerId: 'David Villa', aliases: ['david villa', 'villa', 'บีย่า'] }
    ]
  },
  {
    id: 'che_2021_ucl',
    title: 'Chelsea - แชมป์ UCL 2021 (นัดชิงชนะแมนฯ ซิตี้ 1-0)',
    subtitle: 'ระบบ 3-4-2-1 • กุนซือ: Thomas Tuchel',
    formation: '3-4-2-1',
    clubColor: '#034694',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 16, flag: '🇸🇳', row: 4, col: 3, playerId: 'Édouard Mendy', aliases: ['edouard mendy', 'mendy', 'เมนดี้'] },
      { slotId: 'cb1', pos: 'CB', number: 28, flag: '🇪🇸', row: 3, col: 5, playerId: 'César Azpilicueta', aliases: ['azpilicueta', 'อัซปิลิกวยต้า'] },
      { slotId: 'cb2', pos: 'CB', number: 6, flag: '🇧🇷', row: 3, col: 3, playerId: 'Thiago Silva', aliases: ['thiago silva', 'ธิอาโก้ ซิลวา'] },
      { slotId: 'cb3', pos: 'CB', number: 2, flag: '🇩🇪', row: 3, col: 1, playerId: 'Antonio Rüdiger', aliases: ['rudiger', 'รูดิเกอร์'] },
      { slotId: 'rwb', pos: 'RWB', number: 24, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 5, playerId: 'Reece James', aliases: ['reece james', 'รีซ เจมส์'] },
      { slotId: 'cm1', pos: 'CM', number: 7, flag: '🇫🇷', row: 2, col: 4, playerId: "N'Golo Kanté", aliases: ['kante', 'กองเต้'] },
      { slotId: 'cm2', pos: 'CM', number: 5, flag: '🇮🇹', row: 2, col: 2, playerId: 'Jorginho', aliases: ['jorginho', 'จอร์จินโญ่'] },
      { slotId: 'lwb', pos: 'LWB', number: 21, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 1, playerId: 'Ben Chilwell', aliases: ['chilwell', 'ชิลเวลล์'] },
      { slotId: 'ram', pos: 'CAM', number: 29, flag: '🇩🇪', row: 1, col: 4, playerId: 'Kai Havertz', aliases: ['havertz', 'ฮาแวร์ตซ์'] },
      { slotId: 'st', pos: 'ST', number: 11, flag: '🇩🇪', row: 1, col: 3, playerId: 'Timo Werner', aliases: ['werner', 'แวร์เนอร์'] },
      { slotId: 'lam', pos: 'CAM', number: 19, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 2, playerId: 'Mason Mount', aliases: ['mount', 'mason mount', 'เมาท์'] }
    ]
  },
  {
    id: 'bay_2020_treble',
    title: 'Bayern Munich - หกแชมป์ไร้พ่าย UCL 2020 (ชนะเปแอสเช 1-0)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Hansi Flick',
    formation: '4-2-3-1',
    clubColor: '#DC052D',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇪', row: 4, col: 3, playerId: 'Manuel Neuer', aliases: ['neuer', 'นอยเออร์'] },
      { slotId: 'rb', pos: 'RB', number: 32, flag: '🇩🇪', row: 3, col: 5, playerId: 'Joshua Kimmich', aliases: ['kimmich', 'คิมมิช'] },
      { slotId: 'cb1', pos: 'CB', number: 17, flag: '🇩🇪', row: 3, col: 4, playerId: 'Jérôme Boateng', aliases: ['boateng', 'บัวเต็ง'] },
      { slotId: 'cb2', pos: 'CB', number: 27, flag: '🇦🇹', row: 3, col: 2, playerId: 'David Alaba', aliases: ['alaba', 'อลาบา'] },
      { slotId: 'lb', pos: 'LB', number: 19, flag: '🇨🇦', row: 3, col: 1, playerId: 'Alphonso Davies', aliases: ['davies', 'alphonso davies', 'เดวีส์'] },
      { slotId: 'cdm1', pos: 'CM', number: 18, flag: '🇩🇪', row: 2, col: 4, playerId: 'Leon Goretzka', aliases: ['goretzka', 'โกเรตซ์ก้า'] },
      { slotId: 'cdm2', pos: 'CDM', number: 6, flag: '🇪🇸', row: 2, col: 2, playerId: 'Thiago Alcântara', aliases: ['thiago', 'thiago alcantara', 'ธิอาโก้'] },
      { slotId: 'rw', pos: 'RW', number: 22, flag: '🇩🇪', row: 1, col: 5, playerId: 'Serge Gnabry', aliases: ['gnabry', 'นาบรี้'] },
      { slotId: 'cam', pos: 'CAM', number: 25, flag: '🇩🇪', row: 2, col: 3, playerId: 'Thomas Müller', aliases: ['muller', 'มุลเลอร์'] },
      { slotId: 'lw', pos: 'LW', number: 29, flag: '🇫🇷', row: 1, col: 1, playerId: 'Kingsley Coman', aliases: ['coman', 'โคมัน'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇵🇱', row: 1, col: 3, playerId: 'Robert Lewandowski', aliases: ['lewandowski', 'เลวานดอฟสกี้'] }
    ]
  },
  {
    id: 'mil_2005_ucl',
    title: 'AC Milan - ยุคซูเปอร์สตาร์นัดชิง UCL 2005 อิสตันบูล',
    subtitle: 'ระบบ 4-3-1-2 • กุนซือ: Carlo Ancelotti',
    formation: '4-3-1-2',
    clubColor: '#B91C1C',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇧🇷', row: 4, col: 3, playerId: 'Dida', aliases: ['dida', 'ดิด้า'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇧🇷', row: 3, col: 5, playerId: 'Cafu', aliases: ['cafu', 'คาฟู'] },
      { slotId: 'cb1', pos: 'CB', number: 31, flag: '🇳🇱', row: 3, col: 4, playerId: 'Jaap Stam', aliases: ['stam', 'ยาป สตัม'] },
      { slotId: 'cb2', pos: 'CB', number: 13, flag: '🇮🇹', row: 3, col: 2, playerId: 'Alessandro Nesta', aliases: ['nesta', 'เนสต้า'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇮🇹', row: 3, col: 1, playerId: 'Paolo Maldini', aliases: ['maldini', 'มัลดินี่'] },
      { slotId: 'cm1', pos: 'CM', number: 8, flag: '🇮🇹', row: 2, col: 5, playerId: 'Gennaro Gattuso', aliases: ['gattuso', 'กัตตูโซ่'] },
      { slotId: 'cdm', pos: 'CDM', number: 21, flag: '🇮🇹', row: 2, col: 3, playerId: 'Andrea Pirlo', aliases: ['pirlo', 'ปิร์โล่'] },
      { slotId: 'cm2', pos: 'CM', number: 20, flag: '🇳🇱', row: 2, col: 1, playerId: 'Clarence Seedorf', aliases: ['seedorf', 'เซดอร์ฟ'] },
      { slotId: 'cam', pos: 'CAM', number: 22, flag: '🇧🇷', row: 1, col: 3, playerId: 'Kaká', aliases: ['kaka', 'กาก้า'] },
      { slotId: 'st1', pos: 'ST', number: 7, flag: '🇺🇦', row: 1, col: 4, playerId: 'Andriy Shevchenko', aliases: ['shevchenko', 'เชฟเชนโก้'] },
      { slotId: 'st2', pos: 'ST', number: 11, flag: '🇦🇷', row: 1, col: 2, playerId: 'Hernán Crespo', aliases: ['crespo', 'เครสโป'] }
    ]
  },
  {
    id: 'rma_2024_ucl',
    title: 'Real Madrid - แชมป์ UCL สมัยที่ 15 ปี 2024 (ชนะดอร์ทมุนด์ 2-0)',
    subtitle: 'ระบบ 4-3-1-2 • กุนซือ: Carlo Ancelotti',
    formation: '4-3-1-2',
    clubColor: '#00529F',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇧🇪', row: 4, col: 3, playerId: 'Thibaut Courtois', aliases: ['courtois', 'กูร์กตัวส์'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇪🇸', row: 3, col: 5, playerId: 'Dani Carvajal', aliases: ['carvajal', 'การ์บาฆาล'] },
      { slotId: 'cb1', pos: 'CB', number: 22, flag: '🇩🇪', row: 3, col: 4, playerId: 'Antonio Rüdiger', aliases: ['rudiger', 'รูดิเกอร์'] },
      { slotId: 'cb2', pos: 'CB', number: 6, flag: '🇪🇸', row: 3, col: 2, playerId: 'Nacho Fernández', aliases: ['nacho', 'นาโช่'] },
      { slotId: 'lb', pos: 'LB', number: 23, flag: '🇫🇷', row: 3, col: 1, playerId: 'Ferland Mendy', aliases: ['ferland mendy', 'mendy', 'เมนดี้'] },
      { slotId: 'cm1', pos: 'CM', number: 15, flag: '🇺🇾', row: 2, col: 5, playerId: 'Federico Valverde', aliases: ['valverde', 'บัลเบร์เด้'] },
      { slotId: 'cdm', pos: 'CDM', number: 12, flag: '🇫🇷', row: 2, col: 3, playerId: 'Eduardo Camavinga', aliases: ['camavinga', 'คามาวิงก้า'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇩🇪', row: 2, col: 1, playerId: 'Toni Kroos', aliases: ['kroos', 'โครส'] },
      { slotId: 'cam', pos: 'CAM', number: 5, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 3, playerId: 'Jude Bellingham', aliases: ['bellingham', 'เบลลิงแฮม'] },
      { slotId: 'st1', pos: 'ST', number: 11, flag: '🇧🇷', row: 1, col: 4, playerId: 'Rodrygo', aliases: ['rodrygo', 'โรดรีโก้'] },
      { slotId: 'st2', pos: 'ST', number: 7, flag: '🇧🇷', row: 1, col: 2, playerId: 'Vinícius Júnior', aliases: ['vinicius', 'vini jr', 'วินิซิอุส'] }
    ]
  },
  {
    id: 'eng_2006_wc',
    title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ทีมชาติอังกฤษ - ยุคทอง Golden Generation (ฟุตบอลโลก 2006)',
    subtitle: 'ระบบ 4-4-2 • กุนซือ: Sven-Göran Eriksson',
    formation: '4-4-2',
    clubColor: '#DC2626',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 4, col: 3, playerId: 'Paul Robinson', aliases: ['robinson', 'พอล โรบินสัน'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 5, playerId: 'Gary Neville', aliases: ['gary neville', 'neville', 'แกรี่ เนวิลล์'] },
      { slotId: 'cb1', pos: 'CB', number: 5, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 4, playerId: 'Rio Ferdinand', aliases: ['ferdinand', 'ริโอ'] },
      { slotId: 'cb2', pos: 'CB', number: 6, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 2, playerId: 'John Terry', aliases: ['terry', 'john terry', 'จอห์น เทอร์รี่', 'เทอร์รี่'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 1, playerId: 'Ashley Cole', aliases: ['ashley cole', 'แอชลีย์ โคล'] },
      { slotId: 'rm', pos: 'RM', number: 7, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 5, playerId: 'David Beckham', aliases: ['beckham', 'เบ็คแฮม'] },
      { slotId: 'cm1', pos: 'CM', number: 4, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Steven Gerrard', aliases: ['gerrard', 'เจอร์ราร์ด'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 2, playerId: 'Frank Lampard', aliases: ['lampard', 'แลมพาร์ด'] },
      { slotId: 'lm', pos: 'LM', number: 11, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 1, playerId: 'Joe Cole', aliases: ['joe cole', 'โจ โคล'] },
      { slotId: 'st1', pos: 'ST', number: 9, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 4, playerId: 'Wayne Rooney', aliases: ['rooney', 'รูนี่ย์'] },
      { slotId: 'st2', pos: 'ST', number: 10, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 2, playerId: 'Michael Owen', aliases: ['owen', 'michael owen', 'โอเว่น'] }
    ]
  },
  {
    id: 'fra_1998_wc',
    title: '🇫🇷 ทีมชาติฝรั่งเศส - แชมป์ฟุตบอลโลก 1998 ยุคซีดาน (ชนะบราซิล 3-0)',
    subtitle: 'ระบบ 4-3-2-1 • กุนซือ: Aimé Jacquet',
    formation: '4-3-2-1',
    clubColor: '#1D4ED8',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 16, flag: '🇫🇷', row: 4, col: 3, playerId: 'Fabien Barthez', aliases: ['barthez', 'บาร์กเตซ'] },
      { slotId: 'rb', pos: 'RB', number: 15, flag: '🇫🇷', row: 3, col: 5, playerId: 'Lilian Thuram', aliases: ['thuram', 'ตูราม'] },
      { slotId: 'cb1', pos: 'CB', number: 8, flag: '🇫🇷', row: 3, col: 4, playerId: 'Marcel Desailly', aliases: ['desailly', 'เดอไซญี่'] },
      { slotId: 'cb2', pos: 'CB', number: 18, flag: '🇫🇷', row: 3, col: 2, playerId: 'Frank Leboeuf', aliases: ['leboeuf', 'เลอเบิฟ'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇫🇷', row: 3, col: 1, playerId: 'Bixente Lizarazu', aliases: ['lizarazu', 'ลิซาราซู'] },
      { slotId: 'cm1', pos: 'CM', number: 19, flag: '🇫🇷', row: 2, col: 5, playerId: 'Christian Karembeu', aliases: ['karembeu', 'การ็องเบอ'] },
      { slotId: 'cdm', pos: 'CDM', number: 7, flag: '🇫🇷', row: 2, col: 3, playerId: 'Didier Deschamps', aliases: ['deschamps', 'เดส์ช็องส์'] },
      { slotId: 'cm2', pos: 'CM', number: 17, flag: '🇫🇷', row: 2, col: 1, playerId: 'Emmanuel Petit', aliases: ['petit', 'เปอตีต์'] },
      { slotId: 'cam1', pos: 'CAM', number: 10, flag: '🇫🇷', row: 1, col: 4, playerId: 'Zinedine Zidane', aliases: ['zidane', 'zizou', 'ซีดาน'] },
      { slotId: 'cam2', pos: 'CAM', number: 6, flag: '🇫🇷', row: 1, col: 2, playerId: 'Youri Djorkaeff', aliases: ['djorkaeff', 'จอร์คาเอฟฟ์'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇫🇷', row: 1, col: 3, playerId: 'Stéphane Guivarc\'h', aliases: ['guivarch', 'กีวาร์ช'] }
    ]
  },
  {
    id: 'rma_2002_galacticos',
    title: 'Real Madrid - ยุคกาลาติกอส แชมป์ UCL 2002 (ลูกวอลเลย์ซีดาน)',
    subtitle: 'ระบบ 4-3-1-2 • กุนซือ: Vicente del Bosque',
    formation: '4-3-1-2',
    clubColor: '#00529F',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇪🇸', row: 4, col: 3, playerId: 'Iker Casillas', aliases: ['casillas', 'กาซียาส'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇪🇸', row: 3, col: 5, playerId: 'Míchel Salgado', aliases: ['salgado', 'ซัลกาโด้'] },
      { slotId: 'cb1', pos: 'CB', number: 4, flag: '🇪🇸', row: 3, col: 4, playerId: 'Fernando Hierro', aliases: ['hierro', 'เอียร์โร่'] },
      { slotId: 'cb2', pos: 'CB', number: 6, flag: '🇪🇸', row: 3, col: 2, playerId: 'Iván Helguera', aliases: ['helguera', 'เอลเกร่า'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🇧🇷', row: 3, col: 1, playerId: 'Roberto Carlos', aliases: ['roberto carlos', 'โรแบร์โต้ คาร์ลอส'] },
      { slotId: 'cm1', pos: 'RM', number: 10, flag: '🇵🇹', row: 2, col: 5, playerId: 'Luís Figo', aliases: ['figo', 'ฟิโก้'] },
      { slotId: 'cdm', pos: 'CDM', number: 24, flag: '🇫🇷', row: 2, col: 3, playerId: 'Claude Makélélé', aliases: ['makelele', 'มาเกเลเล่'] },
      { slotId: 'cm2', pos: 'LM', number: 21, flag: '🇦🇷', row: 2, col: 1, playerId: 'Santiago Solari', aliases: ['solari', 'โซลารี่'] },
      { slotId: 'cam', pos: 'CAM', number: 5, flag: '🇫🇷', row: 1, col: 3, playerId: 'Zinedine Zidane', aliases: ['zidane', 'ซีดาน'] },
      { slotId: 'st1', pos: 'ST', number: 7, flag: '🇪🇸', row: 1, col: 4, playerId: 'Raúl González', aliases: ['raul', 'ราอูล'] },
      { slotId: 'st2', pos: 'ST', number: 9, flag: '🇪🇸', row: 1, col: 2, playerId: 'Fernando Morientes', aliases: ['morientes', 'มอริเอนเตส'] }
    ]
  },
  {
    id: 'liv_2005_istanbul',
    title: 'Liverpool - ปาฏิหาริย์อิสตันบูล แชมป์ UCL 2005 (คัมแบ็กชนะเอซี มิลาน 3-3)',
    subtitle: 'ระบบ 4-4-1-1 • กุนซือ: Rafael Benítez',
    formation: '4-4-1-1',
    clubColor: '#C8102E',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇵🇱', row: 4, col: 3, playerId: 'Jerzy Dudek', aliases: ['dudek', 'ดูเด็ค'] },
      { slotId: 'rb', pos: 'RB', number: 3, flag: '🇮🇪', row: 3, col: 5, playerId: 'Steve Finnan', aliases: ['finnan', 'ฟินแนน'] },
      { slotId: 'cb1', pos: 'CB', number: 23, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 4, playerId: 'Jamie Carragher', aliases: ['carragher', 'คาร์ราเกอร์'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇫🇮', row: 3, col: 2, playerId: 'Sami Hyypiä', aliases: ['hyypia', 'ฮูเปีย'] },
      { slotId: 'lb', pos: 'LB', number: 21, flag: '🇲🇱', row: 3, col: 1, playerId: 'Djimi Traoré', aliases: ['traore', 'ตราโอเร่'] },
      { slotId: 'rm', pos: 'RM', number: 10, flag: '🇪🇸', row: 2, col: 5, playerId: 'Luis García', aliases: ['luis garcia', 'หลุยส์ การ์เซีย'] },
      { slotId: 'cm1', pos: 'CM', number: 8, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Steven Gerrard', aliases: ['gerrard', 'เจอร์ราร์ด'] },
      { slotId: 'cm2', pos: 'CM', number: 14, flag: '🇪🇸', row: 2, col: 2, playerId: 'Xabi Alonso', aliases: ['xabi alonso', 'ชาบี อลอนโซ่'] },
      { slotId: 'lm', pos: 'LM', number: 6, flag: '🇳🇴', row: 2, col: 1, playerId: 'John Arne Riise', aliases: ['riise', 'รีเซ่'] },
      { slotId: 'cam', pos: 'AM', number: 7, flag: '🇦🇺', row: 1, col: 4, playerId: 'Harry Kewell', aliases: ['kewell', 'คีเวลล์'] },
      { slotId: 'st', pos: 'ST', number: 5, flag: '🇨🇿', row: 1, col: 2, playerId: 'Milan Baroš', aliases: ['baros', 'บารอส'] }
    ]
  },
  {
    id: 'int_2010_treble',
    title: 'Inter Milan - ทริปเปิลแชมป์ประวัติศาสตร์ 2010 (ชนะบาเยิร์น 2-0)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: José Mourinho',
    formation: '4-2-3-1',
    clubColor: '#010E80',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 12, flag: '🇧🇷', row: 4, col: 3, playerId: 'Júlio César', aliases: ['julio cesar', 'ชูลิโอ เซซาร์'] },
      { slotId: 'rb', pos: 'RB', number: 13, flag: '🇧🇷', row: 3, col: 5, playerId: 'Maicon', aliases: ['ไมคอน'] },
      { slotId: 'cb1', pos: 'CB', number: 6, flag: '🇧🇷', row: 3, col: 4, playerId: 'Lúcio', aliases: ['lucio', 'ลูซิโอ'] },
      { slotId: 'cb2', pos: 'CB', number: 25, flag: '🇦🇷', row: 3, col: 2, playerId: 'Walter Samuel', aliases: ['samuel', 'วอลเตอร์ ซามูเอล'] },
      { slotId: 'lb', pos: 'LB', number: 26, flag: '🇷🇴', row: 3, col: 1, playerId: 'Cristian Chivu', aliases: ['chivu', 'คิวู'] },
      { slotId: 'cdm1', pos: 'CDM', number: 4, flag: '🇦🇷', row: 2, col: 4, playerId: 'Javier Zanetti', aliases: ['zanetti', 'ซาเน็ตติ'] },
      { slotId: 'cdm2', pos: 'CDM', number: 19, flag: '🇦🇷', row: 2, col: 2, playerId: 'Esteban Cambiasso', aliases: ['cambiasso', 'คัมบิอัสโซ่'] },
      { slotId: 'cam', pos: 'CAM', number: 10, flag: '🇳🇱', row: 2, col: 3, playerId: 'Wesley Sneijder', aliases: ['sneijder', 'สไนเดอร์'] },
      { slotId: 'rw', pos: 'RW', number: 9, flag: '🇨🇲', row: 1, col: 5, playerId: 'Samuel Eto\'o', aliases: ['etoo', 'เอโต้'] },
      { slotId: 'st', pos: 'ST', number: 22, flag: '🇦🇷', row: 1, col: 3, playerId: 'Diego Milito', aliases: ['milito', 'มิลิโต้'] },
      { slotId: 'lw', pos: 'LW', number: 27, flag: '🇲🇰', row: 1, col: 1, playerId: 'Goran Pandev', aliases: ['pandev', 'ปานเดฟ'] }
    ]
  },
  {
    id: 'che_2012_ucl',
    title: 'Chelsea - แชมป์ UCL สมัยแรกที่มิวนิค 2012 (ชนะบาเยิร์นจุดโทษ)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Roberto Di Matteo',
    formation: '4-2-3-1',
    clubColor: '#034694',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇨🇿', row: 4, col: 3, playerId: 'Petr Čech', aliases: ['cech', 'ปีเตอร์ เช็ก'] },
      { slotId: 'rb', pos: 'RB', number: 17, flag: '🇵🇹', row: 3, col: 5, playerId: 'José Bosingwa', aliases: ['bosingwa', 'โบซิงวา'] },
      { slotId: 'cb1', pos: 'CB', number: 24, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 4, playerId: 'Gary Cahill', aliases: ['gary cahill', 'แกรี่ เคฮิลล์'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇧🇷', row: 3, col: 2, playerId: 'David Luiz', aliases: ['david luiz', 'ดาวิด ลุยซ์'] },
      { slotId: 'lb', pos: 'LB', number: 3, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 1, playerId: 'Ashley Cole', aliases: ['ashley cole', 'แอชลีย์ โคล'] },
      { slotId: 'cdm1', pos: 'CDM', number: 12, flag: '🇳🇬', row: 2, col: 4, playerId: 'John Obi Mikel', aliases: ['mikel', 'มิเกล'] },
      { slotId: 'cdm2', pos: 'CDM', number: 8, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 2, playerId: 'Frank Lampard', aliases: ['lampard', 'แลมพาร์ด'] },
      { slotId: 'cam', pos: 'CAM', number: 10, flag: '🇪🇸', row: 2, col: 3, playerId: 'Juan Mata', aliases: ['mata', 'ฆวน มาต้า'] },
      { slotId: 'rw', pos: 'RW', number: 21, flag: '🇨🇮', row: 1, col: 5, playerId: 'Salomon Kalou', aliases: ['kalou', 'กาลู'] },
      { slotId: 'st', pos: 'ST', number: 11, flag: '🇨🇮', row: 1, col: 3, playerId: 'Didier Drogba', aliases: ['drogba', 'ดร็อกบา'] },
      { slotId: 'lw', pos: 'LW', number: 34, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 1, playerId: 'Ryan Bertrand', aliases: ['bertrand', 'เบอร์ทรานด์'] }
    ]
  },
  {
    id: 'bay_2013_treble',
    title: 'Bayern Munich - ทริปเปิลแชมป์ยุค Jupp Heynckes 2013 (ชนะดอร์ทมุนด์ 2-1)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Jupp Heynckes',
    formation: '4-2-3-1',
    clubColor: '#DC052D',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇪', row: 4, col: 3, playerId: 'Manuel Neuer', aliases: ['neuer', 'นอยเออร์'] },
      { slotId: 'rb', pos: 'RB', number: 21, flag: '🇩🇪', row: 3, col: 5, playerId: 'Philipp Lahm', aliases: ['lahm', 'ลาห์ม'] },
      { slotId: 'cb1', pos: 'CB', number: 17, flag: '🇩🇪', row: 3, col: 4, playerId: 'Jérôme Boateng', aliases: ['boateng', 'บัวเต็ง'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇧🇷', row: 3, col: 2, playerId: 'Dante', aliases: ['ดันเต้'] },
      { slotId: 'lb', pos: 'LB', number: 27, flag: '🇦🇹', row: 3, col: 1, playerId: 'David Alaba', aliases: ['alaba', 'อลาบา'] },
      { slotId: 'cdm1', pos: 'CDM', number: 8, flag: '🇪🇸', row: 2, col: 4, playerId: 'Javi Martínez', aliases: ['javi martinez', 'ฆาบี มาร์ติเนซ'] },
      { slotId: 'cdm2', pos: 'CDM', number: 31, flag: '🇩🇪', row: 2, col: 2, playerId: 'Bastian Schweinsteiger', aliases: ['schweinsteiger', 'ชไวน์สไตเกอร์'] },
      { slotId: 'cam', pos: 'CAM', number: 25, flag: '🇩🇪', row: 2, col: 3, playerId: 'Thomas Müller', aliases: ['muller', 'มุลเลอร์'] },
      { slotId: 'rw', pos: 'RW', number: 10, flag: '🇳🇱', row: 1, col: 5, playerId: 'Arjen Robben', aliases: ['robben', 'ร็อบเบน'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇭🇷', row: 1, col: 3, playerId: 'Mario Mandžukić', aliases: ['mandzukic', 'มานด์ซูคิช'] },
      { slotId: 'lw', pos: 'LW', number: 7, flag: '🇫🇷', row: 1, col: 1, playerId: 'Franck Ribéry', aliases: ['ribery', 'ริเบรี่'] }
    ]
  },
  {
    id: 'rma_2014_decima',
    title: 'Real Madrid - แชมป์ UCL สมัยที่ 10 La Décima 2014 (ชนะแอตฯ มาดริด 4-1)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Carlo Ancelotti',
    formation: '4-3-3',
    clubColor: '#00529F',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇪🇸', row: 4, col: 3, playerId: 'Iker Casillas', aliases: ['casillas', 'กาซียาส'] },
      { slotId: 'rb', pos: 'RB', number: 15, flag: '🇪🇸', row: 3, col: 5, playerId: 'Dani Carvajal', aliases: ['carvajal', 'การ์บาฆาล'] },
      { slotId: 'cb1', pos: 'CB', number: 4, flag: '🇪🇸', row: 3, col: 4, playerId: 'Sergio Ramos', aliases: ['ramos', 'รามอส'] },
      { slotId: 'cb2', pos: 'CB', number: 2, flag: '🇫🇷', row: 3, col: 2, playerId: 'Raphaël Varane', aliases: ['varane', 'วาราน'] },
      { slotId: 'lb', pos: 'LB', number: 5, flag: '🇵🇹', row: 3, col: 1, playerId: 'Fábio Coentrão', aliases: ['coentrao', 'โคเอนเทรา'] },
      { slotId: 'cm1', pos: 'CM', number: 19, flag: '🇭🇷', row: 2, col: 4, playerId: 'Luka Modrić', aliases: ['modric', 'โมดริช'] },
      { slotId: 'cdm', pos: 'CDM', number: 6, flag: '🇩🇪', row: 2, col: 3, playerId: 'Sami Khedira', aliases: ['khedira', 'เคดิร่า'] },
      { slotId: 'cm2', pos: 'CM', number: 22, flag: '🇦🇷', row: 2, col: 2, playerId: 'Ángel Di María', aliases: ['di maria', 'ดิมาเรีย'] },
      { slotId: 'rw', pos: 'RW', number: 11, flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', row: 1, col: 5, playerId: 'Gareth Bale', aliases: ['bale', 'เบล'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇫🇷', row: 1, col: 3, playerId: 'Karim Benzema', aliases: ['benzema', 'เบนเซม่า'] },
      { slotId: 'lw', pos: 'LW', number: 7, flag: '🇵🇹', row: 1, col: 1, playerId: 'Cristiano Ronaldo', aliases: ['ronaldo', 'cr7', 'โรนัลโด้'] }
    ]
  },
  {
    id: 'bar_2009_sextuple',
    title: 'Barcelona - หกแชมป์ประวัติศาสตร์ 2009 (ชนะแมนฯ ยูไนเต็ด 2-0 ที่โรม)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Pep Guardiola',
    formation: '4-3-3',
    clubColor: '#A50044',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇪🇸', row: 4, col: 3, playerId: 'Víctor Valdés', aliases: ['valdes', 'บัลเดส'] },
      { slotId: 'rb', pos: 'RB', number: 5, flag: '🇪🇸', row: 3, col: 5, playerId: 'Carles Puyol', aliases: ['puyol', 'ปูโยล'] },
      { slotId: 'cb1', pos: 'CB', number: 24, flag: '🇨🇮', row: 3, col: 4, playerId: 'Yaya Touré', aliases: ['yaya toure', 'ยาย่า ตูเร่'] },
      { slotId: 'cb2', pos: 'CB', number: 3, flag: '🇪🇸', row: 3, col: 2, playerId: 'Gerard Piqué', aliases: ['pique', 'ปิเก้'] },
      { slotId: 'lb', pos: 'LB', number: 16, flag: '🇧🇷', row: 3, col: 1, playerId: 'Sylvinho', aliases: ['ซิลวินโญ่'] },
      { slotId: 'cdm', pos: 'CDM', number: 28, flag: '🇪🇸', row: 2, col: 3, playerId: 'Sergio Busquets', aliases: ['busquets', 'บุสเก็ตส์'] },
      { slotId: 'cm1', pos: 'CM', number: 6, flag: '🇪🇸', row: 2, col: 4, playerId: 'Xavi Hernández', aliases: ['xavi', 'ชาบี'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇪🇸', row: 2, col: 2, playerId: 'Andrés Iniesta', aliases: ['iniesta', 'อิเนียสต้า'] },
      { slotId: 'rw', pos: 'RW', number: 10, flag: '🇦🇷', row: 1, col: 5, playerId: 'Lionel Messi', aliases: ['messi', 'เมสซี่'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇨🇲', row: 1, col: 3, playerId: 'Samuel Eto\'o', aliases: ['etoo', 'เอโต้'] },
      { slotId: 'lw', pos: 'LW', number: 14, flag: '🇫🇷', row: 1, col: 1, playerId: 'Thierry Henry', aliases: ['henry', 'อองรี'] }
    ]
  },
  {
    id: 'che_2005_mourinho',
    title: 'Chelsea - แชมป์พรีเมียร์ลีกยุคเสีย 15 ประตู 2004/05',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: José Mourinho',
    formation: '4-3-3',
    clubColor: '#034694',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇨🇿', row: 4, col: 3, playerId: 'Petr Čech', aliases: ['cech', 'ปีเตอร์ เช็ก'] },
      { slotId: 'rb', pos: 'RB', number: 20, flag: '🇵🇹', row: 3, col: 5, playerId: 'Paulo Ferreira', aliases: ['ferreira', 'เปาโล แฟร์เรร่า'] },
      { slotId: 'cb1', pos: 'CB', number: 26, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 4, playerId: 'John Terry', aliases: ['terry', 'เทอร์รี่'] },
      { slotId: 'cb2', pos: 'CB', number: 6, flag: '🇵🇹', row: 3, col: 2, playerId: 'Ricardo Carvalho', aliases: ['carvalho', 'คาร์วัลโญ่'] },
      { slotId: 'lb', pos: 'LB', number: 13, flag: '🇫🇷', row: 3, col: 1, playerId: 'William Gallas', aliases: ['gallas', 'กัลลาส'] },
      { slotId: 'cdm', pos: 'CDM', number: 4, flag: '🇫🇷', row: 2, col: 3, playerId: 'Claude Makélélé', aliases: ['makelele', 'มาเกเลเล่'] },
      { slotId: 'cm1', pos: 'CM', number: 8, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Frank Lampard', aliases: ['lampard', 'แลมพาร์ด'] },
      { slotId: 'cm2', pos: 'CM', number: 5, flag: '🇵🇹', row: 2, col: 2, playerId: 'Tiago Mendes', aliases: ['tiago', 'ติอาโก้ เมนเดส'] },
      { slotId: 'rw', pos: 'RW', number: 11, flag: '🇮🇪', row: 1, col: 5, playerId: 'Damien Duff', aliases: ['duff', 'เดเมียน ดัฟฟ์'] },
      { slotId: 'st', pos: 'ST', number: 15, flag: '🇨🇮', row: 1, col: 3, playerId: 'Didier Drogba', aliases: ['drogba', 'ดร็อกบา'] },
      { slotId: 'lw', pos: 'LW', number: 16, flag: '🇳🇱', row: 1, col: 1, playerId: 'Arjen Robben', aliases: ['robben', 'ร็อบเบน'] }
    ]
  },
  {
    id: 'juv_2015_ucl',
    title: 'Juventus - ชุดเข้าชิง UCL 2015 ยุคแผงมิดฟิลด์เพชร (Pirlo - Pogba - Vidal - Marchisio)',
    subtitle: 'ระบบ 4-3-1-2 • กุนซือ: Massimiliano Allegri',
    formation: '4-3-1-2',
    clubColor: '#000000',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇮🇹', row: 4, col: 3, playerId: 'Gianluigi Buffon', aliases: ['buffon', 'บุฟฟ่อน'] },
      { slotId: 'rb', pos: 'RB', number: 26, flag: '🇨🇭', row: 3, col: 5, playerId: 'Stephan Lichtsteiner', aliases: ['lichtsteiner', 'ลิชท์สไตเนอร์'] },
      { slotId: 'cb1', pos: 'CB', number: 15, flag: '🇮🇹', row: 3, col: 4, playerId: 'Andrea Barzagli', aliases: ['barzagli', 'บาร์ซาญี่'] },
      { slotId: 'cb2', pos: 'CB', number: 19, flag: '🇮🇹', row: 3, col: 2, playerId: 'Leonardo Bonucci', aliases: ['bonucci', 'โบนุชชี่'] },
      { slotId: 'lb', pos: 'LB', number: 33, flag: '🇫🇷', row: 3, col: 1, playerId: 'Patrice Evra', aliases: ['evra', 'เอวร่า'] },
      { slotId: 'cdm', pos: 'CDM', number: 21, flag: '🇮🇹', row: 2, col: 3, playerId: 'Andrea Pirlo', aliases: ['pirlo', 'ปีร์โล่'] },
      { slotId: 'cm1', pos: 'CM', number: 8, flag: '🇮🇹', row: 2, col: 5, playerId: 'Claudio Marchisio', aliases: ['marchisio', 'มาร์คิซิโอ'] },
      { slotId: 'cm2', pos: 'CM', number: 6, flag: '🇫🇷', row: 2, col: 1, playerId: 'Paul Pogba', aliases: ['pogba', 'ป็อกบา'] },
      { slotId: 'cam', pos: 'CAM', number: 23, flag: '🇨🇱', row: 1, col: 3, playerId: 'Arturo Vidal', aliases: ['vidal', 'วิดัล'] },
      { slotId: 'st1', pos: 'ST', number: 10, flag: '🇦🇷', row: 1, col: 4, playerId: 'Carlos Tevez', aliases: ['tevez', 'เตเวซ'] },
      { slotId: 'st2', pos: 'ST', number: 9, flag: '🇪🇸', row: 1, col: 2, playerId: 'Álvaro Morata', aliases: ['morata', 'โมราต้า'] }
    ]
  },
  {
    id: 'bvb_2013_klopp',
    title: 'Borussia Dortmund - ยุคเกเก้นเพรสซิ่ง Jürgen Klopp เข้าชิง UCL 2013',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Jürgen Klopp',
    formation: '4-2-3-1',
    clubColor: '#D97706',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇩🇪', row: 4, col: 3, playerId: 'Roman Weidenfeller', aliases: ['weidenfeller', 'ไวเดนเฟลเลอร์'] },
      { slotId: 'rb', pos: 'RB', number: 26, flag: '🇵🇱', row: 3, col: 5, playerId: 'Łukasz Piszczek', aliases: ['piszczek', 'พิสเช็ค'] },
      { slotId: 'cb1', pos: 'CB', number: 4, flag: '🇷🇸', row: 3, col: 4, playerId: 'Neven Subotić', aliases: ['subotic', 'ซูโบติช'] },
      { slotId: 'cb2', pos: 'CB', number: 15, flag: '🇩🇪', row: 3, col: 2, playerId: 'Mats Hummels', aliases: ['hummels', 'ฮุมเมิลส์'] },
      { slotId: 'lb', pos: 'LB', number: 29, flag: '🇩🇪', row: 3, col: 1, playerId: 'Marcel Schmelzer', aliases: ['schmelzer', 'ชเมลเซอร์'] },
      { slotId: 'cdm1', pos: 'CDM', number: 6, flag: '🇩🇪', row: 2, col: 4, playerId: 'Sven Bender', aliases: ['sven bender', 'สเวน เบนเดอร์'] },
      { slotId: 'cdm2', pos: 'CDM', number: 8, flag: '🇩🇪', row: 2, col: 2, playerId: 'İlkay Gündoğan', aliases: ['gundogan', 'กุนโดกัน'] },
      { slotId: 'cam', pos: 'CAM', number: 11, flag: '🇩🇪', row: 2, col: 3, playerId: 'Marco Reus', aliases: ['reus', 'รอยส์'] },
      { slotId: 'rw', pos: 'RW', number: 16, flag: '🇵🇱', row: 1, col: 5, playerId: 'Jakub Błaszczykowski', aliases: ['blaszczykowski', 'kuba', 'บลัซซีคอฟสกี้'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇵🇱', row: 1, col: 3, playerId: 'Robert Lewandowski', aliases: ['lewandowski', 'เลวานดอฟสกี้'] },
      { slotId: 'lw', pos: 'LW', number: 19, flag: '🇩🇪', row: 1, col: 1, playerId: 'Kevin Großkreutz', aliases: ['grosskreutz', 'โกรสครอยท์ซ'] }
    ]
  },
  {
    id: 'psg_2022_mnm',
    title: 'Paris Saint-Germain - ยุคสามประสานซูเปอร์สตาร์ MNM (Messi - Neymar - Mbappé)',
    subtitle: 'ระบบ 3-4-1-2 • กุนซือ: Christophe Galtier',
    formation: '3-4-1-2',
    clubColor: '#004170',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 99, flag: '🇮🇹', row: 4, col: 3, playerId: 'Gianluigi Donnarumma', aliases: ['donnarumma', 'ดอนนารุมม่า'] },
      { slotId: 'cb1', pos: 'CB', number: 4, flag: '🇪🇸', row: 3, col: 5, playerId: 'Sergio Ramos', aliases: ['ramos', 'รามอส'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🇧🇷', row: 3, col: 3, playerId: 'Marquinhos', aliases: ['มาร์ควินญอส'] },
      { slotId: 'cb3', pos: 'CB', number: 3, flag: '🇫🇷', row: 3, col: 1, playerId: 'Presnel Kimpembe', aliases: ['kimpembe', 'คิมเพมเบ้'] },
      { slotId: 'rwb', pos: 'RWB', number: 2, flag: '🇲🇦', row: 2, col: 5, playerId: 'Achraf Hakimi', aliases: ['hakimi', 'ฮาคิมี่'] },
      { slotId: 'cm1', pos: 'CM', number: 6, flag: '🇮🇹', row: 2, col: 4, playerId: 'Marco Verratti', aliases: ['verratti', 'แวร์รัตติ'] },
      { slotId: 'cm2', pos: 'CM', number: 17, flag: '🇵🇹', row: 2, col: 2, playerId: 'Vitinha', aliases: ['วิตินญ่า'] },
      { slotId: 'lwb', pos: 'LWB', number: 25, flag: '🇵🇹', row: 2, col: 1, playerId: 'Nuno Mendes', aliases: ['nuno mendes', 'นูโน่ เมนเดส'] },
      { slotId: 'cam', pos: 'CAM', number: 30, flag: '🇦🇷', row: 1, col: 3, playerId: 'Lionel Messi', aliases: ['messi', 'เมสซี่'] },
      { slotId: 'st1', pos: 'ST', number: 7, flag: '🇫🇷', row: 1, col: 5, playerId: 'Kylian Mbappé', aliases: ['mbappe', 'เอ็มบัปเป้'] },
      { slotId: 'st2', pos: 'ST', number: 10, flag: '🇧🇷', row: 1, col: 1, playerId: 'Neymar Jr', aliases: ['neymar', 'เนย์มาร์'] }
    ]
  },
  {
    id: 'rma_2022_ucl',
    title: 'Real Madrid - แชมป์ UCL 2022 ที่ปารีส (ชนะลิเวอร์พูล 1-0)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Carlo Ancelotti',
    formation: '4-3-3',
    clubColor: '#00529F',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇧🇪', row: 4, col: 3, playerId: 'Thibaut Courtois', aliases: ['courtois', 'กูร์กตัวส์'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇪🇸', row: 3, col: 5, playerId: 'Dani Carvajal', aliases: ['carvajal', 'การ์บาฆาล'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇧🇷', row: 3, col: 4, playerId: 'Éder Militão', aliases: ['militao', 'มิลิเตา'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇦🇹', row: 3, col: 2, playerId: 'David Alaba', aliases: ['alaba', 'อลาบา'] },
      { slotId: 'lb', pos: 'LB', number: 23, flag: '🇫🇷', row: 3, col: 1, playerId: 'Ferland Mendy', aliases: ['ferland mendy', 'แฟร์กล็องด์ เมนดี้'] },
      { slotId: 'cm1', pos: 'CM', number: 10, flag: '🇭🇷', row: 2, col: 4, playerId: 'Luka Modrić', aliases: ['modric', 'โมดริช'] },
      { slotId: 'cdm', pos: 'CDM', number: 14, flag: '🇧🇷', row: 2, col: 3, playerId: 'Casemiro', aliases: ['คาเซมิโร่'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇩🇪', row: 2, col: 2, playerId: 'Toni Kroos', aliases: ['kroos', 'โครส'] },
      { slotId: 'rw', pos: 'RW', number: 15, flag: '🇺🇾', row: 1, col: 5, playerId: 'Federico Valverde', aliases: ['valverde', 'บัลเบร์เด้'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇫🇷', row: 1, col: 3, playerId: 'Karim Benzema', aliases: ['benzema', 'เบนเซม่า'] },
      { slotId: 'lw', pos: 'LW', number: 20, flag: '🇧🇷', row: 1, col: 1, playerId: 'Vinícius Júnior', aliases: ['vinicius', 'vini jr', 'วินิซิอุส'] }
    ]
  },
  {
    id: 'mci_2018_centurions',
    title: 'Manchester City - แชมป์พรีเมียร์ลีก 100 คะแนน (The Centurions 2017/18)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Pep Guardiola',
    formation: '4-3-3',
    clubColor: '#6CABDD',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 31, flag: '🇧🇷', row: 4, col: 3, playerId: 'Ederson', aliases: ['เอแดร์ซอน'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 5, playerId: 'Kyle Walker', aliases: ['walker', 'ไคล์ วอล์คเกอร์'] },
      { slotId: 'cb1', pos: 'CB', number: 4, flag: '🇧🇪', row: 3, col: 4, playerId: 'Vincent Kompany', aliases: ['kompany', 'กอมปานี'] },
      { slotId: 'cb2', pos: 'CB', number: 30, flag: '🇦🇷', row: 3, col: 2, playerId: 'Nicolás Otamendi', aliases: ['otamendi', 'โอตาเมนดี้'] },
      { slotId: 'lb', pos: 'LB', number: 18, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 1, playerId: 'Fabian Delph', aliases: ['delph', 'ฟาเบียน เดลฟ์'] },
      { slotId: 'cdm', pos: 'CDM', number: 25, flag: '🇧🇷', row: 2, col: 3, playerId: 'Fernandinho', aliases: ['แฟร์นันดินโญ่'] },
      { slotId: 'cm1', pos: 'CM', number: 17, flag: '🇧🇪', row: 2, col: 4, playerId: 'Kevin De Bruyne', aliases: ['de bruyne', 'kdb', 'เดอบรอยน์'] },
      { slotId: 'cm2', pos: 'CM', number: 21, flag: '🇪🇸', row: 2, col: 2, playerId: 'David Silva', aliases: ['david silva', 'ดาบิด ซิลบา'] },
      { slotId: 'rw', pos: 'RW', number: 7, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 5, playerId: 'Raheem Sterling', aliases: ['sterling', 'สเตอร์ลิง'] },
      { slotId: 'st', pos: 'ST', number: 10, flag: '🇦🇷', row: 1, col: 3, playerId: 'Sergio Agüero', aliases: ['aguero', 'อเกวโร่', 'กุน'] },
      { slotId: 'lw', pos: 'LW', number: 19, flag: '🇩🇪', row: 1, col: 1, playerId: 'Leroy Sané', aliases: ['sane', 'เลรอย ซาเน่'] }
    ]
  },
  {
    id: 'por_2016_euro',
    title: '🇵🇹 ทีมชาติโปรตุเกส - แชมป์ยูโร 2016 สมัยแรกในประวัติศาสตร์ (ชนะฝรั่งเศส 1-0)',
    subtitle: 'ระบบ 4-1-3-2 • กุนซือ: Fernando Santos',
    formation: '4-1-3-2',
    clubColor: '#B91C1C',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇵🇹', row: 4, col: 3, playerId: 'Rui Patrício', aliases: ['rui patricio', 'รุย ปาตริซิโอ'] },
      { slotId: 'rb', pos: 'RB', number: 21, flag: '🇵🇹', row: 3, col: 5, playerId: 'Cédric Soares', aliases: ['cedric', 'เซดริก'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇵🇹', row: 3, col: 4, playerId: 'Pepe', aliases: ['เปเป้'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇵🇹', row: 3, col: 2, playerId: 'José Fonte', aliases: ['jose fonte', 'โชเซ่ ฟอนเต้'] },
      { slotId: 'lb', pos: 'LB', number: 5, flag: '🇵🇹', row: 3, col: 1, playerId: 'Raphaël Guerreiro', aliases: ['guerreiro', 'เกร์เรโร่'] },
      { slotId: 'cdm', pos: 'CDM', number: 14, flag: '🇵🇹', row: 2, col: 3, playerId: 'William Carvalho', aliases: ['william carvalho', 'วิลเลียม คาร์วัลโญ่'] },
      { slotId: 'rm', pos: 'RM', number: 16, flag: '🇵🇹', row: 2, col: 5, playerId: 'Renato Sanches', aliases: ['renato sanches', 'เรนาโต้ ซานเชส'] },
      { slotId: 'cm', pos: 'CM', number: 23, flag: '🇵🇹', row: 2, col: 2, playerId: 'Adrien Silva', aliases: ['adrien silva', 'อาเดรียน ซิลวา'] },
      { slotId: 'lm', pos: 'LM', number: 10, flag: '🇵🇹', row: 2, col: 1, playerId: 'João Mário', aliases: ['joao mario', 'เจา มาริโอ'] },
      { slotId: 'st1', pos: 'ST', number: 17, flag: '🇵🇹', row: 1, col: 4, playerId: 'Nani', aliases: ['นานี่'] },
      { slotId: 'st2', pos: 'ST', number: 7, flag: '🇵🇹', row: 1, col: 2, playerId: 'Cristiano Ronaldo', aliases: ['ronaldo', 'cr7', 'โรนัลโด้'] }
    ]
  },
  {
    id: 'ita_2021_euro',
    title: '🇮🇹 ทีมชาติอิตาลี - แชมป์ยูโร 2020 ที่เวมบลีย์ (ชนะอังกฤษจุดโทษ)',
    subtitle: 'ระบบ 4-3-3 • กุนซือ: Roberto Mancini',
    formation: '4-3-3',
    clubColor: '#1D4ED8',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 21, flag: '🇮🇹', row: 4, col: 3, playerId: 'Gianluigi Donnarumma', aliases: ['donnarumma', 'ดอนนารุมม่า'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇮🇹', row: 3, col: 5, playerId: 'Giovanni Di Lorenzo', aliases: ['di lorenzo', 'ดิ ลอเรนโซ่'] },
      { slotId: 'cb1', pos: 'CB', number: 19, flag: '🇮🇹', row: 3, col: 4, playerId: 'Leonardo Bonucci', aliases: ['bonucci', 'โบนุชชี่'] },
      { slotId: 'cb2', pos: 'CB', number: 3, flag: '🇮🇹', row: 3, col: 2, playerId: 'Giorgio Chiellini', aliases: ['chiellini', 'คิเอลลินี่'] },
      { slotId: 'lb', pos: 'LB', number: 13, flag: '🇮🇹', row: 3, col: 1, playerId: 'Emerson Palmieri', aliases: ['emerson', 'เอแมร์ซอน'] },
      { slotId: 'cm1', pos: 'CM', number: 18, flag: '🇮🇹', row: 2, col: 4, playerId: 'Nicolò Barella', aliases: ['barella', 'บาเรลล่า'] },
      { slotId: 'cdm', pos: 'CDM', number: 8, flag: '🇮🇹', row: 2, col: 3, playerId: 'Jorginho', aliases: ['จอร์จินโญ่'] },
      { slotId: 'cm2', pos: 'CM', number: 6, flag: '🇮🇹', row: 2, col: 2, playerId: 'Marco Verratti', aliases: ['verratti', 'แวร์รัตติ'] },
      { slotId: 'rw', pos: 'RW', number: 14, flag: '🇮🇹', row: 1, col: 5, playerId: 'Federico Chiesa', aliases: ['chiesa', 'เคียซ่า'] },
      { slotId: 'st', pos: 'ST', number: 17, flag: '🇮🇹', row: 1, col: 3, playerId: 'Ciro Immobile', aliases: ['immobile', 'อิมโมบิเล่'] },
      { slotId: 'lw', pos: 'LW', number: 10, flag: '🇮🇹', row: 1, col: 1, playerId: 'Lorenzo Insigne', aliases: ['insigne', 'อินซินเญ่'] }
    ]
  },
  {
    id: 'eng_2024_euro',
    title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ทีมชาติอังกฤษ - ชุดนัดชิงชนะเลิศ ยูโร 2024',
    subtitle: 'ระบบ 3-4-2-1 • กุนซือ: Gareth Southgate',
    formation: '3-4-2-1',
    clubColor: '#1E3A8A',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 4, col: 3, playerId: 'Jordan Pickford', aliases: ['pickford', 'พิคฟอร์ด'] },
      { slotId: 'cb1', pos: 'CB', number: 2, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 5, playerId: 'Kyle Walker', aliases: ['walker', 'วอล์คเกอร์'] },
      { slotId: 'cb2', pos: 'CB', number: 5, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 3, playerId: 'John Stones', aliases: ['stones', 'จอห์น สโตนส์'] },
      { slotId: 'cb3', pos: 'CB', number: 6, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 3, col: 1, playerId: 'Marc Guéhi', aliases: ['guehi', 'มาร์ค เกฮี'] },
      { slotId: 'rwb', pos: 'RWB', number: 7, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 5, playerId: 'Bukayo Saka', aliases: ['saka', 'ซาก้า'] },
      { slotId: 'cm1', pos: 'CM', number: 26, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 4, playerId: 'Kobbie Mainoo', aliases: ['mainoo', 'ไมนู'] },
      { slotId: 'cm2', pos: 'CM', number: 4, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 2, playerId: 'Declan Rice', aliases: ['rice', 'เดแคลน ไรซ์'] },
      { slotId: 'lwb', pos: 'LWB', number: 3, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 2, col: 1, playerId: 'Luke Shaw', aliases: ['luke shaw', 'ลุค ชอว์'] },
      { slotId: 'cam1', pos: 'CAM', number: 10, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 4, playerId: 'Jude Bellingham', aliases: ['bellingham', 'เบลลิงแฮม'] },
      { slotId: 'cam2', pos: 'CAM', number: 11, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 2, playerId: 'Phil Foden', aliases: ['foden', 'โฟเด้น'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', row: 1, col: 3, playerId: 'Harry Kane', aliases: ['kane', 'แฮร์รี่ เคน'] }
    ]
  },
  {
    id: 'ned_2010_wc',
    title: '🇳🇱 ทีมชาติเนเธอร์แลนด์ - ชุดเข้าชิงฟุตบอลโลก 2010 (ยุค Robben - Sneijder - Van Persie)',
    subtitle: 'ระบบ 4-2-3-1 • กุนซือ: Bert van Marwijk',
    formation: '4-2-3-1',
    clubColor: '#EA580C',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇳🇱', row: 4, col: 3, playerId: 'Maarten Stekelenburg', aliases: ['stekelenburg', 'สเตเคเลนเบิร์ก'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇳🇱', row: 3, col: 5, playerId: 'Gregory van der Wiel', aliases: ['van der wiel', 'ฟาน เดอร์ วีล'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇳🇱', row: 3, col: 4, playerId: 'John Heitinga', aliases: ['heitinga', 'ไฮติงก้า'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇳🇱', row: 3, col: 2, playerId: 'Joris Mathijsen', aliases: ['mathijsen', 'มาไธจ์เซ่น'] },
      { slotId: 'lb', pos: 'LB', number: 5, flag: '🇳🇱', row: 3, col: 1, playerId: 'Giovanni van Bronckhorst', aliases: ['van bronckhorst', 'ฟาน บรองค์ฮอร์สต์'] },
      { slotId: 'cdm1', pos: 'CDM', number: 6, flag: '🇳🇱', row: 2, col: 4, playerId: 'Mark van Bommel', aliases: ['van bommel', 'ฟาน บอมเมล'] },
      { slotId: 'cdm2', pos: 'CDM', number: 8, flag: '🇳🇱', row: 2, col: 2, playerId: 'Nigel de Jong', aliases: ['de jong', 'ไนเจล เดอ ยอง'] },
      { slotId: 'cam', pos: 'CAM', number: 10, flag: '🇳🇱', row: 2, col: 3, playerId: 'Wesley Sneijder', aliases: ['sneijder', 'สไนเดอร์'] },
      { slotId: 'rw', pos: 'RW', number: 11, flag: '🇳🇱', row: 1, col: 5, playerId: 'Arjen Robben', aliases: ['robben', 'ร็อบเบน'] },
      { slotId: 'st', pos: 'ST', number: 9, flag: '🇳🇱', row: 1, col: 3, playerId: 'Robin van Persie', aliases: ['van persie', 'rvp', 'ฟานเพอร์ซี่'] },
      { slotId: 'lw', pos: 'LW', number: 7, flag: '🇳🇱', row: 1, col: 1, playerId: 'Dirk Kuyt', aliases: ['kuyt', 'เดิร์ก เค้าท์'] }
    ]
  },
  {
    id: 'esp_2012_euro',
    title: '🇪🇸 ทีมชาติสเปน - แชมป์ยูโร 2012 ระบบ False 9 (นัดชิงชนะอิตาลี 4-0)',
    subtitle: 'ระบบ 4-3-3 False 9 • กุนซือ: Vicente del Bosque',
    formation: '4-3-3',
    clubColor: '#DC2626',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇪🇸', row: 4, col: 3, playerId: 'Iker Casillas', aliases: ['casillas', 'กาซียาส'] },
      { slotId: 'rb', pos: 'RB', number: 17, flag: '🇪🇸', row: 3, col: 5, playerId: 'Álvaro Arbeloa', aliases: ['arbeloa', 'อาร์เบลัว'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇪🇸', row: 3, col: 4, playerId: 'Gerard Piqué', aliases: ['pique', 'ปิเก้'] },
      { slotId: 'cb2', pos: 'CB', number: 15, flag: '🇪🇸', row: 3, col: 2, playerId: 'Sergio Ramos', aliases: ['ramos', 'รามอส'] },
      { slotId: 'lb', pos: 'LB', number: 18, flag: '🇪🇸', row: 3, col: 1, playerId: 'Jordi Alba', aliases: ['jordi alba', 'จอร์ดี้ อัลบา'] },
      { slotId: 'cdm', pos: 'CDM', number: 16, flag: '🇪🇸', row: 2, col: 3, playerId: 'Sergio Busquets', aliases: ['busquets', 'บุสเก็ตส์'] },
      { slotId: 'cm1', pos: 'CM', number: 14, flag: '🇪🇸', row: 2, col: 4, playerId: 'Xabi Alonso', aliases: ['xabi alonso', 'ชาบี อลอนโซ่'] },
      { slotId: 'cm2', pos: 'CM', number: 8, flag: '🇪🇸', row: 2, col: 2, playerId: 'Xavi Hernández', aliases: ['xavi', 'ชาบี'] },
      { slotId: 'rw', pos: 'RW', number: 21, flag: '🇪🇸', row: 1, col: 5, playerId: 'David Silva', aliases: ['david silva', 'ดาบิด ซิลบา'] },
      { slotId: 'st', pos: 'CF', number: 10, flag: '🇪🇸', row: 1, col: 3, playerId: 'Cesc Fàbregas', aliases: ['fabregas', 'ฟาเบรกาส'] },
      { slotId: 'lw', pos: 'LW', number: 6, flag: '🇪🇸', row: 1, col: 1, playerId: 'Andrés Iniesta', aliases: ['iniesta', 'อิเนียสต้า'] }
    ]
  },
  {
    id: 'bra_2005_confed',
    title: '🇧🇷 ทีมชาติบราซิล - ยุคจตุรเทพ Magic Quartet (Kaká - Ronaldinho - Adriano - Robinho)',
    subtitle: 'ระบบ 4-2-2-2 • กุนซือ: Carlos Alberto Parreira',
    formation: '4-2-2-2',
    clubColor: '#FACC15',
    slots: [
      { slotId: 'gk', pos: 'GK', number: 1, flag: '🇧🇷', row: 4, col: 3, playerId: 'Dida', aliases: ['ดิด้า'] },
      { slotId: 'rb', pos: 'RB', number: 2, flag: '🇧🇷', row: 3, col: 5, playerId: 'Cafu', aliases: ['คาฟู'] },
      { slotId: 'cb1', pos: 'CB', number: 3, flag: '🇧🇷', row: 3, col: 4, playerId: 'Lúcio', aliases: ['lucio', 'ลูซิโอ'] },
      { slotId: 'cb2', pos: 'CB', number: 4, flag: '🇧🇷', row: 3, col: 2, playerId: 'Juan Silveira', aliases: ['juan', 'ฮวน'] },
      { slotId: 'lb', pos: 'LB', number: 6, flag: '🇧🇷', row: 3, col: 1, playerId: 'Roberto Carlos', aliases: ['roberto carlos', 'โรแบร์โต้ คาร์ลอส'] },
      { slotId: 'cdm1', pos: 'CDM', number: 5, flag: '🇧🇷', row: 2, col: 4, playerId: 'Emerson Ferreira', aliases: ['emerson', 'เอแมร์ซอน'] },
      { slotId: 'cdm2', pos: 'CDM', number: 11, flag: '🇧🇷', row: 2, col: 2, playerId: 'Zé Roberto', aliases: ['ze roberto', 'เซ โรแบร์โต้'] },
      { slotId: 'cam1', pos: 'CAM', number: 8, flag: '🇧🇷', row: 2, col: 5, playerId: 'Kaká', aliases: ['kaka', 'กาก้า'] },
      { slotId: 'cam2', pos: 'CAM', number: 10, flag: '🇧🇷', row: 2, col: 1, playerId: 'Ronaldinho', aliases: ['โรนัลดินโญ่'] },
      { slotId: 'st1', pos: 'ST', number: 9, flag: '🇧🇷', row: 1, col: 4, playerId: 'Adriano', aliases: ['อาเดรียโน่'] },
      { slotId: 'st2', pos: 'ST', number: 7, flag: '🇧🇷', row: 1, col: 2, playerId: 'Robinho', aliases: ['โรบินโญ่'] }
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
  },
  {
    id: 'cp_henry',
    answerName: 'Thierry Henry',
    flag: '🇫🇷',
    position: 'FW',
    aliases: ['henry', 'อองรี'],
    hint: 'ดาวยิงสูงสุดตลอดกาลของ Arsenal และหัวหอกยุคไร้พ่าย The Invincibles',
    steps: [
      { years: '1994–1999', club: 'AS Monaco', apps: 105, goals: 20 },
      { years: '1999', club: 'Juventus', apps: 16, goals: 3 },
      { years: '1999–2007', club: 'Arsenal', apps: 254, goals: 174 },
      { years: '2007–2010', club: 'Barcelona', apps: 80, goals: 35 },
      { years: '2010–2014', club: 'New York Red Bulls', apps: 122, goals: 51 }
    ]
  },
  {
    id: 'cp_r9',
    answerName: 'Ronaldo Nazário',
    flag: '🇧🇷',
    position: 'FW',
    aliases: ['r9', 'ronaldo', 'โรนัลโด้อ้วน'],
    hint: 'โล้นทองคำ R9 แชมป์โลก 2 สมัยที่เคยเล่นให้ทั้ง Barcelona, Real Madrid, Inter และ AC Milan',
    steps: [
      { years: '1994–1996', club: 'PSV Eindhoven', apps: 46, goals: 42 },
      { years: '1996–1997', club: 'Barcelona', apps: 37, goals: 34 },
      { years: '1997–2002', club: 'Inter Milan', apps: 68, goals: 49 },
      { years: '2002–2007', club: 'Real Madrid', apps: 127, goals: 83 },
      { years: '2007–2008', club: 'AC Milan', apps: 20, goals: 9 }
    ]
  },
  {
    id: 'cp_beckham',
    answerName: 'David Beckham',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    position: 'MF',
    aliases: ['beckham', 'เบ็คแฮม'],
    hint: 'เจ้าพ่อลูกนิ่งเบอร์ 7 แห่งโอลด์แทรฟฟอร์ดและตำนานยุค Galácticos',
    steps: [
      { years: '1992–2003', club: 'Manchester United', apps: 265, goals: 62 },
      { years: '2003–2007', club: 'Real Madrid', apps: 116, goals: 13 },
      { years: '2007–2012', club: 'LA Galaxy', apps: 98, goals: 18 },
      { years: '2009 & 2010 (ยืมตัว)', club: 'AC Milan', apps: 29, goals: 2 },
      { years: '2013', club: 'Paris Saint-Germain', apps: 10, goals: 0 }
    ]
  },
  {
    id: 'cp_ronaldinho',
    answerName: 'Ronaldinho',
    flag: '🇧🇷',
    position: 'FW',
    aliases: ['โรนัลดินโญ่'],
    hint: 'พ่อมดลูกหนังเจ้าของรอยยิ้มและบัลลงดอร์ปี 2005',
    steps: [
      { years: '1998–2001', club: 'Grêmio', apps: 52, goals: 21 },
      { years: '2001–2003', club: 'Paris Saint-Germain', apps: 55, goals: 17 },
      { years: '2003–2008', club: 'Barcelona', apps: 145, goals: 70 },
      { years: '2008–2011', club: 'AC Milan', apps: 76, goals: 20 }
    ]
  },
  {
    id: 'cp_zidane',
    answerName: 'Zinedine Zidane',
    flag: '🇫🇷',
    position: 'MF',
    aliases: ['zidane', 'zizou', 'ซีดาน'],
    hint: 'จอมทัพหมายเลข 5 ผู้วอลเลย์ด้วยซ้ายพาเรอัล มาดริดคว้าแชมป์ UCL 2002',
    steps: [
      { years: '1989–1992', club: 'AS Cannes', apps: 61, goals: 6 },
      { years: '1992–1996', club: 'Bordeaux', apps: 139, goals: 28 },
      { years: '1996–2001', club: 'Juventus', apps: 151, goals: 24 },
      { years: '2001–2006', club: 'Real Madrid', apps: 155, goals: 37 }
    ]
  },
  {
    id: 'cp_haaland',
    answerName: 'Erling Haaland',
    flag: '🇳🇴',
    position: 'FW',
    aliases: ['haaland', 'ฮาแลนด์'],
    hint: 'เครื่องจักรสังหารประตูชาวนอร์เวย์ เจ้าของสถิติยิง 36 ประตูในพรีเมียร์ลีกฤดูกาลเดียว',
    steps: [
      { years: '2017–2019', club: 'Molde FK', apps: 39, goals: 14 },
      { years: '2019–2020', club: 'Red Bull Salzburg', apps: 16, goals: 17 },
      { years: '2020–2022', club: 'Borussia Dortmund', apps: 67, goals: 62 },
      { years: '2022–ปัจจุบัน', club: 'Manchester City', apps: 75, goals: 73 }
    ]
  },
  {
    id: 'cp_mbappe',
    answerName: 'Kylian Mbappé',
    flag: '🇫🇷',
    position: 'FW',
    aliases: ['mbappe', 'เอ็มบัปเป้'],
    hint: 'ดาวยิงความเร็วแสงทีมชาติฝรั่งเศสผู้ทำแฮตทริกในนัดชิงฟุตบอลโลก 2022',
    steps: [
      { years: '2015–2017', club: 'AS Monaco', apps: 41, goals: 16 },
      { years: '2017–2024', club: 'Paris Saint-Germain', apps: 205, goals: 191 },
      { years: '2024–ปัจจุบัน', club: 'Real Madrid', apps: 20, goals: 12 }
    ]
  },
  {
    id: 'cp_neymar',
    answerName: 'Neymar Jr',
    flag: '🇧🇷',
    position: 'FW',
    aliases: ['neymar', 'เนย์มาร์'],
    hint: 'หนึ่งในสามประสาน MSN แห่งบาร์เซโลน่า และเจ้าของค่าตัวสถิติโลก 222 ล้านยูโร',
    steps: [
      { years: '2009–2013', club: 'Santos FC', apps: 177, goals: 107 },
      { years: '2013–2017', club: 'Barcelona', apps: 123, goals: 68 },
      { years: '2017–2023', club: 'Paris Saint-Germain', apps: 112, goals: 82 },
      { years: '2023–ปัจจุบัน', club: 'Al-Hilal', apps: 7, goals: 1 }
    ]
  },
  {
    id: 'cp_suarez',
    answerName: 'Luis Suárez',
    flag: '🇺🇾',
    position: 'FW',
    aliases: ['suarez', 'ซัวเรซ'],
    hint: 'กองหน้าจอมถล่มประตูชาวอุรุกวัย เจ้าของรางวัลรองเท้าทองคำยุโรป 2 สมัย',
    steps: [
      { years: '2007–2011', club: 'Ajax', apps: 110, goals: 81 },
      { years: '2011–2014', club: 'Liverpool', apps: 110, goals: 69 },
      { years: '2014–2020', club: 'Barcelona', apps: 191, goals: 147 },
      { years: '2020–2022', club: 'Atlético Madrid', apps: 67, goals: 32 },
      { years: '2024–ปัจจุบัน', club: 'Inter Miami', apps: 27, goals: 20 }
    ]
  },
  {
    id: 'cp_bale',
    answerName: 'Gareth Bale',
    flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    position: 'FW',
    aliases: ['bale', 'เบล'],
    hint: 'ปีกพญาวานรชาวเวลส์ผู้ตีลังกายิงประตูสุดสวยในนัดชิง UCL 2018',
    steps: [
      { years: '2006–2007', club: 'Southampton', apps: 40, goals: 5 },
      { years: '2007–2013', club: 'Tottenham Hotspur', apps: 146, goals: 42 },
      { years: '2013–2022', club: 'Real Madrid', apps: 176, goals: 81 },
      { years: '2020–2021 (ยืมตัว)', club: 'Tottenham Hotspur', apps: 20, goals: 11 },
      { years: '2022–2023', club: 'LAFC', apps: 12, goals: 2 }
    ]
  },
  {
    id: 'cp_hazard',
    answerName: 'Eden Hazard',
    flag: '🇧🇪',
    position: 'FW',
    aliases: ['hazard', 'อาซาร์'],
    hint: 'จอมเลื้อยหมายเลข 10 ขวัญใจสาวกสิงห์บลูส์ผู้คว้าแชมป์ลีกเอิงกับลีลล์ก่อนย้ายมาอังกฤษ',
    steps: [
      { years: '2007–2012', club: 'Lille OSC', apps: 147, goals: 36 },
      { years: '2012–2019', club: 'Chelsea', apps: 245, goals: 85 },
      { years: '2019–2023', club: 'Real Madrid', apps: 54, goals: 4 }
    ]
  },
  {
    id: 'cp_rvp',
    answerName: 'Robin van Persie',
    flag: '🇳🇱',
    position: 'FW',
    aliases: ['van persie', 'rvp', 'ฟานเพอร์ซี่'],
    hint: 'ดาวยิงเท้าซ้ายชั่งทองชาวดัตช์ผู้คว้าดาวซัลโวพรีเมียร์ลีกกับทั้ง Arsenal และ Man Utd',
    steps: [
      { years: '2001–2004', club: 'Feyenoord', apps: 61, goals: 15 },
      { years: '2004–2012', club: 'Arsenal', apps: 194, goals: 96 },
      { years: '2012–2015', club: 'Manchester United', apps: 86, goals: 48 },
      { years: '2015–2018', club: 'Fenerbahçe', apps: 57, goals: 25 }
    ]
  },
  {
    id: 'cp_fabregas',
    answerName: 'Cesc Fàbregas',
    flag: '🇪🇸',
    position: 'MF',
    aliases: ['fabregas', 'ฟาเบรกาส'],
    hint: 'มิดฟิลด์จอมแอสซิสต์ชาวสเปนที่เคยเป็นกัปตันทีมอาร์เซนอลตั้งแต่อายุยังน้อย',
    steps: [
      { years: '2003–2011', club: 'Arsenal', apps: 212, goals: 35 },
      { years: '2011–2014', club: 'Barcelona', apps: 96, goals: 28 },
      { years: '2014–2019', club: 'Chelsea', apps: 138, goals: 15 },
      { years: '2019–2022', club: 'AS Monaco', apps: 54, goals: 3 }
    ]
  },
  {
    id: 'cp_torres',
    answerName: 'Fernando Torres',
    flag: '🇪🇸',
    position: 'FW',
    aliases: ['torres', 'ตอร์เรส', 'เอลนินโญ่'],
    hint: 'ฉายา "เอล นินโญ่" กองหน้าผมทองผู้ยิงประตูชัยให้สเปนคว้าแชมป์ยูโร 2008',
    steps: [
      { years: '2001–2007', club: 'Atlético Madrid', apps: 214, goals: 82 },
      { years: '2007–2011', club: 'Liverpool', apps: 102, goals: 65 },
      { years: '2011–2015', club: 'Chelsea', apps: 110, goals: 20 },
      { years: '2014–2015', club: 'AC Milan', apps: 10, goals: 1 },
      { years: '2015–2018', club: 'Atlético Madrid', apps: 107, goals: 27 }
    ]
  },
  {
    id: 'cp_alonso',
    answerName: 'Xabi Alonso',
    flag: '🇪🇸',
    position: 'MF',
    aliases: ['xabi alonso', 'ชาบี อลอนโซ่'],
    hint: 'กองกลางจอมวางบอลยาวผู้คว้าแชมป์ UCL กับทั้งลิเวอร์พูลและเรอัล มาดริด',
    steps: [
      { years: '2000–2004', club: 'Real Sociedad', apps: 114, goals: 9 },
      { years: '2004–2009', club: 'Liverpool', apps: 143, goals: 15 },
      { years: '2009–2014', club: 'Real Madrid', apps: 158, goals: 4 },
      { years: '2014–2017', club: 'Bayern Munich', apps: 79, goals: 5 }
    ]
  },
  {
    id: 'cp_pirlo',
    answerName: 'Andrea Pirlo',
    flag: '🇮🇹',
    position: 'MF',
    aliases: ['pirlo', 'ปีร์โล่'],
    hint: 'สถาปนิกลูกหนังแดนมะกะโรนีที่ผ่านการค้าแข้งกับ 3 ยักษ์ใหญ่แห่งกัลโช่ เซเรียอา',
    steps: [
      { years: '1998–2001', club: 'Inter Milan', apps: 22, goals: 0 },
      { years: '2001–2011', club: 'AC Milan', apps: 284, goals: 32 },
      { years: '2011–2015', club: 'Juventus', apps: 119, goals: 16 },
      { years: '2015–2017', club: 'New York City FC', apps: 60, goals: 1 }
    ]
  },
  {
    id: 'cp_robben',
    answerName: 'Arjen Robben',
    flag: '🇳🇱',
    position: 'FW',
    aliases: ['robben', 'ร็อบเบน'],
    hint: 'ปีกจรวดทางเรียบชาวดัตช์เจ้าของท่าไม้ตายลากตัดเข้าในแล้วยิงปั่นด้วยซ้าย',
    steps: [
      { years: '2002–2004', club: 'PSV Eindhoven', apps: 56, goals: 17 },
      { years: '2004–2007', club: 'Chelsea', apps: 67, goals: 15 },
      { years: '2007–2009', club: 'Real Madrid', apps: 50, goals: 11 },
      { years: '2009–2019', club: 'Bayern Munich', apps: 201, goals: 99 }
    ]
  },
  {
    id: 'cp_alexis',
    answerName: 'Alexis Sánchez',
    flag: '🇨🇱',
    position: 'FW',
    aliases: ['alexis', 'sanchez', 'อเล็กซิส'],
    hint: 'แนวรุกพลังไดนาโมชาวชิลีผู้พาทีมชาติคว้าแชมป์ Copa América 2 สมัยติด',
    steps: [
      { years: '2008–2011', club: 'Udinese', apps: 95, goals: 20 },
      { years: '2011–2014', club: 'Barcelona', apps: 88, goals: 39 },
      { years: '2014–2018', club: 'Arsenal', apps: 122, goals: 60 },
      { years: '2018–2020', club: 'Manchester United', apps: 32, goals: 3 },
      { years: '2019–2022', club: 'Inter Milan', apps: 79, goals: 16 },
      { years: '2022–2023', club: 'Olympique Marseille', apps: 35, goals: 14 }
    ]
  },
  {
    id: 'cp_aubameyang',
    answerName: 'Pierre-Emerick Aubameyang',
    flag: '🇬🇦',
    position: 'FW',
    aliases: ['aubameyang', 'auba', 'โอบาเมยอง'],
    hint: 'กองหน้าความเร็วสูงชาวกาบองผู้ทำท่าดีใจตีลังกาสวมหน้ากากซูเปอร์ฮีโร่',
    steps: [
      { years: '2011–2013', club: 'Saint-Étienne', apps: 87, goals: 37 },
      { years: '2013–2018', club: 'Borussia Dortmund', apps: 144, goals: 98 },
      { years: '2018–2022', club: 'Arsenal', apps: 128, goals: 68 },
      { years: '2022', club: 'Barcelona', apps: 18, goals: 11 },
      { years: '2022–2023', club: 'Chelsea', apps: 15, goals: 1 },
      { years: '2023–2024', club: 'Olympique Marseille', apps: 34, goals: 17 }
    ]
  },
  {
    id: 'cp_tevez',
    answerName: 'Carlos Tevez',
    flag: '🇦🇷',
    position: 'FW',
    aliases: ['tevez', 'เตเวซ'],
    hint: 'กองหน้ามะขามข้อเดียวชาวอาร์เจนไตน์ผู้คว้าแชมป์พรีเมียร์ลีกกับทั้งสองทีมแห่งเมืองแมนเชสเตอร์',
    steps: [
      { years: '2006–2007', club: 'West Ham United', apps: 26, goals: 7 },
      { years: '2007–2009', club: 'Manchester United', apps: 63, goals: 19 },
      { years: '2009–2013', club: 'Manchester City', apps: 113, goals: 58 },
      { years: '2013–2015', club: 'Juventus', apps: 66, goals: 39 },
      { years: '2015–2021', club: 'Boca Juniors', apps: 114, goals: 42 }
    ]
  },
  {
    id: 'cp_etoo',
    answerName: 'Samuel Eto\'o',
    flag: '🇨🇲',
    position: 'FW',
    aliases: ['etoo', 'เอโต้'],
    hint: 'ตำนานกองหน้าชาวแคเมอรูนผู้คว้าทริปเปิลแชมป์ 2 ปีติดต่อกันกับ Barcelona และ Inter Milan',
    steps: [
      { years: '2000–2004', club: 'RCD Mallorca', apps: 133, goals: 54 },
      { years: '2004–2009', club: 'Barcelona', apps: 144, goals: 108 },
      { years: '2009–2011', club: 'Inter Milan', apps: 67, goals: 33 },
      { years: '2013–2014', club: 'Chelsea', apps: 21, goals: 9 },
      { years: '2014–2015', club: 'Everton', apps: 14, goals: 3 }
    ]
  },
  {
    id: 'cp_bellingham',
    answerName: 'Jude Bellingham',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    position: 'MF',
    aliases: ['bellingham', 'เบลลิงแฮม'],
    hint: 'มิดฟิลด์ดาวรุ่งทีมชาติอังกฤษเจ้าของท่าดีใจกางแขนและเบอร์ 5 แห่งเรอัล มาดริด',
    steps: [
      { years: '2019–2020', club: 'Birmingham City', apps: 41, goals: 4 },
      { years: '2020–2023', club: 'Borussia Dortmund', apps: 92, goals: 12 },
      { years: '2023–ปัจจุบัน', club: 'Real Madrid', apps: 45, goals: 23 }
    ]
  }
];

const TRIVIA_QUESTIONS = [
  // ================= EASY (ระดับง่าย) =================
  {
    id: 'tr_easy_1',
    difficulty: 'easy',
    question: 'สโมสรเดียวในพรีเมียร์ลีกยุค 38 นัด ที่คว้าแชมป์โดย "ไม่แพ้ใครเลยตลอดทั้งฤดูกาล" (The Invincibles) คือทีมใด?',
    options: ['Chelsea', 'Manchester United', 'Arsenal', 'Manchester City'],
    correctIndex: 2,
    explanation: 'Arsenal ยุคไร้พ่าย (ฤดูกาล 2003/04) จบฤดูกาลด้วยสถิติ ชนะ 26 เสมอ 12 แพ้ 0'
  },
  {
    id: 'tr_easy_2',
    difficulty: 'easy',
    question: 'ในนัดชิงชนะเลิศฟุตบอลโลก 2022 (อาร์เจนตินา พบ ฝรั่งเศส) คีลิยัน เอ็มบัปเป้ ยิงในเวลา 120 นาทีไปกี่ประตู?',
    options: ['1 ประตู', '2 ประตู', '3 ประตู', '4 ประตู'],
    correctIndex: 2,
    explanation: 'Kylian Mbappé ยิงแฮตทริก 3 ประตูในเกมนัดชิงบอลโลก 2022 ก่อนตัดสินที่จุดโทษ'
  },
  {
    id: 'tr_easy_3',
    difficulty: 'easy',
    question: 'ใครคือผู้ยิงประตูชัยในนาที 93:20 พา แมนเชสเตอร์ ซิตี้ แซงคว้าแชมป์พรีเมียร์ลีกฤดูกาล 2011/12?',
    options: ['Edin Džeko', 'David Silva', 'Yaya Touré', 'Sergio Agüero'],
    correctIndex: 3,
    explanation: 'Sergio "Kun" Agüero ยิงประตูชัยนาที 93:20 ในเกมชนะ QPR 3-2'
  },
  {
    id: 'tr_easy_4',
    difficulty: 'easy',
    question: 'สโมสรใดคว้าแชมป์ บุนเดสลีกา เยอรมนี ฤดูกาล 2023/24 แบบไร้พ่ายตลอดทั้งฤดูกาลเป็นครั้งแรกในประวัติศาสตร์ลีก?',
    options: ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig'],
    correctIndex: 2,
    explanation: 'Bayer Leverkusen ของกุนซือ Xabi Alonso คว้าแชมป์บุนเดสลีกา 2023/24 แบบไม่แพ้ใครเลยตลอด 34 นัด'
  },
  {
    id: 'tr_easy_5',
    difficulty: 'easy',
    question: 'ชาติใดเป็นเจ้าของสถิติคว้าแชมป์ฟุตบอลโลก (FIFA World Cup) มากที่สุดในประวัติศาสตร์ถึง 5 สมัย?',
    options: ['เยอรมนี', 'อิตาลี', 'อาร์เจนตินา', 'บราซิล'],
    correctIndex: 3,
    explanation: 'ทีมชาติบราซิลคว้าแชมป์โลก 5 สมัย (1958, 1962, 1970, 1994, 2002)'
  },
  {
    id: 'tr_easy_6',
    difficulty: 'easy',
    question: 'นักเตะคนใดเป็นเจ้าของสถิติค่าตัวแพงที่สุดในประวัติศาสตร์ฟุตบอลโลก (222 ล้านยูโร)?',
    options: ['Kylian Mbappé', 'Neymar Jr', 'Philippe Coutinho', 'Jude Bellingham'],
    correctIndex: 1,
    explanation: 'Neymar Jr ย้ายจาก Barcelona ไป Paris Saint-Germain ในปี 2017 ด้วยค่าฉีกสัญญา 222 ล้านยูโร'
  },
  {
    id: 'tr_easy_7',
    difficulty: 'easy',
    question: 'สนามเหย้าของสโมสร เรอัล มาดริด มีชื่อว่าอะไร?',
    options: ['Camp Nou', 'Santiago Bernabéu', 'Wanda Metropolitano', 'Mestalla'],
    correctIndex: 1,
    explanation: 'Santiago Bernabéu คือสนามเหย้าคู่บุญของสโมสร Real Madrid'
  },
  {
    id: 'tr_easy_8',
    difficulty: 'easy',
    question: 'นักเตะคนใดคว้ารางวัล บัลลงดอร์ (Ballon d\'Or) มากที่สุดในประวัติศาสตร์ถึง 8 สมัย?',
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Michel Platini', 'Johan Cruyff'],
    correctIndex: 1,
    explanation: 'Lionel Messi คว้ารางวัล Ballon d\'Or ไปครองถึง 8 สมัย'
  },

  // ================= MEDIUM (ระดับปานกลาง) =================
  {
    id: 'tr_med_1',
    difficulty: 'medium',
    question: 'สโมสรใดคว้าแชมป์ ยูฟ่า แชมเปียนส์ลีก (รวมยูโรเปียนคัพ) มากที่สุดเป็นอันดับ 2 รองจาก เรอัล มาดริด?',
    options: ['Liverpool', 'AC Milan', 'Bayern Munich', 'Barcelona'],
    correctIndex: 1,
    explanation: 'AC Milan คว้าแชมป์ไปถึง 7 สมัย รองจาก Real Madrid (15 สมัย)'
  },
  {
    id: 'tr_med_2',
    difficulty: 'medium',
    question: 'ใครคือผู้เล่นที่ทำ "แฮตทริกเร็วที่สุด" ในประวัติศาสตร์พรีเมียร์ลีก อังกฤษ (ใช้เวลาเพียง 2 นาที 56 วินาที)?',
    options: ['Sadio Mané', 'Robbie Fowler', 'Sergio Agüero', 'Erling Haaland'],
    correctIndex: 0,
    explanation: 'Sadio Mané ทำแฮตทริกในเวลา 2 นาที 56 วินาที สมัยอยู่ Southampton นัดพบ Aston Villa ปี 2015'
  },
  {
    id: 'tr_med_3',
    difficulty: 'medium',
    question: 'นักเตะคนใดเป็นเจ้าของสถิติยิงประตูใน 1 ปีปฏิทิน (Calendar Year) สูงที่สุดในโลกถึง 91 ประตู ในปี 2012?',
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Gerd Müller'],
    correctIndex: 1,
    explanation: 'Lionel Messi ยิงไปถึง 91 ประตูในปี 2012 ทำลายสถิติเดิมของ Gerd Müller (85 ประตู)'
  },
  {
    id: 'tr_med_4',
    difficulty: 'medium',
    question: 'ใครคือเจ้าของสถิติดาวซัลโวสูงสุดตลอดกาลของศึก พรีเมียร์ลีก อังกฤษ ด้วยผลงาน 260 ประตู?',
    options: ['Wayne Rooney', 'Harry Kane', 'Alan Shearer', 'Thierry Henry'],
    correctIndex: 2,
    explanation: 'Alan Shearer คือนักเตะที่ยิงประตูในพรีเมียร์ลีกสูงสุดตลอดกาลที่ 260 ประตู'
  },
  {
    id: 'tr_med_5',
    difficulty: 'medium',
    question: 'กุนซือคนใดพาทีมคว้าแชมป์ ยูฟ่า แชมเปียนส์ลีก ในฐานะผู้จัดการทีมมากที่สุดในประวัติศาสตร์ (5 สมัย)?',
    options: ['Pep Guardiola', 'Sir Alex Ferguson', 'Carlo Ancelotti', 'Zinedine Zidane'],
    correctIndex: 2,
    explanation: 'Carlo Ancelotti คว้าแชมป์ UCL ในฐานะกุนซือถึง 5 สมัย (กับ AC Milan 2 สมัย และ Real Madrid 3 สมัย)'
  },
  {
    id: 'tr_med_6',
    difficulty: 'medium',
    question: 'โรเบิร์ต เลวานดอฟสกี้ เคยเปลี่ยนตัวลงมาเป็นสำรองแล้วยิงคนเดียว 5 ประตูภายในเวลาเพียง 9 นาที ในเกมพบกับทีมใด?',
    options: ['Borussia Dortmund', 'VfL Wolfsburg', 'Schalke 04', 'Hamburger SV'],
    correctIndex: 1,
    explanation: 'Lewandowski ยิง 5 ประตูใน 9 นาทีให้ Bayern Munich ในเกมพบ VfL Wolfsburg เมื่อปี 2015'
  },
  {
    id: 'tr_med_7',
    difficulty: 'medium',
    question: 'สโมสร เลสเตอร์ ซิตี้ สร้างเทพนิยายคว้าแชมป์พรีเมียร์ลีก อังกฤษ ครั้งประวัติศาสตร์ในฤดูกาลใด?',
    options: ['2014/15', '2015/16', '2016/17', '2017/18'],
    correctIndex: 1,
    explanation: 'Leicester City ของกุนซือ Claudio Ranieri คว้าแชมป์พรีเมียร์ลีกในฤดูกาล 2015/16'
  },
  {
    id: 'tr_med_8',
    difficulty: 'medium',
    question: 'ใครคือนักเตะที่ทำแอสซิสต์สูงสุดตลอดกาลของศึก พรีเมียร์ลีก อังกฤษ (162 แอสซิสต์)?',
    options: ['Kevin De Bruyne', 'Cesc Fàbregas', 'Ryan Giggs', 'Frank Lampard'],
    correctIndex: 2,
    explanation: 'Ryan Giggs เป็นเจ้าของสถิติแอสซิสต์สูงสุดตลอดกาลของพรีเมียร์ลีกที่ 162 ครั้ง'
  },

  // ================= HARD (ระดับยาก - แฟนพันธุ์แท้!) =================
  {
    id: 'tr_hard_1',
    difficulty: 'hard',
    question: 'ผู้รักษาประตูคนเดียวในประวัติศาสตร์ที่เคยคว้ารางวัล บัลลงดอร์ (Ballon d\'Or) มาครองได้คือใคร?',
    options: ['Lev Yashin', 'Gianluigi Buffon', 'Manuel Neuer', 'Iker Casillas'],
    correctIndex: 0,
    explanation: 'Lev Yashin ตำนานนายทวารฉายา "แมงมุมดำ" แห่งสหภาพโซเวียต คว้าบัลลงดอร์ในปี 1963'
  },
  {
    id: 'tr_hard_2',
    difficulty: 'hard',
    question: 'นักเตะคนเดียวในประวัติศาสตร์ที่คว้าแชมป์ ยูฟ่า แชมเปียนส์ลีก กับ 3 สโมสรที่แตกต่างกัน คือใคร?',
    options: ['Cristiano Ronaldo', 'Clarence Seedorf', 'Samuel Eto\'o', 'Zlatan Ibrahimović'],
    correctIndex: 1,
    explanation: 'Clarence Seedorf คว้าแชมป์ UCL กับ 3 สโมสร ได้แก่ Ajax (1995), Real Madrid (1998) และ AC Milan (2003, 2007)'
  },
  {
    id: 'tr_hard_3',
    difficulty: 'hard',
    question: 'สโมสรใดเป็นเจ้าของสถิติเสียประตูน้อยที่สุดต่อ 1 ฤดูกาลในประวัติศาสตร์พรีเมียร์ลีก (เสียเพียง 15 ประตูจาก 38 นัด)?',
    options: ['Arsenal (2003/04)', 'Chelsea (2004/05)', 'Manchester United (2007/08)', 'Liverpool (2018/19)'],
    correctIndex: 1,
    explanation: 'Chelsea ยุคของ José Mourinho ในฤดูกาล 2004/05 เสียไปเพียง 15 ประตูตลอดทั้งฤดูกาล'
  },
  {
    id: 'tr_hard_4',
    difficulty: 'hard',
    question: 'ใครคือผู้ยิงประตูที่เร็วที่สุดในประวัติศาสตร์ พรีเมียร์ลีก อังกฤษ ด้วยเวลาเพียง 7.69 วินาที หลังเริ่มเขี่ยบอล?',
    options: ['Shane Long', 'Ledley King', 'Alan Shearer', 'Christian Eriksen'],
    correctIndex: 0,
    explanation: 'Shane Long (Southampton) ยิงประตูใส่ Watford ในปี 2019 ด้วยเวลาเพียง 7.69 วินาที'
  },
  {
    id: 'tr_hard_5',
    difficulty: 'hard',
    question: 'ใครคือเจ้าของสถิติดาวซัลโวสูงสุดตลอดกาลในศึกฟุตบอลโลก รอบสุดท้าย (ยิงรวม 16 ประตู)?',
    options: ['Ronaldo Nazário', 'Miroslav Klose', 'Gerd Müller', 'Just Fontaine'],
    correctIndex: 1,
    explanation: 'Miroslav Klose กองหน้าทีมชาติเยอรมนี ทำสถิติยิงในฟุตบอลโลกรอบสุดท้ายรวม 16 ประตู'
  },
  {
    id: 'tr_hard_6',
    difficulty: 'hard',
    question: 'ในเกมนัดชิง UCL ปี 2005 ที่อิสตันบูล (ลิเวอร์พูล ตามหลัง เอซี มิลาน 0-3 ในครึ่งแรก) ใครคือคนยิงประตูตีไข่แตก 1-3 ให้ลิเวอร์พูล?',
    options: ['Vladimír Šmicer', 'Xabi Alonso', 'Steven Gerrard', 'John Arne Riise'],
    correctIndex: 2,
    explanation: 'กัปตันทีม Steven Gerrard โหม่งประตูตีไข่แตกในนาทีที่ 54 จุดประกายคัมแบ็กตีเสมอ 3-3'
  },
  {
    id: 'tr_hard_7',
    difficulty: 'hard',
    question: 'นักเตะคนใดครองสถิติยิงประตูติดต่อกันทุกนัดยาวนานที่สุดในพรีเมียร์ลีก (11 นัดติดต่อกัน)?',
    options: ['Ruud van Nistelrooy', 'Jamie Vardy', 'Erling Haaland', 'Mohamed Salah'],
    correctIndex: 1,
    explanation: 'Jamie Vardy ยิงประตู 11 นัดติดต่อกันในพรีเมียร์ลีกฤดูกาล 2015/16 ทำลายสถิติเดิมของ Van Nistelrooy (10 นัด)'
  },
  {
    id: 'tr_hard_8',
    difficulty: 'hard',
    question: 'สโมสรจากประเทศอังกฤษทีมแรกที่สามารถคว้าแชมป์ ยูโรเปียนคัพ (UCL) มาครองได้สำเร็จคือทีมใด (ในปี 1968)?',
    options: ['Liverpool', 'Manchester United', 'Nottingham Forest', 'Aston Villa'],
    correctIndex: 1,
    explanation: 'Manchester United ของกุนซือ Sir Matt Busby เป็นทีมแรกของอังกฤษที่คว้าแชมป์ยูโรเปียนคัพในปี 1968 (ทีมแรกของสหราชอาณาจักรคือ Celtic ปี 1967)'
  },
  // ================= ADDITIONAL EASY / MEDIUM / HARD QUESTIONS =================
  {
    id: 'tr_easy_9',
    difficulty: 'easy',
    question: 'ฉายา "ปีศาจแดง" (The Red Devils) เป็นฉายาของสโมสรใดในศึกพรีเมียร์ลีก อังกฤษ?',
    options: ['Liverpool', 'Arsenal', 'Manchester United', 'Nottingham Forest'],
    correctIndex: 2,
    explanation: 'Manchester United มีฉายาว่า "ปีศาจแดง" (The Red Devils) ส่วน Liverpool คือ "หงส์แดง"'
  },
  {
    id: 'tr_easy_10',
    difficulty: 'easy',
    question: 'ทีมชาติใดคว้าแชมป์ฟุตบอลชิงแชมป์แห่งชาติยุโรป (UEFA Euro 2024) ที่จัดขึ้นที่ประเทศเยอรมนี?',
    options: ['อังกฤษ', 'ฝรั่งเศส', 'สเปน', 'เยอรมนี'],
    correctIndex: 2,
    explanation: 'ทีมชาติสเปน เอาชนะ ทีมชาติอังกฤษ 2-1 ในนัดชิงชนะเลิศ คว้าแชมป์ยูโรสมัยที่ 4 สูงสุดในประวัติศาสตร์'
  },
  {
    id: 'tr_easy_11',
    difficulty: 'easy',
    question: 'ศึก "เอล กลาซิโก้" (El Clásico) คือการปะทะกันระหว่างสองสโมสรยักษ์ใหญ่คู่ใด?',
    options: ['Real Madrid พบ Atlético Madrid', 'Real Madrid พบ Barcelona', 'Barcelona พบ Sevilla', 'AC Milan พบ Inter Milan'],
    correctIndex: 1,
    explanation: 'El Clásico คือศึกดาร์บี้แมตช์ระดับโลกระหว่าง Real Madrid และ Barcelona'
  },
  {
    id: 'tr_easy_12',
    difficulty: 'easy',
    question: 'เออร์ลิง ฮาแลนด์ (Erling Haaland) ลงเล่นให้กับทีมชาติใด?',
    options: ['สวีเดน', 'เดนมาร์ก', 'นอร์เวย์', 'ฟินแลนด์'],
    correctIndex: 2,
    explanation: 'Erling Haaland เป็นดาวยิงทีมชาตินอร์เวย์ (Norway)'
  },
  {
    id: 'tr_easy_13',
    difficulty: 'easy',
    question: 'สนามเหย้า "แอนฟิลด์" (Anfield) เป็นรังเหย้าของสโมสรใด?',
    options: ['Everton', 'Liverpool', 'Manchester United', 'Aston Villa'],
    correctIndex: 1,
    explanation: 'Anfield คือสนามเหย้าอันเลื่องชื่อของสโมสร Liverpool'
  },
  {
    id: 'tr_easy_14',
    difficulty: 'easy',
    question: 'นักเตะชาวเอเชียคนแรกที่คว้ารางวัลดาวซัลโวพรีเมียร์ลีก อังกฤษ (Golden Boot ฤดูกาล 2021/22) คือใคร?',
    options: ['Park Ji-sung', 'Shinji Kagawa', 'Son Heung-min', 'Kaoru Mitoma'],
    correctIndex: 2,
    explanation: 'Son Heung-min ยิง 23 ประตูในพรีเมียร์ลีก 2021/22 คว้ารางวัลดาวซัลโวร่วมกับ Mohamed Salah'
  },
  {
    id: 'tr_easy_15',
    difficulty: 'easy',
    question: 'สโมสรใดเป็นเจ้าของสถิติคว้าแชมป์ บุนเดสลีกา เยอรมนี มากที่สุดในประวัติศาสตร์?',
    options: ['Borussia Dortmund', 'Bayer Leverkusen', 'Bayern Munich', 'Werder Bremen'],
    correctIndex: 2,
    explanation: 'Bayern Munich ครองความยิ่งใหญ่คว้าแชมป์บุนเดสลีกามากที่สุดเกิน 32 สมัย'
  },
  {
    id: 'tr_easy_16',
    difficulty: 'easy',
    question: 'ใครคือผู้รักษาประตูมือหนึ่งทีมชาติอาร์เจนตินาชุดคว้าแชมป์ฟุตบอลโลก 2022 ที่กาตาร์?',
    options: ['Sergio Romero', 'Willy Caballero', 'Emiliano Martínez', 'Franco Armani'],
    correctIndex: 2,
    explanation: 'Emiliano "Dibu" Martínez เป็นฮีโร่เซฟลูกหลุดเดี่ยวและจุดโทษพาอาร์เจนตินาคว้าแชมป์โลก 2022'
  },
  {
    id: 'tr_med_9',
    difficulty: 'medium',
    question: 'สโมสรใดจากอังกฤษที่สามารถคว้า "ทริปเปิลแชมป์" (พรีเมียร์ลีก + เอฟเอคัพ + ยูฟ่า แชมเปียนส์ลีก) ในฤดูกาล 1998/99?',
    options: ['Arsenal', 'Liverpool', 'Manchester United', 'Chelsea'],
    correctIndex: 2,
    explanation: 'Manchester United ของ Sir Alex Ferguson สร้างประวัติศาสตร์คว้า Treble แชมป์ในฤดูกาล 1998/99'
  },
  {
    id: 'tr_med_10',
    difficulty: 'medium',
    question: 'ใครคือผู้ยิงประตูโทนในช่วงต่อเวลาพิเศษพาทีมชาติสเปนชนะเนเธอร์แลนด์ 1-0 คว้าแชมป์ฟุตบอลโลก 2010?',
    options: ['David Villa', 'Fernando Torres', 'Andrés Iniesta', 'Xavi Hernández'],
    correctIndex: 2,
    explanation: 'Andrés Iniesta ยิงประตูชัยในนาทีที่ 116 พาสเปนคว้าแชมป์โลกสมัยแรกในประวัติศาสตร์'
  },
  {
    id: 'tr_med_11',
    difficulty: 'medium',
    question: 'ก่อนย้ายมาสร้างชื่อกับ อาร์เซนอล เธียร์รี่ อองรี (Thierry Henry) เคยค้าแข้งกับสโมสรใดในกัลโช่ เซเรียอา อิตาลี?',
    options: ['AC Milan', 'Inter Milan', 'Juventus', 'AS Roma'],
    correctIndex: 2,
    explanation: 'Thierry Henry ค้าแข้งกับ Juventus ช่วงสั้นๆ ในปี 1999 ก่อนที่ Arsène Wenger จะดึงตัวมาอยู่กับ Arsenal'
  },
  {
    id: 'tr_med_12',
    difficulty: 'medium',
    question: 'นักเตะคนใดเป็นเจ้าของสถิติคว้าแชมป์พรีเมียร์ลีก อังกฤษ มากที่สุดในประวัติศาสตร์ (13 สมัย)?',
    options: ['Paul Scholes', 'Ryan Giggs', 'Wayne Rooney', 'Gary Neville'],
    correctIndex: 1,
    explanation: 'Ryan Giggs คว้าแชมป์พรีเมียร์ลีกร่วมกับ Manchester United ไปถึง 13 สมัย'
  },
  {
    id: 'tr_med_13',
    difficulty: 'medium',
    question: 'ดิดิเยร์ ดร็อกบา (Didier Drogba) ย้ายจากสโมสรใดในลีกเอิง ฝรั่งเศส มาร่วมทีม เชลซี ในปี 2004?',
    options: ['Paris Saint-Germain', 'Olympique Lyonnais', 'Olympique Marseille', 'AS Monaco'],
    correctIndex: 2,
    explanation: 'Didier Drogba ย้ายจาก Olympique Marseille มาร่วมทัพ Chelsea ในปี 2004'
  },
  {
    id: 'tr_med_14',
    difficulty: 'medium',
    question: 'ใครคือผู้โหม่งประตูตีเสมอ 1-1 ในนาทีที่ 92:48 พา เรอัล มาดริด รอดตายก่อนชนะ แอตฯ มาดริด คว้าแชมป์ UCL 2014 (La Décima)?',
    options: ['Cristiano Ronaldo', 'Gareth Bale', 'Sergio Ramos', 'Karim Benzema'],
    correctIndex: 2,
    explanation: 'Sergio Ramos โหม่งประตูตีเสมอจากลูกเตะมุมของ Luka Modrić ในนาที 92:48'
  },
  {
    id: 'tr_med_15',
    difficulty: 'medium',
    question: 'นักเตะคนใดคว้ารางวัล บัลลงดอร์ ปี 2018 หยุดการผูกขาด 10 ปีติดต่อกันของ เมสซี่ และ โรนัลโด้?',
    options: ['Antoine Griezmann', 'Luka Modrić', 'Karim Benzema', 'Virgil van Dijk'],
    correctIndex: 1,
    explanation: 'Luka Modrić คว้าแชมป์ UCL กับเรอัล มาดริด และพาโครเอเชียเข้าชิงฟุตบอลโลก 2018 จนคว้าบัลลงดอร์ไปครอง'
  },
  {
    id: 'tr_med_16',
    difficulty: 'medium',
    question: 'ซลาตัน อิบราฮิโมวิช เคยค้าแข้งให้กับสโมสรยักษ์ใหญ่ในอิตาลีครบทั้ง 3 ทีม (ยูเวนตุส, อินเตอร์ มิลาน, เอซี มิลาน) แต่เขาไม่เคยเล่นให้ทีมใดต่อไปนี้?',
    options: ['Barcelona', 'Paris Saint-Germain', 'Bayern Munich', 'Manchester United'],
    correctIndex: 2,
    explanation: 'Zlatan เคยเล่นให้ Ajax, Juventus, Inter, Barcelona, AC Milan, PSG, Man Utd และ LA Galaxy แต่ไม่เคยเล่นให้ Bayern Munich'
  },
  {
    id: 'tr_hard_9',
    difficulty: 'hard',
    question: 'ในนัดชิง UCL ปี 1999 ที่คัมป์นู (แมนฯ ยูไนเต็ด พลิกชนะ บาเยิร์น 2-1 ช่วงทดเจ็บ) ใครคือผู้ยิงประตูตีเสมอ 1-1 ในนาทีที่ 90+1?',
    options: ['Ole Gunnar Solskjær', 'Teddy Sheringham', 'David Beckham', 'Dwight Yorke'],
    correctIndex: 1,
    explanation: 'Teddy Sheringham ยิงตีเสมอ 1-1 นาที 90+1 ก่อนที่ Ole Gunnar Solskjær จะยิงประตูชัย 2-1 ในนาที 90+3'
  },
  {
    id: 'tr_hard_10',
    difficulty: 'hard',
    question: 'ใครคือผู้รักษาประตูที่ครองสถิติเก็บคลีนชีต (ไม่เสียประตู) สูงสุดตลอดกาลในประวัติศาสตร์ พรีเมียร์ลีก อังกฤษ (202 คลีนชีต)?',
    options: ['David James', 'Peter Schmeichel', 'Edwin van der Sar', 'Petr Čech'],
    correctIndex: 3,
    explanation: 'Petr Čech เก็บคลีนชีตรวม 202 นัดในพรีเมียร์ลีกกับ Chelsea และ Arsenal'
  },
  {
    id: 'tr_hard_11',
    difficulty: 'hard',
    question: 'ทีมชาติใดสร้างเทพนิยายคว้าแชมป์ ยูโร 2004 ที่ประเทศโปรตุเกสเป็นเจ้าภาพ ด้วยการเอาชนะโปรตุเกสทั้งนัดเปิดสนามและนัดชิงชนะเลิศ?',
    options: ['เดนมาร์ก', 'กรีซ', 'สาธารณรัฐเช็ก', 'รัสเซีย'],
    correctIndex: 1,
    explanation: 'ทีมชาติกรีซ ของกุนซือ Otto Rehhagel หักปากกาเซียนคว้าแชมป์ Euro 2004 จากลูกโหม่งของ Angelos Charisteas'
  },
  {
    id: 'tr_hard_12',
    difficulty: 'hard',
    question: 'ใครคือผู้ยิงประตูชัยในช่วงต่อเวลาพิเศษ พาทีมชาติเยอรมนี ชนะ อาร์เจนตินา 1-0 คว้าแชมป์ฟุตบอลโลก 2014 ที่บราซิล?',
    options: ['Thomas Müller', 'Toni Kroos', 'Mario Götze', 'André Schürrle'],
    correctIndex: 2,
    explanation: 'Mario Götze พักอกแล้วยิงวอลเลย์ในนาทีที่ 113 จากลูกเปิดของ André Schürrle'
  },
  {
    id: 'tr_hard_13',
    difficulty: 'hard',
    question: 'นักเตะคนใดเป็นเจ้าของสถิติลงสนามในศึก พรีเมียร์ลีก อังกฤษ มากนัดที่สุดตลอดกาล (653 นัด)?',
    options: ['Ryan Giggs', 'Frank Lampard', 'Gareth Barry', 'James Milner'],
    correctIndex: 2,
    explanation: 'Gareth Barry ลงสนามในพรีเมียร์ลีกไปถึง 653 นัด (กับ Aston Villa, Man City, Everton และ West Brom)'
  },
  {
    id: 'tr_hard_14',
    difficulty: 'hard',
    question: 'สโมสร อินเตอร์ มิลาน ยุคคว้าทริปเปิลแชมป์ปี 2010 (ชนะ บาเยิร์น มิวนิค 2-0 ในนัดชิง UCL) ใครคือผู้เหมาคนเดียวทั้ง 2 ประตูในนัดชิง?',
    options: ['Samuel Eto\'o', 'Wesley Sneijder', 'Diego Milito', 'Goran Pandev'],
    correctIndex: 2,
    explanation: 'Diego Milito เหมาคนเดียว 2 ประตูในนัดชิงชนะเลิศ พา Inter Milan ของ José Mourinho คว้าแชมป์ UCL 2010'
  },
  {
    id: 'tr_hard_15',
    difficulty: 'hard',
    question: 'ใครคือนักเตะชาวอังกฤษคนสุดท้ายที่คว้ารางวัล บัลลงดอร์ (Ballon d\'Or) มาครองได้สำเร็จ (ในปี 2001)?',
    options: ['David Beckham', 'Michael Owen', 'Steven Gerrard', 'Wayne Rooney'],
    correctIndex: 1,
    explanation: 'Michael Owen คว้ารางวัล Ballon d\'Or ในปี 2001 หลังพาลิเวอร์พูลคว้า 5 แชมป์บอลถ้วย'
  },
  {
    id: 'tr_hard_16',
    difficulty: 'hard',
    question: 'ในศึกฟุตบอลโลก 2002 รอบชิงชนะเลิศ (บราซิล ชนะ เยอรมนี 2-0) ใครคือผู้เหมาทั้ง 2 ประตูให้ทีมชาติบราซิล?',
    options: ['Rivaldo', 'Ronaldinho', 'Ronaldo Nazário', 'Roberto Carlos'],
    correctIndex: 2,
    explanation: 'Ronaldo Nazário (R9) เหมาทั้ง 2 ประตูในนัดชิงชนะเลิศ และคว้ารางวัลดาวซัลโวฟุตบอลโลก 2002 ที่ 8 ประตู'
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
