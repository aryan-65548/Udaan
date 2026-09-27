export interface StateDistricts {
  state: string;
  stateCode: string;
  districts: {
    name: string;
    blocks: string[];
  }[];
}

export const INDIAN_LOCATION_DATA: StateDistricts[] = [
  {
    state: 'Gujarat',
    stateCode: 'GJ',
    districts: [
      { name: 'Anand', blocks: ['Anand', 'Khambhat', 'Petlad', 'Borsad', 'Umreth', 'Tarapur', 'Sojitra', 'Anklav'] },
      { name: 'Dahod', blocks: ['Dahod', 'Garbada', 'Limkheda', 'Jhalod', 'Fatepura', 'Devgadh Baria', 'Dhanpur', 'Sanjeli'] },
      { name: 'Ahmedabad', blocks: ['Daskroi', 'Sanand', 'Bavla', 'Dholka', 'Dhandhuka', 'Viramgam', 'Mandal', 'Detroj'] },
      { name: 'Vadodara', blocks: ['Vadodara', 'Padra', 'Karjan', 'Dabhoi', 'Savli', 'Vaghodia', 'Shinor', 'Desar'] },
      { name: 'Surat', blocks: ['Chorasi', 'Olpad', 'Kamrej', 'Bardoli', 'Mahuva', 'Mandvi', 'Mangrol', 'Umarpada'] },
      { name: 'Rajkot', blocks: ['Rajkot', 'Gondal', 'Jetpur', 'Dhoraji', 'Kotda Sangani', 'Lodhika', 'Jasdan', 'Upleta'] },
      { name: 'Mehsana', blocks: ['Mehsana', 'Kadi', 'Visnagar', 'Vadnagar', 'Vijapur', 'Unjha', 'Becharaji', 'Kheralu'] },
      { name: 'Banaskantha', blocks: ['Palanpur', 'Deesa', 'Dhanera', 'Tharad', 'Vav', 'Danta', 'Vadgam', 'Kankrej'] },
      { name: 'Kheda', blocks: ['Nadiad', 'Matar', 'Kapadvanj', 'Mehmedabad', 'Thasra', 'Mahudha', 'Vaso', 'Galteshwar'] },
      { name: 'Panchmahal', blocks: ['Godhra', 'Halol', 'Kalol', 'Ghoghamba', 'Shehra', 'Morva Hadaf', 'Jambughoda'] },
      { name: 'Sabarkantha', blocks: ['Himatnagar', 'Idar', 'Prantij', 'Talod', 'Khedbrahma', 'Vadali', 'Poshina', 'Vijaynagar'] },
      { name: 'Bharuch', blocks: ['Bharuch', 'Ankleshwar', 'Jambusar', 'Amod', 'Vagra', 'Hansot', 'Valia', 'Jhagadia', 'Netrang'] },
      { name: 'Bhavnagar', blocks: ['Bhavnagar', 'Palitana', 'Sihor', 'Mahuva', 'Gariadhar', 'Talaja', 'Vallabhipur', 'Umrala'] },
      { name: 'Jamnagar', blocks: ['Jamnagar', 'Lalpur', 'Kalavad', 'Jamjodhpur', 'Jodiya', 'Dhrol'] },
      { name: 'Junagadh', blocks: ['Junagadh', 'Keshod', 'Mangrol', 'Manavadar', 'Malia', 'Visavadar', 'Mendarda', 'Bhesan'] },
    ],
  },
  {
    state: 'Maharashtra',
    stateCode: 'MH',
    districts: [
      { name: 'Pune', blocks: ['Baramati', 'Haveli', 'Shirur', 'Khed', 'Maval', 'Junnar', 'Indapur', 'Daund', 'Purandar'] },
      { name: 'Nashik', blocks: ['Nashik', 'Sinnar', 'Niphad', 'Yeola', 'Malegaon', 'Dindori', 'Baglan', 'Kalwan'] },
      { name: 'Nagpur', blocks: ['Nagpur Rural', 'Katol', 'Saoner', 'Umred', 'Ramtek', 'Hingna', 'Narkhed', 'Parseoni'] },
      { name: 'Ahmednagar', blocks: ['Nagar', 'Rahata', 'Sangamner', 'Shrirampur', 'Kopargaon', 'Newasa', 'Parner', 'Pathardi'] },
      { name: 'Solapur', blocks: ['North Solapur', 'Barshi', 'Pandharpur', 'Malshiras', 'Karmala', 'Sangola', 'Madha', 'Akkalkot'] },
      { name: 'Kolhapur', blocks: ['Karveer', 'Hatkangale', 'Shirol', 'Kagal', 'Gadhinglaj', 'Radhanagari', 'Panhala', 'Bhudargad'] },
      { name: 'Satara', blocks: ['Satara', 'Karad', 'Wai', 'Phaltan', 'Koregaon', 'Khandala', 'Patan', 'Jaoli'] },
      { name: 'Aurangabad (Chhatrapati Sambhajinagar)', blocks: ['Aurangabad', 'Paithan', 'Gangapur', 'Vaijapur', 'Kannad', 'Khuldabad', 'Sillod'] },
      { name: 'Amravati', blocks: ['Amravati', 'Achalpur', 'Chandur Bazar', 'Morshi', 'Warud', 'Daryapur', 'Anjangaon Surji'] },
      { name: 'Jalgaon', blocks: ['Jalgaon', 'Bhusawal', 'Chalisgaon', 'Pachora', 'Jamner', 'Raver', 'Yawal', 'Amalner'] },
    ],
  },
  {
    state: 'Rajasthan',
    stateCode: 'RJ',
    districts: [
      { name: 'Jaipur', blocks: ['Sanganer', 'Amber', 'Bassi', 'Chaksu', 'Jamwa Ramgarh', 'Kotputli', 'Phagi', 'Shahpura'] },
      { name: 'Udaipur', blocks: ['Girwa', 'Badgaon', 'Mavli', 'Vallabhnagar', 'Salumber', 'Kherwara', 'Jhadol', 'Sarada'] },
      { name: 'Jodhpur', blocks: ['Luni', 'Mandore', 'Bilara', 'Bhopalgarh', 'Osian', 'Balesar', 'Shergarh', 'Phalodi'] },
      { name: 'Ajmer', blocks: ['Ajmer Rural', 'Kishangarh', 'Beawar', 'Nasirabad', 'Kekri', 'Pisangan', 'Masuda', 'Bhinai'] },
      { name: 'Alwar', blocks: ['Alwar', 'Tijara', 'Behror', 'Ramgarh', 'Rajgarh', 'Kishangarh Bas', 'Thanagazi', 'Bansur'] },
      { name: 'Kota', blocks: ['Ladpura', 'Digod', 'Sangod', 'Itawa', 'Khairabad', 'Chechat'] },
      { name: 'Bikaner', blocks: ['Bikaner', 'Nokha', 'Kolayat', 'Lunkaransar', 'Khajuwala', 'Dungargarh', 'Chhattargarh'] },
      { name: 'Bhilwara', blocks: ['Bhilwara', 'Mandal', 'Sahada', 'Asind', 'Kotri', 'Jahazpur', 'Banera', 'Shahpura'] },
      { name: 'Sikar', blocks: ['Sikar', 'Dhod', 'Piprali', 'Fatehpur', 'Laxmangarh', 'Neem Ka Thana', 'Danta Ramgarh', 'Sri Madhopur'] },
      { name: 'Nagaur', blocks: ['Nagaur', 'Merta', 'Degana', 'Jayal', 'Didwana', 'Ladnun', 'Makrana', 'Parbatsar'] },
    ],
  },
  {
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    districts: [
      { name: 'Varanasi', blocks: ['Kashi Vidyapith', 'Arajiline', 'Harhua', 'Sewapuri', 'Pindra', 'Baragaon', 'Chiraigaon', 'Cholapur'] },
      { name: 'Lucknow', blocks: ['Bakshi Ka Talab', 'Sarojini Nagar', 'Mohanlalganj', 'Chinhat', 'Kakori', 'Malihabad', 'Gosainganj'] },
      { name: 'Prayagraj', blocks: ['Bahria', 'Phulpur', 'Soraon', 'Holagarh', 'Mauaima', 'Shankargarh', 'Karchhana', 'Jasra'] },
      { name: 'Gorakhpur', blocks: ['Campierganj', 'Pipraich', 'Bhathat', 'Chargawan', 'Sahjanwa', 'Khorabar', 'Bansgaon', 'Gola'] },
      { name: 'Kanpur Nagar', blocks: ['Kalyanpur', 'Sarsaul', 'Bidhnu', 'Ghatampur', 'Chaubeypur', 'Bilhaur', 'Shivrajpur', 'Patara'] },
      { name: 'Agra', blocks: ['Achhnera', 'Akola', 'Fatehabad', 'Fatehpur Sikri', 'Kheragarh', 'Pinahat', 'Saiyan', 'Shamsabad'] },
      { name: 'Meerut', blocks: ['Meerut', 'Rajpura', 'Kharkhoda', 'Sardhana', 'Daurala', 'Mawana', 'Hastinapur', 'Parikshitgarh'] },
      { name: 'Bareilly', blocks: ['Baheri', 'Bithri Chainpur', 'Fatehganj Paschim', 'Kyara', 'Mirganj', 'Nawabganj', 'Shergarh'] },
      { name: 'Aligarh', blocks: ['Atrauli', 'Chandaus', 'Dhanipur', 'Gonda', 'Iglas', 'Jawan Sikandarpur', 'Khair', 'Lodha'] },
      { name: 'Jhansi', blocks: ['Babina', 'Badagaon', 'Bamaur', 'Bangra', 'Chirgaon', 'Gursarai', 'Mauranipur', 'Moth'] },
    ],
  },
  {
    state: 'Madhya Pradesh',
    stateCode: 'MP',
    districts: [
      { name: 'Indore', blocks: ['Indore', 'Sanwer', 'Depalpur', 'Mhow (Dr. Ambedkar Nagar)'] },
      { name: 'Bhopal', blocks: ['Phanda', 'Berasia'] },
      { name: 'Jabalpur', blocks: ['Jabalpur', 'Panagar', 'Sihora', 'Kundam', 'Patan', 'Shahpura', 'Majholi'] },
      { name: 'Gwalior', blocks: ['Gwalior', 'Morar', 'Ghatigaon (Barai)', 'Bhitarwar', 'Dabra'] },
      { name: 'Ujjain', blocks: ['Ujjain', 'Ghatiya', 'Khachrod', 'Mahidpur', 'Tarana', 'Badnagar', 'Nagda'] },
      { name: 'Sagar', blocks: ['Sagar', 'Banda', 'Bina', 'Deori', 'Garhakota', 'Jaisinagar', 'Khurai', 'Rahatgarh', 'Rehli', 'Shahgarh'] },
      { name: 'Rewa', blocks: ['Rewa', 'Govindgarh', 'Gangev', 'Huzur', 'Jawa', 'Mauganj', 'Naigarhi', 'Raipur Karchuliyan', 'Sirmaur', 'Teonthar'] },
      { name: 'Khargone (West Nimar)', blocks: ['Khargone', 'Barwaha', 'Bhagwanpura', 'Bhikangaon', 'Gogawan', 'Kasrawad', 'Maheshwar', 'Segaon'] },
    ],
  },
  {
    state: 'Karnataka',
    stateCode: 'KA',
    districts: [
      { name: 'Mysuru', blocks: ['Mysuru', 'Nanjangud', 'Hunsur', 'T. Narasipura', 'Periyapatna', 'K.R. Nagar', 'H.D. Kote', 'Saragur'] },
      { name: 'Bengaluru Rural', blocks: ['Devanahalli', 'Doddaballapura', 'Hosakote', 'Nelamangala'] },
      { name: 'Belagavi', blocks: ['Belagavi', 'Gokak', 'Chikkodi', 'Athani', 'Bailhongal', 'Hukkeri', 'Khanapur', 'Ramdurg', 'Saundatti', 'Raybag'] },
      { name: 'Tumakuru', blocks: ['Tumakuru', 'Chikkanayakanahalli', 'Gubbi', 'Koratagere', 'Kunigal', 'Madhugiri', 'Pavagada', 'Sira', 'Tiptur', 'Turuvekere'] },
      { name: 'Dharwad', blocks: ['Dharwad', 'Hubballi Rural', 'Kalghatgi', 'Navalgund', 'Kundgol', 'Alnavar', 'Annigeri'] },
      { name: 'Mandya', blocks: ['Mandya', 'Maddur', 'Malavalli', 'Pandavapura', 'Srirangapatna', 'Krishnarajpet', 'Nagamangala'] },
      { name: 'Shivamogga', blocks: ['Shivamogga', 'Bhadravathi', 'Hosanagara', 'Sagara', 'Shikaripura', 'Soraba', 'Thirthahalli'] },
    ],
  },
  {
    state: 'Bihar',
    stateCode: 'BR',
    districts: [
      { name: 'Patna', blocks: ['Patna Sadar', 'Danapur', 'Phulwari Sharif', 'Fatuha', 'Bakhtiarpur', 'Barh', 'Bikram', 'Bihta', 'Masaurhi', 'Mokama', 'Paliganj', 'Punpun'] },
      { name: 'Gaya', blocks: ['Gaya Town', 'Bodh Gaya', 'Dobhi', 'Sherghati', 'Tekari', 'Wazirganj', 'Manpur', 'Barachatti', 'Fatehpur', 'Imamganj'] },
      { name: 'Muzaffarpur', blocks: ['Mushahari', 'Kanti', 'Motipur', 'Paroo', 'Sahebganj', 'Saraiya', 'Bochahan', 'Gaighat', 'Kurhani', 'Minapur', 'Sakra'] },
      { name: 'Bhagalpur', blocks: ['Jagdishpur', 'Nathnagar', 'Sabour', 'Sultanganj', 'Kahalgaon', 'Pirpainti', 'Colgong', 'Gopalpur', 'Bihpur', 'Naugachhia'] },
      { name: 'Darbhanga', blocks: ['Darbhanga Sadar', 'Bahadurpur', 'Baheri', 'Benipur', 'Biraul', 'Hayaghat', 'Jale', 'Keoti', 'Singhwara', 'Alinagar'] },
    ],
  },
  {
    state: 'Punjab',
    stateCode: 'PB',
    districts: [
      { name: 'Ludhiana', blocks: ['Ludhiana-1', 'Ludhiana-2', 'Jagraon', 'Khanna', 'Samrala', 'Doraha', 'Dehlon', 'Pakhowal', 'Raikot', 'Sidhwan Bet'] },
      { name: 'Amritsar', blocks: ['Amritsar-1', 'Amritsar-2', 'Ajnala', 'Attari', 'Chogawan', 'Harsha Chhina', 'Jandiala Guru', 'Majitha', 'Rayya', 'Verka'] },
      { name: 'Jalandhar', blocks: ['Jalandhar West', 'Jalandhar East', 'Adampur', 'Bhogpur', 'Goraya', 'Lohian Khas', 'Nakodar', 'Nurmahal', 'Phillaur', 'Rurka Kalan', 'Shahkot'] },
      { name: 'Patiala', blocks: ['Patiala', 'Bhunerheri', 'Ghanour', 'Nabha', 'Patran', 'Rajpura', 'Samana', 'Sanour'] },
      { name: 'Bathinda', blocks: ['Bathinda', 'Bhagta Bhaika', 'Maur', 'Nathana', 'Phul', 'Rampura Phul', 'Sangat', 'Talwandi Sabo'] },
    ],
  },
  {
    state: 'Tamil Nadu',
    stateCode: 'TN',
    districts: [
      { name: 'Coimbatore', blocks: ['Anaimalai', 'Annur', 'Karamadai', 'Kinathukadavu', 'Madukkarai', 'Periyanayakkanpalayam', 'Pollachi North', 'Pollachi South', 'Sarkarsamakulam', 'Sulur', 'Sultanpet', 'Thondamuthur'] },
      { name: 'Madurai', blocks: ['Alanganallur', 'Chellampatti', 'Kallikudi', 'Kottampatti', 'Madurai East', 'Madurai West', 'Melur', 'Sedapatti', 'T. Vadipatti', 'Thirumangalam', 'Thirupparankundram', 'Usilampatti'] },
      { name: 'Salem', blocks: ['Attur', 'Ayothiyapattinam', 'Gangavalli', 'Kadayampatti', 'Kolathur', 'Konganapuram', 'Macdonald Choultry', 'Mecheri', 'Nangavalli', 'Omalur', 'Panaimarathupatti', 'Peddanaickenpalayam', 'Salem', 'Sankari', 'Thalaivasal', 'Tharamangalam', 'Valapady', 'Veerapandi', 'Yercaud'] },
      { name: 'Tiruchirappalli', blocks: ['Andanallur', 'Lalgudi', 'Manachanallur', 'Manapparai', 'Manikandam', 'Marungapuri', 'Musiri', 'Pullambadi', 'Thathaiyangarpet', 'Thiruverumbur', 'Thottiyam', 'Thuraiyur', 'Uppiliyapuram', 'Vaiyampatti'] },
    ],
  },
  {
    state: 'West Bengal',
    stateCode: 'WB',
    districts: [
      { name: 'Bardhaman (Purba Bardhaman)', blocks: ['Burdwan-I', 'Burdwan-II', 'Bhatar', 'Ausgram-I', 'Ausgram-II', 'Galsi-I', 'Galsi-II', 'Memari-I', 'Memari-II', 'Kalna-I', 'Kalna-II', 'Katwa-I', 'Katwa-II'] },
      { name: 'Hooghly', blocks: ['Singur', 'Haripal', 'Tarakeswar', 'Chanditala-I', 'Chanditala-II', 'Jangipara', 'Polba Dadpur', 'Dhaniakhali', 'Pandua', 'Balagarh', 'Chinsurah-Mogra'] },
      { name: 'Nadia', blocks: ['Krishnanagar-I', 'Krishnanagar-II', 'Chapra', 'Nakashipara', 'Kaliganj', 'Tehatta-I', 'Tehatta-II', 'Karimpur-I', 'Karimpur-II', 'Ranaghat-I', 'Ranaghat-II', 'Chakdaha', 'Haringhata', 'Hanskhali', 'Shantipur', 'Nabadwip'] },
      { name: 'Murshidabad', blocks: ['Berhampore', 'Beldanga-I', 'Beldanga-II', 'Hariharpara', 'Naoda', 'Kandi', 'Bharatpur-I', 'Bharatpur-II', 'Burwan', 'Khargram', 'Domkal', 'Jalangi', 'Raninagar-I', 'Raninagar-II', 'Lalgola', 'Bhagawangola-I', 'Bhagawangola-II', 'Murshidabad-Jiaganj', 'Nabagram', 'Raghunathganj-I', 'Raghunathganj-II', 'Suti-I', 'Suti-II', 'Samserganj', 'Farakka'] },
    ],
  },
];
